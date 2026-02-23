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
  'id' | 'questionnaire_id' | 'title' | 'type' | 'is_first_question'
>;
type OptionSelect = Pick<OptionRow, 'id' | 'question_id' | 'text' | 'next_question_id'>;

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
  ): Promise<Pick<QuestionnaireRow, 'id' | 'title' | 'description' | 'is_active'>> {
    // Sanitizar únicamente el argumento de entrada (lo que entra desde el usuario/config)
    const cleanTitle = sanitizeString(title, 'questionnaire.title');
    const supabase = supabaseClient ?? createBrowserClient();

    const { data, error } = await supabase
      .from('questionnaires')
      .select('id, title, description, is_active')
      .eq('title', cleanTitle)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw new Error(`QuestionnaireService.getByTitle: ${error.message}`);
    if (!data) throw new Error(`No se encontró un cuestionario publicado con el título "${cleanTitle}".`);

    // Los datos de la BD ya llegan limpios (el proxy auto-trim actúa en escritura).
    return data;
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
      .select('id, questionnaire_id, title, type, is_first_question')
      .eq('questionnaire_id', questionnaireId)
      .eq('is_deleted', false)
      .returns<QuestionSelect[]>();

    if (qErr) throw new Error(`QuestionnaireService.getQuestionsMap (questions): ${qErr.message}`);
    if (!questions || questions.length === 0) return new Map();

    const questionIds = questions.map(q => q.id);

    const { data: options, error: oErr } = await supabase
      .from('question_options')
      .select('id, question_id, text, next_question_id')
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
        nextQuestionId: row.next_question_id,
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
        isFirstQuestion: row.is_first_question,
        options: optionsByQuestion.get(row.id) ?? [],
      });
    }

    return questionsMap;
  }

  /**
   * Devuelve la pregunta marcada como `is_first_question = true` en el mapa.
   *
   * @throws Error si ninguna pregunta está marcada como primera.
   */
  static findFirstQuestion(questionsMap: Map<string, QuestionNode>): QuestionNode {
    for (const question of questionsMap.values()) {
      if (question.isFirstQuestion) return question;
    }
    throw new Error(
      'QuestionnaireService.findFirstQuestion: No hay ninguna pregunta marcada como is_first_question.',
    );
  }
}
