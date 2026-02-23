import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { QuestionnaireService } from '@/services/questionnaire.service';
import { ResponseService } from '@/services/response.service';
import PageLayout from '@/components/PageLayout';
import { QuestionnaireListClient, type QuestionnaireWithProgress } from '@/components/questionnaires/QuestionnaireList.client';

export const dynamic = 'force-dynamic';

export default async function QuestionnairesPage() {
    const supabase = await createServerSupabaseClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    // 2. Fetch active questionnaires
    const { data: questionnaires, error: qErr } = await supabase
        .from('questionnaires')
        .select('id, title, description, is_active')
        .eq('is_active', true);

    if (qErr) {
        console.error('Error fetching questionnaires:', qErr.message);
        return (
            <PageLayout className="bg-[#F5F3EF]">
                <div className="mx-auto max-w-4xl px-4 py-12 text-center text-[#6B7280]">
                    Error al cargar los cuestionarios.
                </div>
            </PageLayout>
        );
    }

    if (!questionnaires || questionnaires.length === 0) {
        return (
            <PageLayout className="bg-[#F5F3EF]">
                <QuestionnaireListClient available={[]} inProgress={[]} completed={[]} />
            </PageLayout>
        );
    }

    const availableList: QuestionnaireWithProgress[] = [];
    const inProgressList: QuestionnaireWithProgress[] = [];
    const completedList: QuestionnaireWithProgress[] = [];

    // 3. Process each questionnaire concurrently
    await Promise.all(questionnaires.map(async (q: any) => {
        try {
            // Load graph for progress calculation
            const qMap = await QuestionnaireService.getQuestionsMap(q.id, supabase);

            // Calculate dynamic progress
            const userProgress = await ResponseService.getUserProgress(user.id, q.id, qMap, supabase);

            const answeredCount = userProgress.answeredCount;
            const isCompleted = userProgress.isCompleted;
            const totalEstimated = userProgress.progress?.maxSteps || answeredCount;

            const item: QuestionnaireWithProgress = {
                questionnaire: q,
                answeredCount: answeredCount,
                totalQuestions: totalEstimated,
                isCompleted: !!isCompleted,
            };

            if (isCompleted) {
                completedList.push(item);
            } else if (answeredCount > 0) {
                inProgressList.push(item);
            } else {
                availableList.push(item);
            }
        } catch (err) {
            console.error(`Error processing questionnaire ${q.id}:`, err);
        }
    }));

    return (
        <PageLayout className="bg-[#F5F3EF]">
            <QuestionnaireListClient
                available={availableList}
                inProgress={inProgressList}
                completed={completedList}
            />
        </PageLayout>
    );
}
