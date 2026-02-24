import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import PageLayout from '@/components/PageLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { calculateWHO5Score } from '@/lib/who5/who5.config';
import type { EmotionType } from '@/types';

export const dynamic = 'force-dynamic';

export default async function CompletedSessionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const supabase = await createServerSupabaseClient();

    // 1. Verify Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        redirect('/login');
    }

    const { id: sessionId } = await params;

    // 2. Fetch Session Details
    const { data: session, error: sessionErr } = await supabase
        .from('questionnaire_sessions')
        .select(`
            id,
            completed_at,
            questionnaires!inner(title, is_onboarding)
        `)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .single();

    if (sessionErr || !session) {
        return notFound();
    }

    const isWHO5 = !session.questionnaires.is_onboarding;

    // 3. Fetch Responses using Supabase standard join syntax
    // This perfectly replicates the logic of the requested SQL join:
    // "SELECT qr.id, qr.option_id, qr.free_text_response, qq.title AS question_title, qq.type AS question_type, qq.order_index, qo.text AS option_text FROM questionnaire_responses qr JOIN questionnaire_questions qq ON qq.id = qr.question_id LEFT JOIN question_options qo ON qo.id = qr.option_id WHERE qr.session_id = [id] ORDER BY qq.order_index ASC"

    const { data: responses, error: joinErr } = await supabase
        .from('questionnaire_responses')
        .select(`
            id,
            option_id,
            free_text_response,
            questionnaire_questions!inner(
                title,
                type,
                order_index
            ),
            question_options(
                text,
                score
            )
        `)
        .eq('session_id', sessionId)
        .order('order_index', { referencedTable: 'questionnaire_questions', ascending: true });

    if (joinErr || !responses) {
        return notFound();
    }

    // Process responses into a flatter structure for the UI
    const formattedResponses = responses.map((r: any) => {
        const q = Array.isArray(r.questionnaire_questions) ? r.questionnaire_questions[0] : r.questionnaire_questions;
        const o = r.question_options ? (Array.isArray(r.question_options) ? r.question_options[0] : r.question_options) : null;

        return {
            id: r.id,
            question_title: q.title,
            question_type: q.type,
            order_index: q.order_index,
            option_text: o ? o.text : null,
            score: o?.score, // Required to re-calculate WHO5 score or we could just use option value
            free_text_response: r.free_text_response
        };
    }).sort((a, b) => a.order_index - b.order_index);


    // WHO-5 Scoring logic
    let who5Result = null;
    if (isWHO5) {
        const answersMap: Record<string, number> = {};
        formattedResponses.forEach(r => {
            if (r.score !== undefined && r.score !== null) {
                answersMap[r.id] = r.score;
            }
        });
        who5Result = calculateWHO5Score(answersMap);
    }

    // Date formatting (Spanish legible)
    const completedDate = new Date(session.completed_at as string);
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(completedDate);

    // Dynamic styles based on emotion (fallback if no config)
    const getEmotionColors = (emotion: EmotionType) => {
        switch (emotion) {
            case 'calm': return 'text-green-700 bg-green-100 border-green-200';
            case 'okay': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
            case 'challenging': return 'text-red-700 bg-red-100 border-red-200';
            case 'mixed': return 'text-purple-700 bg-purple-100 border-purple-200';
            default: return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    return (
        <ProtectedRoute>
            <PageLayout className="bg-[#F5F3EF]">
                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                    {/* Back Navigation */}
                    <Link
                        href="/questionnaires"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] mb-8 transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Volver a cuestionarios
                    </Link>

                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-[#E8F3ED] rounded-full mb-5 shadow-sm">
                            <CheckCircle2 size={36} className="text-[#4A9B9B]" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">{session.questionnaires.title}</h1>
                        <p className="text-[15px] font-medium text-[#6B7280] capitalize">
                            Completado el {formattedDate}
                        </p>
                    </div>

                    {/* WHO-5 Score Panel */}
                    {isWHO5 && who5Result && (
                        <div className="bg-white rounded-3xl max-w-10xl mx-auto p-8 shadow-sm border border-[#E5E7EB] mb-10 text-center flex flex-col items-center">
                            <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-widest mb-4">
                                Índice de Bienestar
                            </h2>
                            <div className="text-6xl  font-bold text-[#2C5F7C] mb-4">
                                {who5Result.finalScore} <span className="text-2xl text-[#9CA3AF] font-semibold">/ 100</span>
                            </div>
                            <div className={`px-5 py-2 rounded-full text-[15px] font-semibold border ${getEmotionColors(who5Result.category.emotion)}`}>
                                {who5Result.category.label}
                            </div>
                            <p className="mt-4 text-sm text-[#6B7280] max-w-3xl leading-relaxed">
                                {who5Result.category.description}
                            </p>
                        </div>
                    )}

                    {/* Responses List */}
                    <section>
                        <h2 className="text-xl font-bold text-[#1A1A1A] mb-6 pl-2 border-l-4 border-[#4A9B9B]">
                            Resumen de Respuestas
                        </h2>
                        <div className="space-y-4">
                            {formattedResponses.map((resp, idx) => (
                                <div key={resp.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] transition-all hover:shadow-md">
                                    <div className="flex gap-5">
                                        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F3EF] text-base font-bold text-[#2C5F7C]">
                                            {idx + 1}
                                        </div>
                                        <div className="pt-2">
                                            <h3 className="text-[16px] font-semibold text-[#1A1A1A] leading-relaxed mb-3">
                                                {resp.question_title}
                                            </h3>
                                            <div className="inline-block bg-[#F0F9F9] border border-[#A8C5B5] px-4 py-2.5 rounded-xl">
                                                <p className="text-[15px] text-[#2C5F7C] font-semibold">
                                                    {resp.option_text || resp.free_text_response || <span className="text-gray-400 italic">Sin respuesta</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </PageLayout>
        </ProtectedRoute>
    );
}
