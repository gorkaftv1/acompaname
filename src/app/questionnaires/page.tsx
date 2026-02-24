import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { QuestionnaireService } from '@/services/questionnaire.service';
import { ResponseService } from '@/services/response.service';
import PageLayout from '@/components/PageLayout';
import { QuestionnaireListClient, type QuestionnaireWithProgress, type CompletedSessionWithDetails } from '@/components/questionnaires/QuestionnaireList.client';

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
        .select('id, title, description, status')
        .eq('status', 'published');

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
    const completedList: CompletedSessionWithDetails[] = [];

    // Fetch Completed Sessions
    const { data: completedSessions, error: csErr } = await supabase
        .from('questionnaire_sessions')
        .select(`
            id,
            completed_at,
            questionnaire_id,
            questionnaires ( title, is_onboarding )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

    if (!csErr && completedSessions) {
        completedSessions.forEach((session: any) => {
            if (session.questionnaires) {
                // Ensure array handling for relation
                const qData = Array.isArray(session.questionnaires) ? session.questionnaires[0] : session.questionnaires;
                completedList.push({
                    sessionId: session.id,
                    questionnaireId: session.questionnaire_id,
                    title: qData.title,
                    isOnboarding: qData.is_onboarding,
                    completedAt: session.completed_at
                });
            }
        });
    }

    // 3. Process each questionnaire concurrently for active/in_progress
    await Promise.all(questionnaires.map(async (q: any) => {
        try {
            // Load graph for progress calculation
            const qMap = await QuestionnaireService.getQuestionsMap(q.id, supabase);

            // Calculate dynamic progress
            const userProgress = await ResponseService.getUserProgress(user.id, q.id, qMap, supabase);

            const answeredCount = userProgress.answeredCount;
            const isCompleted = userProgress.isCompleted;
            const totalEstimated = userProgress.progress?.totalSteps || answeredCount;

            const item: QuestionnaireWithProgress = {
                questionnaire: q,
                answeredCount: answeredCount,
                totalQuestions: totalEstimated,
                isCompleted: !!isCompleted,
            };

            if (!isCompleted && answeredCount > 0) {
                inProgressList.push(item);
            } else if (!isCompleted && answeredCount === 0) {
                availableList.push(item);
            }
            // Skip if completed, as they are now handled by completedSessions query
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
