import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
    answered: number;
    total: number;
}

export function QuestionnaireProgressBar({ answered, total }: ProgressBarProps) {
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
