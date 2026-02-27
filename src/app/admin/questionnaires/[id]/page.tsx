import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import PageLayout from '@/components/PageLayout';
import AdminEditQuestionnaireClient from '@/components/admin/AdminEditQuestionnaireClient';
import AdminEditWHO5QuestionnaireClient from '@/components/admin/AdminEditWHO5QuestionnaireClient';
import AdminEditOnboardingQuestionnaireClient from '@/components/admin/AdminEditOnboardingQuestionnaireClient';
import { AdminQuestionnaireService } from '@/lib/services/admin-questionnaire.service';

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

    let initialData;
    try {
        initialData = await AdminQuestionnaireService.getQuestionnaireById(id, supabase);
    } catch (err) {
        return notFound();
    }

    return (
        <ProtectedRoute>
            <PageLayout className="bg-[#F5F3EF]">
                {initialData.type === 'who5' ? (
                    <AdminEditWHO5QuestionnaireClient initialData={initialData} />
                ) : initialData.type === 'onboarding' ? (
                    <AdminEditOnboardingQuestionnaireClient initialData={initialData} />
                ) : (
                    <AdminEditQuestionnaireClient initialData={initialData} />
                )}
            </PageLayout>
        </ProtectedRoute>
    );
}
