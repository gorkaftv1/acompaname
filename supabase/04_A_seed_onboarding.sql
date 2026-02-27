-- =============================================================================
-- 04a_seed_onboarding_preguntas.sql — AcompañaMe
-- Cuestionario de onboarding. Sin P21 ni P21B.
-- Navegación por show_if + order_index. Sin next_question_id.
-- =============================================================================
-- -----------------------------------------------------------------------------
-- 1. Cuestionario
-- -----------------------------------------------------------------------------
INSERT INTO public.questionnaires (id, title, description, type, status)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'Onboarding — AcompañaMe',
  'Cuestionario inicial para conocer tu situación y personalizar tu experiencia.',
  'onboarding',
  'draft'
)
ON CONFLICT (id) DO UPDATE
  SET title         = EXCLUDED.title,
      description   = EXCLUDED.description,
      type          = EXCLUDED.type,
      status        = 'draft';
-- -----------------------------------------------------------------------------
-- 2. Preguntas
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  q_id UUID := 'b0000000-0000-0000-0000-000000000001';
  -- FASE 1: IDENTIDAD
  P1   UUID := 'c0000000-0000-0000-0000-000000000001';
  P2   UUID := 'c0000000-0000-0000-0000-000000000002';
  P3   UUID := 'c0000000-0000-0000-0000-000000000003';
  P4   UUID := 'c0000000-0000-0000-0000-000000000004';
  P5   UUID := 'c0000000-0000-0000-0000-000000000005';
  P6   UUID := 'c0000000-0000-0000-0000-000000000006';
  P7   UUID := 'c0000000-0000-0000-0000-000000000007';
  P8   UUID := 'c0000000-0000-0000-0000-000000000008';
  P9   UUID := 'c0000000-0000-0000-0000-000000000009';
  -- FASE 2: EL VÍNCULO
  P10  UUID := 'c0000000-0000-0000-0000-000000000010';
  -- RAMA LABORAL
  P11  UUID := 'c0000000-0000-0000-0000-000000000011';
  P12  UUID := 'c0000000-0000-0000-0000-000000000012';
  P13  UUID := 'c0000000-0000-0000-0000-000000000013';
  P14  UUID := 'c0000000-0000-0000-0000-000000000014';
  P15  UUID := 'c0000000-0000-0000-0000-000000000015';
  P15B UUID := 'c0000000-0000-0000-0000-000000000016';
  -- RAMA PAREJA (sin P21 y P21B)
  P16  UUID := 'c0000000-0000-0000-0000-000000000017';
  P17  UUID := 'c0000000-0000-0000-0000-000000000018';
  P18  UUID := 'c0000000-0000-0000-0000-000000000019';
  P19  UUID := 'c0000000-0000-0000-0000-000000000020';
  P20  UUID := 'c0000000-0000-0000-0000-000000000021';
  P21C UUID := 'c0000000-0000-0000-0000-000000000024';
  -- RAMA FAMILIAR
  P22  UUID := 'c0000000-0000-0000-0000-000000000025';
  P23  UUID := 'c0000000-0000-0000-0000-000000000026';
  P24  UUID := 'c0000000-0000-0000-0000-000000000027';
  P25  UUID := 'c0000000-0000-0000-0000-000000000028';
  P26  UUID := 'c0000000-0000-0000-0000-000000000029';
  P27  UUID := 'c0000000-0000-0000-0000-000000000030';
  P28  UUID := 'c0000000-0000-0000-0000-000000000031';
  -- RAMA AMISTAD
  P29  UUID := 'c0000000-0000-0000-0000-000000000032';
  P30  UUID := 'c0000000-0000-0000-0000-000000000033';
  P31  UUID := 'c0000000-0000-0000-0000-000000000034';
  -- RAMA OTROS
  P32  UUID := 'c0000000-0000-0000-0000-000000000035';
  P33  UUID := 'c0000000-0000-0000-0000-000000000036';
  P34  UUID := 'c0000000-0000-0000-0000-000000000037';
  -- FASE 4: CLIMA EMOCIONAL
  P35  UUID := 'c0000000-0000-0000-0000-000000000038';
  P35B UUID := 'c0000000-0000-0000-0000-000000000039';
  P35C UUID := 'c0000000-0000-0000-0000-000000000040';
  P35D UUID := 'c0000000-0000-0000-0000-000000000041';
  -- RAMA A: APAGÓN
  P36  UUID := 'c0000000-0000-0000-0000-000000000042';
  P37  UUID := 'c0000000-0000-0000-0000-000000000043';
  P38  UUID := 'c0000000-0000-0000-0000-000000000044';
  P39  UUID := 'c0000000-0000-0000-0000-000000000045';
  P40  UUID := 'c0000000-0000-0000-0000-000000000046';
  P41  UUID := 'c0000000-0000-0000-0000-000000000047';
  P42  UUID := 'c0000000-0000-0000-0000-000000000048';
  P43  UUID := 'c0000000-0000-0000-0000-000000000049';
  -- RAMA B: TENSIÓN
  P44  UUID := 'c0000000-0000-0000-0000-000000000050';
  P45  UUID := 'c0000000-0000-0000-0000-000000000051';
  P46  UUID := 'c0000000-0000-0000-0000-000000000052';
  P47  UUID := 'c0000000-0000-0000-0000-000000000053';
  P48  UUID := 'c0000000-0000-0000-0000-000000000054';
  P49  UUID := 'c0000000-0000-0000-0000-000000000055';
  P50  UUID := 'c0000000-0000-0000-0000-000000000056';
  P51  UUID := 'c0000000-0000-0000-0000-000000000057';
  -- RAMA C: DESBORDE
  P52  UUID := 'c0000000-0000-0000-0000-000000000058';
  P53  UUID := 'c0000000-0000-0000-0000-000000000059';
  P54  UUID := 'c0000000-0000-0000-0000-000000000060';
  -- CONVERGENCIA + FASE 5: CIERRE
  P55  UUID := 'c0000000-0000-0000-0000-000000000061';
  P56  UUID := 'c0000000-0000-0000-0000-000000000062';
  P57  UUID := 'c0000000-0000-0000-0000-000000000063';
  P58  UUID := 'c0000000-0000-0000-0000-000000000064';
  P59  UUID := 'c0000000-0000-0000-0000-000000000065';
  P60  UUID := 'c0000000-0000-0000-0000-000000000066';
  P61  UUID := 'c0000000-0000-0000-0000-000000000067';
  P62  UUID := 'c0000000-0000-0000-0000-000000000068';
  P63  UUID := 'c0000000-0000-0000-0000-000000000069';
  P64  UUID := 'c0000000-0000-0000-0000-000000000070';
  P65  UUID := 'c0000000-0000-0000-0000-000000000071';
  P66  UUID := 'c0000000-0000-0000-0000-000000000072';
  P67  UUID := 'c0000000-0000-0000-0000-000000000073';
  -- UUIDs de opciones clave para show_if
  P3_O2  UUID := 'd0000003-0000-0000-0003-000000000002';
  P10_O1 UUID := 'd0000010-0000-0000-0010-000000000001'; -- pareja
  P10_O2 UUID := 'd0000010-0000-0000-0010-000000000002'; -- familia
  P10_O3 UUID := 'd0000010-0000-0000-0010-000000000003'; -- amistad
  P10_O4 UUID := 'd0000010-0000-0000-0010-000000000004'; -- trabajo
  P10_O5 UUID := 'd0000010-0000-0000-0010-000000000005'; -- otros
  P16_O1 UUID := 'd0000017-0000-0000-0017-000000000001'; -- convivís
  P16_O2 UUID := 'd0000017-0000-0000-0017-000000000002'; -- no convivís
  P22_O1 UUID := 'd0000025-0000-0000-0025-000000000001'; -- convivís/muy encima
  P22_O2 UUID := 'd0000025-0000-0000-0025-000000000002'; -- bastante a menudo
  P35_O1 UUID := 'd0000038-0000-0000-0038-000000000001'; -- apagón
  P35_O2 UUID := 'd0000038-0000-0000-0038-000000000002'; -- tensión
  P35_O3 UUID := 'd0000038-0000-0000-0038-000000000003'; -- desborde
  P35_O5 UUID := 'd0000038-0000-0000-0038-000000000005'; -- mezcla
  P35_O6 UUID := 'd0000038-0000-0000-0038-000000000006'; -- no sé
  P35B_O1 UUID := 'd0000039-0000-0000-0039-000000000001';
  P35B_O2 UUID := 'd0000039-0000-0000-0039-000000000002';
  P35D_O1 UUID := 'd0000041-0000-0000-0041-000000000001';
  P35D_O2 UUID := 'd0000041-0000-0000-0041-000000000002';
  P35D_O3 UUID := 'd0000041-0000-0000-0041-000000000003';
  P62_O3  UUID := 'd0000068-0000-0000-0068-000000000003'; -- al límite
