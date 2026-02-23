-- =============================================================================
-- seed.sql — AcompañaMe
-- Cuestionario completo "Onboarding - AcompañaMe" con saltos lógicos
-- Arquitectura User-Centric | Saneamiento de datos exclusivo en Frontend
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. USUARIO ADMIN
-- -----------------------------------------------------------------------------
-- Requiere la extensión pgcrypto (activa por defecto en Supabase)
-- El trigger handle_new_user creará el perfil automáticamente con role='user'.
-- El INSERT posterior lo eleva a 'admin' mediante ON CONFLICT DO UPDATE.


-- -----------------------------------------------------------------------------
-- 2. CUESTIONARIO PRINCIPAL
-- -----------------------------------------------------------------------------
INSERT INTO public.questionnaires (id, title, description, is_active)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'Onboarding',
  'Cuestionario inicial para conocer a la persona que acompaña y su situación.',
  true
);


-- =============================================================================
-- 3. PREGUNTAS{{Y}} OPCIONES
-- Convención de UUIDs:
--   Preguntas: c0000000-0000-0000-0000-{PXXX en hex con padding}
--   Opciones:  d0000000-0000-0000-{PXX}-{OPT_INDEX con padding}
-- =============================================================================

-- Usamos variables de bloque DO $$ para insertar en orden y referenciar UUIDs
-- de forma legible. Se insertan primero TODAS las preguntas, luego las opciones,
-- para que las FK de next_question_id puedan resolverse.

DO $$
DECLARE
  q_id UUID := 'b0000000-0000-0000-0000-000000000001'; -- questionnaire_id

  -- ─── FASE 1: IDENTIDAD ────────────────────────────────────────────────────
  P1   UUID := 'c0000000-0000-0000-0000-000000000001';
  P2   UUID := 'c0000000-0000-0000-0000-000000000002';
  P3   UUID := 'c0000000-0000-0000-0000-000000000003';
  -- Bloque Estudios
  P4   UUID := 'c0000000-0000-0000-0000-000000000004';
  P5   UUID := 'c0000000-0000-0000-0000-000000000005';
  P6   UUID := 'c0000000-0000-0000-0000-000000000006';
  -- Vida Personal
  P7   UUID := 'c0000000-0000-0000-0000-000000000007';
  P8   UUID := 'c0000000-0000-0000-0000-000000000008';
  P9   UUID := 'c0000000-0000-0000-0000-000000000009';

  -- ─── FASE 2: EL VÍNCULO ───────────────────────────────────────────────────
  P10  UUID := 'c0000000-0000-0000-0000-000000000010';

  -- Rama Laboral
  P11  UUID := 'c0000000-0000-0000-0000-000000000011';
  P12  UUID := 'c0000000-0000-0000-0000-000000000012';
  P13  UUID := 'c0000000-0000-0000-0000-000000000013';
  P14  UUID := 'c0000000-0000-0000-0000-000000000014';
  P15  UUID := 'c0000000-0000-0000-0000-000000000015';
  P15B UUID := 'c0000000-0000-0000-0000-000000000016'; -- P15B

  -- Rama Pareja
  P16  UUID := 'c0000000-0000-0000-0000-000000000017';
  P17  UUID := 'c0000000-0000-0000-0000-000000000018';
  P18  UUID := 'c0000000-0000-0000-0000-000000000019';
  P19  UUID := 'c0000000-0000-0000-0000-000000000020';
  P20  UUID := 'c0000000-0000-0000-0000-000000000021';
  P21  UUID := 'c0000000-0000-0000-0000-000000000022';
  P21B UUID := 'c0000000-0000-0000-0000-000000000023'; -- P21B
  P21C UUID := 'c0000000-0000-0000-0000-000000000024'; -- P21C

  -- Rama Familiar
  P22  UUID := 'c0000000-0000-0000-0000-000000000025';
  P23  UUID := 'c0000000-0000-0000-0000-000000000026';
  P24  UUID := 'c0000000-0000-0000-0000-000000000027';
  P25  UUID := 'c0000000-0000-0000-0000-000000000028';
  P26  UUID := 'c0000000-0000-0000-0000-000000000029';
  P27  UUID := 'c0000000-0000-0000-0000-000000000030';
  P28  UUID := 'c0000000-0000-0000-0000-000000000031';

  -- Rama Amistad
  P29  UUID := 'c0000000-0000-0000-0000-000000000032';
  P30  UUID := 'c0000000-0000-0000-0000-000000000033';
  P31  UUID := 'c0000000-0000-0000-0000-000000000034';

  -- Rama Otros
  P32  UUID := 'c0000000-0000-0000-0000-000000000035';
  P33  UUID := 'c0000000-0000-0000-0000-000000000036';
  P34  UUID := 'c0000000-0000-0000-0000-000000000037';

  -- ─── FASE 4: CLIMA EMOCIONAL ──────────────────────────────────────────────
  P35  UUID := 'c0000000-0000-0000-0000-000000000038';
  P35B UUID := 'c0000000-0000-0000-0000-000000000039';
  P35C UUID := 'c0000000-0000-0000-0000-000000000040';
  P35D UUID := 'c0000000-0000-0000-0000-000000000041';

  -- Rama A — Apagón
  P36  UUID := 'c0000000-0000-0000-0000-000000000042';
  P37  UUID := 'c0000000-0000-0000-0000-000000000043';
  P38  UUID := 'c0000000-0000-0000-0000-000000000044';
  P39  UUID := 'c0000000-0000-0000-0000-000000000045';
  P40  UUID := 'c0000000-0000-0000-0000-000000000046';
  P41  UUID := 'c0000000-0000-0000-0000-000000000047';
  P42  UUID := 'c0000000-0000-0000-0000-000000000048';
  P43  UUID := 'c0000000-0000-0000-0000-000000000049';

  -- Rama B — Tensión
  P44  UUID := 'c0000000-0000-0000-0000-000000000050';
  P45  UUID := 'c0000000-0000-0000-0000-000000000051';
  P46  UUID := 'c0000000-0000-0000-0000-000000000052';
  P47  UUID := 'c0000000-0000-0000-0000-000000000053';
  P48  UUID := 'c0000000-0000-0000-0000-000000000054';
  P49  UUID := 'c0000000-0000-0000-0000-000000000055';
  P50  UUID := 'c0000000-0000-0000-0000-000000000056';
  P51  UUID := 'c0000000-0000-0000-0000-000000000057';

  -- Rama C — Desborde
  P52  UUID := 'c0000000-0000-0000-0000-000000000058';
  P53  UUID := 'c0000000-0000-0000-0000-000000000059';
  P54  UUID := 'c0000000-0000-0000-0000-000000000060';

  -- Convergencia
  P55  UUID := 'c0000000-0000-0000-0000-000000000061';

  -- ─── FASE 5: CIERRE ───────────────────────────────────────────────────────
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

BEGIN

-- =============================================================================
-- INSERTAR PREGUNTAS (todas primero, sin opciones aún)
-- =============================================================================

INSERT INTO public.questionnaire_questions
  (id, questionnaire_id, order_index, title, description, type, is_first_question)
VALUES

-- ── FASE 1: IDENTIDAD ─────────────────────────────────────────────────────────
(P1,  q_id,  1,  'P1 — ¿Cómo te llamas?',
  NULL, 'text', true),

(P2,  q_id,  2,  'P2 — ¿Y cómo llamamos a la persona que acompañas por aquí?',
  'Nombre o apodo, como te salga natural.', 'text', false),

