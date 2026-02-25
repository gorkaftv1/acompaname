'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, BookOpen, ChevronRight, Heart } from 'lucide-react';
import { QuestionnaireProgressBar } from './QuestionnaireProgressBar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CardVariant = 'onboarding' | 'who5' | 'normal';

export interface QuestionnaireWithProgress {
    questionnaire: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        is_onboarding: boolean;
    };
    answeredCount: number;
    totalQuestions: number;
    isCompleted: boolean;
}

export interface QuestionnaireCardProps {
    item: QuestionnaireWithProgress;
    variant: CardVariant;
    onStart?: () => void;
    onContinue?: () => void;
    onViewResponses?: () => void;
    completedSessionId?: string;
    resolvePlaceholders: (text: string) => string;
}

// ---------------------------------------------------------------------------
// Variant config helpers
// ---------------------------------------------------------------------------

interface VariantConfig {
    cardBg: string;
    cardRing: string;
    iconBg: string;
    badgeLabel: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    subtitle: string;
    subtitleColor: string;
    iconColor: (state: 'completed' | 'inProgress' | 'new') => string;
    actionIcon: React.ReactNode;
}

const VARIANTS: Record<CardVariant, VariantConfig> = {
    onboarding: {
        cardBg: 'bg-[#F2F9F9]',
        cardRing: 'ring-[#BBDCD2]',
        iconBg: 'bg-[#E5F2F2]',
        badgeLabel: 'Bienvenida',
        badgeBg: 'bg-[#E5F2F2]',
        badgeBorder: 'border-[#BBDCD2]',
        badgeText: 'text-[#2C5F7C]',
        subtitle: 'Cuéntanos sobre tu situación para personalizar tu experiencia',
        subtitleColor: 'text-[#4A9B9B]',
        iconColor: () => 'text-[#4A9B9B]',
        actionIcon: <BookOpen size={16} />,
    },
    who5: {
        cardBg: 'bg-[#FEFDFB]',
        cardRing: 'ring-[#D9C9A8]',
        iconBg: 'bg-[#FDF4E7]',
        badgeLabel: 'Bienestar',
        badgeBg: 'bg-[#FDF4E7]',
        badgeBorder: 'border-[#D9C9A8]',
        badgeText: 'text-[#8B6A2E]',
        subtitle: 'Evalúa tu bienestar mental de las últimas 2 semanas',
        subtitleColor: 'text-[#8B6A2E]',
        iconColor: (state) => state === 'inProgress' ? 'text-[#E8B563]' : 'text-[#8B6A2E]',
        actionIcon: <Heart size={16} />,
    },
    normal: {
        cardBg: 'bg-white',
        cardRing: 'ring-[#E5E7EB]',
        iconBg: 'bg-[#F5F3EF]',
        badgeLabel: '',
        badgeBg: '',
        badgeBorder: '',
        badgeText: '',
        subtitle: '',
        subtitleColor: '',
        iconColor: (state) => {
            if (state === 'completed') return 'text-[#6B9E78]';
            if (state === 'inProgress') return 'text-[#E8B563]';
            return 'text-[#2C5F7C]';
        },
        actionIcon: <BookOpen size={16} />,
    },
};

// ---------------------------------------------------------------------------
// Action button helpers per variant
// ---------------------------------------------------------------------------

function getButtonContent(
    variant: CardVariant,
    isCompleted: boolean,
    isInProgress: boolean,
): { label: string; className: string; disabled?: boolean } {
    if (variant === 'onboarding') {
        if (isCompleted) {
            // No clickable action — replaced by static label rendered separately
            return { label: '', className: '', disabled: true };
        }
        return {
            label: isInProgress ? 'Continuar' : 'Comenzar',
            className: 'bg-[#4A9B9B] text-white hover:bg-[#3a8888] shadow-sm',
        };
    }

    if (variant === 'who5') {
        return {
            label: isCompleted ? 'Repetir' : isInProgress ? 'Continuar' : 'Comenzar',
            className: 'bg-[#E8B563] text-white hover:bg-[#d4a050] shadow-sm',
        };
    }

    // normal
    return {
        label: isCompleted ? 'Repetir' : isInProgress ? 'Continuar' : 'Comenzar',
        className: 'bg-[#2C5F7C] text-white hover:bg-[#245170]',
    };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuestionnaireCard({
    item,
    variant,
    onStart,
    onContinue,
    onViewResponses,
    completedSessionId,
    resolvePlaceholders,
}: QuestionnaireCardProps) {
    const router = useRouter();
    const { questionnaire, answeredCount, totalQuestions, isCompleted } = item;
    const isInProgress = !isCompleted && answeredCount > 0;
    const cfg = VARIANTS[variant];
    const hasBadge = variant !== 'normal';

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

    const btn = getButtonContent(variant, isCompleted, isInProgress);
    const showButton = !(variant === 'onboarding' && isCompleted);

    return (
        <motion.article
            whileHover={{ y: -3, boxShadow: '0 12px 24px -6px rgb(0 0 0 / 0.09)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`group relative flex flex-col gap-3 rounded-2xl p-5 shadow-md ring-1 ${cfg.cardBg} ${cfg.cardRing}`}
        >
            {/* Badge */}
            {hasBadge && (
                <div className="absolute -top-3 left-5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest shadow-sm border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText}`}>
                        {cfg.badgeLabel}
                    </span>
                </div>
            )}

            <div className={`flex items-start justify-between gap-3 ${hasBadge ? 'mt-2' : ''}`}>
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
                        {cfg.subtitle && (
                            <p className={`mt-0.5 text-xs font-medium ${cfg.subtitleColor}`}>
                                {cfg.subtitle}
                            </p>
                        )}
                        {/* Description for normal variant */}
                        {variant === 'normal' && questionnaire.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-[#6B7280] leading-relaxed">
                                {resolvePlaceholders(questionnaire.description)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right — button or static label */}
                {showButton ? (
                    <button
                        onClick={() => {
                            if (variant === 'onboarding') {
                                router.push('/onboarding');
                            } else {
                                isInProgress ? onContinue?.() : onStart?.();
                            }
                        }}
                        className={`shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${btn.className}`}
                    >
                        {btn.label}
                        <ChevronRight size={14} />
                    </button>
                ) : (
                    /* Onboarding completed — show responses button */
                    <button
                        onClick={() => onViewResponses?.()}
                        className="shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold text-[#4A9B9B] border border-[#BBDCD2] bg-white hover:bg-[#F2F9F9] transition-colors shadow-sm"
                    >
                        Ver respuestas
                    </button>
                )}
            </div>

            {/* Progress bar for in-progress */}
            {isInProgress && (
                <QuestionnaireProgressBar answered={answeredCount} total={totalQuestions} />
            )}

            {/* Footer for normal completed */}
            {isCompleted && variant === 'normal' && (
                <div className="flex items-center gap-2 text-xs text-[#6B7280] border-t border-[#E5E7EB] pt-3">
                    <CheckCircle2 size={12} className="text-[#6B9E78]" />
                    <span>Completado</span>
                </div>
            )}
        </motion.article>
    );
}
