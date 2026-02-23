-- =============================================================================
-- 06_seed_who5.sql
-- Seed data for the WHO-5 Well-Being Index questionnaire
--
-- The WHO-5 is a 5-item self-report measure of current mental well-being.
-- Each item is rated on a 6-point Likert scale (0–5).
-- Final score = raw sum × 4  →  range: 0–100.
--
-- © World Health Organization, 1998. The WHO-5 may be freely used.
-- Source: "Mastering Depression in Primary Care", v2.2,
--          Psychiatric Research Unit, WHO Collaborating Center in Mental Health,
--          Frederiksborg General Hospital, Hillerød, Denmark.
--
-- UUID convention (mirrors 04_seed_onboarding.sql):
--   Questionnaire : b0000000-0000-0000-0000-000000000002
--   Questions     : e0000000-0000-0000-0000-00000000000{1-5}
--   Options       : f0000000-0000-0000-000{Q}-{option index zero-padded}
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Questionnaire record
-- ---------------------------------------------------------------------------
INSERT INTO public.questionnaires (id, title, description, is_active)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'WHO-5 — Índice de Bienestar',
  'Un breve cuestionario validado internacionalmente para evaluar tu bienestar emocional durante las últimas dos semanas.',
  true
)
ON CONFLICT (id) DO UPDATE
  SET title       = EXCLUDED.title,
      description = EXCLUDED.description,
      is_active   = EXCLUDED.is_active;

-- ---------------------------------------------------------------------------
-- 2. Questions + Options  (DO block for readable UUID variables)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  q_id UUID := 'b0000000-0000-0000-0000-000000000002';

  -- Questions
  Q1 UUID := 'e0000000-0000-0000-0000-000000000001';
  Q2 UUID := 'e0000000-0000-0000-0000-000000000002';
  Q3 UUID := 'e0000000-0000-0000-0000-000000000003';
  Q4 UUID := 'e0000000-0000-0000-0000-000000000004';
  Q5 UUID := 'e0000000-0000-0000-0000-000000000005';

  -- Options for Q1 (value 5 → 0, indices 1 → 6)
  Q1_O5 UUID := 'f0000000-0000-0000-0001-000000000001';
  Q1_O4 UUID := 'f0000000-0000-0000-0001-000000000002';
  Q1_O3 UUID := 'f0000000-0000-0000-0001-000000000003';
  Q1_O2 UUID := 'f0000000-0000-0000-0001-000000000004';
  Q1_O1 UUID := 'f0000000-0000-0000-0001-000000000005';
  Q1_O0 UUID := 'f0000000-0000-0000-0001-000000000006';

  -- Options for Q2
  Q2_O5 UUID := 'f0000000-0000-0000-0002-000000000001';
  Q2_O4 UUID := 'f0000000-0000-0000-0002-000000000002';
  Q2_O3 UUID := 'f0000000-0000-0000-0002-000000000003';
  Q2_O2 UUID := 'f0000000-0000-0000-0002-000000000004';
  Q2_O1 UUID := 'f0000000-0000-0000-0002-000000000005';
  Q2_O0 UUID := 'f0000000-0000-0000-0002-000000000006';

  -- Options for Q3
  Q3_O5 UUID := 'f0000000-0000-0000-0003-000000000001';
  Q3_O4 UUID := 'f0000000-0000-0000-0003-000000000002';
  Q3_O3 UUID := 'f0000000-0000-0000-0003-000000000003';
  Q3_O2 UUID := 'f0000000-0000-0000-0003-000000000004';
  Q3_O1 UUID := 'f0000000-0000-0000-0003-000000000005';
  Q3_O0 UUID := 'f0000000-0000-0000-0003-000000000006';

  -- Options for Q4
  Q4_O5 UUID := 'f0000000-0000-0000-0004-000000000001';
  Q4_O4 UUID := 'f0000000-0000-0000-0004-000000000002';
  Q4_O3 UUID := 'f0000000-0000-0000-0004-000000000003';
  Q4_O2 UUID := 'f0000000-0000-0000-0004-000000000004';
  Q4_O1 UUID := 'f0000000-0000-0000-0004-000000000005';
  Q4_O0 UUID := 'f0000000-0000-0000-0004-000000000006';

  -- Options for Q5
  Q5_O5 UUID := 'f0000000-0000-0000-0005-000000000001';
  Q5_O4 UUID := 'f0000000-0000-0000-0005-000000000002';
  Q5_O3 UUID := 'f0000000-0000-0000-0005-000000000003';
  Q5_O2 UUID := 'f0000000-0000-0000-0005-000000000004';
  Q5_O1 UUID := 'f0000000-0000-0000-0005-000000000005';
  Q5_O0 UUID := 'f0000000-0000-0000-0005-000000000006';

