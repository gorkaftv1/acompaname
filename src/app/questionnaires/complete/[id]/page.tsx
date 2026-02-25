import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { QuestionnaireCompleteClient } from '@/components/questionnaires/QuestionnaireCompleteClient';

export default async function QuestionnaireCompletePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: session } = await supabase
        .from('questionnaire_sessions')
        .select(`
      *,
      questionnaires ( id, title, description, is_onboarding ),
      questionnaire_responses (
        *,
        questionnaire_questions ( id, title, order_index, type ),
        question_options ( id, text, score )
      )
    `)
        .eq('id', id)
        .eq('user_id', user!.id)
        .eq('status', 'completed')
        .single();

    if (!session) notFound();

    // Ordena respuestas por order_index de la pregunta
    session.questionnaire_responses = session.questionnaire_responses
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) =>
            a.questionnaire_questions.order_index - b.questionnaire_questions.order_index
        );

    return <QuestionnaireCompleteClient session={session} />;
}
