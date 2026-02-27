import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils/date';

import type { CompletedSessionWithDetails } from '@/types/questionnaire.types';


export interface CompletedSessionCardProps {
    session: CompletedSessionWithDetails;
    onClick: () => void;
    onViewResponses: () => void;
    resolvePlaceholders: (text: string) => string;
}

export function CompletedSessionCard({
    session,
    onClick,
    onViewResponses,
    resolvePlaceholders,
}: CompletedSessionCardProps) {
    const formattedDate = new Date(session.completedAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const relativeTime = getRelativeTime(new Date(session.completedAt));

    const displayTitle = !session.isOnboarding
        ? `${resolvePlaceholders(session.title)} — Respondido ${relativeTime}`
        : resolvePlaceholders(session.title);

    return (
        <motion.article
            onClick={onClick}
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
                <div className="shrink-0 flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewResponses();
                        }}
                        className="px-3 py-1.5 text-[13px] font-semibold rounded-xl border border-[#E5E7EB] bg-white text-[#4A9B9B] hover:bg-[#F2F9F9] hover:border-[#BBDCD2] transition-colors shadow-sm"
                    >
                        Ver respuestas
                    </button>
                    <div className="flex items-center justify-center text-[#6B7280] group-hover:text-[#4A9B9B] transition-colors">
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
