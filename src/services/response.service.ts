import { createBrowserClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { sanitizeString } from '@/lib/utils/sanitize';
import { getGraphProgress, type GraphProgress } from '@/lib/utils/graph-progress';
import { QuestionnaireService } from './questionnaire.service';
import type { QuestionNode } from '@/lib/services/questionnaire-engine.types';
import { ProfileService } from './profile.service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const LOCAL_PROGRESS_KEY = 'guest_onboarding_progress';

export interface LocalResponse {
    questionId: string;
    optionId: string | null;
    freeText: string | null;
}

export interface GuestProgress {
    questionnaireId: string;
    responses: LocalResponse[];
    userName: string | null;
    caregivingName: string | null;
}

export class ResponseService {
    // ── Local Storage Helpers ──
    static getGuestProgress(): GuestProgress | null {
        if (typeof window === 'undefined') return null;
        try {
            const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
            return raw ? (JSON.parse(raw) as GuestProgress) : null;
        } catch {
            return null;
        }
    }

    static setGuestProgress(progress: GuestProgress): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progress));
    }

    static clearGuestProgress(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(LOCAL_PROGRESS_KEY);
        localStorage.removeItem('onboarding_guest_session');
    }

    static ensureGuestProgress(questionnaireId: string): GuestProgress {
        let progress = this.getGuestProgress();
        if (!progress || progress.questionnaireId !== questionnaireId) {
            progress = { questionnaireId, responses: [], userName: null, caregivingName: null };
            this.setGuestProgress(progress);
        }
        return progress;
    }

    static saveGuestName(questionnaireId: string, key: 'userName' | 'caregivingName', value: string): void {
        const progress = this.ensureGuestProgress(questionnaireId);
        progress[key] = sanitizeString(value, key);
        this.setGuestProgress(progress);
    }

    // ── Core Operations ──

    /**
     * Guarda la respuesta. Si hay userId, upsert a DB (el proxy auto-trims strings).
     * Si no, guarda en localStorage.
     */
    static async saveResponse(
        userId: string | null | undefined,
        questionnaireId: string,
        questionId: string,
        optionId: string | null,
        freeText: string | null
    ): Promise<void> {
        if (!userId) {
            const progress = this.ensureGuestProgress(questionnaireId);
            const existing = progress.responses.findIndex(r => r.questionId === questionId);
            const response: LocalResponse = { questionId, optionId, freeText };
            if (existing >= 0) progress.responses[existing] = response;
            else progress.responses.push(response);
            this.setGuestProgress(progress);
            return;
        }

        const supabase = createBrowserClient();
        const { error } = await supabase.from('questionnaire_responses').upsert({
            user_id: userId,
            question_id: questionId,
            option_id: optionId,
            free_text_response: freeText,
        }, { onConflict: 'user_id,question_id' });

        if (error) throw new Error(`ResponseService.saveResponse: ${error.message}`);
    }

    /**
     * Sincroniza el progreso del Guest hacia Supabase tras registro.
     */
    static async syncGuestToCloud(userId: string): Promise<void> {
        const progress = this.getGuestProgress();
        if (!progress) return;

        const supabase = createBrowserClient();

        if (progress.responses.length > 0) {
            const rows = progress.responses.map((r) => ({
                user_id: userId,
                question_id: r.questionId,
                option_id: r.optionId,
                free_text_response: r.freeText,
            }));
            const { error: respError } = await supabase.from('questionnaire_responses').upsert(rows, { onConflict: 'user_id,question_id' });
            if (respError) throw new Error(`syncGuestToCloud (responses): ${respError.message}`);
        }

        if (progress.userName || progress.caregivingName) {
            await ProfileService.updateProfile(userId, {
                ...(progress.userName && { name: progress.userName }),
                ...(progress.caregivingName && { caregivingFor: progress.caregivingName })
            });
        }

        this.clearGuestProgress();
    }

    /**
     * Deduce la profundidad de progreso dinámica cruzando las respuestas del usuario
     * con el grafo de preguntas del cuestionario.
     * Ideal para Server Components que renderizan listas.
     */
    static async getUserProgress(
        userId: string,
        questionnaireId: string,
        questionsMap: Map<string, QuestionNode>,
        supabaseClient?: SupabaseClient<Database>
    ): Promise<{ progress: GraphProgress | null; isCompleted: boolean; answeredCount: number; currentQuestionId: string | null }> {
        const supabase = supabaseClient ?? createBrowserClient();

        const { data: responses, error } = await supabase
            .from('questionnaire_responses')
            .select('question_id, created_at, option_id, questionnaire_questions!inner(questionnaire_id, order_index)')
            .eq('user_id', userId)
            .eq('questionnaire_questions.questionnaire_id', questionnaireId);

        if (error) {
            logger.error('ResponseService', 'Error fetching user progress', error);
            return { progress: null, isCompleted: false, answeredCount: 0, currentQuestionId: null };
        }

        const firstQ = QuestionnaireService.findFirstQuestion(questionsMap);
        if (!firstQ) return { progress: null, isCompleted: false, answeredCount: 0, currentQuestionId: null };

        const answeredCount = responses?.length || 0;
        let currentQuestionId = firstQ.id;
        let isCompleted = false;

        if (answeredCount > 0 && responses) {
            // Sort by order_index descending to find the furthest question reached
            const sortedResponses = [...responses].sort((a, b) => {
                const orderA = (a.questionnaire_questions as any)?.order_index ?? 0;
                const orderB = (b.questionnaire_questions as any)?.order_index ?? 0;
                return orderB - orderA;
            });

            const lastAnswer = sortedResponses[0];
            const lastQNode = questionsMap.get(lastAnswer.question_id);

            if (lastQNode) {
                if (lastAnswer.option_id) {
                    const opt = lastQNode.options.find(o => o.id === lastAnswer.option_id);
                    if (opt && opt.nextQuestionId) {
                        currentQuestionId = opt.nextQuestionId;
                    } else {
                        currentQuestionId = lastAnswer.question_id;
                        isCompleted = true; // No nextQuestionId means terminal
                    }
                } else {
                    const phantom = lastQNode.options.find(o => o.isPhantom);
                    if (phantom && phantom.nextQuestionId) {
                        currentQuestionId = phantom.nextQuestionId;
                    } else {
                        isCompleted = true;
                    }
                }
            }
        }

        const progress = isCompleted ? null : getGraphProgress(questionsMap, firstQ.id, currentQuestionId, answeredCount);
        return { progress, isCompleted, answeredCount, currentQuestionId };
    }
}
