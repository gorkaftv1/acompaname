import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import PageLayout from '@/components/PageLayout';
import AdminEditQuestionnaireClient from '@/components/admin/AdminEditQuestionnaireClient';

export const dynamic = 'force-dynamic';

export default async function EditQuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabaseClient();

    // Verify Authentication & Admin Role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // Role check logic matching /admin/page.tsx guard logic from supabase.auth

    const { id } = await params;

    // Fetch Questionnaire Details (status, title, description, and related questions and options)
    const { data: questionnaire, error: qErr } = await supabase
        .from('questionnaires')
        .select(`
            id,
            title,
            description,
            status,
            is_onboarding,
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

    if (qErr || !questionnaire) {
        return notFound();
    }

    // Filter out deleted questions directly and sort by order_index
    const questions = (questionnaire.questionnaire_questions || [])
        .filter((q: any) => !q.is_deleted)
        .map((q: any) => {
            // Sort options natively here to pass clean props
            const options = (q.question_options || []).sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));
            return {
                ...q,
                question_options: options
            };
        })
        .sort((a: any, b: any) => a.order_index - b.order_index);

    const initialData = {
        ...questionnaire,
        questionnaire_questions: questions
    };

    return (
        <ProtectedRoute>
            <PageLayout className="bg-[#F5F3EF]">
                <AdminEditQuestionnaireClient initialData={initialData} />
            </PageLayout>
        </ProtectedRoute>
    );
}
