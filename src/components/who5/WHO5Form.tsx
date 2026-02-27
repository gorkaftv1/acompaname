'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionNode, OptionNode } from '@/types/questionnaire-engine.types';
import WHO5QuestionCard from './WHO5QuestionCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WHO5FormProps {
  questions: QuestionNode[];
  options: OptionNode[];
  title?: string;
  description?: string;
  onComplete: (answers: Record<string, number>) => void;
  isSaving?: boolean;
}

// ---------------------------------------------------------------------------
// Scale Legend
// ---------------------------------------------------------------------------

const ScaleLegend: React.FC<{ options: OptionNode[] }> = ({ options }) => {
  const sorted = [...options].sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  if (!lowest || !highest) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
      className="mb-8 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3"
    >
      <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-[#4A9B9B]">
        Escala de respuesta
      </p>
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-4 text-sm text-[#374151]">
        <span>
          <span className="font-bold text-[#2C5F7C]">0</span>
          {' '}= {lowest.optionText}
        </span>
        <span className="hidden text-[#9CA3AF] sm:block">→</span>
        <span>
          <span className="font-bold text-[#2C5F7C]">5</span>
          {' '}= {highest.optionText}
        </span>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const WHO5Form: React.FC<WHO5FormProps> = ({ questions, options, title, description, onComplete, isSaving }) => {
  // selectedOptionIds: questionId → optionId
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const firstUnansweredRef = useRef<string | null>(null);

  console.log('WHO5Form', { questions, options, title, description, onComplete, isSaving });

  const handleSelect = (questionId: string, optionId: string) => {
    setSelectedOptionIds((prev) => ({ ...prev, [questionId]: optionId }));
    if (showErrors) {
      const stillUnanswered = questions.some(
        (q) => q.id !== questionId && !(q.id in selectedOptionIds)
      );
      if (!stillUnanswered) setShowErrors(false);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(selectedOptionIds).length !== questions.length) {
      setShowErrors(true);
      const first = questions.find((q) => !(q.id in selectedOptionIds));
      if (first) {
        firstUnansweredRef.current = first.id;
        const el = document.getElementById(`question-${first.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    // Convert back to score-based record for onComplete
    const answers: Record<string, number> = {};
    for (const [qId, optId] of Object.entries(selectedOptionIds)) {
      const opt = options.find((o) => o.id === optId);
      if (opt !== undefined) answers[qId] = opt.score ?? 0;
    }
    onComplete(answers);
  };

  const answeredCount = Object.keys(selectedOptionIds).length;
  const totalCount = questions.length;
  const progressPct = totalCount === 0 ? 0 : (answeredCount / totalCount) * 100;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
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
          {title || 'WHO-5 — Índice de Bienestar'}
        </h1>
        <p className="mx-auto max-w-4xl text-sm leading-relaxed text-[#6B7280]">
          {description || 'Por favor, indica para cada una de las siguientes afirmaciones cuál se acerca más a cómo te has sentido durante las últimas dos semanas.'}
        </p>
      </motion.div>

      {/* Scale legend */}
      <ScaleLegend options={options} />

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
        <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
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
        {questions.map((question, idx) => (
          <div key={question.id} id={`question-${question.id}`}>
            <WHO5QuestionCard
              question={question}
              questionNumber={idx + 1}
              totalQuestions={totalCount}
              options={options}
              selectedOptionId={selectedOptionIds[question.id] ?? null}
              hasError={showErrors && !(question.id in selectedOptionIds)}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>

      {/* Submit */}
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
            max-w-3xl rounded-2xl px-6 py-4 text-base font-semibold text-white
            shadow-md transition-shadow duration-200 hover:shadow-lg
            focus:outline-none focus:ring-2 focus:ring-[#4A9B9B] focus:ring-offset-2
          "
          style={{
            background: Object.keys(selectedOptionIds).length === questions.length
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
          {showErrors && Object.keys(selectedOptionIds).length !== questions.length && (
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
        © Organización Mundial de la Salud, 1998. El cuestionario WHO-5 puede utilizarse libremente. Si se traduce a un nuevo idioma, la traducción debe enviarse a la OMS para su registro. Las traducciones registradas pueden utilizarse de forma gratuita. Fuente: &quot;Mastering Depression in Primary Care&quot;, versión 2.2, Unidad de Investigación Psiquiátrica, Centro Colaborador de la OMS en Salud Mental, Hospital General de Frederiksberg, Hillerød, Dinamarca.
      </motion.p>
    </div>
  );
};

export default WHO5Form;
