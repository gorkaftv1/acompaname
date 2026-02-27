'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, BookOpen, ChevronRight, Heart } from 'lucide-react';
import { QuestionnaireProgressBar } from './QuestionnaireProgressBar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

import type { QuestionnaireWithProgress } from '@/types/questionnaire.types';

export interface WHO5QuestionnaireCardProps {
    item: QuestionnaireWithProgress;
    onStart?: () => void;
    onContinue?: () => void;
    onViewResponses?: () => void;
    completedSessionId?: string;
    resolvePlaceholders: (text: string) => string;
}

const cfg = {
    cardBg: 'bg-[#FEFDFB]',
    cardRing: 'ring-[#D9C9A8]',
    iconBg: 'bg-[#FDF4E7]',
    badgeLabel: 'Bienestar',
    badgeBg: 'bg-[#FDF4E7]',
    badgeBorder: 'border-[#D9C9A8]',
    badgeText: 'text-[#8B6A2E]',
    subtitle: 'Evalúa tu bienestar mental de las últimas 2 semanas',
    subtitleColor: 'text-[#8B6A2E]',
    iconColor: (state: 'completed' | 'inProgress' | 'new') => state === 'inProgress' ? 'text-[#E8B563]' : 'text-[#8B6A2E]',
    actionIcon: <Heart size={16} />,
};

// ---------------------------------------------------------------------------
// Action button helpers
// ---------------------------------------------------------------------------

function getButtonContent(
    isCompleted: boolean,
    isInProgress: boolean,
): { label: string; className: string; disabled?: boolean } {
    return {
        label: isCompleted ? 'Repetir' : isInProgress ? 'Continuar' : 'Comenzar',
        className: 'bg-[#E8B563] text-white hover:bg-[#d4a050] shadow-sm',
    };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WHO5QuestionnaireCard({
    item,
    onStart,
    onContinue,
    onViewResponses,
    completedSessionId,
    resolvePlaceholders,
}: WHO5QuestionnaireCardProps) {
    const router = useRouter();
    const { questionnaire, answeredCount, totalQuestions, isCompleted } = item;
    const isInProgress = !isCompleted && answeredCount > 0;

    const iconState: 'completed' | 'inProgress' | 'new' = isCompleted
        ? 'completed'
        : isInProgress
            ? 'inProgress'
            : 'new';

    const StatusIcon = isCompleted
        ? <CheckCircle2 size={18} className={cfg.iconColor(iconState)} />
        : isInProgress
            ? <Clock size={18} className={cfg.iconColor(iconState)} />
            : <BookOpen size={18} className={cfg.iconColor(iconState)} />;

    const btn = getButtonContent(isCompleted, isInProgress);

    return (
        <motion.article
            whileHover={{ y: -3, boxShadow: '0 12px 24px -6px rgb(0 0 0 / 0.09)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`group relative flex flex-col gap-3 rounded-2xl p-5 shadow-md ring-1 ${cfg.cardBg} ${cfg.cardRing}`}
        >
            {/* Badge */}
            <div className="absolute -top-3 left-5">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest shadow-sm border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText}`}>
                    {cfg.badgeLabel}
                </span>
            </div>

            <div className={`flex items-start justify-between gap-3 mt-2`}>
                {/* Left — icon + text */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg}`}>
                        {StatusIcon}
                    </span>
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-[#1A1A1A] leading-snug">
                            {resolvePlaceholders(questionnaire.title)}
                        </h3>
                        {/* Subtitle from variant config */}
                        <p className={`mt-0.5 text-xs font-medium ${cfg.subtitleColor}`}>
                            {cfg.subtitle}
                        </p>
                    </div>
                </div>

                {/* Right — button or static label */}
                <button
                    onClick={() => {
                        isInProgress ? onContinue?.() : onStart?.();
                    }}
                    className={`shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${btn.className}`}
                >
                    {btn.label}
                    <ChevronRight size={14} />
                </button>
            </div>

            {isInProgress && (
                <QuestionnaireProgressBar answered={answeredCount} total={totalQuestions} />
            )}
        </motion.article>
    );
}