(P3,  q_id,  3,  'P3 — {{Y}}, para entenderte un poco mejor antes de entrar en lo de {{X}}: ¿cuál es tu situación ahora mismo?',
  NULL, 'single_choice', false),

-- Bloque Estudios
(P4,  q_id,  4,  'P4 — ¿Qué es lo que estás estudiando ahora mismo?',
  'Para situar el ritmo que llevas.', 'single_choice', false),

(P5,  q_id,  5,  'P5 — ¿Cómo llevas el ritmo y la carga de los estudios últimamente?',
  NULL, 'single_choice', false),

(P6,  q_id,  6,  'P6 — ¿Qué es lo que más te está pesando de esta etapa de estudios?',
  NULL, 'single_choice', false),

-- Vida Personal
(P7,  q_id,  7,  'P7 — En estos últimos 10 días, ¿has tenido ratitos de tiempo libre de verdad?',
  'Es decir, sin agenda, sin obligaciones, sin sentirte culpable.', 'single_choice', false),

(P8,  q_id,  8,  'P8 — Cuando tienes un rato para ti, {{Y}}: ¿qué es lo que más te recarga ahora mismo?',
  NULL, 'single_choice', false),

(P9,  q_id,  9,  'P9 —{{Y}} de vida social, ¿cómo estás tú, {{Y}}, ahora mismo?',
  NULL, 'single_choice', false),

-- ── FASE 2: EL VÍNCULO ────────────────────────────────────────────────────────
(P10, q_id, 10, 'P10 — Para no ir a ciegas: ¿qué es {{X}} para ti?',
  NULL, 'single_choice', false),

-- ── FASE 3: RAMA LABORAL ──────────────────────────────────────────────────────
(P11, q_id, 11, 'P11 — En el curro: ¿cómo es la dinámica entre tú y {{X}}?',
  NULL, 'single_choice', false),

(P12, q_id, 12, 'P12 — En una semana normal, ¿cuánto os toca trataros tú y {{X}}?',
  NULL, 'single_choice', false),

(P13, q_id, 13, 'P13 —{{Y}} esto en el equipo o en el entorno laboral: ¿cómo se percibe?',
  NULL, 'single_choice', false),

(P14, q_id, 14, 'P14 — ¿Cómo es la relación con quien tiene autoridad en este contexto laboral?',
  'Tu jefe/a, el mando, o quien marque el ritmo.', 'single_choice', false),

(P15, q_id, 15, 'P15 — ¿{{X}} te escribe fuera de horas o te pide cosas que te dejan con cara de "esto no toca"?',
  NULL, 'single_choice', false),

(P15B, q_id, 16, 'P15B — Si esta conversación te saliera bien de verdad: ¿en qué 1–2 momentos con {{X}} te gustaría notarlo?',
  'Cuéntamelo en una frase, tipo: "cuando pasa X..."', 'text', false),

-- ── FASE 3: RAMA PAREJA ───────────────────────────────────────────────────────
(P16, q_id, 17, 'P16 — Con {{X}}: ¿vivís juntos?',
  NULL, 'single_choice', false),

(P17, q_id, 18, 'P17 — En casa, cuando las cosas se tensan: ¿hay manera de que cada uno tenga su espacio un rato?',
  NULL, 'single_choice', false),

(P18, q_id, 19, 'P18 — Si no convivís: ¿con qué frecuencia habláis o os veis tú y {{X}} ahora mismo?',
  NULL, 'single_choice', false),

(P19, q_id, 20, 'P19 — ¿Hasta qué punto cada uno/a de los dos tiene su espacio, proyectos o tiempo propios?',
  'Es decir: ¿hay independencia dentro de la relación?', 'single_choice', false),

(P20, q_id, 21, 'P20 — ¿Hay proyectos, responsabilidades o temas del día a día que los dos gestionáis juntos, como equipo?',
  NULL, 'single_choice', false),

(P21, q_id, 22, 'P21 — ¿La familia política (la familia de {{X}}) tiene un papel activo en vuestra relación o en la situación actual?',
  NULL, 'single_choice', false),

(P21B, q_id, 23, 'P21B — Te pregunto con cuidado: ¿hay peques u otra gente en casa a quien esta situación le esté salpicando fuerte?',
  NULL, 'single_choice', false),

(P21C, q_id, 24, 'P21C — Si esto mejorara: ¿en qué 1–2 momentos con {{X}} te gustaría que esta conversación te echara un cable?',
  NULL, 'text', false),

-- ── FASE 3: RAMA FAMILIAR ─────────────────────────────────────────────────────
(P22, q_id, 25, 'P22 — Con {{X}}: ¿convivís, o te toca estar muy encima casi a diario?',
  NULL, 'single_choice', false),

(P23, q_id, 26, 'P23 — En casa, {{X}} tiene un rincón propio de verdad: ¿un espacio donde pueda estar a su bola?',
  NULL, 'single_choice', false),

(P24, q_id, 27, 'P24 — ¿Vivís o convivís cerca, o hay distancia física de por medio entre tú y {{X}}?',
  NULL, 'single_choice', false),

(P25, q_id, 28, 'P25 — En plan rutina familiar: ¿hasta qué punto la dinámica de casa se ha ido reorganizando alrededor de cómo está {{X}}?',
  NULL, 'single_choice', false),

(P26, q_id, 29, 'P26 — ¿Hay más familia implicada en esta situación, o lo estás llevando tú casi solo/a?',
  NULL, 'single_choice', false),

(P27, q_id, 30, 'P27 — ¿Hay planes familiares concretos para los próximos meses que dependan de cómo evolucione la situación de {{X}}?',
  NULL, 'single_choice', false),

(P28, q_id, 31, 'P28 — Si esta conversación funcionara bien: ¿en qué 1–2 situaciones con {{X}} te gustaría notarlo?',
  NULL, 'text', false),

-- ── FASE 3: RAMA AMISTAD ──────────────────────────────────────────────────────
(P29, q_id, 32, 'P29 — Con {{X}}: ¿cuánto habláis o os veis ahora?',
  NULL, 'single_choice', false),

(P30, q_id, 33, 'P30 — Siendo honestos/as: ¿cómo llevas tú esta situación?',
  NULL, 'single_choice', false),

(P31, q_id, 34, 'P31 — Si esto saliera bien: ¿en qué 1–2 momentos con {{X}} te gustaría que esta conversación te ayudara?',
  NULL, 'text', false),

-- ── FASE 3: RAMA OTROS ────────────────────────────────────────────────────────
(P32, q_id, 35, 'P32 — ¿Dónde pasa casi todo lo de {{X}} contigo? Para situarme rápido.',
  NULL, 'single_choice', false),

(P33, q_id, 36, 'P33 — En una semana normal: ¿cuánto contacto tienes con {{X}}?',
  NULL, 'single_choice', false),

(P34, q_id, 37, 'P34 — Si esto saliera bien: ¿en qué 1–2 situaciones con {{X}} te gustaría notarlo?',
  NULL, 'text', false),

-- ── FASE 4: CLIMA EMOCIONAL ───────────────────────────────────────────────────
(P35, q_id, 38, 'P35 — Vale y llendo al grano: ¿cómo describirías el clima con {{X}} últimamente?',
  NULL, 'single_choice', false),

(P35B, q_id, 39, 'P35B — Si tuvieras que quedarte con el clima que más pesa hoy, ¿cuál sería?',
  NULL, 'single_choice', false),

