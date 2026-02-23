/**
 * TypeScript Types for Supabase Database
 *
 * Types based on actual database schema (00_initial_schema.sql).
 * These types ensure type safety when querying Supabase.
 *
 * Tables:
 * - profiles (user profile with onboarding data)
 * - daily_emotions (unified mood + journal entries)
 * - chat_messages (chat history with AI)
 * - questionnaires (configurable questionnaires)
 * - questionnaire_questions (individual questions)
 * - question_options (answer options with conditional navigation)
 * - questionnaire_responses (individual answers — user-owned, no sessions)
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
                    role: 'user' | 'assistant'
                    content: string
                    emotion: 'calm' | 'okay' | 'challenging' | 'mixed' | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    role: 'user' | 'assistant'
                    content: string
                    emotion?: 'calm' | 'okay' | 'challenging' | 'mixed' | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    role?: 'user' | 'assistant'
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
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    is_active?: boolean
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
                    is_first_question: boolean
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
                    is_first_question?: boolean
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
                    is_first_question?: boolean
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
                    next_question_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    question_id: string
                    order_index?: number
                    text: string
                    next_question_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    question_id?: string
                    order_index?: number
                    text?: string
                    next_question_id?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: 'question_options_question_id_fkey'
                        columns: ['question_id']
                        referencedRelation: 'questionnaire_questions'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'question_options_next_question_id_fkey'
                        columns: ['next_question_id']
                        referencedRelation: 'questionnaire_questions'
                        referencedColumns: ['id']
                    }
                ]
            }
            questionnaire_responses: {
                Row: {
                    id: string
                    user_id: string
                    question_id: string
                    option_id: string | null
                    free_text_response: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    question_id: string
                    option_id?: string | null
                    free_text_response?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
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
                    is_active: boolean
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
                    is_first_question: boolean
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
                    next_question_id: string | null
                    created_at: string
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
                Args: { q_id: string }
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
