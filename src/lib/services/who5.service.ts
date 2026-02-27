import { createBrowserClient } from '@/lib/supabase/client';
import { ResponseService } from './response.service';
import type { QuestionNode, OptionNode } from '@/types/questionnaire-engine.types';
import type { WHO5ScoreCategory, WHO5Result } from '@/types/who5.types';

export const WHO5_SCORE_FACTOR = 4;
export const WHO5_LEGAL_DISCLAIMER = '© Organización Mundial de la Salud, 1998. El cuestionario WHO-5 puede utilizarse libremente. Si se traduce a un nuevo idioma, la traducción debe enviarse a la OMS para su registro. Las traducciones registradas pueden utilizarse de forma gratuita. Fuente: "Mastering Depression in Primary Care", versión 2.2, Unidad de Investigación Psiquiátrica, Centro Colaborador de la OMS en Salud Mental, Hospital General de Frederiksberg, Hillerød, Dinamarca.';

export const who5ScoreCategories: WHO5ScoreCategory[] = [
  {
    label: 'Día muy bueno',
    emotion: 'calm',
    description: 'Tu bienestar es excelente. Estás experimentando una sensación profunda de calma y plenitud.',
    min: 85,
    max: 100,
  },
  {
    label: 'Día tranquilo',
    emotion: 'calm',
    description: 'Te encuentras en buen estado. La serenidad y el equilibrio predominan en tu vida.',
    min: 70,
    max: 84,
  },
  {
    label: 'Día normal',
    emotion: 'okay',
    description: 'Tu bienestar es moderado. Estás saliendo adelante con altibajos habituales.',
    min: 50,
    max: 69,
  },
  {
    label: 'Día cansado',
    emotion: 'mixed',
    description: 'Percibes cierto agotamiento. Es un buen momento para descansar y cuidarte.',
    min: 35,
    max: 49,
  },
  {
    label: 'Día estresante',
    emotion: 'challenging',
    description: 'Estás atravesando un momento de tensión. Procura buscar apoyo y espacios de alivio.',
    min: 20,
    max: 34,
  },
  {
    label: 'Día cuesta arriba',
    emotion: 'challenging',
    description: 'El peso del día se hace notar. No estás solo/a — hablar con alguien puede ayudar.',
    min: 10,
    max: 19,
  },
  {
    label: 'Día de sobrecarga',
    emotion: 'challenging',
    description: 'Tu nivel de bienestar es muy bajo. Considera buscar apoyo profesional cuanto antes.',
    min: 0,
    max: 9,
  },
];

export class WHO5Service {
    static calculateWHO5Score(answers: Record<string, number>): WHO5Result {
        const rawScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
        const finalScore = rawScore * WHO5_SCORE_FACTOR;

        const category =
            who5ScoreCategories.find((c) => finalScore >= c.min && finalScore <= c.max)
            ?? who5ScoreCategories[who5ScoreCategories.length - 1];

        return { rawScore, finalScore, category };
    }

    static allQuestionsAnswered(answers: Record<string, number>, questionsCount: number): boolean {
        return Object.keys(answers).length === questionsCount;
    }
    /**
     * Saves WHO-5 answers to the database and calculates the final score.
     *
     * @param userId The ID of the user answering the questionnaire.
     * @param questionnaireId The ID of the WHO-5 questionnaire document.
     * @param answers Record mapping question IDs to the selected option's generic score (0-5).
     * @param questions List of question nodes from the WHO-5 questionnaire.
     * @param options List of possible option nodes for the WHO-5 questions.
     * @returns The calculated WHO5Result.
     * @throws Error if any database operation fails.
     */
    static async saveAnswers(
        userId: string,
        questionnaireId: string,
        answers: Record<string, number>,
        questions: QuestionNode[],
        options: OptionNode[]
    ): Promise<WHO5Result> {
        const supabase = createBrowserClient();

        // 1. Get or Create Session
        const sessionId = await ResponseService.getOrCreateActiveSession(userId, questionnaireId);

        // 2. Build rows for UPSERT
        const rows = questions.map((q) => {
            const optScore = answers[q.id]; // This is the generic score (0-5)
            const matchedOpt = options.find((o) => o.score === optScore);
            return {
                user_id: userId,
                questionnaire_id: questionnaireId,
                session_id: sessionId,
                question_id: q.id,
                option_id: matchedOpt?.id || '',
            };
        }).filter(row => row.option_id !== '');

        // 3. UPSERT responses
        const { error: upsertError } = await supabase
            .from('questionnaire_responses')
            .upsert(rows, { onConflict: 'session_id,question_id' });

        if (upsertError) {
            throw new Error(`Failed to save responses: ${upsertError.message}`);
        }

        // 4. Calculate final score
        const result = this.calculateWHO5Score(answers);

        // 5. Update session status and score
        const { error: updateError } = await supabase
            .from('questionnaire_sessions')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                score: result.finalScore
            })
            .eq('id', sessionId);

        if (updateError) {
            throw new Error(`Failed to update session: ${updateError.message}`);
        }

        // 6. Return the computed result
        return result;
    }
}