(P35C, q_id, 40, 'P35C — Cuéntame con tus propias palabras qué es lo que más te agobia o te pesa de la situación con {{X}}.',
  'No te preocupes por ordenarlo.', 'text', false),

(P35D, q_id, 41, 'P35D — Lo que más te pesa ahora mismo en la relación con {{X}} es...',
  NULL, 'single_choice', false),

-- Rama A — Apagón
(P36, q_id, 42, 'P36 — Cuéntame más. En estas últimas dos semanas: ¿qué es lo que más ha cambiado en la dinámica entre vosotros?',
  NULL, 'single_choice', false),

(P37, q_id, 43, 'P37 — ¿Notas que las rutinas de descanso de {{X}} se han desordenado? (Horas de dormir, calidad del sueño.)',
  NULL, 'single_choice', false),

(P38, q_id, 44, 'P38 — ¿Y con las rutinas de alimentación de {{X}}? ¿Has notado que algo ha cambiado?',
  NULL, 'single_choice', false),

(P39, q_id, 45, 'P39 — ¿{{X}} ha dejado de participar en cosas que antes le daban energía o ilusión?',
  NULL, 'single_choice', false),

(P40, q_id, 46, 'P40 — Últimamente: ¿{{X}} está más retraído/a?',
  'Tarda en contestar, cancela planes, se le ve menos.', 'single_choice', false),

(P41, q_id, 47, 'P41 — ¿{{X}} tiene momentos de mucho agobio o bloqueo, donde parece que se le viene todo encima de golpe?',
  NULL, 'single_choice', false),

(P42, q_id, 48, 'P42 — ¿Sientes que {{X}} está pudiendo con su día a día, o que la situación le supera?',
  'Levantarse, comer algo, moverse.', 'single_choice', false),

(P43, q_id, 49, 'P43 — ¿Te da la sensación de que {{X}} está en modo "sobrevivir el día"?',
  'Evita ciertos temas, sitios o personas, como si todo le costara más de lo normal.', 'single_choice', false),

-- Rama B — Tensión
(P44, q_id, 50, 'P44 — Con {{X}}: suena a bucle. ¿Qué es lo que más se repite en vuestra dinámica?',
  NULL, 'single_choice', false),

(P45, q_id, 51, 'P45 — ¿Sientes que vas como pisando huevos con {{X}} para que no se altere?',
  NULL, 'single_choice', false),

(P46, q_id, 52, 'P46 — ¿Qué suele encender la mecha en {{X}}?',
  NULL, 'single_choice', false),

(P47, q_id, 53, 'P47 — Cuando {{X}} entra en ese bucle: ¿dirías que lo que busca es calmarse, sentirse seguro/a, evitar algo, o prevenir que pase algo malo?',
  NULL, 'single_choice', false),

(P48, q_id, 54, 'P48 — ¿Esto con {{X}} te pilla de sorpresa, o ya lo ves venir?',
  'Ciertas horas, sitios, personas.', 'single_choice', false),

(P49, q_id, 55, 'P49 — Cuando intentas pausar o redirigir la situación con {{X}}: ¿qué suele pasar?',
  NULL, 'single_choice', false),

(P50, q_id, 56, 'P50 — Si lo ponemos en cámara lenta: ocurre algo → {{X}} se pone en alerta → reacciona de cierta manera... ¿y después qué?',
  '¿Se calma un rato, o la tensión sigue? Cuéntamelo en 2–3 frases.', 'text', false),

(P51, q_id, 57, 'P51 — ¿{{X}} te empuja a que hagas las cosas a su manera?',
  'Insiste mucho, hay culpa, presión, o te da reparo decir que no.', 'single_choice', false),

-- Rama C — Desborde
(P52, q_id, 58, 'P52 — Cuando dices que {{X}} se desborda o se salta límites: ¿cómo lo describirías?',
  NULL, 'single_choice', false),

(P53, q_id, 59, 'P53 — ¿Esto con {{X}} pasa de vez en cuando, o está siendo muy frecuente?',
  NULL, 'single_choice', false),

(P54, q_id, 60, 'P54 — ¿Qué suele dispararlo? A veces hay un patrón claro.',
  NULL, 'single_choice', false),

-- ── CONVERGENCIA ──────────────────────────────────────────────────────────────
(P55, q_id, 61, 'P55 — Antes de seguir: ¿cómo te sientes tú, {{Y}}, gestionando esta situación con {{X}} en este momento?',
  NULL, 'single_choice', false),

-- ── FASE 5: CIERRE ────────────────────────────────────────────────────────────
(P56, q_id, 62, 'P56 —{{Y}} hasta ahora con {{X}}: ¿qué has hecho que haya ayudado, aunque sea un pelín?',
  NULL, 'text', false),

(P57, q_id, 63, 'P57 — ¿Y qué has probado que, visto en retrospectiva, lo ha complicado más o no ha ido bien?',
  'Para no repetirlo.', 'text', false),

(P58, q_id, 64, 'P58 — Imagina que dentro de una semana las cosas están mejor con {{X}}. ¿Qué señales concretas lo indicarían?',
  'Menos roces, mejor ambiente, más conexión, más calma.', 'text', false),

(P59, q_id, 65, 'P59 —{{Y}} ahora tú, {{Y}}: de verdad, ¿cómo estás hoy? Del 0 al 10.',
  NULL, 'single_choice', false),

(P60, q_id, 66, 'P60 — En estos últimos 10 días: ¿has tenido aunque sea ratitos de calma o de sentirte un poco bien?',
  NULL, 'single_choice', false),

(P61, q_id, 67, 'P61 — ¿Notas que estás disfrutando menos de las cosas que normalmente te recargan?',
  'Salir, descansar, hobbies, tiempo con gente.', 'single_choice', false),

(P62, q_id, 68, 'P62 — Ahora mismo, para sostener esta situación con {{X}}: ¿cómo te sientes?',
  NULL, 'single_choice', false),

(P63, q_id, 69, 'P63 — ¿Qué es lo que más te está desgastando por dentro últimamente?',
  'Solo se muestra si en P62 seleccionaste "Voy al límite, no doy más".', 'single_choice', false),

(P64, q_id, 70, 'P64 — ¿Con quién te apoyas tú ahora mismo?',
  NULL, 'single_choice', false),

(P65, q_id, 71, 'P65 — Para poder cuidar a {{X}} sin romperte tú: ¿qué acuerdo contigo mismo/a necesitas sí o sí?',
  NULL, 'single_choice', false),

(P66, q_id, 72, 'P66 — Con {{X}}: ¿hay ya algún tipo de acompañamiento o apoyo externo en marcha?',
  'Orientación, coaching, consulta.', 'single_choice', false),

(P67, q_id, 73, 'P67 — Para cerrar por hoy, {{Y}}: ¿qué te gustaría llevarte de esta conversación?',
  NULL, 'single_choice', false);


-- =============================================================================
-- INSERTAR OPCIONES (con next_question_id ya resuelto)
-- =============================================================================

INSERT INTO public.question_options (id, question_id, order_index, text, next_question_id) VALUES

-- ── P1 (text → P2) ────────────────────────────────────────────────────────────
('d0000001-0000-0000-0001-000000000001', P1, 1, 'Escribe tu nombre', P2),

-- ── P2 (text → P3) ────────────────────────────────────────────────────────────
('d0000002-0000-0000-0002-000000000001', P2, 1, 'Escribe el nombre o apodo', P3),

