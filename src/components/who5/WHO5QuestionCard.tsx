'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionNode, OptionNode } from '@/lib/services/questionnaire-engine.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WHO5QuestionCardProps {
    question: QuestionNode;
    questionNumber: number;
    totalQuestions: number;
    /** All shared options (same for every WHO-5 question). */
    options: OptionNode[];
    selectedOptionId: string | null;
    hasError: boolean;
    onSelect: (questionId: string, optionId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const WHO5QuestionCard: React.FC<WHO5QuestionCardProps> = ({
    question,
    questionNumber,
    options,
    selectedOptionId,
    hasError,
    onSelect,
}) => {
    // Sort options by score ascending (0 → 5)
    const sortedOptions = [...options].sort((a, b) => (a.score ?? 0) - (b.score ?? 0));

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: questionNumber * 0.08 }}
            className={`
        rounded-2xl border bg-white p-6 shadow-sm transition-shadow duration-200
        ${hasError ? 'border-red-300 ring-1 ring-red-200' : 'border-[#E5E7EB]'}
      `}
        >
            {/* Question header */}
            <div className="mb-5 flex items-start gap-3">
                <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #A8C5B5, #4A9B9B)' }}
                >
                    {questionNumber}
                </span>
                <p className="text-[15px] leading-relaxed text-[#1A1A1A]">
                    {question.questionText}
                </p>
            </div>

            {/* Error hint */}
            <AnimatePresence>
                {hasError && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 text-sm text-red-500"
                    >
                        Por favor, selecciona una opción antes de continuar.
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Horizontal scale options */}
            <div className="overflow-x-auto pb-1">
                <div className="flex justify-between gap-2 min-w-[340px]">
                    {sortedOptions.map((option) => {
                        const isSelected = option.id === selectedOptionId;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => onSelect(question.id, option.id)}
                                className={`
                  flex flex-col items-center justify-center flex-1 min-w-[52px]
                  rounded-xl border-2 py-3 px-1 gap-1 transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9B9B]
                  active:scale-[0.96]
                  ${isSelected
                                        ? 'border-[#4A9B9B] bg-[#4A9B9B] text-white shadow-md'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-[#4A9B9B] hover:bg-teal-50'
                                    }
                `}
                            >
                                <span className={`text-xl font-bold leading-none ${isSelected ? 'text-white' : 'text-[#2C5F7C]'}`}>
                                    {option.score}
                                </span>
                                <span className={`text-[10px] text-center leading-tight px-0.5 line-clamp-2 ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                                    {option.optionText}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default WHO5QuestionCard;
