'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  allQuestionsAnswered,
} from '@/lib/who5/who5.config';
import type { QuestionNode, OptionNode } from '@/lib/services/questionnaire-engine.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WHO5FormProps {
  questions: QuestionNode[];
  options: OptionNode[];
  onComplete: (answers: Record<string, number>) => void;
  isSaving?: boolean;
}

// ---------------------------------------------------------------------------
// Sub-component: single question block
// ---------------------------------------------------------------------------

interface QuestionBlockProps {
  question: QuestionNode;
  options: OptionNode[];
  selectedValue: number | undefined;
  hasError: boolean;
  onChange: (questionId: string, value: number) => void;
}

const QuestionBlock: React.FC<QuestionBlockProps> = ({
  question,
  options,
  selectedValue,
  hasError,
  onChange,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut', delay: question.orderIndex * 0.08 }}
    className={`
      rounded-2xl border bg-white p-6 shadow-sm transition-shadow duration-200
      ${hasError ? 'border-red-300 ring-1 ring-red-200' : 'border-[#E5E7EB]'}
    `}
  >
    {/* Question header */}
    <div className="mb-4 flex items-start gap-3">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #A8C5B5, #4A9B9B)' }}
      >
        {question.orderIndex}
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

    {/* Options */}
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        // WHO5 standard scores options 5 to 0. We map the option score directly
        const value = option.score ?? 0;
        const isSelected = selectedValue === value;
        return (
          <label
            key={option.id}
            className={`
              flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3
              text-sm transition-all duration-150
              ${isSelected
                ? 'border-[#4A9B9B] bg-[#F0F9F9] text-[#2C5F7C] font-medium'
                : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#A8C5B5] hover:bg-[#F9FAFB]'
              }
            `}
          >
            <input
              type="radio"
              name={question.id}
              value={value}
              checked={isSelected}
              onChange={() => onChange(question.id, value)}
              className="sr-only"
            />
            {/* Custom radio indicator */}
            <span
              className={`
                flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150
                ${isSelected
                  ? 'border-[#4A9B9B] bg-[#4A9B9B]'
                  : 'border-[#D1D5DB] bg-white'
                }
              `}
            >
              {isSelected && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </span>
            <span>{option.optionText}</span>
          </label>
        );
      })}
    </div>
  </motion.div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const WHO5Form: React.FC<WHO5FormProps> = ({ questions, options, onComplete, isSaving }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showErrors, setShowErrors] = useState(false);
  const firstUnansweredRef = useRef<string | null>(null);

  const handleChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear error state for this question if user just answered it
    if (showErrors) {
      const stillUnanswered = questions.some(
        (q) => q.id !== questionId && !(q.id in answers)
      );
      if (!stillUnanswered) setShowErrors(false);
    }
  };

  const handleSubmit = () => {
    if (!allQuestionsAnswered(answers, questions.length)) {
      setShowErrors(true);
      // Scroll to first unanswered question
      const first = questions.find((q) => !(q.id in answers));
      if (first) {
        firstUnansweredRef.current = first.id;
        const el = document.getElementById(`question-${first.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    onComplete(answers);
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const progressPct = totalCount === 0 ? 0 : (answeredCount / totalCount) * 100;

  return (
    <div className="w-full mx-auto max-w-4xl px-4 sm:px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#4A9B9B]">
          Bienestar
        </p>
        <h1 className="mb-2 text-2xl font-semibold text-[#1A1A1A]">
          WHO-5 — Índice de Bienestar
        </h1>
        <p className="mx-auto max-w-10xl text-sm leading-relaxed text-[#6B7280]">
          Por favor, indica para cada una de las siguientes afirmaciones cuál se acerca más a cómo te has sentido durante las últimas dos semanas.
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="mb-1 flex justify-between text-xs text-[#9CA3AF]">
          <span>{answeredCount} de {totalCount} respondidas</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #A8C5B5, #4A9B9B)' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Questions */}
      <div className="flex flex-col gap-5">
        {questions.map((question) => (
          <div key={question.id} id={`question-${question.id}`}>
            <QuestionBlock
              question={question}
              options={options}
              selectedValue={answers[question.id]}
              hasError={showErrors && !(question.id in answers)}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>

      {/* Submit button */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-8 flex flex-col items-center gap-4"
      >
        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="
            w-full max-w-x rounded-2xl px-6 py-4 text-base font-semibold text-white
            shadow-md transition-shadow duration-200 hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-[#4A9B9B] focus:ring-offset-2
          "
          style={{
            background: allQuestionsAnswered(answers, questions.length)
              ? 'linear-gradient(135deg, #4A9B9B, #2C5F7C)'
              : 'linear-gradient(135deg, #A8C5B5, #7BB5B5)',
          }}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Guardando...
            </span>
          ) : (
            'Terminar'
          )}
        </motion.button>

        <AnimatePresence>
          {showErrors && !allQuestionsAnswered(answers, questions.length) && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-center text-xs text-red-500"
            >
              Responde todas las preguntas para continuar.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* WHO Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-10 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-center text-[11px] leading-relaxed text-[#9CA3AF]"
      >
        © Organización Mundial de la Salud, 1998. El cuestionario WHO-5 puede utilizarse libremente. Si se traduce a un nuevo idioma, la traducción debe enviarse a la OMS para su registro. Las traducciones registradas pueden utilizarse de forma gratuita. Fuente: "Mastering Depression in Primary Care", versión 2.2, Unidad de Investigación Psiquiátrica, Centro Colaborador de la OMS en Salud Mental, Hospital General de Frederiksberg, Hillerød, Dinamarca.
      </motion.p>
    </div>
  );
};

export default WHO5Form;