-- ── P3 ────────────────────────────────────────────────────────────────────────
('d0000003-0000-0000-0003-000000000001', P3, 1, 'Estoy trabajando', P7),
('d0000003-0000-0000-0003-000000000002', P3, 2, 'Estoy estudiando', P4),
('d0000003-0000-0000-0003-000000000003', P3, 3, 'Estoy de descanso / entre etapas', P7),
('d0000003-0000-0000-0003-000000000004', P3, 4, 'Combino trabajo y estudios', P7),

-- ── P4 ────────────────────────────────────────────────────────────────────────
('d0000004-0000-0000-0004-000000000001', P4, 1, 'Estoy en la universidad o un máster', P5),
('d0000004-0000-0000-0004-000000000002', P4, 2, 'Estoy preparando unas oposiciones', P5),
('d0000004-0000-0000-0004-000000000003', P4, 3, 'Hago FP o un curso de formación', P5),
('d0000004-0000-0000-0004-000000000004', P4, 4, 'Estoy en el cole/bachillerato o preparando selectividad', P5),

-- ── P5 ────────────────────────────────────────────────────────────────────────
('d0000005-0000-0000-0005-000000000001', P5, 1, 'Bien, lo llevo bastante controlado', P6),
('d0000005-0000-0000-0005-000000000002', P5, 2, 'Regular, voy a rachas', P6),
('d0000005-0000-0000-0005-000000000003', P5, 3, 'Me está costando, voy algo justo/a', P6),
('d0000005-0000-0000-0005-000000000004', P5, 4, 'Estoy bastante saturado/a o bloqueado/a', P6),

-- ── P6 ────────────────────────────────────────────────────────────────────────
('d0000006-0000-0000-0006-000000000001', P6, 1, 'La presión de los resultados y los exámenes', P7),
('d0000006-0000-0000-0006-000000000002', P6, 2, 'El tiempo: no llego a todo lo que me gustaría', P7),
('d0000006-0000-0000-0006-000000000003', P6, 3, 'La motivación: tengo dudas de si este camino es el mío', P7),
('d0000006-0000-0000-0006-000000000004', P6, 4, 'El ambiente: la clase, el profesorado o los compañeros', P7),

-- ── P7 ────────────────────────────────────────────────────────────────────────
('d0000007-0000-0000-0007-000000000001', P7, 1, 'Sí, bastante. Me he podido desconectar', P8),
('d0000007-0000-0000-0007-000000000002', P7, 2, 'Alguno, pero se me escapa rápido', P8),
('d0000007-0000-0000-0007-000000000003', P7, 3, 'Casi ninguno, voy con todo muy apretado/a', P8),
('d0000007-0000-0000-0007-000000000004', P7, 4, 'Ni sé lo que es eso últimamente', P8),

-- ── P8 ────────────────────────────────────────────────────────────────────────
('d0000008-0000-0000-0008-000000000001', P8, 1, 'Mover el cuerpo: deporte, caminar, bailar...', P9),
('d0000008-0000-0000-0008-000000000002', P8, 2, 'Algo creativo o mental: leer, música, series, aprender', P9),
('d0000008-0000-0000-0008-000000000003', P8, 3, 'Desconectar del todo: no pensar, no hacer', P9),
('d0000008-0000-0000-0008-000000000004', P8, 4, 'Estar con gente: planes sociales, quedar, hablar', P9),

-- ── P9 ────────────────────────────────────────────────────────────────────────
('d0000009-0000-0000-0009-000000000001', P9, 1, 'Bien, tengo red y me siento acompañado/a', P10),
('d0000009-0000-0000-0009-000000000002', P9, 2, 'Tengo a alguien, pero me gustaría más apoyo', P10),
('d0000009-0000-0000-0009-000000000003', P9, 3, 'Me siento bastante solo/a con todo esto', P10),
('d0000009-0000-0000-0009-000000000004', P9, 4, 'Prefiero no entrar ahí ahora mismo', P10),

-- ── P10 — El Vínculo ──────────────────────────────────────────────────────────
('d0000010-0000-0000-0010-000000000001', P10, 1, 'Es alguien del trabajo', P11),
('d0000010-0000-0000-0010-000000000002', P10, 2, 'Es mi pareja', P16),
('d0000010-0000-0000-0010-000000000003', P10, 3, 'Es familia', P22),
('d0000010-0000-0000-0010-000000000004', P10, 4, 'Es un/a amigo/a', P29),
('d0000010-0000-0000-0010-000000000005', P10, 5, 'Es otra cosa, te cuento', P32),

-- ── P11 ────────────────────────────────────────────────────────────────────────
('d0000011-0000-0000-0011-000000000001', P11, 1, 'X está en mi equipo / me reporta', P12),
('d0000011-0000-0000-0011-000000000002', P11, 2, 'Yo estoy en el equipo de{{X}}/ le reporto', P12),
('d0000011-0000-0000-0011-000000000003', P11, 3, 'Estamos al mismo nivel', P12),
('d0000011-0000-0000-0011-000000000004', P11, 4, 'Es cliente, proveedor o algo parecido', P12),
('d0000011-0000-0000-0011-000000000005', P11, 5, 'Es difícil de etiquetar', P12),

-- ── P12 ────────────────────────────────────────────────────────────────────────
('d0000012-0000-0000-0012-000000000001', P12, 1, 'Casi todos los días', P13),
('d0000012-0000-0000-0012-000000000002', P12, 2, 'Varias veces a la semana', P13),
('d0000012-0000-0000-0012-000000000003', P12, 3, 'Una vez por semana o menos', P13),
('d0000012-0000-0000-0012-000000000004', P12, 4, 'Solo cuando hay proyectos o situaciones puntuales', P13),

-- ── P13 ────────────────────────────────────────────────────────────────────────
('d0000013-0000-0000-0013-000000000001', P13, 1, 'Apenas se nota, todo fluye con normalidad', P14),
('d0000013-0000-0000-0013-000000000002', P13, 2, 'Se nota algo de tensión de vez en cuando', P14),
('d0000013-0000-0000-0013-000000000003', P13, 3, 'El ambiente está raro casi siempre', P14),
('d0000013-0000-0000-0013-000000000004', P13, 4, 'Hay gente incómoda o que evita el contacto con X', P14),

-- ── P14 ────────────────────────────────────────────────────────────────────────
('d0000014-0000-0000-0014-000000000001', P14, 1, 'Fluida, hay confianza y comunicación', P15),
('d0000014-0000-0000-0014-000000000002', P14, 2, 'Correcta pero distante, nos hablamos lo justo', P15),
('d0000014-0000-0000-0014-000000000003', P14, 3, 'Tensa, hay fricciones frecuentes', P15),
('d0000014-0000-0000-0014-000000000004', P14, 4, 'Nula o muy complicada, mejor no mencionarlo', P15),

-- ── P15 ────────────────────────────────────────────────────────────────────────
('d0000015-0000-0000-0015-000000000001', P15, 1, 'No, para nada', P15B),
('d0000015-0000-0000-0015-000000000002', P15, 2, 'Alguna vez, pero tampoco es grave', P15B),
('d0000015-0000-0000-0015-000000000003', P15, 3, 'Sí, bastante a menudo', P15B),
('d0000015-0000-0000-0015-000000000004', P15, 4, 'Sí, claramente se pasa', P15B),

