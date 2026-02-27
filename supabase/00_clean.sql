-- =============================================================================
-- 01_initial_schema.sql — AcompañaMe
-- Arquitectura: inmutabilidad por convención, sin versionado JSONB.
-- Saneamiento de datos (trim) exclusivo en Frontend.
-- =============================================================================
-- -----------------------------------------------------------------------------
-- FUNCIONES BASE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- -----------------------------------------------------------------------------
-- PROFILES
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id                       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                     TEXT NOT NULL DEFAULT 'Usuario',
  caregiving_for           TEXT,
  relationship_type        TEXT,
  condition                TEXT,
  caregiving_duration      TEXT,
  main_challenges          TEXT[],
  support_needs            TEXT,
  ai_tone                  TEXT CHECK (ai_tone IN ('formal', 'casual', 'friendly')),
  preferred_language_style TEXT CHECK (preferred_language_style IN ('direct', 'detailed', 'balanced')),
  notification_preferences JSONB,
  role                     TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- Helper: comprueba si el usuario autenticado es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
-- Trigger: crea el perfil automáticamente al registrar un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id,
    'user',
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'name',
      'Usuario'
    )
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- -----------------------------------------------------------------------------
-- DAILY EMOTIONS
-- -----------------------------------------------------------------------------
CREATE TABLE public.daily_emotions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  emotion    TEXT NOT NULL,
  intensity  TEXT CHECK (intensity IN ('low', 'medium', 'high')),
  title      TEXT,
  content    TEXT,
  tags       TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE TRIGGER set_daily_emotions_updated_at
  BEFORE UPDATE ON public.daily_emotions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- -----------------------------------------------------------------------------
