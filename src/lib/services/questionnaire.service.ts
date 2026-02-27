import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase/client';
import { sanitizeString } from '@/lib/utils/sanitize';
import type { Database } from '@/lib/supabase/database.types';
import type { QuestionNode, OptionNode } from '@/types/questionnaire-engine.types';

// ---------------------------------------------------------------------------
// Tipos internos derivados del schema
// ---------------------------------------------------------------------------
type QuestionRow = Database['public']['Tables']['questionnaire_questions']['Row'];
type OptionRow = Database['public']['Tables']['question_options']['Row'];
type QuestionnaireRow = Database['public']['Tables']['questionnaires']['Row'];

// Selección parcial usada en getQuestionsMap
type QuestionSelect = Pick<
  QuestionRow,
  'id' | 'questionnaire_id' | 'title' | 'description' | 'type' | 'order_index' | 'show_if'
>;
type OptionSelect = Pick<OptionRow, 'id' | 'question_id' | 'text' | 'score'>;

// ---------------------------------------------------------------------------
// Servicio
// ---------------------------------------------------------------------------
export class QuestionnaireService {
  /**
   * Busca un cuestionario publicado por su título exacto.
   * Acepta un cliente Supabase tipado como parámetro para permitir el uso
   * desde Server Components (cliente de servidor) o Client Components (browser).
   *
   * @param title - Título del cuestionario (se normalize con trim antes de la búsqueda).
   * @param supabaseClient - Cliente opcional; si se omite se usa el singleton del browser.
   */
  static async getByTitle(
    title: string,
    supabaseClient?: SupabaseClient<Database>,
  ): Promise<Pick<QuestionnaireRow, 'id' | 'title' | 'description' | 'status'>> {
    // Sanitizar únicamente el argumento de entrada (lo que entra desde el usuario/config)
    const cleanTitle = sanitizeString(title, 'questionnaire.title');
    const supabase = supabaseClient ?? createBrowserClient();

    console.log('[QuestionnaireService][getByTitle] Cargando cuestionario', { title: cleanTitle });
    const { data, error } = await supabase
      .from('questionnaires')
      .select('id, title, description, status')
      .eq('title', cleanTitle)
      .eq('status', 'published')
      .maybeSingle();

    if (error) {
      console.error('[QuestionnaireService][getByTitle] Error cargando cuestionario', { error, title: cleanTitle });
      throw new Error(`QuestionnaireService.getByTitle: ${error.message}`);
    }
    console.log('[QuestionnaireService][getByTitle] Cuestionario cargado', { data });

    if (!data) throw new Error(`No se encontró un cuestionario publicado con el título "${cleanTitle}".`);

    return data;
  }