BEGIN
  INSERT INTO public.questionnaire_questions
    (id, questionnaire_id, order_index, title, description, type, show_if)
  VALUES
  -- ── FASE 1: IDENTIDAD ────────────────────────────────────────────────────────
  (P1,  q_id,  1,
    '¿Cómo te llamas?',
    NULL, 'text', NULL),
  (P2,  q_id,  2,
    '¿{{Y}} cómo llamamos a quien estás ayudando por aquí?',
    'Nombre o apodo, como te salga natural.', 'text', NULL),
  (P3,  q_id,  3,
    '¿Cuál es tu situación ahora mismo {{Y}}?',
    NULL, 'single_choice', NULL),
  (P4,  q_id,  4,
    '¿Qué es lo que estás estudiando ahora mismo {{Y}}?',
    'Para situar el ritmo que llevas.', 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P3,'option_ids',jsonb_build_array(P3_O2))
    ))),
  (P5,  q_id,  5,
    '¿Cómo llevas el ritmo y la carga de los estudios últimamente {{Y}}?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P3,'option_ids',jsonb_build_array(P3_O2))
    ))),
  (P6,  q_id,  6,
    '¿Qué es lo que más te está pesando de esta etapa de estudios {{Y}}?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P3,'option_ids',jsonb_build_array(P3_O2))
    ))),
  (P7,  q_id,  7,
    '¿Has tenido ratitos de tiempo libre de verdad en los últimos días?',
    'Sin agenda, sin obligaciones, sin sentirte culpable.', 'single_choice', NULL),
  (P8,  q_id,  8,
    '¿Qué es lo que más te recarga ahora mismo?',
    NULL, 'single_choice', NULL),
  (P9,  q_id,  9,
    '¿Cómo estás de vida social?',
    NULL, 'single_choice', NULL),
  -- ── FASE 2: EL VÍNCULO ──────────────────────────────────────────────────────
  (P10, q_id, 10,
    '¿Qué es esta {{X}} para ti?',
    NULL, 'single_choice', NULL),
  -- ── RAMA LABORAL ─────────────────────────────────────────────────────────────
  (P11, q_id, 11,
    'En el curro: ¿cómo va la cosa con {{X}}?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O4))
    ))),
  (P12, q_id, 12,
    'En una semana normal, ¿Soléis coincidir mucho?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O4))
    ))),
  (P13, q_id, 13,
    'En el equipo o en el entorno laboral: ¿cómo se percibe esto?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O4))
    ))),
  (P14, q_id, 14,
    '¿Cómo es la relación con quien tiene autoridad?',
    'Tu jefe/a, el mando, o quien marque el ritmo.', 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O4))
    ))),
  (P15, q_id, 15,
    '¿Te escribe fuera de horas o te pide cosas que no tocan?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O4))
    ))),
  (P15B, q_id, 16,
    'Si esto saliera bien: ¿en qué 1-2 momentos te gustaría notarlo?',
    'Cuéntamelo en una frase, tipo: "cuando pasa X..."', 'text',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O4))
    ))),
  -- ── RAMA PAREJA (sin P21 y P21B) ─────────────────────────────────────────────
  (P16, q_id, 17,
    'Con esta persona: ¿vivís juntos?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O1))
    ))),
  (P17, q_id, 18,
    'En casa, cuando se tensiona, ¿hay espacio para despejarse?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P16,'option_ids',jsonb_build_array(P16_O1))
    ))),
  (P18, q_id, 19,
    '¿Con qué frecuencia habláis o os veis ahora mismo?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P16,'option_ids',jsonb_build_array(P16_O2))
    ))),
  (P19, q_id, 20,
    '¿Hasta qué punto hay independencia dentro de la relación?',
    'Proyectos, tiempo y espacio propios.', 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O1))
    ))),
  (P20, q_id, 21,
    '¿Gestionáis cosas juntos como equipo?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O1))
    ))),
  (P21C, q_id, 22,
    '¿En qué 1-2 momentos te gustaría notar que esto mejora?',
    NULL, 'text',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O1))
    ))),
  -- ── RAMA FAMILIAR ────────────────────────────────────────────────────────────
  (P22, q_id, 23,
    '¿Convivís, o estás muy encima casi a diario?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O2))
    ))),
  (P23, q_id, 24,
    '¿Tiene un rincón propio donde estar a su bola?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P22,'option_ids',jsonb_build_array(P22_O1))
    ))),
  (P24, q_id, 25,
    '¿Hay distancia física de por medio entre vosotros?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P22,'option_ids',jsonb_build_array(P22_O2))
    ))),
  (P25, q_id, 26,
    '¿La rutina familiar se ha reorganizado alrededor de él/ella?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O2))
    ))),
  (P26, q_id, 27,
    '¿Hay más familia implicada, o lo llevas casi solo/a?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O2))
    ))),
  (P27, q_id, 28,
    '¿Hay planes familiares que dependan de cómo evolucione esto?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O2))
    ))),
  (P28, q_id, 29,
    '¿En qué 1-2 situaciones te gustaría notar que esto mejora?',
    NULL, 'text',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O2))
    ))),
  -- ── RAMA AMISTAD ─────────────────────────────────────────────────────────────
  (P29, q_id, 30,
    '¿Cuánto habláis u os veis ahora mismo?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O3))
    ))),
  (P30, q_id, 31,
    'Siendo honestos/as: ¿cómo llevas tú esta situación?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O3))
    ))),
  (P31, q_id, 32,
    '¿En qué 1-2 momentos te gustaría que esto te ayudara?',
    NULL, 'text',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O3))
    ))),
  -- ── RAMA OTROS ───────────────────────────────────────────────────────────────
  (P32, q_id, 33,
    '¿Dónde pasa casi todo lo de esta persona contigo?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O5))
    ))),
  (P33, q_id, 34,
    '¿Cuánto contacto tienes con esta persona en una semana?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O5))
    ))),
  (P34, q_id, 35,
    '¿En qué 1-2 situaciones te gustaría notar que mejora?',
    NULL, 'text',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P10,'option_ids',jsonb_build_array(P10_O5))
    ))),
  -- ── FASE 4: CLIMA EMOCIONAL ──────────────────────────────────────────────────
  (P35, q_id, 36,
    '¿Cómo describirías el clima con esta persona últimamente?',
    NULL, 'single_choice', NULL),
  (P35B, q_id, 37,
    '¿Cómo dirías que se ha sentido el ambiente hoy?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35,'option_ids',jsonb_build_array(P35_O5))
    ))),
  (P35C, q_id, 38,
    'Cuéntame con tus propias palabras qué es lo que más te agobia o te pesa.',
    'No te preocupes por ordenarlo.', 'text',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35,'option_ids',jsonb_build_array(P35_O6))
    ))),
  (P35D, q_id, 39,
    'Lo que más te pesa ahora mismo en esta relación es...',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35,'option_ids',jsonb_build_array(P35_O6))
    ))),
  -- ── RAMA A: APAGÓN ───────────────────────────────────────────────────────────
  (P36, q_id, 40,
    '¿Qué es lo que más ha cambiado en la dinámica entre vosotros?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O1)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O1)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O1))
    ))),
  (P37, q_id, 41,
    '¿Las rutinas de descanso de esta persona se han desordenado?',
    'Horas de dormir, calidad del sueño.', 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O1)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O1)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O1))
    ))),
  (P38, q_id, 42,
    '¿Y con las rutinas de alimentación? ¿Has notado algún cambio?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O1)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O1)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O1))
    ))),
  (P39, q_id, 43,
    '¿Ha dejado de participar en cosas que antes le daban energía o ilusión?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O1)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O1)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O1))
    ))),
  (P40, q_id, 44,
    'Últimamente: ¿está más retraído/a?',
    'Tarda en contestar, cancela planes, se le ve menos.', 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O1)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O1)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O1))
    ))),
  (P41, q_id, 45,
    '¿Tiene momentos de mucho agobio o bloqueo, donde todo se le viene encima?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O1)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O1)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O1))
    ))),
  (P42, q_id, 46,
    '¿Sientes que está pudiendo con el día a día, o que la situación le supera?',
    'Levantarse, comer, moverse.', 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O1)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O1)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O1))
    ))),
  (P43, q_id, 47,
    '¿Te da la sensación de que {{X}} está como ded bajón y parece que simplemente está?',
    'Evita ciertos temas, sitios o personas.', 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O1)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O1)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O1))
    ))),
  -- ── RAMA B: TENSIÓN ──────────────────────────────────────────────────────────
  (P44, q_id, 48,
    '¿Qué es lo que más se repite en vuestra dinámica?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O2)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O2))
    ))),
  (P45, q_id, 49,
    '¿Tienes que tener extremo cuidado cuando hablas con {{X}} para evitar situaciones no deseadas?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O2)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O2))
    ))),
  (P46, q_id, 50,
    '¿Qué suele encender la mecha?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O2)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O2))
    ))),
  (P47, q_id, 51,
    'Cuando entra en ese bucle: ¿qué busca? ¿Calmarse, evitar algo, prevenir?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O2)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O2))
    ))),
  (P48, q_id, 52,
    '¿Estas situaciones te pillan de sorpresa o ya lo ves venir?',
    'Ciertas horas, sitios, personas.', 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O2)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O2))
    ))),
  (P49, q_id, 53,
    '¿Cuando intentas calmar la situación que pasa?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O2)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O2))
    ))),
  (P50, q_id, 54,
    'EL bucle de que ocurra algo → se ponga en alerta → reaccione... ¿y después qué?',
    'Cuéntamelo en 2-3 frases.', 'text',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O2)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O2))
    ))),
  (P51, q_id, 55,
    '¿Te empuja a que hagas las cosas a su manera?',
    'Insiste mucho, hay culpa, presión o reparo para decir que no.', 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O2)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O2))
    ))),
  -- ── RAMA C: DESBORDE ─────────────────────────────────────────────────────────
  (P52, q_id, 56,
    'Cuando dices que se desborda o salta límites: ¿cómo lo describirías?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O3)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O3))
    ))),
  (P53, q_id, 57,
    '¿Esto pasa de vez en cuando, o está siendo muy frecuente?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O3)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O3))
    ))),
  (P54, q_id, 58,
    '¿Qué suele dispararlo? A veces hay un patrón claro.',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P35, 'option_ids',jsonb_build_array(P35_O3)),
      jsonb_build_object('question_id',P35B,'option_ids',jsonb_build_array(P35B_O2)),
      jsonb_build_object('question_id',P35D,'option_ids',jsonb_build_array(P35D_O3))
    ))),
  -- ── CONVERGENCIA ─────────────────────────────────────────────────────────────
  (P55, q_id, 59,
    '¿Cómo te sientes tú gestionando esta situación en este momento?',
    NULL, 'single_choice', NULL),
  -- ── FASE 5: CIERRE ───────────────────────────────────────────────────────────
  (P56, q_id, 60,
    '¿Qué has hecho hasta ahora que haya ayudado, aunque sea un pelín?',
    NULL, 'text', NULL),
  (P57, q_id, 61,
    '¿Y qué has probado que lo ha complicado más o no ha ido bien?',
    'Para no repetirlo.', 'text', NULL),
  (P58, q_id, 62,
    'Si dentro de una semana las cosas están mejor: ¿qué señales lo indicarían?',
    'Menos roces, mejor ambiente, más conexión, más calma.', 'text', NULL),
  (P59, q_id, 63,
    'Ahora tú: ¿cómo estás hoy? Del 0 al 10.',
    NULL, 'single_choice', NULL),
  (P60, q_id, 64,
    '¿Has tenido aunque sea ratitos de calma en los últimos 10 días?',
    NULL, 'single_choice', NULL),
  (P61, q_id, 65,
    '¿Notas que estás disfrutando menos de lo que normalmente te recarga?',
    'Salir, descansar, hobbies, tiempo con gente.', 'single_choice', NULL),
  (P62, q_id, 66,
    '¿Cómo te sientes manteniendo esta situación?',
    NULL, 'single_choice', NULL),
  (P63, q_id, 67,
    '¿Qué es lo que más te agota?',
    NULL, 'single_choice',
    jsonb_build_object('operator','OR','conditions',jsonb_build_array(
      jsonb_build_object('question_id',P62,'option_ids',jsonb_build_array(P62_O3))
    ))),
  (P64, q_id, 68,
    '¿Quién te está apoyando ahora mismo?',
    NULL, 'single_choice', NULL),
  (P65, q_id, 69,
    '¿{{Y}} tienes algún tipo de norma que sigues para que la situación no te sobrepase?',
    NULL, 'single_choice', NULL),
  (P66, q_id, 70,
    '¿Qué te gustaría llevarte de esta conversación?',
    NULL, 'single_choice', NULL)
  ON CONFLICT (id) DO UPDATE
    SET title       = EXCLUDED.title,
        description = EXCLUDED.description,
        type        = EXCLUDED.type,
        order_index = EXCLUDED.order_index,
        show_if     = EXCLUDED.show_if;
  RAISE NOTICE '✅ 71 preguntas insertadas.';
END $$;
