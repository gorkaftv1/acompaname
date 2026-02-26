import { createBrowserClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { sanitizeString } from '@/lib/utils/sanitize';
import { getLinearProgress, type LinearProgress } from '@/lib/utils/graph-progress';
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

    // ── Session Helpers ──
    static async getOrCreateActiveSession(
        userId: string,
        questionnaireId: string,
        supabaseClient?: SupabaseClient<Database>
    ): Promise<string> {
        const supabase = supabaseClient ?? createBrowserClient();

        console.log('[ResponseService][getOrCreateActiveSession] Buscando sesión', { userId, questionnaireId });
        // Buscar sesión activa
        const { data: session } = await supabase
            .from('questionnaire_sessions')
            .select('id')
            .eq('user_id', userId)
            .eq('questionnaire_id', questionnaireId)
            .eq('status', 'in_progress')
            .maybeSingle();

        if (session) {
            console.log('[ResponseService][getOrCreateActiveSession] Sesión encontrada', { sessionId: session.id });
            return session.id;
        }

        console.log('[ResponseService][getOrCreateActiveSession] Creando nueva sesión', { userId, questionnaireId });
        // Crear nueva sesión
        const { data: newSession, error } = await supabase
            .from('questionnaire_sessions')
            .insert({ user_id: userId, questionnaire_id: questionnaireId, status: 'in_progress' })
            .select('id')
            .single();

        if (error) {
            console.error('[ResponseService][getOrCreateActiveSession] Error creando sesión', { error, userId, questionnaireId });
            throw new Error(`ResponseService.getOrCreateActiveSession: ${error.message}`);
        }
        console.log('[ResponseService][getOrCreateActiveSession] Sesión creada', { sessionId: newSession.id });
        return newSession.id;
    }

    static async getSessionResponses(sessionId: string, supabaseClient?: SupabaseClient<Database>) {
        const supabase = supabaseClient ?? createBrowserClient();
        console.log('[ResponseService][getSessionResponses] Cargando respuestas', { sessionId });
        const { data: responses, error } = await supabase
            .from('questionnaire_responses')
            .select('question_id, option_id, free_text_response')
            .eq('session_id', sessionId);

        if (error) {
            console.error('[ResponseService][getSessionResponses] Error:', error);
            throw new Error(`ResponseService.getSessionResponses: ${error.message}`);
        }
        return responses || [];
    }

    static async getUserCompletedSessions(userId: string, supabaseClient?: SupabaseClient<Database>) {
        const supabase = supabaseClient ?? createBrowserClient();
        console.log('[ResponseService][getUserCompletedSessions] Cargando sesiones completadas', { userId });
        const { data: sessions, error } = await supabase
            .from('questionnaire_sessions')
            .select(`
                id,
                completed_at,
                questionnaire_id,
                score,
                questionnaires ( title, type, description )
            `)
            .eq('user_id', userId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false });

        if (error) {
            console.error('[ResponseService][getUserCompletedSessions] Error:', error);
            throw new Error(`ResponseService.getUserCompletedSessions: ${error.message}`);
        }
        return sessions || [];
    }

    static async getCompletedSessionDetails(sessionId: string, userId: string, supabaseClient?: SupabaseClient<Database>) {
        const supabase = supabaseClient ?? createBrowserClient();
        console.log('[ResponseService][getCompletedSessionDetails] Cargando detalles de sesión', { sessionId, userId });
        const { data: session, error } = await supabase
            .from('questionnaire_sessions')
            .select(`
                id,
                completed_at,
                score,
                questionnaires ( id, title, description, type ),
                questionnaire_responses (
                    id,
                    free_text_response,
                    questionnaire_questions ( id, title, order_index, type ),
                    question_options ( id, text, score )
                )
            `)
            .eq('id', sessionId)
            .eq('user_id', userId)
            .eq('status', 'completed')
            .single();

        if (error || !session) {
            console.error('[ResponseService][getCompletedSessionDetails] Error o no encontrado:', error);
            return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.questionnaire_responses = (session as any).questionnaire_responses
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .sort((a: any, b: any) =>
                a.questionnaire_questions.order_index - b.questionnaire_questions.order_index
            );

        return session;
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
        const sessionId = await this.getOrCreateActiveSession(userId, questionnaireId, supabase);

        console.log('[ResponseService][saveResponse] Guardando respuesta', { sessionId, questionId, optionId, freeText });
        const { error } = await supabase.from('questionnaire_responses').upsert({
            user_id: userId,
            questionnaire_id: questionnaireId,
            session_id: sessionId,
            question_id: questionId,
            option_id: optionId,
            free_text_response: freeText,
        }, { onConflict: 'session_id,question_id' });

        if (error) {
            console.error('[ResponseService][saveResponse] Error guardando respuesta', { error, sessionId, questionId });
            throw new Error(`ResponseService.saveResponse: ${error.message}`);
        }
        console.log('[ResponseService][saveResponse] Respuesta guardada exitosamente', { sessionId, questionId });
    }

    /**
     * Completa la sesión activa para el usuario y cuestionario.
     * Si no es onboarding, calcula guardando el score.
     */
    static async completeSession(
        userId: string | null | undefined,
        questionnaireId: string,
        supabaseClient?: SupabaseClient<Database>
    ): Promise<void> {
        if (!userId) return; // Guests will sync on registration

        const supabase = supabaseClient ?? createBrowserClient();

        console.log('[ResponseService][completeSession] Buscando sesión activa para completar', { userId, questionnaireId });
        // 1. Find active session
        const { data: session } = await supabase
            .from('questionnaire_sessions')
            .select('id')
            .eq('user_id', userId)
            .eq('questionnaire_id', questionnaireId)
            .eq('status', 'in_progress')
            .maybeSingle();

        if (!session) {
            console.log('[ResponseService][completeSession] No se encontró sesión activa', { userId, questionnaireId });
            return;
        }

        console.log('[ResponseService][completeSession] Verificando si es onboarding', { questionnaireId });
        // 2. Determine if it's onboarding
        const { data: qData } = await supabase
            .from('questionnaires')
            .select('type')
            .eq('id', questionnaireId)
            .single();

        const isOnboarding = qData?.type === 'onboarding';

        let finalScore: number | null = null;

        // 3. Compute score if not onboarding (like WHO-5)
        if (!isOnboarding) {
            console.log('[ResponseService][completeSession] Calculando score para cuestionario', { sessionId: session.id });
            const { data: responses, error: rErr } = await supabase
                .from('questionnaire_responses')
                .select('option_id, question_options(score)')
                .eq('session_id', session.id);

            if (!rErr && responses) {
                const totalScore = responses.reduce((acc, r) => {
                    // Safe access to relation object array/single
                    const qOpts = Array.isArray(r.question_options) ? r.question_options[0] : r.question_options;
                    const s = (qOpts as any)?.score || 0;
                    return acc + s;
                }, 0);
                finalScore = totalScore * 4;
            }
        }

        console.log('[ResponseService][completeSession] Actualizando sesión', { sessionId: session.id, status: 'completed', finalScore });
        // 4. Update session
        const { error } = await supabase
            .from('questionnaire_sessions')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                score: finalScore
            })
            .eq('id', session.id);

        if (error) {
            console.error('[ResponseService][completeSession] Error completando sesión', { error, sessionId: session.id });
            logger.error('ResponseService', `Error completing session: ${error.message}`);
            throw new Error(`ResponseService.completeSession: ${error.message}`);
        }
        console.log('[ResponseService][completeSession] Sesión completada con éxito', { sessionId: session.id });
    }

    /**
     * Sincroniza el progreso del Guest hacia Supabase tras registro.
     */
    static async syncGuestToCloud(userId: string): Promise<void> {
        const progress = this.getGuestProgress();
        if (!progress) return;

        const supabase = createBrowserClient();

        if (progress.responses.length > 0) {
            const sessionId = await this.getOrCreateActiveSession(userId, progress.questionnaireId, supabase);

            const rows = progress.responses.map((r) => ({
                user_id: userId,
                questionnaire_id: progress.questionnaireId,
                session_id: sessionId,
                question_id: r.questionId,
                option_id: r.optionId,
                free_text_response: r.freeText,
            }));
            console.log('[ResponseService][syncGuestToCloud] Sincronizando respuestas', { sessionId, count: rows.length });
            const { error: respError } = await supabase.from('questionnaire_responses').upsert(rows, { onConflict: 'session_id,question_id' });
            if (respError) {
                console.error('[ResponseService][syncGuestToCloud] Error sincronizando respuestas', { error: respError, sessionId });
                throw new Error(`syncGuestToCloud (responses): ${respError.message}`);
            }
            console.log('[ResponseService][syncGuestToCloud] Sincronización exitosa', { sessionId });
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
     * Deduce la profundidad de progreso cruzando las respuestas del usuario.
     * Ideal para Server Components que renderizan listas.
     */
    static async getUserProgress(
        userId: string,
        questionnaireId: string,
        questionsMap: Map<string, QuestionNode>,
        supabaseClient?: SupabaseClient<Database>
    ): Promise<{ progress: LinearProgress | null; isCompleted: boolean; answeredCount: number; currentQuestionId: string | null }> {
        const supabase = supabaseClient ?? createBrowserClient();

        console.log('[ResponseService][getUserProgress] Buscando sesión en progreso', { userId, questionnaireId });
        const { data: session } = await supabase
            .from('questionnaire_sessions')
            .select('id, status')
            .eq('user_id', userId)
            .eq('questionnaire_id', questionnaireId)
            .eq('status', 'in_progress')
            .maybeSingle();

        if (!session) {
            console.log('[ResponseService][getUserProgress] No hay sesión en progreso', { userId, questionnaireId });
            return { progress: null, isCompleted: false, answeredCount: 0, currentQuestionId: null };
        }

        console.log('[ResponseService][getUserProgress] Extrayendo respuestas', { sessionId: session.id });

        const { data: responses, error } = await supabase
            .from('questionnaire_responses')
            .select('question_id, created_at, option_id, questionnaire_questions!inner(questionnaire_id, order_index)')
            .eq('session_id', session.id);

        if (error) {
            console.error('[ResponseService][getUserProgress] Error obteniendo progreso del usuario', { error, sessionId: session.id });
            logger.error('ResponseService', 'Error fetching user progress', error);
            return { progress: null, isCompleted: false, answeredCount: 0, currentQuestionId: null };
        }
        console.log('[ResponseService][getUserProgress] Progreso cargado', { responsesCount: responses?.length ?? 0 });

        const sortedQuestions = Array.from(questionsMap.values()).sort((a, b) => a.orderIndex - b.orderIndex);
        if (sortedQuestions.length === 0) return { progress: null, isCompleted: false, answeredCount: 0, currentQuestionId: null };

        const answeredCount = responses?.length || 0;
        let currentQuestionId = sortedQuestions[0].id;
        let isCompleted = false;

        if (answeredCount > 0 && responses) {
            // Sort by order_index descending to find the furthest question reached
            const sortedResponses = [...responses].sort((a, b) => {
                const orderA = (a.questionnaire_questions as any)?.order_index ?? 0;
                const orderB = (b.questionnaire_questions as any)?.order_index ?? 0;
                return orderB - orderA;
            });

            const lastAnswer = sortedResponses[0];
            const furthestIndex = sortedQuestions.findIndex(q => q.id === lastAnswer.question_id);

            if (furthestIndex >= 0 && furthestIndex < sortedQuestions.length - 1) {
                currentQuestionId = sortedQuestions[furthestIndex + 1].id;
            } else {
                currentQuestionId = lastAnswer.question_id;
            }
        }

        const progress = isCompleted ? null : getLinearProgress(sortedQuestions, currentQuestionId);
        return { progress, isCompleted, answeredCount, currentQuestionId };
    }
}
