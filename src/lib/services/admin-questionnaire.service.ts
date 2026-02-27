import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import type { QuestionNode, OptionNode, QuestionnaireData, AdminSurveySummary } from '@/types/admin.types';

type QuestionnaireRow = Database['public']['Tables']['questionnaires']['Row'];
type QuestionSelect = Database['public']['Tables']['questionnaire_questions']['Row'];
type OptionSelect = Database['public']['Tables']['question_options']['Row'];

export class AdminQuestionnaireService {
    /**
     * Gets all questionnaires for the admin dashboard.
     */
    static async getAllQuestionnaires(
        supabase: SupabaseClient<Database>
    ): Promise<AdminSurveySummary[]> {
        const { data, error } = await supabase
            .from('questionnaires')
            .select('id, title, description, status, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Error fetching questionnaires: ${error.message}`);
        }

        return data ?? [];
    }

    /**
     * Creates a new questionnaire.
     */
    static async createQuestionnaire(
        payload: { title: string; description: string | null; type: 'onboarding' | 'who5' | 'standard' },
        supabase: SupabaseClient<Database>
    ): Promise<string> {
        const { data, error } = await supabase
            .from('questionnaires')
            .insert({
                title: payload.title,
                description: payload.description,
                status: 'draft',
                type: payload.type
            })
            .select('id')
            .single();

        if (error || !data) {
            throw new Error(error?.message || 'Error al crear el cuestionario.');
        }

        if (payload.type === 'who5') {
            await AdminQuestionnaireService.insertWHO5Template(data.id, supabase);
        }

        return data.id;
    }

    /**
     * Inserts the standard WHO-5 questions and options.
     */
    private static async insertWHO5Template(questionnaireId: string, supabase: SupabaseClient<Database>) {
        const questions = [
            'Me he sentido alegre y de buen humor.',
            'Me he sentido tranquilo/a y relajado/a.',
            'Me he sentido activo/a y con energía.',
            'Me he despertado sintiéndome fresco/a y descansado/a.',
            'Mi vida cotidiana ha estado llena de cosas que me interesan.'
        ];

        const options = [
            { text: 'Todo el tiempo', score: 5 },
            { text: 'La mayor parte del tiempo', score: 4 },
            { text: 'Más de la mitad del tiempo', score: 3 },
            { text: 'Menos de la mitad del tiempo', score: 2 },
            { text: 'Alguna vez', score: 1 },
            { text: 'En ningún momento', score: 0 }
        ];

        for (let i = 0; i < questions.length; i++) {
            const { data: qData, error: qErr } = await supabase
                .from('questionnaire_questions')
                .insert({
                    questionnaire_id: questionnaireId,
                    title: questions[i],
                    type: 'single_choice',
                    order_index: i
                })
                .select('id')
                .single();

            if (qErr || !qData) {
                console.error('Error inserting WHO5 question', qErr);
                continue;
            }

            const optsToInsert = options.map((opt, idx) => ({
                question_id: qData.id,
                text: opt.text,
                score: opt.score,
                order_index: idx
            }));

            await supabase.from('question_options').insert(optsToInsert);
        }
    }

    /**
     * Publishes a questionnaire.
     */
    static async publishQuestionnaire(id: string, supabase: SupabaseClient<Database>): Promise<void> {
        const { error } = await supabase.rpc('publish_questionnaire', { p_questionnaire_id: id });
        if (error) throw new Error(error.message || 'Error al publicar.');
    }

    /**
     * Archives a questionnaire.
     */
    static async archiveQuestionnaire(id: string, supabase: SupabaseClient<Database>): Promise<void> {
        const { error } = await supabase.from('questionnaires').update({ status: 'archived' }).eq('id', id);
        if (error) throw new Error(error.message || 'Error al archivar.');
    }

    /**
     * Updates base info of a draft questionnaire.
     */
    static async updateQuestionnaireBaseInfo(
        id: string,
        payload: { title?: string; description?: string | null; type?: 'onboarding' | 'who5' | 'standard' },
        supabase: SupabaseClient<Database>
    ): Promise<void> {
        const { error } = await supabase.from('questionnaires').update(payload).eq('id', id);
        if (error) throw new Error('Error al actualizar información básica.');
    }

    /**
     * Deletes a questionnaire.
     */
    static async deleteQuestionnaire(
        id: string,
        supabase: SupabaseClient<Database>
    ): Promise<void> {
        const { error } = await supabase.from('questionnaires').delete().eq('id', id);
        if (error) {
            throw new Error(`Error deleting questionnaire: ${error.message}`);
        }
    }

