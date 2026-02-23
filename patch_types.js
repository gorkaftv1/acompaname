const fs = require('fs');
const path = './src/lib/supabase/database.types.ts';
let content = fs.readFileSync(path, 'utf8');

// questionnaires
content = content.replace(/status: 'draft' \| 'published'/g, "is_active: boolean");
content = content.replace(/status\?: 'draft' \| 'published'/g, "is_active?: boolean");

// deleted_at everywhere except daily_emotions and chat_messages where it doesn't exist
content = content.replace(/deleted_at: string \| null\n/g, "");
content = content.replace(/deleted_at\?: string \| null\n/g, "");

// questionnaire_questions
content = content.replace(/question_text: string/g, "order_index: number\n          title: string\n          description: string | null");
content = content.replace(/question_text\?: string/g, "order_index?: number\n          title?: string\n          description?: string | null");

content = content.replace(/question_type: 'single_choice' \| 'multiple_choice' \| 'text' \| 'number' \| 'boolean'/g, "type: 'single_choice' | 'multiple_choice' | 'text'");
content = content.replace(/question_type\?: 'single_choice' \| 'multiple_choice' \| 'text' \| 'number' \| 'boolean'/g, "type?: 'single_choice' | 'multiple_choice' | 'text'");

// Actually, questionnaire_questions has is_deleted instead of deleted_at
content = content.replace(/is_first_question: boolean/g, "is_first_question: boolean\n          is_deleted: boolean");
content = content.replace(/is_first_question\?: boolean/g, "is_first_question?: boolean\n          is_deleted?: boolean");

// question_options
content = content.replace(/option_text: string/g, "order_index: number\n          text: string");
content = content.replace(/option_text\?: string/g, "order_index?: number\n          text?: string");

// questionnaire_responses
content = content.replace(/selected_option_id: string \| null/g, "option_id: string | null");
content = content.replace(/selected_option_id\?: string \| null/g, "option_id?: string | null");

// Views: active_questionnaire_questions -> active_questions
content = content.replace(/active_questionnaire_questions:/g, "active_questions:");

// Func: soft_delete_question
content = content.replace(/p_question_id: string/g, "q_id: string");

fs.writeFileSync(path, content);
console.log('Successfully patched database.types.ts');