-- ── P15B (text → P35) ─────────────────────────────────────────────────────────
('d0000016-0000-0000-0016-000000000001', P15B, 1, 'Cuéntamelo en una frase, tipo: "cuando pasa X..."', P35),

-- ── P16 ────────────────────────────────────────────────────────────────────────
('d0000017-0000-0000-0017-000000000001', P16, 1, 'Sí, convivimos', P17),
('d0000017-0000-0000-0017-000000000002', P16, 2, 'No, cada uno en su casa', P18),

-- ── P17 ────────────────────────────────────────────────────────────────────────
('d0000018-0000-0000-0018-000000000001', P17, 1, 'Sí, podemos separarnos y despejarnos', P19),
('d0000018-0000-0000-0018-000000000002', P17, 2, 'Más o menos, depende del día', P19),
('d0000018-0000-0000-0018-000000000003', P17, 3, 'No, piso pequeño, no hay escape', P19),

-- ── P18 ────────────────────────────────────────────────────────────────────────
('d0000019-0000-0000-0019-000000000001', P18, 1, 'Casi a diario', P19),
('d0000019-0000-0000-0019-000000000002', P18, 2, 'Varias veces a la semana', P19),
('d0000019-0000-0000-0019-000000000003', P18, 3, 'Una vez a la semana', P19),
('d0000019-0000-0000-0019-000000000004', P18, 4, 'Muy de vez en cuando', P19),

-- ── P19 ────────────────────────────────────────────────────────────────────────
('d0000020-0000-0000-0020-000000000001', P19, 1, 'Sí, cada uno tiene su mundo y eso está bien', P20),
('d0000020-0000-0000-0020-000000000002', P19, 2, 'Bastante, aunque a veces cuesta mantenerlo', P20),
('d0000020-0000-0000-0020-000000000003', P19, 3, 'Poco, tendemos a hacerlo todo juntos', P20),
('d0000020-0000-0000-0020-000000000004', P19, 4, 'Casi ninguna, vivimos muy fusionados/as', P20),

-- ── P20 ────────────────────────────────────────────────────────────────────────
('d0000021-0000-0000-0021-000000000001', P20, 1, 'Sí, funcionamos bastante bien como equipo', P21),
('d0000021-0000-0000-0021-000000000002', P20, 2, 'En algunas cosas sí, en otras cada uno va por su lado', P21),
('d0000021-0000-0000-0021-000000000003', P20, 3, 'Cuesta, hay desacuerdo frecuente en cómo hacer las cosas', P21),
('d0000021-0000-0000-0021-000000000004', P20, 4, 'No, casi todo lo lleva uno de los dos', P21),

-- ── P21 ────────────────────────────────────────────────────────────────────────
('d0000022-0000-0000-0022-000000000001', P21, 1, 'No, no entra mucho', P21B),
('d0000022-0000-0000-0022-000000000002', P21, 2, 'Sí, y la relación es buena', P21B),
('d0000022-0000-0000-0022-000000000003', P21, 3, 'Sí, y genera algo de tensión', P21B),
('d0000022-0000-0000-0022-000000000004', P21, 4, 'Sí, y es una fuente importante de conflicto', P21B),

-- ── P21B ───────────────────────────────────────────────────────────────────────
('d0000023-0000-0000-0023-000000000001', P21B, 1, 'No, estamos solo{{X}}y yo / no afecta a nadie más', P21C),
('d0000023-0000-0000-0023-000000000002', P21B, 2, 'Sí, hay hijos', P21C),
('d0000023-0000-0000-0023-000000000003', P21B, 3, 'Sí, hay más convivientes', P21C),
('d0000023-0000-0000-0023-000000000004', P21B, 4, 'Prefiero no entrar ahí', P21C),

-- ── P21C (text → P35) ─────────────────────────────────────────────────────────
('d0000024-0000-0000-0024-000000000001', P21C, 1, 'Respuesta libre', P35),

-- ── P22 ────────────────────────────────────────────────────────────────────────
('d0000025-0000-0000-0025-000000000001', P22, 1, 'Convivimos', P23),
('d0000025-0000-0000-0025-000000000002', P22, 2, 'Casi a diario, aunque no vivamos juntos', P23),
('d0000025-0000-0000-0025-000000000003', P22, 3, 'Bastante a menudo', P23),
('d0000025-0000-0000-0025-000000000004', P22, 4, 'Más bien de vez en cuando', P23),

-- ── P23 ────────────────────────────────────────────────────────────────────────
('d0000026-0000-0000-0026-000000000001', P23, 1, 'Sí, tiene su espacio', P24),
('d0000026-0000-0000-0026-000000000002', P23, 2, 'A ratos, pero cuesta', P24),
('d0000026-0000-0000-0026-000000000003', P23, 3, 'No, casi nada de espacio propio', P24),

-- ── P24 ────────────────────────────────────────────────────────────────────────
('d0000027-0000-0000-0027-000000000001', P24, 1, 'Vivimos en la misma ciudad / muy cerca', P25),
('d0000027-0000-0000-0027-000000000002', P24, 2, 'Estamos en ciudades distintas, pero a poca distancia', P25),
('d0000027-0000-0000-0027-000000000003', P24, 3, 'Hay bastante distancia, nos vemos en visitas puntuales', P25),
('d0000027-0000-0000-0027-000000000004', P24, 4, 'Vivimos en países distintos / muy lejos', P25),

-- ── P25 ────────────────────────────────────────────────────────────────────────
('d0000028-0000-0000-0028-000000000001', P25, 1, 'Nada, más o menos seguimos igual', P26),
('d0000028-0000-0000-0028-000000000002', P25, 2, 'Un poco, hemos ajustado algunas cosas', P26),
('d0000028-0000-0000-0028-000000000003', P25, 3, 'Bastante, condiciona mucho el día a día', P26),
('d0000028-0000-0000-0028-000000000004', P25, 4, 'Totalmente, todo gira alrededor de esto', P26),

-- ── P26 ────────────────────────────────────────────────────────────────────────
('d0000029-0000-0000-0029-000000000001', P26, 1, 'Lo llevo yo prácticamente solo/a', P27),
('d0000029-0000-0000-0029-000000000002', P26, 2, 'Hay gente, pero cada uno va por su lado', P27),
('d0000029-0000-0000-0029-000000000003', P26, 3, 'Sí, hay apoyo y estamos bastante alineados', P27),
('d0000029-0000-0000-0029-000000000004', P26, 4, 'No lo tengo claro', P27),

-- ── P27 ────────────────────────────────────────────────────────────────────────
('d0000030-0000-0000-0030-000000000001', P27, 1, 'Sí, hay cosas que dependen de esto', P28),
('d0000030-0000-0000-0030-000000000002', P27, 2, 'Más o menos, hay temas en el aire', P28),
('d0000030-0000-0000-0030-000000000003', P27, 3, 'No, seguimos con nuestra vida con independencia', P28),
('d0000030-0000-0000-0030-000000000004', P27, 4, 'No lo sé todavía', P28),

-- ── P28 (text → P35) ─────────────────────────────────────────────────────────
('d0000031-0000-0000-0031-000000000001', P28, 1, 'Respuesta libre', P35),

-- ── P29 ────────────────────────────────────────────────────────────────────────
('d0000032-0000-0000-0032-000000000001', P29, 1, 'Casi todos los días', P30),
('d0000032-0000-0000-0032-000000000002', P29, 2, 'Varias veces a la semana', P30),
('d0000032-0000-0000-0032-000000000003', P29, 3, 'Una vez por semana', P30),
('d0000032-0000-0000-0032-000000000004', P29, 4, 'Muy de vez en cuando', P30),

