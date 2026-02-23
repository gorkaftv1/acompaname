-- =============================================================================
-- 00_initial_schema.sql — AcompañaMe
-- Esquema definitivo. Arquitectura User-Centric.
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
-- TABLAS PRINCIPALES
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
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Trigger: crea el perfil automáticamente al registrar un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

CREATE TABLE public.chat_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role       TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content    TEXT NOT NULL,
    emotion    TEXT CHECK (emotion IN ('calm', 'okay', 'challenging', 'mixed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLAS DEL CUESTIONARIO
-- -----------------------------------------------------------------------------

CREATE TABLE public.questionnaires (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_questionnaires_updated_at
  BEFORE UPDATE ON public.questionnaires
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.questionnaire_questions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    questionnaire_id UUID NOT NULL REFERENCES public.questionnaires(id) ON DELETE CASCADE,
    order_index      INT NOT NULL,
    title            TEXT NOT NULL,
    description      TEXT,
    type             TEXT NOT NULL DEFAULT 'single_choice'
                       CHECK (type IN ('single_choice', 'multiple_choice', 'text')),
    is_first_question BOOLEAN NOT NULL DEFAULT false,
    is_deleted       BOOLEAN NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_questions_updated_at
  BEFORE UPDATE ON public.questionnaire_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.question_options (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id      UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
    order_index      INT NOT NULL,
    text             TEXT NOT NULL,
    next_question_id UUID REFERENCES public.questionnaire_questions(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTA: free_text_response debe ser limpiado con trim exclusivamente en el cliente (Frontend).
-- NO debe haber triggers de trim dinámicos en esta base de datos.
CREATE TABLE public.questionnaire_responses (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id        UUID NOT NULL REFERENCES public.questionnaire_questions(id) ON DELETE CASCADE,
    option_id          UUID REFERENCES public.question_options(id) ON DELETE CASCADE,
    free_text_response TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

CREATE TRIGGER set_responses_updated_at
  BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- VISTAS ACTIVAS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.active_questionnaires AS
  SELECT * FROM public.questionnaires WHERE is_active = true;

CREATE OR REPLACE VIEW public.active_questions AS
  SELECT * FROM public.questionnaire_questions WHERE is_deleted = false;

-- -----------------------------------------------------------------------------
-- FUNCIONES DE DOMINIO
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.soft_delete_question(q_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  UPDATE public.questionnaire_questions SET is_deleted = true WHERE id = q_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- SEGURIDAD: RLS Y POLÍTICAS
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_emotions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaires          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options        ENABLE ROW LEVEL SECURITY;
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

-- Daily Emotions / Chat Messages: privados por usuario
CREATE POLICY "Users manage own emotions"
  ON public.daily_emotions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own messages"
  ON public.chat_messages FOR ALL USING (auth.uid() = user_id);

-- Cuestionarios y configuración: lectura pública, escritura solo admin
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

-- Respuestas: usuario gestiona las suyas, admin puede leerlas todas
CREATE POLICY "Users manage own responses"
  ON public.questionnaire_responses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all responses"
  ON public.questionnaire_responses FOR SELECT USING (public.is_admin());