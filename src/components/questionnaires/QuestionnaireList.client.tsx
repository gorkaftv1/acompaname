'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants, type Transition } from 'framer-motion';
import { Clock, CheckCircle2, BookOpen, ChevronRight } from 'lucide-react';
import { useQuestionnaireContext } from '@/lib/hooks/useQuestionnaireContext';
import { getRelativeTime } from '@/lib/utils/date';

/** Questionnaire IDs that have a dedicated standalone route */
const STANDALONE_ROUTES: Record<string, string> = {
    'b0000000-0000-0000-0000-000000000002': '/who-5',
};

export interface QuestionnaireWithProgress {
    questionnaire: {
        id: string;
        title: string;
        description: string | null;
        status: string;
    };
    answeredCount: number;
    totalQuestions: number;
    isCompleted: boolean;
}

export interface CompletedSessionWithDetails {
    sessionId: string;
    questionnaireId: string;
    title: string;
    isOnboarding: boolean;
    completedAt: string;
}

const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const itemTransition: Transition = { duration: 0.35, ease: 'easeOut' as const };

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: itemTransition },
};

function ProgressBar({ answered, total }: { answered: number; total: number }) {
    const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
    return (
        <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1.5">
                <span>{answered} de {total} (estimado)</span>
                <span className="font-medium">{pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#4A9B9B] to-[#2C5F7C]"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}

function UserQuestionnaireCard({
    item,
    onStart,
    onContinue,
    resolvePlaceholders,
}: {
    item: QuestionnaireWithProgress;
    onStart?: () => void;
    onContinue?: () => void;
    resolvePlaceholders: (text: string) => string;
}) {
    const { questionnaire, answeredCount, totalQuestions, isCompleted } = item;
    const isInProgress = !isCompleted && answeredCount > 0;

    return (
        <motion.article
            whileHover={{ y: -3, boxShadow: '0 12px 24px -6px rgb(0 0 0 / 0.09)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="group relative flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-md ring-1 ring-[#E5E7EB]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F3EF]">
                        {isCompleted ? (
                            <CheckCircle2 size={18} className="text-[#6B9E78]" />
                        ) : isInProgress ? (
                            <Clock size={18} className="text-[#E8B563]" />
                        ) : (
                            <BookOpen size={18} className="text-[#2C5F7C]" />
                        )}
                    </span>
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-[#1A1A1A] leading-snug">
                            {resolvePlaceholders(questionnaire.title)}
                        </h3>
                        {questionnaire.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-[#6B7280] leading-relaxed">
                                {resolvePlaceholders(questionnaire.description)}
                            </p>
                        )}
                    </div>
                </div>

                {!isCompleted && (
                    <button
                        onClick={isInProgress ? onContinue : onStart}
                        className="shrink-0 flex items-center gap-1.5 rounded-xl bg-[#2C5F7C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245170]"
                    >
                        {isInProgress ? 'Continuar' : 'Empezar'}
                        <ChevronRight size={14} />
                    </button>
                )}
            </div>

            {isInProgress && <ProgressBar answered={answeredCount} total={totalQuestions} />}

            {isCompleted && (
                <div className="flex items-center gap-2 text-xs text-[#6B7280] border-t border-[#E5E7EB] pt-3">
                    <CheckCircle2 size={12} className="text-[#6B9E78]" />
                    <span>Completado</span>
                </div>
            )}
        </motion.article>
    );
}

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            {icon}
            <h2 className="text-lg font-semibold text-[#1A1A1A]">{title}</h2>
            <span className="rounded-full bg-[#F5F3EF] px-2.5 py-0.5 text-xs font-medium text-[#6B7280]">{count}</span>
        </div>
    );
}

function EmptySection({ message }: { message: string }) {
    return (
        <div className="rounded-xl border-2 border-dashed border-[#E5E7EB] bg-white/50 px-6 py-8 text-center">
            <p className="text-sm text-[#6B7280]">{message}</p>
        </div>
    );
}

export function QuestionnaireListClient({
    available,
    inProgress,
    completed,
}: {
    available: QuestionnaireWithProgress[];
    inProgress: QuestionnaireWithProgress[];
    completed: CompletedSessionWithDetails[];
}) {
    const { resolvePlaceholders } = useQuestionnaireContext();
    const router = useRouter();

    const resolveRoute = (id: string) => STANDALONE_ROUTES[id] ?? `/onboarding?questionnaireId=${id}`;
    const handleStart = (id: string) => router.push(resolveRoute(id));
    const handleContinue = (id: string) => router.push(resolveRoute(id));
    const handleViewSession = (sessionId: string) => router.push(`/questionnaires/session/${sessionId}`);

    const totalCount = available.length + inProgress.length + completed.length;

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1A1A1A]">Mis Cuestionarios</h1>
                <p className="mt-1 text-sm text-[#6B7280]">
                    {totalCount} {totalCount === 1 ? 'cuestionario disponible' : 'cuestionarios disponibles'}
                </p>
            </div>

            <div className="space-y-10">
                {inProgress.length > 0 && (
                    <section>
                        <SectionHeader icon={<Clock size={18} className="text-[#E8B563]" />} title="En Progreso" count={inProgress.length} />
                        <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
                            {inProgress.map((item) => (
                                <motion.div key={item.questionnaire.id} variants={itemVariants}>
                                    <UserQuestionnaireCard item={item} onContinue={() => handleContinue(item.questionnaire.id)} resolvePlaceholders={resolvePlaceholders} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>
                )}

                <section>
                    <SectionHeader icon={<BookOpen size={18} className="text-[#2C5F7C]" />} title="Disponibles" count={available.length} />
                    {available.length === 0 ? (
                        <EmptySection message="No hay cuestionarios nuevos disponibles por ahora." />
                    ) : (
                        <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
                            {available.map((item) => (
                                <motion.div key={item.questionnaire.id} variants={itemVariants}>
                                    <UserQuestionnaireCard item={item} onStart={() => handleStart(item.questionnaire.id)} resolvePlaceholders={resolvePlaceholders} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </section>

                {completed.length > 0 && (
                    <section>
                        <hr className="my-8 border-[#E5E7EB]" />
                        <SectionHeader icon={<CheckCircle2 size={18} className="text-[#6B9E78]" />} title="Cuestionarios completados" count={completed.length} />
                        <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
                            {completed.map((session) => {
                                const formattedDate = new Date(session.completedAt).toLocaleDateString();
                                const relativeTime = getRelativeTime(new Date(session.completedAt));

                                const displayTitle = !session.isOnboarding
                                    ? `${resolvePlaceholders(session.title)} — Respondido ${relativeTime}`
                                    : resolvePlaceholders(session.title);

                                return (
                                    <motion.div key={session.sessionId} variants={itemVariants}>
                                        <motion.article
                                            onClick={() => handleViewSession(session.sessionId)}
                                            whileHover={{ y: -3, boxShadow: '0 12px 24px -6px rgb(0 0 0 / 0.09)' }}
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                            className="group relative flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E5E7EB] cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F3EF]">
                                                        <CheckCircle2 size={18} className="text-[#6B9E78]" />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-base font-semibold text-[#1A1A1A] leading-snug">
                                                            {displayTitle}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-[#6B7280]">
                                                            Completado el {formattedDate}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 flex items-center justify-center text-[#6B7280] group-hover:text-[#4A9B9B] transition-colors">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                        </motion.article>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </section>
                )}
            </div>
        </div>
    );
}