-- ── P30 ────────────────────────────────────────────────────────────────────────
('d0000033-0000-0000-0033-000000000001', P30, 1, 'Lo llevo bien', P31),
('d0000033-0000-0000-0033-000000000002', P30, 2, 'Me pesa, pero lo sostengo', P31),
('d0000033-0000-0000-0033-000000000003', P30, 3, 'Me está drenando bastante', P31),
('d0000033-0000-0000-0033-000000000004', P30, 4, 'Estoy ya al límite', P31),

-- ── P31 (text → P35) ─────────────────────────────────────────────────────────
('d0000034-0000-0000-0034-000000000001', P31, 1, 'Respuesta libre', P35),

-- ── P32 ────────────────────────────────────────────────────────────────────────
('d0000035-0000-0000-0035-000000000001', P32, 1, 'En casa', P33),
('d0000035-0000-0000-0035-000000000002', P32, 2, 'En el trabajo o los estudios', P33),
('d0000035-0000-0000-0035-000000000003', P32, 3, 'Casi todo es por mensajes u online', P33),
('d0000035-0000-0000-0035-000000000004', P32, 4, 'Es otro rollo, te cuento', P33),

-- ── P33 ────────────────────────────────────────────────────────────────────────
('d0000036-0000-0000-0036-000000000001', P33, 1, 'Mucho, casi a diario', P34),
('d0000036-0000-0000-0036-000000000002', P33, 2, 'Bastante, varias veces a la semana', P34),
('d0000036-0000-0000-0036-000000000003', P33, 3, 'Poco, semanal o menos', P34),
('d0000036-0000-0000-0036-000000000004', P33, 4, 'Va por rachas', P34),

-- ── P34 (text → P35) ─────────────────────────────────────────────────────────
('d0000037-0000-0000-0037-000000000001', P34, 1, 'Respuesta libre', P35),

-- ── P35 — Clima Emocional ─────────────────────────────────────────────────────
('d0000038-0000-0000-0038-000000000001', P35, 1, 'Hay mucho apagón: poca energía, poca ilusión, todo parece cuesta arriba', P36),
('d0000038-0000-0000-0038-000000000002', P35, 2, 'Hay mucha tensión: bucles, conversaciones que se repiten, todo muy en alerta', P44),
('d0000038-0000-0000-0038-000000000003', P35, 3, 'Hay roces o desbordamientos: límites que se saltan, momentos de mucha intensidad', P52),
('d0000038-0000-0000-0038-000000000004', P35, 4, 'Hay mucho caos o desconexión: todo muy acelerado o fuera de ritmo', P55),
('d0000038-0000-0000-0038-000000000005', P35, 5, 'Es una mezcla de varios de estos climas', P35B),
('d0000038-0000-0000-0038-000000000006', P35, 6, 'No sé ni por dónde empezar', P35C),

-- ── P35B ───────────────────────────────────────────────────────────────────────
('d0000039-0000-0000-0039-000000000001', P35B, 1, 'El apagón y la falta de energía', P36),
('d0000039-0000-0000-0039-000000000002', P35B, 2, 'La tensión y los bucles', P44),
('d0000039-0000-0000-0039-000000000003', P35B, 3, 'El caos y el desborde', P55),

-- ── P35C (text → P35D) ────────────────────────────────────────────────────────
('d0000040-0000-0000-0040-000000000001', P35C, 1, 'Respuesta libre', P35D),

-- ── P35D ───────────────────────────────────────────────────────────────────────
('d0000041-0000-0000-0041-000000000001', P35D, 1, 'El apagón: poca energía, distancia emocional, clima triste', P36),
('d0000041-0000-0000-0041-000000000002', P35D, 2, 'La tensión: bucles, roces, todo muy en alerta', P44),
('d0000041-0000-0000-0041-000000000003', P35D, 3, 'La sensación de que la situación se está yendo de las manos', P55),

-- ── P36 ────────────────────────────────────────────────────────────────────────
('d0000042-0000-0000-0042-000000000001', P36, 1, 'X parece más distante o con menos ganas de todo', P37),
('d0000042-0000-0000-0042-000000000002', P36, 2, 'Noto más preocupación o nerviosismo de fondo', P37),
('d0000042-0000-0000-0042-000000000003', P36, 3, 'Hay más irritabilidad: salta ante cosas pequeñas', P37),
('d0000042-0000-0000-0042-000000000004', P36, 4, 'El ritmo es muy diferente: todo va más lento, o al contrario, muy acelerado', P37),
('d0000042-0000-0000-0042-000000000005', P36, 5, 'Un poco de todo a la vez', P37),

-- ── P37 ────────────────────────────────────────────────────────────────────────
('d0000043-0000-0000-0043-000000000001', P37, 1, 'Sí, le cuesta coger el sueño', P38),
('d0000043-0000-0000-0043-000000000002', P37, 2, 'Sí, hay muchos despertares o sueño muy fragmentado', P38),
('d0000043-0000-0000-0043-000000000003', P37, 3, 'Sí, duerme muchísimo más de lo habitual', P38),
('d0000043-0000-0000-0043-000000000004', P37, 4, 'Parece que duerme muy poco', P38),
('d0000043-0000-0000-0043-000000000005', P37, 5, 'No lo noto / no tengo esa información', P38),

-- ── P38 ────────────────────────────────────────────────────────────────────────
('d0000044-0000-0000-0044-000000000001', P38, 1, 'Come menos de lo habitual, se le olvida o no le apetece', P39),
('d0000044-0000-0000-0044-000000000002', P38, 2, 'Come más, como por inercia o por llenar algo', P39),
('d0000044-0000-0000-0044-000000000003', P38, 3, 'Va muy irregular: un día sí y otro no', P39),
('d0000044-0000-0000-0044-000000000004', P38, 4, 'Diría que todo sigue más o menos igual', P39),
('d0000044-0000-0000-0044-000000000005', P38, 5, 'No lo sé', P39),

-- ── P39 ────────────────────────────────────────────────────────────────────────
('d0000045-0000-0000-0045-000000000001', P39, 1, 'No, sigue con sus cosas habituales', P40),
('d0000045-0000-0000-0045-000000000002', P39, 2, 'Ha soltado algunas', P40),
('d0000045-0000-0000-0045-000000000003', P39, 3, 'Ha soltado casi todo', P40),
('d0000045-0000-0000-0045-000000000004', P39, 4, 'No sé', P40),

-- ── P40 ────────────────────────────────────────────────────────────────────────
('d0000046-0000-0000-0046-000000000001', P40, 1, 'No, sigue bastante presente', P41),
('d0000046-0000-0000-0046-000000000002', P40, 2, 'Un poco más de lo normal', P41),
('d0000046-0000-0000-0046-000000000003', P40, 3, 'Bastante, sí', P41),
('d0000046-0000-0000-0046-000000000004', P40, 4, 'Ha desaparecido casi del todo', P41),

-- ── P41 ────────────────────────────────────────────────────────────────────────
('d0000047-0000-0000-0047-000000000001', P41, 1, 'Sí, le ocurre', P42),
('d0000047-0000-0000-0047-000000000002', P41, 2, 'No, no va por ahí', P42),
('d0000047-0000-0000-0047-000000000003', P41, 3, 'No lo sé', P42),