  /**
   * Obtiene todos los cuestionarios publicados
   */
  static async getPublishedQuestionnaires(
    supabaseClient?: SupabaseClient<Database>,
  ): Promise<Pick<QuestionnaireRow, 'id' | 'title' | 'description' | 'status' | 'type'>[]> {
    const supabase = supabaseClient ?? createBrowserClient();
    const { data, error } = await supabase
      .from('questionnaires')
      .select('id, title, description, status, type')
      .eq('status', 'published');

    if (error) {
      console.error('[QuestionnaireService][getPublishedQuestionnaires] Error:', error);
      throw new Error(`QuestionnaireService.getPublishedQuestionnaires: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene un cuestionario publicado con sus preguntas y opciones, ordenado por order_index
   */
  static async getQuestionnaireWithQuestions(
    id: string,
    supabaseClient?: SupabaseClient<Database>,
  ) {
    const supabase = supabaseClient ?? createBrowserClient();

    const { data: questionnaire, error } = await supabase
      .from('questionnaires')
      .select(`
            *,
            questionnaire_questions (
                *,
                question_options ( * )
            )
        `)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('[QuestionnaireService][getQuestionnaireWithQuestions] Error:', error);
      return null;
    }

    if (!questionnaire) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    questionnaire.questionnaire_questions = (questionnaire as any)
      .questionnaire_questions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((q: any) => !q.is_deleted)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.order_index - b.order_index)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((q: any) => ({
        ...q,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        question_options: q.question_options.sort(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a: any, b: any) => a.order_index - b.order_index
        ),
      }));

    return questionnaire;
  }

  /**
   * Busca un cuestionario por su ID exacto.
   */
  static async getById(
    id: string,
    supabaseClient?: SupabaseClient<Database>,
  ): Promise<(Pick<QuestionnaireRow, 'id' | 'title' | 'description' | 'status'> & { questionsMap: Map<string, QuestionNode> }) | null> {
    const supabase = supabaseClient ?? createBrowserClient();

    console.log('[QuestionnaireService][getById] Cargando cuestionario', { id });
    const { data: qData, error: qErr } = await supabase
      .from('questionnaires')
      .select('id, title, description, status')
      .eq('id', id)
      .maybeSingle();

    if (qErr) {
      console.error('[QuestionnaireService][getById] Error cargando cuestionario', { error: qErr, id });
      return null;
    }
    if (!qData) {
      console.log('[QuestionnaireService][getById] Cuestionario no encontrado', { id });
      return null;
    }
    console.log('[QuestionnaireService][getById] Cuestionario básico cargado', { qData });

    if (qErr || !qData) return null;

    const questionsMap = await this.getQuestionsMap(id, supabase);

    return {
      ...qData,
      questionsMap
    };
  }

  /**
   * Obtiene el cuestionario WHO-5 publicado más reciente.
   */
  static async getLatestWHO5(
    supabaseClient?: SupabaseClient<Database>,
  ): Promise<(Pick<QuestionnaireRow, 'id' | 'title' | 'description' | 'status'> & { questionsMap: Map<string, QuestionNode> }) | null> {
    const supabase = supabaseClient ?? createBrowserClient();

    console.log('[QuestionnaireService][getLatestWHO5] Cargando último WHO-5');
    const { data: qData, error: qErr } = await supabase
      .from('questionnaires')
      .select('id, title, description, status')
      .eq('type', 'who5')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (qErr) {
      console.error('[QuestionnaireService][getLatestWHO5] Error cargando último WHO-5', { error: qErr });
      return null;
    }
    if (!qData) {
      console.log('[QuestionnaireService][getLatestWHO5] No se encontró ningún cuestionario WHO-5 publicado');
      return null;
    }
    console.log('[QuestionnaireService][getLatestWHO5] Cuestionario WHO-5 básico cargado', { qData });

    const questionsMap = await this.getQuestionsMap(qData.id, supabase);

    return {
      ...qData,
      questionsMap
    };
  }

  /**
   * Carga todas las preguntas y opciones de un cuestionario como un Map indexado por ID.
   *
   * @param questionnaireId - UUID del cuestionario.
   * @param supabaseClient - Cliente opcional.
   */
  static async getQuestionsMap(
    questionnaireId: string,
    supabaseClient?: SupabaseClient<Database>,
  ): Promise<Map<string, QuestionNode>> {
    const supabase = supabaseClient ?? createBrowserClient();

    console.log('[QuestionnaireService][getQuestionsMap] Cargando preguntas', { questionnaireId });
    const { data: questions, error: qErr } = await supabase
      .from('questionnaire_questions')
      .select('id, questionnaire_id, title, description, type, order_index, show_if')
      .eq('questionnaire_id', questionnaireId)
      .eq('is_deleted', false)
      .order('order_index')
      .returns<QuestionSelect[]>();

    if (qErr) {
      console.error('[QuestionnaireService][getQuestionsMap] Error cargando preguntas', { error: qErr, questionnaireId });
      throw new Error(`QuestionnaireService.getQuestionsMap (questions): ${qErr.message}`);
    }
    console.log('[QuestionnaireService][getQuestionsMap] Preguntas cargadas', { questionsCount: questions?.length ?? 0 });
    if (!questions || questions.length === 0) return new Map();

    const questionIds = questions.map(q => q.id);

    console.log('[QuestionnaireService][getQuestionsMap] Cargando opciones', { questionIds });
    const { data: options, error: oErr } = await supabase
      .from('question_options')
      .select('id, question_id, text, score')
      .in('question_id', questionIds)
      .returns<OptionSelect[]>();

    if (oErr) {
      console.error('[QuestionnaireService][getQuestionsMap] Error cargando opciones', { error: oErr, questionIds });
      throw new Error(`QuestionnaireService.getQuestionsMap (options): ${oErr.message}`);
    }
    console.log('[QuestionnaireService][getQuestionsMap] Opciones cargadas', { optionsCount: options?.length ?? 0 });

    const textQuestionIds = new Set(questions.filter(q => q.type === 'text').map(q => q.id));

    // Agrupar opciones por pregunta
    const optionsByQuestion = new Map<string, OptionNode[]>();
    for (const row of options ?? []) {
      const opts = optionsByQuestion.get(row.question_id) ?? [];
      opts.push({
        id: row.id,
        // isPhantom identifica opciones de preguntas de texto (donde el texto de la opción actúa como placeholder en el front)
        optionText: row.text,
        score: row.score,
        isPhantom: textQuestionIds.has(row.question_id) || row.text.trim() === 'Respuesta libre',
      });
      optionsByQuestion.set(row.question_id, opts);
    }

    // Construir el mapa de preguntas
    const questionsMap = new Map<string, QuestionNode>();
    for (const row of questions) {
      questionsMap.set(row.id, {
        id: row.id,
        questionnaireId: row.questionnaire_id,
        questionText: row.title,
        description: row.description,
        questionType: row.type as QuestionNode['questionType'],
        orderIndex: row.order_index,
        showIf: row.show_if,
        options: optionsByQuestion.get(row.id) ?? [],
      });
    }

    return questionsMap;
  }

  /**
   * Devuelve la pregunta con el orderIndex más bajo (la primera).
   *
   * @throws Error si no hay preguntas.
   */
  static findFirstQuestion(questionsMap: Map<string, QuestionNode>): QuestionNode {
    let firstNode: QuestionNode | null = null;
    for (const question of questionsMap.values()) {
      if (!firstNode || question.orderIndex < firstNode.orderIndex) {
        firstNode = question;
      }
    }
    if (!firstNode) {
      throw new Error(
        'QuestionnaireService.findFirstQuestion: No hay ninguna pregunta.',
      );
    }
    return firstNode;
  }
}
