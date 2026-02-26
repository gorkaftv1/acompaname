-- =============================================================================
-- 06_seed_who5.sql — AcompañaMe
-- WHO-5 Well-Being Index — Índice de Bienestar de la OMS
--
-- 5 preguntas, escala Likert 0–5.
-- Puntuación final = suma raw × 4 → rango 0–100.
-- Score se guarda en questionnaire_sessions.score al completar.
--
-- © World Health Organization, 1998. Uso libre.
--
-- UUID convention:
--   Cuestionario : b0000000-0000-0000-0000-000000000002
--   Preguntas    : e0000000-0000-0000-0000-00000000000{1-5}
--   Opciones     : f0000000-0000-0000-000{Q}-00000000000{1-6}
--                  order_index 1 = score 5 (Todo el tiempo)
--                  order_index 6 = score 0 (En ningún momento)
-- =============================================================================
-- -----------------------------------------------------------------------------
-- 1. Cuestionario
-- -----------------------------------------------------------------------------
INSERT INTO public.questionnaires (id, title, description, type, status)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'WHO-5 — Índice de Bienestar',
  'Un breve cuestionario validado internacionalmente para evaluar tu bienestar emocional durante las últimas dos semanas.',
  'who5',
  'draft'
)
ON CONFLICT (id) DO UPDATE
  SET title         = EXCLUDED.title,
      description   = EXCLUDED.description,
      type          = EXCLUDED.type,
      status        = 'draft';
-- -----------------------------------------------------------------------------
-- 2. Preguntas y opciones
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  q_id UUID := 'b0000000-0000-0000-0000-000000000002';
  Q1 UUID := 'e0000000-0000-0000-0000-000000000001';
  Q2 UUID := 'e0000000-0000-0000-0000-000000000002';
  Q3 UUID := 'e0000000-0000-0000-0000-000000000003';
  Q4 UUID := 'e0000000-0000-0000-0000-000000000004';
  Q5 UUID := 'e0000000-0000-0000-0000-000000000005';