-- ── P42 ────────────────────────────────────────────────────────────────────────
('d0000048-0000-0000-0048-000000000001', P42, 1, 'Lo maneja sin problema aparente', P43),
('d0000048-0000-0000-0048-000000000002', P42, 2, 'Tira, pero con más esfuerzo del normal', P43),
('d0000048-0000-0000-0048-000000000003', P42, 3, 'Noto que le cuesta bastante', P43),
('d0000048-0000-0000-0048-000000000004', P42, 4, 'Parece que la situación le desborda en lo más básico', P43),
('d0000048-0000-0000-0048-000000000005', P42, 5, 'No lo sé', P43),

-- ── P43 ────────────────────────────────────────────────────────────────────────
('d0000049-0000-0000-0049-000000000001', P43, 1, 'Sí, bastante', P55),
('d0000049-0000-0000-0049-000000000002', P43, 2, 'Algo, sí', P55),
('d0000049-0000-0000-0049-000000000003', P43, 3, 'No, no me encaja', P55),
('d0000049-0000-0000-0049-000000000004', P43, 4, 'No lo sé', P55),

-- ── P44 ────────────────────────────────────────────────────────────────────────
('d0000050-0000-0000-0050-000000000001', P44, 1, 'Conversaciones o discusiones que vuelven una y otra vez', P45),
('d0000050-0000-0000-0050-000000000002', P44, 2, 'X necesita controlarlo todo o que todo salga como prevé', P45),
('d0000050-0000-0000-0050-000000000003', P44, 3, 'Tiene rutinas o comprobaciones muy fijas que no puede saltarse', P45),
('d0000050-0000-0000-0050-000000000004', P44, 4, 'Está siempre dándole vueltas a lo mismo, muy en alerta', P45),
('d0000050-0000-0000-0050-000000000005', P44, 5, 'Un mix de varias de estas cosas', P45),

-- ── P45 ────────────────────────────────────────────────────────────────────────
('d0000051-0000-0000-0051-000000000001', P45, 1, 'Uff, sí, totalmente', P46),
('d0000051-0000-0000-0051-000000000002', P45, 2, 'A ratos', P46),
('d0000051-0000-0000-0051-000000000003', P45, 3, 'No, no tanto', P46),

-- ── P46 ────────────────────────────────────────────────────────────────────────
('d0000052-0000-0000-0052-000000000001', P46, 1, 'Una conversación tensa o un roce', P47),
('d0000052-0000-0000-0052-000000000002', P46, 2, 'Quedarse solo/a', P47),
('d0000052-0000-0000-0052-000000000003', P46, 3, 'Situaciones con mucha gente', P47),
('d0000052-0000-0000-0052-000000000004', P46, 4, 'No saber qué va a pasar / la incertidumbre', P47),
('d0000052-0000-0000-0052-000000000005', P46, 5, 'Temas de orden, limpieza o gestión del entorno', P47),
('d0000052-0000-0000-0052-000000000006', P46, 6, 'Salir de casa o cambiar de rutina', P47),
('d0000052-0000-0000-0052-000000000007', P46, 7, 'Presión del trabajo o los estudios', P47),
('d0000052-0000-0000-0052-000000000008', P46, 8, 'Otra cosa', P47),

-- ── P47 ────────────────────────────────────────────────────────────────────────
('d0000053-0000-0000-0053-000000000001', P47, 1, 'Calmarse un poco', P48),
('d0000053-0000-0000-0053-000000000002', P47, 2, 'Quedarse tranquilo/a al 100%', P48),
('d0000053-0000-0000-0053-000000000003', P47, 3, 'Evitar enfrentarse a algo', P48),
('d0000053-0000-0000-0053-000000000004', P47, 4, 'Prevenir por si acaso', P48),
('d0000053-0000-0000-0053-000000000005', P47, 5, 'No lo entiendo del todo, es raro', P48),

-- ── P48 ────────────────────────────────────────────────────────────────────────
('d0000054-0000-0000-0054-000000000001', P48, 1, 'Me pilla de sorpresa', P49),
('d0000054-0000-0000-0054-000000000002', P48, 2, 'Se ve venir bastante', P49),
('d0000054-0000-0000-0054-000000000003', P48, 3, 'Depende, hay días', P49),
('d0000054-0000-0000-0054-000000000004', P48, 4, 'No lo sé', P49),

-- ── P49 ────────────────────────────────────────────────────────────────────────
('d0000055-0000-0000-0055-000000000001', P49, 1, 'Se enfada fuerte', P50),
('d0000055-0000-0000-0055-000000000002', P49, 2, 'Se agobia o se bloquea', P50),
('d0000055-0000-0000-0055-000000000003', P49, 3, 'Se encierra y desaparece', P50),
('d0000055-0000-0000-0055-000000000004', P49, 4, 'Tiene una reacción muy explosiva o intensa, pero le dura poco', P50),
('d0000055-0000-0000-0055-000000000005', P49, 5, 'Otra reacción', P50),

-- ── P50 (text → P51) ─────────────────────────────────────────────────────────
('d0000056-0000-0000-0056-000000000001', P50, 1, 'Cuéntamelo en 2–3 frases', P51),

-- ── P51 ────────────────────────────────────────────────────────────────────────
('d0000057-0000-0000-0057-000000000001', P51, 1, 'No, para nada', P55),
('d0000057-0000-0000-0057-000000000002', P51, 2, 'Sí, insiste bastante', P55),
('d0000057-0000-0000-0057-000000000003', P51, 3, 'Sí, hay culpa o chantaje emocional de fondo', P55),
('d0000057-0000-0000-0057-000000000004', P51, 4, 'No lo tengo claro', P55),

-- ── P52 ────────────────────────────────────────────────────────────────────────
('d0000058-0000-0000-0058-000000000001', P52, 1, 'Más de palabras: gritos, reproches, momentos de mucha intensidad verbal', P53),
('d0000058-0000-0000-0058-000000000002', P52, 2, 'Me inquieta o me desborda a mí, aunque no llegue a más', P53),
('d0000058-0000-0000-0058-000000000003', P52, 3, 'No sé bien cómo nombrarlo, pero no me deja tranquilo/a', P53),

-- ── P53 ────────────────────────────────────────────────────────────────────────
('d0000059-0000-0000-0059-000000000001', P53, 1, 'Fue un par de veces y ya', P54),
('d0000059-0000-0000-0059-000000000002', P53, 2, 'Pasa casi cada semana', P54),
('d0000059-0000-0000-0059-000000000003', P53, 3, 'Pasa varias veces por semana', P54),
('d0000059-0000-0000-0059-000000000004', P53, 4, 'Es casi diario últimamente', P54),

-- ── P54 ────────────────────────────────────────────────────────────────────────
('d0000060-0000-0000-0060-000000000001', P54, 1, 'Cuando le digo que no / pongo un límite', P55),
('d0000060-0000-0000-0060-000000000002', P54, 2, 'Temas de confianza, celos o control', P55),
('d0000060-0000-0000-0060-000000000003', P54, 3, 'Estrés acumulado', P55),
('d0000060-0000-0000-0060-000000000004', P54, 4, 'Cuando bebe o recurre a algo para desconectar', P55),
('d0000060-0000-0000-0060-000000000005', P54, 5, 'Es impredecible, cualquier cosa puede serlo', P55),
('d0000060-0000-0000-0060-000000000006', P54, 6, 'Otra cosa', P55),

