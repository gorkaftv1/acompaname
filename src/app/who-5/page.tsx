'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import WHO5Form from '@/components/who5/WHO5Form';
import WHO5Results from '@/components/who5/WHO5Results';
import { calculateWHO5Score, type WHO5Result } from '@/lib/who5/who5.config';

/**
 * WHO-5 Page
 *
 * Orchestrates the two-phase flow:
 *   1. Form  — user answers all 5 WHO-5 questions
 *   2. Result — animated blob result screen
 */
export default function WHO5Page() {
  const [phase, setPhase] = useState<'form' | 'result'>('form');
  const [result, setResult] = useState<WHO5Result | null>(null);

  const handleFormComplete = (answers: Record<string, number>) => {
    const computed = calculateWHO5Score(answers);
    setResult(computed);
    setPhase('result');
    // Scroll to top of the page so the blob is immediately visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetake = () => {
    setResult(null);
    setPhase('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ProtectedRoute>
      <PageLayout className="bg-[#F5F3EF]">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {phase === 'form' ? (
              <motion.div
                key="form"
                style={{ width: '100%' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <WHO5Form onComplete={handleFormComplete} />
              </motion.div>
            ) : (
              <motion.div
                key="result"
                style={{ width: '100%' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {result && (
                  <WHO5Results result={result} onRetake={handleRetake} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
