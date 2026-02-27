'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import Link from 'next/link';
import type { WHO5Result } from '@/types/who5.types';
import WHO5ScoreCard from './WHO5ScoreCard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WHO5ResultsProps {
  result: WHO5Result;
  onRetake?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const WHO5Results: React.FC<WHO5ResultsProps> = ({ result, onRetake }) => {
  const { category } = result;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full mx-auto max-w-4xl px-4 sm:px-6 py-10 flex flex-col items-center"
    >
      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 text-xs font-semibold uppercase tracking-widest text-[#4A9B9B]"
      >
        Resultado WHO-5
      </motion.p>

      {/* Blob */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative flex items-center justify-center"
      >
        <EmotionalCompanion emotion={category.emotion} size={220} animated intensity="medium" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 text-2xl font-semibold text-[#1A1A1A]"
      >
        {category.label}
      </motion.h2>

      {/* Score card (ring + description + interpretation table) */}
      <WHO5ScoreCard result={result} />

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        {onRetake && (
          <motion.button
            onClick={onRetake}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="
              rounded-2xl border border-[#E5E7EB] bg-white px-6 py-3 text-sm
              font-medium text-[#6B7280] shadow-sm transition-all duration-150
              hover:border-[#A8C5B5] hover:text-[#2C5F7C]
              focus:outline-none focus:ring-2 focus:ring-[#4A9B9B] focus:ring-offset-2
            "
          >
            Repetir cuestionario
          </motion.button>
        )}

        <Link
          href="/dashboard"
          className="
            rounded-2xl border border-[#4A9B9B] bg-[#4A9B9B] px-6 py-3 text-sm
            font-medium text-white shadow-sm transition-all duration-150
            hover:border-[#3a8888] hover:bg-[#3a8888]
          "
        >
          Volver al inicio
        </Link>

        <p className="mt-2 max-w-4xl text-center text-[10px] leading-relaxed text-[#D1D5DB]">
          Puntuación &lt; 50 puede indicar bajo bienestar. Consulta con un
          profesional de la salud si lo consideras necesario.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WHO5Results;
