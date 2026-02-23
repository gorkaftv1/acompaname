/**
 * Questionnaire Engine — Tipos de dominio
 *
 * Estos tipos son específicos del motor de cuestionario dinámico.
 * Son independientes de los tipos de Supabase (snake_case) y de los
 * servicios individuales de tabla.
 */

// ---------------------------------------------------------------------------
// Nodos del grafo
// ---------------------------------------------------------------------------

/** Una opción de respuesta con su puntero al siguiente nodo. */
export interface OptionNode {
    id: string;
    optionText: string;
    /** UUID de la siguiente pregunta, o null si este nodo es el final del cuestionario. */
    nextQuestionId: string | null;
    /** true cuando option_text === 'Respuesta libre' (opción fantasma para preguntas de tipo text). */
    isPhantom: boolean;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'boolean';

/** Una pregunta con sus opciones ya cargadas. */
export interface QuestionNode {
    id: string;
    questionnaireId: string;
    questionText: string;
    questionType: QuestionType;
    isFirstQuestion: boolean;
    options: OptionNode[];
}

// ---------------------------------------------------------------------------
// Estado del motor
// ---------------------------------------------------------------------------

export type EngineStatus =
    | 'loading'   // Cargando preguntas desde Supabase
    | 'answering' // El usuario está respondiendo
    | 'saving'    // Guardando respuesta (petición en curso)
    | 'completed' // Cuestionario completado
    | 'error';    // Error irrecuperable

export interface QuestionnaireEngineState {
    status: EngineStatus;
    currentQuestion: QuestionNode | null;
    /** Map de questionId → respuesta local (para UI inmediata sin esperar a BD). */
    answersMap: Map<string, AnswerEntry>;
    errorMessage: string | null;
    /** Número de preguntas respondidas (para mostrar progreso aproximado). */
    answeredCount: number;
    /** Nombre del usuario (capturado en Q1). */
    userName: string | null;
    /** Nombre de la persona acompañada (capturado en Q2). */
    caregivingName: string | null;
}

export interface AnswerEntry {
    questionId: string;
    selectedOptionId: string | null;
    freeTextResponse: string | null;
}
