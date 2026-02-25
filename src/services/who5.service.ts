import { createBrowserClient } from '@/lib/supabase/client';
import { ResponseService } from './response.service';
import { WHO5_DB_QUESTIONNAIRE_ID, calculateWHO5Score, type WHO5Result } from '@/lib/who5/who5.config';
import type { QuestionNode, OptionNode } from '@/lib/services/questionnaire-engine.types';

export class WHO5Service {
    /**
     * Saves WHO-5 answers to the database and calculates the final score.
     *
     * @param userId The ID of the user answering the questionnaire.
     * @param answers Record mapping question IDs to the selected option's generic score (0-5).
     * @param questions List of question nodes from the WHO-5 questionnaire.
     * @param options List of possible option nodes for the WHO-5 questions.
     * @returns The calculated WHO5Result.
     * @throws Error if any database operation fails.
     */
    static async saveAnswers(
        userId: string,
        answers: Record<string, number>,
        questions: QuestionNode[],
        options: OptionNode[]
    ): Promise<WHO5Result> {
        const supabase = createBrowserClient();

        // 1. Get or Create Session
        const sessionId = await ResponseService.getOrCreateActiveSession(userId, WHO5_DB_QUESTIONNAIRE_ID);

        // 2. Build rows for UPSERT
        const rows = questions.map((q) => {
            const optScore = answers[q.id]; // This is the generic score (0-5)
            const matchedOpt = options.find((o) => o.score === optScore);
            return {
                user_id: userId,
                questionnaire_id: WHO5_DB_QUESTIONNAIRE_ID,
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
        const result = calculateWHO5Score(answers);

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
