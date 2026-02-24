import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase/client';
import { sanitizeString } from '@/lib/utils/sanitize';
import type { Database } from '@/lib/supabase/database.types';
import type { QuestionNode, OptionNode } from '@/lib/services/questionnaire-engine.types';

// ---------------------------------------------------------------------------
// Tipos internos derivados del schema
// ---------------------------------------------------------------------------
type QuestionRow = Database['public']['Tables']['questionnaire_questions']['Row'];
type OptionRow = Database['public']['Tables']['question_options']['Row'];
type QuestionnaireRow = Database['public']['Tables']['questionnaires']['Row'];

// Selección parcial usada en getQuestionsMap
type QuestionSelect = Pick<
  QuestionRow,
  'id' | 'questionnaire_id' | 'title' | 'type' | 'order_index' | 'show_if'
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

    const { data, error } = await supabase
      .from('questionnaires')
      .select('id, title, description, status')
      .eq('title', cleanTitle)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw new Error(`QuestionnaireService.getByTitle: ${error.message}`);
    if (!data) throw new Error(`No se encontró un cuestionario publicado con el título "${cleanTitle}".`);

    return data;
  }

  /**
   * Busca un cuestionario por su ID exacto.
   */
  static async getById(
    id: string,
    supabaseClient?: SupabaseClient<Database>,
  ): Promise<(Pick<QuestionnaireRow, 'id' | 'title' | 'description' | 'status'> & { questionsMap: Map<string, QuestionNode> }) | null> {
    const supabase = supabaseClient ?? createBrowserClient();

    const { data: qData, error: qErr } = await supabase
      .from('questionnaires')
      .select('id, title, description, status')
      .eq('id', id)
      .maybeSingle();

    if (qErr || !qData) return null;

    const questionsMap = await this.getQuestionsMap(id, supabase);

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

    const { data: questions, error: qErr } = await supabase
      .from('questionnaire_questions')
      .select('id, questionnaire_id, title, type, order_index, show_if')
      .eq('questionnaire_id', questionnaireId)
      .eq('is_deleted', false)
      .order('order_index')
      .returns<QuestionSelect[]>();

    if (qErr) throw new Error(`QuestionnaireService.getQuestionsMap (questions): ${qErr.message}`);
    if (!questions || questions.length === 0) return new Map();

    const questionIds = questions.map(q => q.id);

    const { data: options, error: oErr } = await supabase
      .from('question_options')
      .select('id, question_id, text, score')
      .in('question_id', questionIds)
      .returns<OptionSelect[]>();

    if (oErr) throw new Error(`QuestionnaireService.getQuestionsMap (options): ${oErr.message}`);

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
