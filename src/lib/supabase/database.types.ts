/**
 * TypeScript Types for Supabase Database
 *
 * Types based on actual database schema (01_initial_schema.sql + 07_views.sql).
 * These types ensure type safety when querying Supabase.
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    name: string
                    caregiving_for: string | null
                    relationship_type: string | null
                    condition: string | null
                    caregiving_duration: string | null
                    main_challenges: string[] | null
                    support_needs: string | null
                    ai_tone: 'formal' | 'casual' | 'friendly' | null
                    preferred_language_style: 'direct' | 'detailed' | 'balanced' | null
                    notification_preferences: Json | null
                    role: 'admin' | 'user'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name: string
                    caregiving_for?: string | null
                    relationship_type?: string | null
                    condition?: string | null
                    caregiving_duration?: string | null
                    main_challenges?: string[] | null
                    support_needs?: string | null
                    ai_tone?: 'formal' | 'casual' | 'friendly' | null
                    preferred_language_style?: 'direct' | 'detailed' | 'balanced' | null
                    notification_preferences?: Json | null
                    role?: 'admin' | 'user'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    caregiving_for?: string | null
                    relationship_type?: string | null
                    condition?: string | null
                    caregiving_duration?: string | null
                    main_challenges?: string[] | null
                    support_needs?: string | null
                    ai_tone?: 'formal' | 'casual' | 'friendly' | null
                    preferred_language_style?: 'direct' | 'detailed' | 'balanced' | null
                    notification_preferences?: Json | null
                    role?: 'admin' | 'user'
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            daily_emotions: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    emotion: 'calm' | 'okay' | 'challenging' | 'mixed'
                    intensity: 'low' | 'medium' | 'high'
                    title: string | null
                    content: string | null
                    tags: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    date: string
                    emotion: 'calm' | 'okay' | 'challenging' | 'mixed'
                    intensity?: 'low' | 'medium' | 'high'
                    title?: string | null
                    content?: string | null
                    tags?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string
                    emotion?: 'calm' | 'okay' | 'challenging' | 'mixed'
                    intensity?: 'low' | 'medium' | 'high'
                    title?: string | null
                    content?: string | null
                    tags?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'daily_emotions_user_id_fkey'
                        columns: ['user_id']
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    }
                ]
            }
            chat_messages: {
                Row: {
                    id: string
                    user_id: string
                    role: 'user' | 'assistant' | 'system'
                    content: string
                    emotion: 'calm' | 'okay' | 'challenging' | 'mixed' | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    role: 'user' | 'assistant' | 'system'
                    content: string
                    emotion?: 'calm' | 'okay' | 'challenging' | 'mixed' | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    role?: 'user' | 'assistant' | 'system'
                    content?: string
                    emotion?: 'calm' | 'okay' | 'challenging' | 'mixed' | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'chat_messages_user_id_fkey'
                        columns: ['user_id']
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    }
                ]
            }
            questionnaires: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    type: 'onboarding' | 'who5' | 'standard'
                    status: 'draft' | 'published' | 'archived'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    type?: 'onboarding' | 'who5' | 'standard'
                    status?: 'draft' | 'published' | 'archived'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    type?: 'onboarding' | 'who5' | 'standard'
                    status?: 'draft' | 'published' | 'archived'
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            questionnaire_questions: {
                Row: {
                    id: string
                    questionnaire_id: string
                    order_index: number
                    title: string
                    description: string | null
                    type: 'single_choice' | 'multiple_choice' | 'text'
                    show_if: Json | null
                    is_deleted: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    questionnaire_id: string
                    order_index?: number
                    title: string
                    description?: string | null
                    type?: 'single_choice' | 'multiple_choice' | 'text'
                    show_if?: Json | null
                    is_deleted?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    questionnaire_id?: string
                    order_index?: number
                    title?: string
                    description?: string | null
                    type?: 'single_choice' | 'multiple_choice' | 'text'
                    show_if?: Json | null
                    is_deleted?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'questionnaire_questions_questionnaire_id_fkey'
                        columns: ['questionnaire_id']
                        referencedRelation: 'questionnaires'
                        referencedColumns: ['id']
                    }
                ]
            }
            question_options: {
                Row: {
                    id: string
                    question_id: string
                    order_index: number
                    text: string
                    score: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    question_id: string
                    order_index?: number
                    text: string
                    score?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    question_id?: string
                    order_index?: number
                    text?: string
                    score?: number | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'question_options_question_id_fkey'
                        columns: ['question_id']
                        referencedRelation: 'questionnaire_questions'
                        referencedColumns: ['id']
                    }
                ]
            }
            questionnaire_sessions: {
                Row: {
                    id: string
                    user_id: string
                    questionnaire_id: string
                    status: 'in_progress' | 'completed' | 'abandoned'
                    score: number | null
                    started_at: string
                    completed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    questionnaire_id: string
                    status?: 'in_progress' | 'completed' | 'abandoned'
                    score?: number | null
                    started_at?: string
                    completed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    questionnaire_id?: string
                    status?: 'in_progress' | 'completed' | 'abandoned'
                    score?: number | null
                    started_at?: string
                    completed_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: 'questionnaire_sessions_user_id_fkey'
                        columns: ['user_id']
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'questionnaire_sessions_questionnaire_id_fkey'
                        columns: ['questionnaire_id']
                        referencedRelation: 'questionnaires'
                        referencedColumns: ['id']
                    }
                ]
            }
            questionnaire_responses: {
                Row: {
                    id: string
                    user_id: string
                    questionnaire_id: string
                    session_id: string
                    question_id: string
                    option_id: string | null
                    free_text_response: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    questionnaire_id: string
                    session_id: string
                    question_id: string
                    option_id?: string | null
                    free_text_response?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    questionnaire_id?: string
                    session_id?: string
                    question_id?: string
                    option_id?: string | null
                    free_text_response?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'questionnaire_responses_user_id_fkey'
                        columns: ['user_id']
                        referencedRelation: 'users'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'questionnaire_responses_session_id_fkey'
                        columns: ['session_id']
                        referencedRelation: 'questionnaire_sessions'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'questionnaire_responses_question_id_fkey'
                        columns: ['question_id']
                        referencedRelation: 'questionnaire_questions'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'questionnaire_responses_option_id_fkey'
                        columns: ['option_id']
                        referencedRelation: 'question_options'
                        referencedColumns: ['id']
                    }
                ]
            }
        }
        Views: {
            active_questionnaires: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    type: 'onboarding' | 'who5' | 'standard'
                    status: 'draft' | 'published' | 'archived'
                    created_at: string
                    updated_at: string
                }
                Relationships: []
            }
            active_questions: {
                Row: {
                    id: string
                    questionnaire_id: string
                    order_index: number
                    title: string
                    description: string | null
                    type: 'single_choice' | 'multiple_choice' | 'text'
                    show_if: Json | null
                    is_deleted: boolean
                    created_at: string
                    updated_at: string
                }
                Relationships: []
            }
            active_question_options: {
                Row: {
                    id: string
                    question_id: string
                    order_index: number
                    text: string
                    score: number | null
                    created_at: string
                }
                Relationships: []
            }
            user_responses_detail: {
                Row: {
                    user_id: string
                    user_name: string
                    questionnaire_id: string
                    questionnaire_title: string
                    is_onboarding: boolean
                    session_id: string
                    session_status: 'in_progress' | 'completed' | 'abandoned'
                    session_score: number | null
                    started_at: string
                    completed_at: string | null
                    question_id: string
                    question_title: string
                    question_type: 'single_choice' | 'multiple_choice' | 'text'
                    question_order: number
                    option_text: string | null
                    option_score: number | null
                    free_text_response: string | null
                    answered_at: string
                }
                Relationships: []
            }
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
            soft_delete_question: {
                Args: { p_question_id: string }
                Returns: undefined
            }
            publish_questionnaire: {
                Args: { p_questionnaire_id: string }
                Returns: undefined
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
