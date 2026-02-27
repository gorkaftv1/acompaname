'use client';

import React, { useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import WHO5Form from '@/components/who5/WHO5Form';
import WHO5Results from '@/components/who5/WHO5Results';
import type { WHO5Result } from '@/types/who5.types';
import { useAuthStore } from '@/lib/store/auth.store';
import { QuestionnaireService } from '@/lib/services/questionnaire.service';
import { WHO5Service } from '@/lib/services/who5.service';
import QuestionnaireLoadingScreen from '@/components/questionnaires/QuestionnaireLoadingScreen';
import type { QuestionNode, OptionNode } from '@/types/questionnaire-engine.types';

/**
 * WHO-5 Page
 *
 * Orchestrates the two-phase flow:
 *   1. Form  — user answers all 5 WHO-5 questions
 *   2. Result — animated blob result screen
 */
export default function WHO5Page({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const idFromParams = unwrappedParams.id;
  const [phase, setPhase] = useState<'form' | 'result'>('form');
  const [result, setResult] = useState<WHO5Result | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<QuestionNode[]>([]);
  const [options, setOptions] = useState<OptionNode[]>([]);
  const [questionnaireId, setQuestionnaireId] = useState<string | null>(null);
  const [questionnaireTitle, setQuestionnaireTitle] = useState<string>('');
  const [questionnaireDesc, setQuestionnaireDesc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);

  React.useEffect(() => {
    async function loadWHO5Data() {
      if (!idFromParams) return;
      try {
        const questionnaire = await QuestionnaireService.getById(idFromParams);
        if (!questionnaire) throw new Error('WHO-5 questionnaire not found.');
        console.log('WHO-5 questionnaire loaded:', questionnaire.title);

        // Extract and sort questions by orderIndex
        const questionNodes = Array.from(questionnaire.questionsMap.values()).sort(
          (a: QuestionNode, b: QuestionNode) => a.orderIndex - b.orderIndex
        );
        setQuestions(questionNodes);
        setQuestionnaireId(questionnaire.id);
        setQuestionnaireTitle(questionnaire.title);
        setQuestionnaireDesc(questionnaire.description || '');

        // Gather all distinct options (usually WHO-5 has a standard set across all questions)
        // Since the UI visualizes them consistently, pick from the first question
        if (questionNodes.length > 0) {
          setOptions(questionNodes[0].options);
        }
      } catch (err) {
        console.error('Error loading WHO-5 data:', err);
        setError('Error al cargar el cuestionario de bienestar.');
      } finally {
        setIsLoading(false);
      }
    }

    if (idFromParams) {
      loadWHO5Data();
    }
  }, [idFromParams]);

  const handleFormComplete = async (answers: Record<string, number>) => {
    if (!user) {
      setError('Debes iniciar sesión para guardar el cuestionario.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (!questionnaireId) {
        throw new Error('Questionnaire ID not initialized');
      }

      const computedResult = await WHO5Service.saveAnswers(user.id, questionnaireId, answers, questions, options);

      // Update UI
      setResult(computedResult);
      setPhase('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error saving WHO-5 answers:', err);
      setError('Hubo un error al guardar tus respuestas. Por favor, inténtalo de nuevo.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setPhase('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <PageLayout className="bg-[#F5F3EF]">
          <QuestionnaireLoadingScreen />
        </PageLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <PageLayout className="bg-[#F5F3EF]">
          <div className="flex h-full items-center justify-center p-6 text-center text-red-500">
            {error}
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

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
                <WHO5Form
                  questions={questions}
                  options={options}
                  title={questionnaireTitle}
                  description={questionnaireDesc}
                  onComplete={handleFormComplete}
                  isSaving={isSaving}
                />
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
