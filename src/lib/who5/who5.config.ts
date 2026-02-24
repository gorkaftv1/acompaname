/**
 * WHO-5 Wellbeing Index — Configuration & Score Mapping
 *
 * Implements the standard WHO-5 questionnaire (World Health Organization
 * Five Well-Being Index) with Spanish translations and blob-emotion mapping.
 *
 * Score calculation:
 *   raw  = sum of all 5 answers (0–25)
 *   final = raw × 4          → range: 0–100
 *
 * Disclaimer (required by WHO):
 *   © World Health Organization, 1998. "Mastering Depression in Primary Care"
 *   Version 2.2. Regional Office for Europe, Psychiatric Research Unit,
 *   WHO Collaborating Center in Mental Health, Frederiksborg General Hospital,
 *   Hillerød, Denmark.
 *
 *   "The WHO-5 questionnaire may be freely used by anyone free of charge.
 *   If the questionnaire is translated into a new language, the translation
 *   must be sent to WHO for registration. Registered translations may be
 *   used free of charge."
 */

import type { EmotionType } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WHO5ScoreCategory {
  label: string;
  emotion: EmotionType;
  description: string;
  /** Minimum score (inclusive) */
  min: number;
  /** Maximum score (inclusive) */
  max: number;
}

export interface WHO5Result {
  rawScore: number;
  finalScore: number;
  category: WHO5ScoreCategory;
}

export const WHO5_SCORE_FACTOR = 4;
export const WHO5_LEGAL_DISCLAIMER = '© Organización Mundial de la Salud, 1998. El cuestionario WHO-5 puede utilizarse libremente. Si se traduce a un nuevo idioma, la traducción debe enviarse a la OMS para su registro. Las traducciones registradas pueden utilizarse de forma gratuita. Fuente: "Mastering Depression in Primary Care", versión 2.2, Unidad de Investigación Psiquiátrica, Centro Colaborador de la OMS en Salud Mental, Hospital General de Frederiksberg, Hillerød, Dinamarca.';

// ---------------------------------------------------------------------------
// Score categories — map final score (0-100) to emotion & label
// ---------------------------------------------------------------------------

/**
 * Ordered from highest to lowest so that the first matching range wins.
 */
export const who5ScoreCategories: WHO5ScoreCategory[] = [
  {
    label: 'Día muy bueno',
    emotion: 'calm',
    description:
      'Tu bienestar es excelente. Estás experimentando una sensación profunda de calma y plenitud.',
    min: 85,
    max: 100,
  },
  {
    label: 'Día tranquilo',
    emotion: 'calm',
    description:
      'Te encuentras en buen estado. La serenidad y el equilibrio predominan en tu vida.',
    min: 70,
    max: 84,
  },
  {
    label: 'Día normal',
    emotion: 'okay',
    description:
      'Tu bienestar es moderado. Estás saliendo adelante con altibajos habituales.',
    min: 50,
    max: 69,
  },
  {
    label: 'Día cansado',
    emotion: 'mixed',
    description:
      'Percibes cierto agotamiento. Es un buen momento para descansar y cuidarte.',
    min: 35,
    max: 49,
  },
  {
    label: 'Día estresante',
    emotion: 'challenging',
    description:
      'Estás atravesando un momento de tensión. Procura buscar apoyo y espacios de alivio.',
    min: 20,
    max: 34,
  },
  {
    label: 'Día cuesta arriba',
    emotion: 'challenging',
    description:
      'El peso del día se hace notar. No estás solo/a — hablar con alguien puede ayudar.',
    min: 10,
    max: 19,
  },
  {
    label: 'Día de sobrecarga',
    emotion: 'challenging',
    description:
      'Tu nivel de bienestar es muy bajo. Considera buscar apoyo profesional cuanto antes.',
    min: 0,
    max: 9,
  },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Calculate the WHO-5 final score from a map of questionId → answer value.
 *
 * @param answers - Record<questionId, optionValue (0-5)>
 * @returns WHO5Result with rawScore, finalScore, and matched category
 */
export function calculateWHO5Score(
  answers: Record<string, number>
): WHO5Result {
  const rawScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const finalScore = rawScore * WHO5_SCORE_FACTOR;

  const category =
    who5ScoreCategories.find(
      (c) => finalScore >= c.min && finalScore <= c.max
    ) ?? who5ScoreCategories[who5ScoreCategories.length - 1];

  return { rawScore, finalScore, category };
}

export const WHO5_DB_QUESTIONNAIRE_ID = 'b0000000-0000-0000-0000-000000000002';

/**
 * Check whether every question has been answered.
 */
export function allQuestionsAnswered(
  answers: Record<string, number>,
  questionsCount: number
): boolean {
  return Object.keys(answers).length === questionsCount;
}
