// ─── Shared Admin Types ──────────────────────────────────────────────────────────

export interface OptionNode {
    id: string;
    text: string;
    score: number | null;
    order_index: number;
}

export interface ShowIfCondition {
    question_id: string;
    option_ids: string[];
}

export interface ShowIfRule {
    operator: 'OR' | 'AND';
    conditions: ShowIfCondition[];
}

export interface QuestionNode {
    id: string;
    title: string;
    description: string | null;
    type: 'single_choice' | 'multiple_choice' | 'text';
    order_index: number;
    show_if: ShowIfRule | null | string; // Supabase returns it as JSON or string, handled in UI
    is_deleted: boolean;
    question_options: OptionNode[];
}

export interface QuestionnaireData {
    id: string;
    title: string;
    description: string | null;
    status: 'draft' | 'published' | 'archived';
    type: 'onboarding' | 'who5' | 'standard';
    created_at: string;
    questionnaire_questions: QuestionNode[];
}

export interface AdminSurveySummary {
    id: string;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
}