BEGIN
  -- -------------------------------------------------------------------------
  -- Preguntas
  -- -------------------------------------------------------------------------
  INSERT INTO public.questionnaire_questions
    (id, questionnaire_id, order_index, title, type, show_if)
  VALUES
    (Q1, q_id, 1, 'Me he sentido alegre y de buen humor.',                        'single_choice', NULL),
    (Q2, q_id, 2, 'Me he sentido tranquilo/a y relajado/a.',                      'single_choice', NULL),
    (Q3, q_id, 3, 'Me he sentido activo/a y con energía.',                        'single_choice', NULL),
    (Q4, q_id, 4, 'Me he despertado sintiéndome fresco/a y descansado/a.',        'single_choice', NULL),
    (Q5, q_id, 5, 'Mi vida cotidiana ha estado llena de cosas que me interesan.', 'single_choice', NULL)
  ON CONFLICT (id) DO UPDATE
    SET title       = EXCLUDED.title,
        type        = EXCLUDED.type,
        order_index = EXCLUDED.order_index,
        show_if     = EXCLUDED.show_if;
  -- -------------------------------------------------------------------------
  -- Opciones — misma escala para las 5 preguntas
  -- order_index 1 → score 5 (Todo el tiempo)
  -- order_index 6 → score 0 (En ningún momento)
  -- -------------------------------------------------------------------------
  -- Q1
  INSERT INTO public.question_options (id, question_id, order_index, text, score) VALUES
    ('f0000000-0000-0000-0001-000000000001', Q1, 1, 'Todo el tiempo',             5),
    ('f0000000-0000-0000-0001-000000000002', Q1, 2, 'La mayor parte del tiempo',  4),
    ('f0000000-0000-0000-0001-000000000003', Q1, 3, 'Más de la mitad del tiempo', 3),
    ('f0000000-0000-0000-0001-000000000004', Q1, 4, 'Menos de la mitad del tiempo', 2),
    ('f0000000-0000-0000-0001-000000000005', Q1, 5, 'Alguna vez',                 1),
    ('f0000000-0000-0000-0001-000000000006', Q1, 6, 'En ningún momento',          0)
  ON CONFLICT (id) DO UPDATE
    SET text  = EXCLUDED.text,
        score = EXCLUDED.score;
  -- Q2
  INSERT INTO public.question_options (id, question_id, order_index, text, score) VALUES
    ('f0000000-0000-0000-0002-000000000001', Q2, 1, 'Todo el tiempo',             5),
    ('f0000000-0000-0000-0002-000000000002', Q2, 2, 'La mayor parte del tiempo',  4),
    ('f0000000-0000-0000-0002-000000000003', Q2, 3, 'Más de la mitad del tiempo', 3),
    ('f0000000-0000-0000-0002-000000000004', Q2, 4, 'Menos de la mitad del tiempo', 2),
    ('f0000000-0000-0000-0002-000000000005', Q2, 5, 'Alguna vez',                 1),
    ('f0000000-0000-0000-0002-000000000006', Q2, 6, 'En ningún momento',          0)
  ON CONFLICT (id) DO UPDATE
    SET text  = EXCLUDED.text,
        score = EXCLUDED.score;
  -- Q3
  INSERT INTO public.question_options (id, question_id, order_index, text, score) VALUES
    ('f0000000-0000-0000-0003-000000000001', Q3, 1, 'Todo el tiempo',             5),
    ('f0000000-0000-0000-0003-000000000002', Q3, 2, 'La mayor parte del tiempo',  4),
    ('f0000000-0000-0000-0003-000000000003', Q3, 3, 'Más de la mitad del tiempo', 3),
    ('f0000000-0000-0000-0003-000000000004', Q3, 4, 'Menos de la mitad del tiempo', 2),
    ('f0000000-0000-0000-0003-000000000005', Q3, 5, 'Alguna vez',                 1),
    ('f0000000-0000-0000-0003-000000000006', Q3, 6, 'En ningún momento',          0)
  ON CONFLICT (id) DO UPDATE
    SET text  = EXCLUDED.text,
        score = EXCLUDED.score;
  -- Q4
  INSERT INTO public.question_options (id, question_id, order_index, text, score) VALUES
    ('f0000000-0000-0000-0004-000000000001', Q4, 1, 'Todo el tiempo',             5),
    ('f0000000-0000-0000-0004-000000000002', Q4, 2, 'La mayor parte del tiempo',  4),
    ('f0000000-0000-0000-0004-000000000003', Q4, 3, 'Más de la mitad del tiempo', 3),
    ('f0000000-0000-0000-0004-000000000004', Q4, 4, 'Menos de la mitad del tiempo', 2),
    ('f0000000-0000-0000-0004-000000000005', Q4, 5, 'Alguna vez',                 1),
    ('f0000000-0000-0000-0004-000000000006', Q4, 6, 'En ningún momento',          0)
  ON CONFLICT (id) DO UPDATE
    SET text  = EXCLUDED.text,
        score = EXCLUDED.score;
  -- Q5
  INSERT INTO public.question_options (id, question_id, order_index, text, score) VALUES
    ('f0000000-0000-0000-0005-000000000001', Q5, 1, 'Todo el tiempo',             5),
    ('f0000000-0000-0000-0005-000000000002', Q5, 2, 'La mayor parte del tiempo',  4),
    ('f0000000-0000-0000-0005-000000000003', Q5, 3, 'Más de la mitad del tiempo', 3),
    ('f0000000-0000-0000-0005-000000000004', Q5, 4, 'Menos de la mitad del tiempo', 2),
    ('f0000000-0000-0000-0005-000000000005', Q5, 5, 'Alguna vez',                 1),
    ('f0000000-0000-0000-0005-000000000006', Q5, 6, 'En ningún momento',          0)
  ON CONFLICT (id) DO UPDATE
    SET text  = EXCLUDED.text,
        score = EXCLUDED.score;
  RAISE NOTICE '✅ WHO-5: 5 preguntas y 30 opciones insertadas.';
END $$;
-- -----------------------------------------------------------------------------
-- 3. Publicar
-- -----------------------------------------------------------------------------
SELECT public.publish_questionnaire('b0000000-0000-0000-0000-000000000002');
