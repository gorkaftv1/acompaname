import type { QuestionNode } from '@/lib/services/questionnaire-engine.types';

export interface LinearProgress {
    currentStep: number;
    totalSteps: number;
}

/**
 * Calculates linear progression based on the sorted list of questions.
 *
 * @param sortedQuestions - Lista de preguntas ordenadas por orderIndex.
 * @param currentQuestionId - ID de la pregunta en la que está el usuario.
 */
export function getLinearProgress(
    sortedQuestions: QuestionNode[],
    currentQuestionId: string,
): LinearProgress {
    const totalSteps = sortedQuestions.length;
    const currentIndex = sortedQuestions.findIndex(q => q.id === currentQuestionId);

    return {
        currentStep: currentIndex >= 0 ? currentIndex + 1 : 1,
        totalSteps,
    };
}