-- ── P55 — Convergencia ────────────────────────────────────────────────────────
('d0000061-0000-0000-0061-000000000001', P55, 1, 'Tengo recursos y margen para seguir acompañando', P56),
('d0000061-0000-0000-0061-000000000002', P55, 2, 'Voy tirando, pero noto que me exige más de lo habitual', P56),
('d0000061-0000-0000-0061-000000000003', P55, 3, 'Me siento desbordado/a y creo que necesito apoyo externo', P56),
('d0000061-0000-0000-0061-000000000004', P55, 4, 'No lo sé, estoy confuso/a', P56),

-- ── P56 (text → P57) ─────────────────────────────────────────────────────────
('d0000062-0000-0000-0062-000000000001', P56, 1, 'Respuesta libre', P57),

-- ── P57 (text → P58) ─────────────────────────────────────────────────────────
('d0000063-0000-0000-0063-000000000001', P57, 1, 'Respuesta libre', P58),

-- ── P58 (text → P59) ─────────────────────────────────────────────────────────
('d0000064-0000-0000-0064-000000000001', P58, 1, 'Respuesta libre', P59),

-- ── P59 ────────────────────────────────────────────────────────────────────────
('d0000065-0000-0000-0065-000000000001', P59, 1, '0–2: Estoy fatal', P60),
('d0000065-0000-0000-0065-000000000002', P59, 2, '3–4: Voy tirando, pero mal', P60),
('d0000065-0000-0000-0065-000000000003', P59, 3, '5–6: Ahí, en medio', P60),
('d0000065-0000-0000-0065-000000000004', P59, 4, '7–8: Bastante ok', P60),
('d0000065-0000-0000-0065-000000000005', P59, 5, '9–10: Sorprendentemente bien', P60),

-- ── P60 ────────────────────────────────────────────────────────────────────────
('d0000066-0000-0000-0066-000000000001', P60, 1, 'Sí, por suerte sí', P61),
('d0000066-0000-0000-0066-000000000002', P60, 2, 'Muy poquito, pero algo', P61),
('d0000066-0000-0000-0066-000000000003', P60, 3, 'Nada de nada', P61),

-- ── P61 ────────────────────────────────────────────────────────────────────────
('d0000067-0000-0000-0067-000000000001', P61, 1, 'No, sigo disfrutando más o menos igual', P62),
('d0000067-0000-0000-0067-000000000002', P61, 2, 'Sí, un poco menos', P62),
('d0000067-0000-0000-0067-000000000003', P61, 3, 'Sí, bastante menos', P62),
('d0000067-0000-0000-0067-000000000004', P61, 4, 'Sí, casi nada me está apeteciendo', P62),

-- ── P62 ────────────────────────────────────────────────────────────────────────
('d0000068-0000-0000-0068-000000000001', P62, 1, 'Tengo margen, puedo estar', P64),
('d0000068-0000-0000-0068-000000000002', P62, 2, 'Voy justito/a, pero llego', P64),
('d0000068-0000-0000-0068-000000000003', P62, 3, 'Voy al límite, no doy más', P63),

-- ── P63 (solo si P62 = opción 3 "al límite") ─────────────────────────────────
('d0000069-0000-0000-0069-000000000001', P63, 1, 'El descanso: dormir mal o poco', P64),
('d0000069-0000-0000-0069-000000000002', P63, 2, 'El estrés o la tensión acumulada', P64),
('d0000069-0000-0000-0069-000000000003', P63, 3, 'Los roces y la tensión con X', P64),
('d0000069-0000-0000-0069-000000000004', P63, 4, 'El trabajo o la presión económica', P64),
('d0000069-0000-0000-0069-000000000005', P63, 5, 'La soledad o la falta de apoyo', P64),
('d0000069-0000-0000-0069-000000000006', P63, 6, 'Otra cosa', P64),

-- ── P64 ────────────────────────────────────────────────────────────────────────
('d0000070-0000-0000-0070-000000000001', P64, 1, 'Amigos', P65),
('d0000070-0000-0000-0070-000000000002', P64, 2, 'Familia', P65),
('d0000070-0000-0000-0070-000000000003', P64, 3, 'Acompañamiento emocional o psicológico', P65),
('d0000070-0000-0000-0070-000000000004', P64, 4, 'Un grupo o comunidad', P65),
('d0000070-0000-0000-0070-000000000005', P64, 5, 'Nadie ahora mismo', P65),
('d0000070-0000-0000-0070-000000000006', P64, 6, 'Otra cosa', P65),

-- ── P65 ────────────────────────────────────────────────────────────────────────
('d0000071-0000-0000-0071-000000000001', P65, 1, 'Respetar mis horarios de descanso', P66),
('d0000071-0000-0000-0071-000000000002', P65, 2, 'Tener tiempo para mí, sí o sí', P66),
('d0000071-0000-0000-0071-000000000003', P65, 3, 'Poder tener espacio físico cuando lo necesito', P66),
('d0000071-0000-0000-0071-000000000004', P65, 4, 'Tener claros los recursos económicos disponibles', P66),
('d0000071-0000-0000-0071-000000000005', P65, 5, 'Que no haya gritos ni desbordamientos hacia mí', P66),
('d0000071-0000-0000-0071-000000000006', P65, 6, 'Otro acuerdo importante', P66),

-- ── P66 ────────────────────────────────────────────────────────────────────────
('d0000072-0000-0000-0072-000000000001', P66, 1, 'Nada todavía', P67),
('d0000072-0000-0000-0072-000000000002', P66, 2, 'Sí, algo general: médico de cabecera, orientador...', P67),
('d0000072-0000-0000-0072-000000000003', P66, 3, 'Sí, tiene apoyo psicológico o emocional', P67),
('d0000072-0000-0000-0072-000000000004', P66, 4, 'Sí, apoyo más especializado', P67),
('d0000072-0000-0000-0072-000000000005', P66, 5, 'Ha habido alguna consulta puntual o de urgencia', P67),
('d0000072-0000-0000-0072-000000000006', P66, 6, 'No lo sé', P67),

-- ── P67 — Cierre (next_question_id = NULL → FIN) ─────────────────────────────
('d0000073-0000-0000-0073-000000000001', P67, 1, 'Un plan de acuerdos y límites que pueda sostener', NULL),
('d0000073-0000-0000-0073-000000000002', P67, 2, 'Ideas para hablar con{{X}}sin que acabe en bronca', NULL),
('d0000073-0000-0000-0073-000000000003', P67, 3, 'Pasos claros para buscar acompañamiento externo', NULL),
('d0000073-0000-0000-0073-000000000004', P67, 4, 'Otra cosa, te cuento', NULL);

END $$;

-- =============================================================================
-- Verificación rápida
-- =============================================================================
DO $$
DECLARE
  total_preguntas INT;
  total_opciones  INT;
BEGIN
  SELECT COUNT(*) INTO total_preguntas FROM public.questionnaire_questions
    WHERE questionnaire_id = 'b0000000-0000-0000-0000-000000000001';
  SELECT COUNT(*) INTO total_opciones  FROM public.question_options
    WHERE question_id IN (
      SELECT id FROM public.questionnaire_questions
      WHERE questionnaire_id = 'b0000000-0000-0000-0000-000000000001'
    );
  RAISE NOTICE '✅ Seed completado: % preguntas, % opciones insertadas.',
    total_preguntas, total_opciones;
END $$;