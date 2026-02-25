import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import PageLayout from '@/components/PageLayout';
import QuestionnaireSessionClient from '@/components/questionnaires/QuestionnaireSessionClient';

export const dynamic = 'force-dynamic';

export default async function QuestionnaireSessionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const supabase = await createServerSupabaseClient();

    // 1. Auth guard
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    const { id } = await params;

    // 2. Fetch published questionnaire with all questions + options
    const { data: questionnaire } = await supabase
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

    if (!questionnaire) notFound();

    // 3. Sort questions and options by order_index, filter deleted
    questionnaire.questionnaire_questions = (questionnaire as any)
        .questionnaire_questions
        .filter((q: any) => !q.is_deleted)
        .sort((a: any, b: any) => a.order_index - b.order_index)
        .map((q: any) => ({
            ...q,
            question_options: q.question_options.sort(
                (a: any, b: any) => a.order_index - b.order_index
            ),
        }));

    return (
        <PageLayout className="bg-[#F5F3EF]">
            <QuestionnaireSessionClient
                questionnaire={questionnaire as any}
                userId={user.id}
            />
        </PageLayout>
    );
}