    /**
     * Fetches a specific questionnaire along with its questions and options.
     */
    static async getQuestionnaireById(
        id: string,
        supabase: SupabaseClient<Database>
    ): Promise<QuestionnaireData> {
        const { data: questionnaire, error: qError } = await supabase
            .from('questionnaires')
            .select(`
            id,
            title,
            description,
            status,
            type,
            created_at,
            questionnaire_questions (
                id,
                title,
                description,
                type,
                order_index,
                show_if,
                is_deleted,
                question_options (
                    id,
                    text,
                    score,
                    order_index
                )
            )
        `)
            .eq('id', id)
            .single();

        if (qError || !questionnaire) {
            throw new Error(qError ? qError.message : 'Questionnaire not found');
        }

        // Process questions: filter deleted and sort options
        const questions = (questionnaire.questionnaire_questions || [])
            .filter((q: any) => !q.is_deleted)
            .map((q: any) => {
                const options = (q.question_options || []).sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));
                return {
                    ...q,
                    question_options: options
                };
            })
            .sort((a: any, b: any) => a.order_index - b.order_index);

        return {
            ...questionnaire,
            questionnaire_questions: questions
        };
    }

    // ─── Question Mutations ───────────────────────────────────────────────

    static async addQuestion(
        questionnaireId: string,
        orderIndex: number,
        supabase: SupabaseClient<Database>
    ): Promise<QuestionNode> {
        const { data: newQ, error } = await supabase
            .from('questionnaire_questions')
            .insert({
                questionnaire_id: questionnaireId,
                title: 'Nueva Pregunta',
                type: 'single_choice',
                order_index: orderIndex
            })
            .select('*')
            .single();

        if (error || !newQ) throw new Error('Error al añadir pregunta.');
        return { ...newQ, question_options: [] } as unknown as QuestionNode;
    }

    static async updateQuestion(
        questionId: string,
        updates: Partial<QuestionNode>,
        supabase: SupabaseClient<Database>
    ): Promise<void> {
        console.log('[AdminQuestionnaireService] updateQuestion called for qId:', questionId, 'with raw updates:', updates);
        const payload = { ...updates };
        if (payload.show_if && typeof payload.show_if === 'string') {
            payload.show_if = JSON.parse(payload.show_if);
        }
        console.log('[AdminQuestionnaireService] updateQuestion parsed payload for Supabase:', payload);

        const { data, error } = await supabase.from('questionnaire_questions').update(payload as any).eq('id', questionId).select();

        console.log('[AdminQuestionnaireService] Supabase update response data:', data, 'error:', error);

        if (error) throw new Error(error.message || 'Error al actualizar pregunta.');
    }

    static async deleteQuestion(questionId: string, supabase: SupabaseClient<Database>): Promise<void> {
        const { error } = await supabase.from('questionnaire_questions').update({ is_deleted: true }).eq('id', questionId);
        if (error) throw new Error('Error al eliminar pregunta.');
    }

    static async reorderQuestions(
        q1: { id: string; order_index: number },
        q2: { id: string; order_index: number },
        supabase: SupabaseClient<Database>
    ): Promise<void> {
        await Promise.all([
            supabase.from('questionnaire_questions').update({ order_index: q1.order_index }).eq('id', q1.id),
            supabase.from('questionnaire_questions').update({ order_index: q2.order_index }).eq('id', q2.id),
        ]);
    }

    // ─── Option Mutations ─────────────────────────────────────────────────

    static async addOption(
        questionId: string,
        orderIndex: number,
        isScoreNull: boolean,
        supabase: SupabaseClient<Database>
    ): Promise<OptionNode> {
        const { data: newOpt, error } = await supabase
            .from('question_options')
            .insert({
                question_id: questionId,
                text: 'Nueva Opción',
                score: isScoreNull ? null : 0,
                order_index: orderIndex
            })
            .select('*')
            .single();

        if (error || !newOpt) throw new Error('Error al añadir opción.');
        return newOpt as OptionNode;
    }

    static async updateOption(
        optionId: string,
        updates: Partial<OptionNode>,
        supabase: SupabaseClient<Database>
    ): Promise<void> {
        const { error } = await supabase.from('question_options').update(updates).eq('id', optionId);
        if (error) throw new Error('Error al actualizar opción.');
    }

    static async deleteOption(optionId: string, supabase: SupabaseClient<Database>): Promise<void> {
        const { error } = await supabase.from('question_options').delete().eq('id', optionId);
        if (error) throw new Error('Error al eliminar opción.');
    }

    static async reorderOptions(
        opt1: { id: string; order_index: number },
        opt2: { id: string; order_index: number },
        supabase: SupabaseClient<Database>
    ): Promise<void> {
        await Promise.all([
            supabase.from('question_options').update({ order_index: opt1.order_index }).eq('id', opt1.id),
            supabase.from('question_options').update({ order_index: opt2.order_index }).eq('id', opt2.id),
        ]);
    }
}
