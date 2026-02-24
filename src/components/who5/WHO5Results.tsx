'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import Link from 'next/link';
import type { WHO5Result } from '@/lib/who5/who5.config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WHO5ResultsProps {
  result: WHO5Result;
  onRetake?: () => void;
}

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
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="6"
      />
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
// Main component
// ---------------------------------------------------------------------------

const WHO5Results: React.FC<WHO5ResultsProps> = ({ result, onRetake }) => {
  const { finalScore, category } = result;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full mx-auto max-w-4xl px-4 sm:px-6 py-10 flex flex-col items-center"
    >
      {/* Subtle label above blob */}
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 text-xs font-semibold uppercase tracking-widest text-[#4A9B9B]"
      >
        Resultado WHO-5
      </motion.p>

      {/* ---- Blob ---- */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative flex items-center justify-center"
      >
        <EmotionalCompanion
          emotion={category.emotion}
          size={220}
          animated
          intensity="medium"
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 text-2xl font-semibold text-[#1A1A1A]"
      >
        {category.label}
      </motion.h2>

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
        <p className="w-full mt-1 text-xs text-[#9CA3AF]">Puntuación WHO-5</p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-6 max-w-3xl text-center text-sm leading-relaxed text-[#6B7280]"
      >
        {category.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.5 }}
        className="mt-6 w-full max-w-4xl rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
      >
        <p className="max-w-2xl mb-3 text-center text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
          Interpretación
        </p>
        {[
          { range: '85 – 100', label: 'Día muy bueno', color: '#6B9E78' },
          { range: '70 – 84', label: 'Día tranquilo', color: '#4A9B9B' },
          { range: '50 – 69', label: 'Día normal', color: '#E8B563' },
          { range: '35 – 49', label: 'Día cansado', color: '#B4A5C7' },
          { range: '20 – 34', label: 'Día estresante', color: '#D99B7C' },
          { range: '10 – 19', label: 'Día cuesta arriba', color: '#C97064' },
          { range: '0 – 9', label: 'Día de sobrecarga', color: '#C97064' },
        ].map(({ range, label, color }) => {
          const isActive =
            finalScore >= parseInt(range.split('–')[0].trim()) &&
            finalScore <= parseInt(range.split('–')[1].trim());
          return (
            <div
              key={range}
              className={`
                flex items-center justify-between rounded-lg px-3 py-1.5 text-xs
                ${isActive ? 'bg-[#F0F9F9] font-semibold' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className={isActive ? 'text-[#2C5F7C]' : 'text-[#6B7280]'}>
                  {label}
                </span>
              </div>
              <span className={isActive ? 'text-[#2C5F7C]' : 'text-[#9CA3AF]'}>
                {range}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* ---- Actions ---- */}
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
