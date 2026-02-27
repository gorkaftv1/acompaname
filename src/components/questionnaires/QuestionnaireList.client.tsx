'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants, type Transition } from 'framer-motion';
import { Clock, CheckCircle2, BookOpen } from 'lucide-react';
import { useQuestionnaireContext } from '@/lib/hooks/useQuestionnaireContext';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

import { QuestionnaireCard } from './QuestionnaireCard';
import { WHO5QuestionnaireCard } from './WHO5QuestionnaireCard';
import { CompletedSessionCard } from './CompletedSessionCard';
import type { QuestionnaireWithProgress, CompletedSessionWithDetails } from '@/types/questionnaire.types';
import type { CardVariant } from '@/types/questionnaire.types';
import { SectionHeader, EmptySection } from './QuestionnaireSectionHeader';

const getCardVariant = (item: QuestionnaireWithProgress): CardVariant => {
    if (item.questionnaire.type === 'onboarding') return 'onboarding';
    if (item.questionnaire.type === 'who5') return 'who5';
    return 'normal';
};



const listVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const itemTransition: Transition = { duration: 0.35, ease: 'easeOut' as const };

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: itemTransition },
};

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

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Detect if onboarding is completed from the completed sessions list
    const hasCompletedOnboarding = completed.some((s) => s.isOnboarding);

    const resolveRoute = (id: string, type: string) => type === 'who5' ? `/who-5/${id}` : `/questionnaires/session/${id}`;

    const handleStart = (item: QuestionnaireWithProgress) => {
        const { id, type } = item.questionnaire;

        // Check if it's the onboarding flow — bypass confirm dialog and standalone check
        if (type === 'onboarding') {
            router.push('/onboarding');
            return;
        }

        // Check if questionnaire is a standalone (WHO-5) — always allow
        if (type === 'who5') {
            router.push(`/who-5/${id}`);
            return;
        }
        // Guard: non-onboarding questionnaires require onboarding completion
        if (!hasCompletedOnboarding) {
            setConfirmDialog({
                isOpen: true,
                title: 'Completa el onboarding primero',
                message: 'Para acceder a los cuestionarios necesitas completar el proceso de bienvenida primero. Te llevará solo unos minutos. ¿Quieres completarlo ahora?',
                onConfirm: () => {
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    router.push('/onboarding');
                },
            });
            return;
        }
        router.push(resolveRoute(id, type));
    };

    const handleContinue = (id: string, type: string) => router.push(resolveRoute(id, type));
    const handleViewSession = (sessionId: string) => router.push(`/questionnaires/session/${sessionId}`);
    const handleViewResponses = (sessionId: string) => router.push(`/questionnaires/complete/${sessionId}`);

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
                            {inProgress.map((item) => {
                                const completedSession = completed.find(
                                    (s) => s.questionnaireId === item.questionnaire.id
                                );
                                return (
                                    <motion.div key={item.questionnaire.id} variants={itemVariants}>
                                        {getCardVariant(item) === 'who5' ? (
                                            <WHO5QuestionnaireCard
                                                item={item}
                                                onContinue={() => handleContinue(item.questionnaire.id, item.questionnaire.type)}
                                                onViewResponses={
                                                    completedSession
                                                        ? () => handleViewResponses(completedSession.sessionId)
                                                        : undefined
                                                }
                                                completedSessionId={completedSession?.sessionId}
                                                resolvePlaceholders={resolvePlaceholders}
                                            />
                                        ) : (
                                            <QuestionnaireCard
                                                item={item}
                                                variant={getCardVariant(item) as 'onboarding' | 'normal'}
                                                onContinue={() => handleContinue(item.questionnaire.id, item.questionnaire.type)}
                                                onViewResponses={
                                                    completedSession
                                                        ? () => handleViewResponses(completedSession.sessionId)
                                                        : undefined
                                                }
                                                completedSessionId={completedSession?.sessionId}
                                                resolvePlaceholders={resolvePlaceholders}
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </section>
                )}

                <section>
                    <SectionHeader icon={<BookOpen size={18} className="text-[#2C5F7C]" />} title="Disponibles" count={available.length} />
                    {available.length === 0 ? (
                        <EmptySection message="No hay cuestionarios nuevos disponibles por ahora." />
                    ) : (
                        <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
                            {available.map((item) => {
                                const completedSession = completed.find(
                                    (s) => s.questionnaireId === item.questionnaire.id
                                );
                                return (
                                    <motion.div key={item.questionnaire.id} variants={itemVariants}>
                                        {getCardVariant(item) === 'who5' ? (
                                            <WHO5QuestionnaireCard
                                                item={item}
                                                onStart={() => handleStart(item)}
                                                onViewResponses={
                                                    completedSession
                                                        ? () => handleViewResponses(completedSession.sessionId)
                                                        : undefined
                                                }
                                                completedSessionId={completedSession?.sessionId}
                                                resolvePlaceholders={resolvePlaceholders}
                                            />
                                        ) : (
                                            <QuestionnaireCard
                                                item={item}
                                                variant={getCardVariant(item) as 'onboarding' | 'normal'}
                                                onStart={() => handleStart(item)}
                                                onViewResponses={
                                                    completedSession
                                                        ? () => handleViewResponses(completedSession.sessionId)
                                                        : undefined
                                                }
                                                completedSessionId={completedSession?.sessionId}
                                                resolvePlaceholders={resolvePlaceholders}
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </section>

                {completed.length > 0 && (
                    <section>
                        <hr className="my-8 border-[#E5E7EB]" />
                        <SectionHeader icon={<CheckCircle2 size={18} className="text-[#6B9E78]" />} title="Cuestionarios completados" count={completed.length} />
                        <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-4">
                            {completed.map((session) => (
                                <motion.div key={session.sessionId} variants={itemVariants}>
                                    <CompletedSessionCard
                                        session={session}
                                        onClick={() => handleViewSession(session.sessionId)}
                                        onViewResponses={() => handleViewResponses(session.sessionId)}
                                        resolvePlaceholders={resolvePlaceholders}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmLabel="Ir al onboarding"
                cancelLabel="Ahora no"
                variant="default"
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
