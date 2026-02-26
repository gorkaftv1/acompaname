import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import PageLayout from '@/components/PageLayout';
import QuestionnaireSessionClient from '@/components/questionnaires/QuestionnaireSessionClient';
import { QuestionnaireService } from '@/services/questionnaire.service';

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

    // 2. Fetch published questionnaire with all questions + options via service
    const questionnaire = await QuestionnaireService.getQuestionnaireWithQuestions(id, supabase);

    if (!questionnaire) notFound();

    return (
        <PageLayout className="bg-[#F5F3EF]">
            <QuestionnaireSessionClient
                questionnaire={questionnaire as any}
                userId={user.id}
            />
        </PageLayout>
    );
}