-- CHAT MESSAGES
-- -----------------------------------------------------------------------------
CREATE TABLE public.chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content    TEXT NOT NULL,
  emotion    TEXT CHECK (emotion IN ('calm', 'okay', 'challenging', 'mixed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- -----------------------------------------------------------------------------
-- CUESTIONARIOS
-- -----------------------------------------------------------------------------
CREATE TABLE public.questionnaires (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL DEFAULT 'standard'
                  CHECK (type IN ('onboarding', 'who5', 'standard')),
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published', 'archived')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_questionnaires_updated_at
  BEFORE UPDATE ON public.questionnaires
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- -----------------------------------------------------------------------------
-- PREGUNTAS
-- -----------------------------------------------------------------------------
CREATE TABLE public.questionnaire_questions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  order_index      INT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  type             TEXT NOT NULL DEFAULT 'single_choice'
                     CHECK (type IN ('single_choice', 'multiple_choice', 'text')),
  show_if          JSONB,
  -- { operator: 'OR'|'AND', conditions: [{ question_id, option_ids[] }] }
  is_deleted       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_questions_updated_at
  BEFORE UPDATE ON public.questionnaire_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- -----------------------------------------------------------------------------
-- OPCIONES
-- -----------------------------------------------------------------------------
CREATE TABLE public.question_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  text        TEXT NOT NULL,
  score       INT,
  -- valor numérico para cuestionarios puntuables (ej. WHO-5: 0–5)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- -----------------------------------------------------------------------------
-- INMUTABILIDAD POST-PUBLICACIÓN
-- Bloquea UPDATE y DELETE en preguntas y opciones una vez el cuestionario
-- está publicado. Para modificar: archivar y crear uno nuevo.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_published_immutability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_status TEXT;
  v_qid    UUID;
BEGIN
  -- Resolvemos el questionnaire_id según la tabla que dispara el trigger
  IF TG_TABLE_NAME = 'questionnaire_questions' THEN
    v_qid := OLD.questionnaire_id;
  ELSE
    -- question_options: necesitamos subir un nivel
    SELECT questionnaire_id INTO v_qid
      FROM public.questionnaire_questions
     WHERE id = OLD.question_id;
  END IF;
  SELECT status INTO v_status
    FROM public.questionnaires
   WHERE id = v_qid;
  IF v_status = 'published' THEN
    RAISE EXCEPTION
      'El cuestionario está publicado y es inmutable. Archívalo y crea uno nuevo.';
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$;
CREATE TRIGGER immutable_questions
  BEFORE UPDATE OR DELETE ON public.questionnaire_questions
  FOR EACH ROW EXECUTE FUNCTION public.guard_published_immutability();
CREATE TRIGGER immutable_options
  BEFORE UPDATE OR DELETE ON public.question_options
  FOR EACH ROW EXECUTE FUNCTION public.guard_published_immutability();
-- -----------------------------------------------------------------------------
-- SESIONES
-- Una sesión por usuario por cuestionario activa simultáneamente.
-- Sesiones completadas/abandonadas se conservan como registro histórico
-- (score del WHO-5, fecha de onboarding completado, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE public.questionnaire_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  status           TEXT NOT NULL DEFAULT 'in_progress'
                     CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score            INT,
  -- puntuación calculada al completar (WHO-5: 0–100, onboarding: NULL)
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);
-- Solo una sesión activa por usuario y cuestionario
CREATE UNIQUE INDEX one_active_session_per_user_questionnaire
  ON public.questionnaire_sessions (user_id, questionnaire_id)
  WHERE status = 'in_progress';
-- -----------------------------------------------------------------------------
-- RESPUESTAS
-- Estado actual de progreso del usuario. Borrables sin consecuencias.
-- El UPSERT por (session_id, question_id) permite modificar respuestas
-- anteriores sin acumular duplicados.
-- -----------------------------------------------------------------------------
CREATE TABLE public.questionnaire_responses (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_id   UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
  session_id         UUID NOT NULL REFERENCES public.questionnaire_sessions(id) ON DELETE CASCADE,
  question_id        UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
  option_id          UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
  free_text_response TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);
CREATE TRIGGER set_responses_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- -----------------------------------------------------------------------------
-- VISTAS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.active_questionnaires AS
  SELECT * FROM public.questionnaires
  WHERE status = 'published';
CREATE OR REPLACE VIEW public.active_questions AS
  SELECT * FROM public.questionnaire_questions
  WHERE is_deleted = false;
-- -----------------------------------------------------------------------------
-- FUNCIÓN DE PUBLICACIÓN
-- Transición draft → published. El trigger de inmutabilidad se activa
-- automáticamente a partir de este momento.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.publish_questionnaire(p_questionnaire_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT (public.is_admin() OR current_user = 'postgres') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.questionnaire_questions
    WHERE questionnaire_id = p_questionnaire_id
      AND is_deleted = false
  ) THEN
    RAISE EXCEPTION 'No se puede publicar un cuestionario sin preguntas.';
  END IF;
  UPDATE public.questionnaires
     SET status = 'published'
   WHERE id = p_questionnaire_id;
END;
$$;
-- -----------------------------------------------------------------------------
-- FUNCIÓN SOFT DELETE DE PREGUNTA (solo en draft)
-- El trigger de inmutabilidad ya lo bloquea en published, pero esta función
-- añade el guard explícito y la semántica de is_deleted.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.soft_delete_question(p_question_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  UPDATE public.questionnaire_questions
     SET is_deleted = true
   WHERE id = p_question_id;
  -- Si el cuestionario está publicado, el trigger lanzará la excepción
  -- antes de que este UPDATE llegue a completarse.
END;
$$;
-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_emotions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
-- Profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can read all profiles"
  ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can manage all profiles"
  ON public.profiles FOR ALL USING (public.is_admin());
-- Daily emotions / chat messages
CREATE POLICY "Users manage own emotions"
  ON public.daily_emotions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own messages"
  ON public.chat_messages FOR ALL USING (auth.uid() = user_id);
-- Cuestionarios: lectura pública, escritura solo admin
CREATE POLICY "Anyone can read questionnaires"
  ON public.questionnaires FOR SELECT USING (true);
CREATE POLICY "Admin can manage questionnaires"
  ON public.questionnaires FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can read questions"
  ON public.questionnaire_questions FOR SELECT USING (true);
CREATE POLICY "Admin can manage questions"
  ON public.questionnaire_questions FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can read options"
  ON public.question_options FOR SELECT USING (true);
CREATE POLICY "Admin can manage options"
  ON public.question_options FOR ALL USING (public.is_admin());
-- Sesiones y respuestas
CREATE POLICY "Users manage own sessions"
  ON public.questionnaire_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can read all sessions"
  ON public.questionnaire_sessions FOR SELECT USING (public.is_admin());
CREATE POLICY "Users manage own responses"
  ON public.questionnaire_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admin can read all responses"
  ON public.questionnaire_responses FOR SELECT USING (public.is_admin());