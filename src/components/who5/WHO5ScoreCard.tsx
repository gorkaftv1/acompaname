'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { WHO5Result } from '@/types/who5.types';

// ---------------------------------------------------------------------------
// Score ring — circular arc that fills proportionally to the score
// ---------------------------------------------------------------------------

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            className="-rotate-90"
            aria-hidden="true"
        >
            {/* Track */}
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="6" />
            {/* Fill */}
            <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#4A9B9B"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.6, ease: 'easeOut', delay: 0.6 }}
            />
        </svg>
    );
};

// ---------------------------------------------------------------------------
// WHO5ScoreCard
// ---------------------------------------------------------------------------

interface WHO5ScoreCardProps {
    result: WHO5Result;
}

const INTERPRETATION_RANGES = [
    { range: '85 – 100', label: 'Día muy bueno', color: '#6B9E78' },
    { range: '70 – 84', label: 'Día tranquilo', color: '#4A9B9B' },
    { range: '50 – 69', label: 'Día normal', color: '#E8B563' },
    { range: '35 – 49', label: 'Día cansado', color: '#B4A5C7' },
    { range: '20 – 34', label: 'Día estresante', color: '#D99B7C' },
    { range: '10 – 19', label: 'Día cuesta arriba', color: '#C97064' },
    { range: '0 – 9', label: 'Día de sobrecarga', color: '#C97064' },
] as const;

const WHO5ScoreCard: React.FC<WHO5ScoreCardProps> = ({ result }) => {
    const { finalScore, category } = result;

    return (
        <>
            {/* Score ring */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="mt-6 flex flex-col items-center"
            >
                <div className="relative flex items-center justify-center">
                    <ScoreRing score={finalScore} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.0 }}
                            className="w-full text-center text-2xl font-bold text-[#2C5F7C]"
                        >
                            {finalScore}
                        </motion.span>
                        <span className="text-[10px] text-[#9CA3AF]">/ 100</span>
                    </div>
                </div>
                <p className="w-full mt-1 text-xs text-[#9CA3AF] text-center">Puntuación WHO-5</p>
            </motion.div>

            {/* Category description */}
            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mt-6 max-w-3xl text-center text-sm leading-relaxed text-[#6B7280]"
            >
                {category.description}
            </motion.p>

            {/* Interpretation table */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.5 }}
                className="mt-6 w-full max-w-4xl rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
            >
                <p className="max-w-2xl mb-3 text-center text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                    Interpretación
                </p>
                {INTERPRETATION_RANGES.map(({ range, label, color }) => {
                    const [lo, hi] = range.split('–').map((s) => parseInt(s.trim(), 10));
                    const isActive = finalScore >= lo && finalScore <= hi;
                    return (
                        <div
                            key={range}
                            className={`
                flex items-center justify-between rounded-lg px-3 py-1.5 text-xs
                ${isActive ? 'bg-[#F0F9F9] font-semibold' : ''}
              `}
                        >
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className={isActive ? 'text-[#2C5F7C]' : 'text-[#6B7280]'}>{label}</span>
                            </div>
                            <span className={isActive ? 'text-[#2C5F7C]' : 'text-[#9CA3AF]'}>{range}</span>
                        </div>
                    );
                })}
            </motion.div>
        </>
    );
};

export default WHO5ScoreCard;
