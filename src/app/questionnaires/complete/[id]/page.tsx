import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { QuestionnaireCompleteClient } from '@/components/questionnaires/QuestionnaireCompleteClient';
import { ResponseService } from '@/lib/services/response.service';
import type { CompletedSessionDetails } from '@/types/questionnaire.types';

export default async function QuestionnaireCompletePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const session = await ResponseService.getCompletedSessionDetails(id, user!.id, supabase);

    if (!session) notFound();

    return <QuestionnaireCompleteClient session={session as unknown as CompletedSessionDetails} />;
}