BEGIN

  -- -----------------------------------------------------------------------
  -- 2a. Insert questions (Q1 is the entry point)
  --     Columns: id, questionnaire_id, order_index, title, type, is_first_question
  -- -----------------------------------------------------------------------
  INSERT INTO public.questionnaire_questions
    (id, questionnaire_id, order_index, title, type, is_first_question)
  VALUES
    (Q1, q_id, 1, 'Me he sentido alegre y de buen humor.',                         'single_choice', true),
    (Q2, q_id, 2, 'Me he sentido tranquilo/a y relajado/a.',                       'single_choice', false),
    (Q3, q_id, 3, 'Me he sentido activo/a y con energía.',                         'single_choice', false),
    (Q4, q_id, 4, 'Me he despertado sintiéndome fresco/a y descansado/a.',         'single_choice', false),
    (Q5, q_id, 5, 'Mi vida cotidiana ha estado llena de cosas que me interesan.',  'single_choice', false)
  ON CONFLICT (id) DO UPDATE
    SET title             = EXCLUDED.title,
        type              = EXCLUDED.type,
        order_index       = EXCLUDED.order_index,
        is_first_question = EXCLUDED.is_first_question;

  -- -----------------------------------------------------------------------
  -- 2b. Options for Q1  →  Q2
  --     Columns: id, question_id, order_index, text, next_question_id
  -- -----------------------------------------------------------------------
  INSERT INTO public.question_options (id, question_id, order_index, text, next_question_id)
  VALUES
    (Q1_O5, Q1, 1, 'Todo el tiempo',               Q2),
    (Q1_O4, Q1, 2, 'La mayor parte del tiempo',    Q2),
    (Q1_O3, Q1, 3, 'Más de la mitad del tiempo',   Q2),
    (Q1_O2, Q1, 4, 'Menos de la mitad del tiempo', Q2),
    (Q1_O1, Q1, 5, 'Alguna vez',                   Q2),
    (Q1_O0, Q1, 6, 'En ningún momento',            Q2)
  ON CONFLICT (id) DO UPDATE
    SET text             = EXCLUDED.text,
        next_question_id = EXCLUDED.next_question_id;

  -- -----------------------------------------------------------------------
  -- 2c. Options for Q2  →  Q3
  -- -----------------------------------------------------------------------
  INSERT INTO public.question_options (id, question_id, order_index, text, next_question_id)
  VALUES
    (Q2_O5, Q2, 1, 'Todo el tiempo',               Q3),
    (Q2_O4, Q2, 2, 'La mayor parte del tiempo',    Q3),
    (Q2_O3, Q2, 3, 'Más de la mitad del tiempo',   Q3),
    (Q2_O2, Q2, 4, 'Menos de la mitad del tiempo', Q3),
    (Q2_O1, Q2, 5, 'Alguna vez',                   Q3),
    (Q2_O0, Q2, 6, 'En ningún momento',            Q3)
  ON CONFLICT (id) DO UPDATE
    SET text             = EXCLUDED.text,
        next_question_id = EXCLUDED.next_question_id;

  -- -----------------------------------------------------------------------
  -- 2d. Options for Q3  →  Q4
  -- -----------------------------------------------------------------------
  INSERT INTO public.question_options (id, question_id, order_index, text, next_question_id)
  VALUES
    (Q3_O5, Q3, 1, 'Todo el tiempo',               Q4),
    (Q3_O4, Q3, 2, 'La mayor parte del tiempo',    Q4),
    (Q3_O3, Q3, 3, 'Más de la mitad del tiempo',   Q4),
    (Q3_O2, Q3, 4, 'Menos de la mitad del tiempo', Q4),
    (Q3_O1, Q3, 5, 'Alguna vez',                   Q4),
    (Q3_O0, Q3, 6, 'En ningún momento',            Q4)
  ON CONFLICT (id) DO UPDATE
    SET text             = EXCLUDED.text,
        next_question_id = EXCLUDED.next_question_id;

  -- -----------------------------------------------------------------------
  -- 2e. Options for Q4  →  Q5
  -- -----------------------------------------------------------------------
  INSERT INTO public.question_options (id, question_id, order_index, text, next_question_id)
  VALUES
    (Q4_O5, Q4, 1, 'Todo el tiempo',               Q5),
    (Q4_O4, Q4, 2, 'La mayor parte del tiempo',    Q5),
    (Q4_O3, Q4, 3, 'Más de la mitad del tiempo',   Q5),
    (Q4_O2, Q4, 4, 'Menos de la mitad del tiempo', Q5),
    (Q4_O1, Q4, 5, 'Alguna vez',                   Q5),
    (Q4_O0, Q4, 6, 'En ningún momento',            Q5)
  ON CONFLICT (id) DO UPDATE
    SET text             = EXCLUDED.text,
        next_question_id = EXCLUDED.next_question_id;

  -- -----------------------------------------------------------------------
  -- 2f. Options for Q5  →  NULL (end of questionnaire)
  -- -----------------------------------------------------------------------
  INSERT INTO public.question_options (id, question_id, order_index, text, next_question_id)
  VALUES
    (Q5_O5, Q5, 1, 'Todo el tiempo',               NULL),
    (Q5_O4, Q5, 2, 'La mayor parte del tiempo',    NULL),
    (Q5_O3, Q5, 3, 'Más de la mitad del tiempo',   NULL),
    (Q5_O2, Q5, 4, 'Menos de la mitad del tiempo', NULL),
    (Q5_O1, Q5, 5, 'Alguna vez',                   NULL),
    (Q5_O0, Q5, 6, 'En ningún momento',            NULL)
  ON CONFLICT (id) DO UPDATE
    SET text             = EXCLUDED.text,
        next_question_id = EXCLUDED.next_question_id;

END $$;
