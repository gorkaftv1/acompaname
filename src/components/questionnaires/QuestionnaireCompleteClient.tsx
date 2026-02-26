'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import WHO5Results from '@/components/who5/WHO5Results';
import { who5ScoreCategories, type WHO5Result } from '@/lib/who5/who5.config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function QuestionnaireCompleteClient({ session }: { session: any }) {
    const router = useRouter();

    const formattedDate = new Date(session.completed_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const is_onboarding = session.questionnaires.type === 'onboarding';
    const showScore = !is_onboarding && session.score !== null;
    const score = session.score;

    const who5Result: WHO5Result | null = showScore ? {
        rawScore: (score ?? 0) / 4,
        finalScore: score ?? 0,
        category: who5ScoreCategories.find((c) => (score ?? 0) >= c.min && (score ?? 0) <= c.max) ?? who5ScoreCategories[who5ScoreCategories.length - 1],
    } : null;

    const containerVariants: Variants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <header className="mb-8">
                <button
                    onClick={() => router.push('/questionnaires')}
                    className="group mb-6 flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#4A9B9B] transition-colors"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    Volver
                </button>

                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-[#1A1A1A] leading-tight">
                        {session.questionnaires.title}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5F2F2] px-3 py-1 text-sm font-semibold text-[#2C5F7C] border border-[#BBDCD2]">
                            <CheckCircle2 size={16} />
                            Completado el {formattedDate}
                        </span>
                    </div>
                </div>
            </header>

            {showScore && who5Result && (
                <div className="-mx-4 sm:mx-0 mb-10">
                    <WHO5Results result={who5Result} />
                </div>
            )}

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
            >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {session.questionnaire_responses.map((resp: any, index: number) => {
                    const question = resp.questionnaire_questions;
                    const option = resp.question_options;
                    const answerText = option ? option.text : resp.free_text_response;
                    const optionScore = option?.score;

                    if (!answerText) return null; // Solo mostrar si hay respuesta

                    return (
                        <motion.article
                            key={resp.id}
                            variants={itemVariants}
                            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E5E7EB]"
                        >
                            <h3 className="text-sm font-semibold text-[#1A1A1A] leading-relaxed mb-3">
                                <span className="text-[#4A9B9B] mr-2">{index + 1}.</span>
                                {question.title}
                            </h3>

                            <div className="flex items-start justify-between gap-4 rounded-xl bg-[#F9FAFB] p-4 border border-[#E5E7EB]/50">
                                <p className="text-sm font-medium text-[#4B5563]">
                                    {answerText}
                                </p>

                                {!is_onboarding && optionScore !== null && optionScore !== undefined && (
                                    <span className="shrink-0 inline-flex items-center justify-center rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#2C5F7C] shadow-sm ring-1 ring-[#E5E7EB]">
                                        {optionScore} pts
                                    </span>
                                )}
                            </div>
                        </motion.article>
                    );
                })}
            </motion.div>

            <footer className="mt-12 flex flex-col gap-3">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full rounded-xl bg-gradient-to-r from-[#4A9B9B] to-[#2C5F7C] py-3.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.01] hover:shadow-md active:scale-[0.99]"
                >
                    Ir al inicio
                </button>
                <button
                    onClick={() => router.push('/questionnaires')}
                    className="w-full rounded-xl bg-white py-3.5 text-center text-sm font-semibold text-[#4A9B9B] shadow-sm ring-1 ring-[#E5E7EB] transition-all hover:bg-[#F9FAFB] active:scale-[0.99]"
                >
                    Volver a cuestionarios
                </button>
            </footer>
        </div>
    );
}
