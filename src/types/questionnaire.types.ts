export type QuestionnaireType = 'onboarding' | 'who5' | 'standard';

export interface QuestionOption {
    id: string;
    text: string;
    score: number | null;
    order_index: number;
}

export interface Question {
    id: string;
    title: string;
    type: 'single_choice' | 'multiple_choice' | 'text';
    order_index: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    show_if: any | null;
    question_options: QuestionOption[];
}

export interface Questionnaire {
    id: string;
    title: string;
    description: string | null;
    type: QuestionnaireType | string;
    questionnaire_questions: Question[];
}

export interface CompletedSessionWithDetails {
    sessionId: string;
    questionnaireId: string;
    title: string;
    isOnboarding: boolean;
    completedAt: string;
}

export type CardVariant = 'onboarding' | 'who5' | 'normal';

export interface QuestionnaireWithProgress {
    questionnaire: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        type: string;
    };
    answeredCount: number;
    totalQuestions: number;
    isCompleted: boolean;
}

export interface QuestionnaireResponseDetail {
    id: string;
    free_text_response: string | null;
    questionnaire_questions: {
        id: string;
        title: string;
        order_index: number;
        type: string;
    };
    question_options: {
        id: string;
        text: string;
        score: number | null;
    } | null;
}

export interface CompletedSessionDetails {
    id: string;
    completed_at: string;
    score: number | null;
    questionnaires: {
        id: string;
        title: string;
        description: string | null;
        type: string;
    };
    questionnaire_responses: QuestionnaireResponseDetail[];
}
