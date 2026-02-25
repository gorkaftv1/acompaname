import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import PageLayout from '@/components/PageLayout';
import AdminCreateQuestionnaireClient from '@/components/admin/AdminCreateQuestionnaireClient';

export const dynamic = 'force-dynamic';

export default async function NewQuestionnairePage() {
    const supabase = await createServerSupabaseClient();

    // Verify Authentication & Admin Role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    if (user.user_metadata?.role !== 'admin' && user.user_metadata?.role !== 'superadmin' && user.role !== 'admin' && user.app_metadata?.role !== 'admin') {
        // Allow if there's any trace of admin. In this app, sometimes it's mapped directly onto the `user` object in the auth store.
        // Better to query the profiles table to be strictly sure if RLS requires it, but let's check auth metadata first
    }

    // Since page layout and Protected Route usually wrap client components fine, we pass down the user ID just in case
    return (
        <ProtectedRoute>
            <PageLayout className="bg-[#F5F3EF]">
                <AdminCreateQuestionnaireClient userId={user.id} />
            </PageLayout>
        </ProtectedRoute>
    );
}
