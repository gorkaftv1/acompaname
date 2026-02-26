'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { ResponseService } from '@/services/response.service';
import { ChevronLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
import type { Questionnaire, Question } from '@/types/questionnaire.types';

interface QuestionnaireSessionClientProps {
    questionnaire: Questionnaire;
    userId: string;
}

// ─── show_if evaluator ────────────────────────────────────────────────────────

function isQuestionVisible(
    question: Question,
    responses: Record<string, string>,
): boolean {
    if (!question.show_if) return true;

    const { operator, conditions } = question.show_if as {
        operator: 'OR' | 'AND';
        conditions: { question_id: string; option_ids: string[] }[];
    };

    if (!Array.isArray(conditions) || conditions.length === 0) return true;

    const results = conditions.map((c) => {
        const answer = responses[c.question_id];
        return Array.isArray(c.option_ids) && answer ? c.option_ids.includes(answer) : false;
    });

    return operator === 'AND' ? results.every(Boolean) : results.some(Boolean);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuestionnaireSessionClient({
    questionnaire,
    userId,
}: QuestionnaireSessionClientProps) {
    const supabase = createBrowserClient();
    const router = useRouter();

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Filtered visible questions ──────────────────────────────────────
    const visibleQuestions = questionnaire.questionnaire_questions.filter((q) =>
        isQuestionVisible(q, responses)
    );

    const totalVisible = visibleQuestions.length;
    const answeredCount = visibleQuestions.filter((q) => responses[q.id] !== undefined).length;
    const progressPct = totalVisible === 0 ? 0 : Math.round((answeredCount / totalVisible) * 100);

    // ── Initialize: find or create session ─────────────────────────────
    useEffect(() => {
        let mounted = true;

        async function init() {
            setIsLoading(true);
            setError(null);

            try {
                const sid = await ResponseService.getOrCreateActiveSession(userId, questionnaire.id, supabase);
                if (!mounted) return;

                setSessionId(sid);

                const prevResponses = await ResponseService.getSessionResponses(sid, supabase);
                if (!mounted) return;

                if (prevResponses && prevResponses.length > 0) {
                    const map: Record<string, string> = {};
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    prevResponses.forEach((r: any) => {
                        if (r.option_id) {
                            map[r.question_id] = r.option_id;
                        } else if (r.free_text_response) {
                            map[r.question_id] = r.free_text_response;
                        }
                    });
                    setResponses(map);
                }
            } catch (err) {
                if (mounted) {
                    const msg = err instanceof Error ? err.message : 'Error al iniciar la sesión.';
                    setError(msg);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        }

        init();
        return () => { mounted = false; };
    }, [questionnaire.id, userId]);

    // ── Save response (upsert immediately on selection) ─────────────────
    const saveResponse = useCallback(
        async (questionId: string, optionId: string | null, freeText: string | null) => {
            if (!sessionId) return;

            try {
                await ResponseService.saveResponse(userId, questionnaire.id, questionId, optionId, freeText);
            } catch (err) {
                console.error('Error saving response:', err);
            }
        },
        [sessionId, userId, questionnaire.id]
    );

    const handleOptionSelect = useCallback(
        async (questionId: string, optionId: string) => {
            setResponses((prev) => ({ ...prev, [questionId]: optionId }));
            await saveResponse(questionId, optionId, null);
        },
        [saveResponse]
    );

    const handleTextChange = useCallback(
        (questionId: string, text: string) => {
            setResponses((prev) => ({ ...prev, [questionId]: text }));
        },
        []
    );

    const handleTextBlur = useCallback(
        async (questionId: string, text: string) => {
            await saveResponse(questionId, null, text || null);
        },
        [saveResponse]
    );

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!sessionId) return;

        // Check all visible questions are answered
        const unanswered = visibleQuestions.filter((q) => !responses[q.id]);
        if (unanswered.length > 0) {
            setError(`Faltan ${unanswered.length} pregunta(s) por responder.`);
            const el = document.getElementById(`question-${unanswered[0].id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await ResponseService.completeSession(userId, questionnaire.id, supabase);

            // Fetch the completed session details to get the final score calculated by the backend via service
            const sessionDetails = await ResponseService.getCompletedSessionDetails(sessionId, userId, supabase);

            setScore(sessionDetails?.score ?? null);
            setIsCompleted(true);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al enviar el cuestionario.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Loading screen ───────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={32} className="animate-spin text-[#4A9B9B]" />
            </div>
        );
    }

    // ── Completion screen ────────────────────────────────────────────────
    if (isCompleted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto max-w-xl px-4 py-20 text-center flex flex-col items-center gap-6"
            >
                <div className="rounded-full bg-[#E8F3ED] p-5">
                    <CheckCircle2 size={48} className="text-[#4A9B9B]" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-[#1A1A1A]">¡Cuestionario completado!</h1>
                    <p className="text-sm text-[#6B7280]">
                        Tus respuestas han sido guardadas correctamente.
                    </p>
                </div>

                {score !== null && (
                    <div className="rounded-2xl border border-[#E5E7EB] bg-white px-8 py-6 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#4A9B9B] mb-1">
                            Puntuación total
                        </p>
                        <p className="text-5xl font-bold text-[#2C5F7C]">{score}</p>
                    </div>
                )}

                <div className="flex gap-3 mt-2">
                    <Link
                        href="/questionnaires"
                        className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-medium text-[#6B7280] shadow-sm hover:border-[#A8C5B5] hover:text-[#2C5F7C] transition-all"
                    >
                        Volver a cuestionarios
                    </Link>
                    <Link
                        href="/dashboard"
                        className="rounded-2xl bg-[#4A9B9B] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#3a8888] transition-all"
                    >
                        Ir al inicio
                    </Link>
                </div>
            </motion.div>
        );
    }

    // ── Main form ────────────────────────────────────────────────────────
    return (
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
            {/* Back nav */}
            <Link
                href="/questionnaires"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] mb-8 transition-colors"
            >
                <ChevronLeft size={16} />
                Volver a cuestionarios
            </Link>

            {/* Header */}
            <div className="mb-8">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#4A9B9B]">
                    Cuestionario
                </p>
                <h1 className="text-2xl font-bold text-[#1A1A1A] mb-1">{questionnaire.title}</h1>
                {questionnaire.description && (
                    <p className="text-sm text-[#6B7280] leading-relaxed">{questionnaire.description}</p>
                )}
            </div>

            {/* Progress */}
            <div className="mb-8">
                <div className="mb-1 flex justify-between text-xs text-[#9CA3AF]">
                    <span>{answeredCount} de {totalVisible} respondidas</span>
                    <span>{progressPct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #A8C5B5, #4A9B9B)' }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Questions */}
            <div className="flex flex-col gap-5 mb-8">
                <AnimatePresence>
                    {visibleQuestions.map((question, idx) => {
                        const hasError = !!error && !responses[question.id];
                        return (
                            <motion.div
                                key={question.id}
                                id={`question-${question.id}`}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3, delay: idx * 0.04 }}
                                className={`rounded-2xl border bg-white p-6 shadow-sm transition-shadow ${hasError ? 'border-red-300 ring-1 ring-red-200' : 'border-[#E5E7EB]'
                                    }`}
                            >
                                {/* Question header */}
                                <div className="flex items-start gap-3 mb-4">
                                    <span
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                                        style={{ background: 'linear-gradient(135deg, #A8C5B5, #4A9B9B)' }}
                                    >
                                        {idx + 1}
                                    </span>
                                    <p className="text-[15px] leading-relaxed text-[#1A1A1A] font-medium">
                                        {question.title}
                                    </p>
                                </div>

                                {/* Options */}
                                {question.type === 'text' ? (
                                    <textarea
                                        rows={3}
                                        placeholder="Tu respuesta..."
                                        value={responses[question.id] ?? ''}
                                        onChange={(e) => handleTextChange(question.id, e.target.value)}
                                        onBlur={(e) => handleTextBlur(question.id, e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#1A1A1A] resize-y focus:border-[#4A9B9B] focus:outline-none focus:ring-1 focus:ring-[#4A9B9B]"
                                    />
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {question.question_options.map((opt) => {
                                            const isSelected = responses[question.id] === opt.id;
                                            return (
                                                <label
                                                    key={opt.id}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-150 ${isSelected
                                                        ? 'border-[#4A9B9B] bg-[#F0F9F9] text-[#2C5F7C] font-medium'
                                                        : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#A8C5B5] hover:bg-[#F9FAFB]'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={question.id}
                                                        value={opt.id}
                                                        checked={isSelected}
                                                        onChange={() => handleOptionSelect(question.id, opt.id)}
                                                        className="sr-only"
                                                    />
                                                    {/* Custom radio indicator */}
                                                    <span
                                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? 'border-[#4A9B9B] bg-[#4A9B9B]' : 'border-[#D1D5DB] bg-white'
                                                            }`}
                                                    >
                                                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                    </span>
                                                    <span>{opt.text}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Error banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                    >
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                className="w-full rounded-2xl px-6 py-4 text-base font-semibold text-white shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#4A9B9B] focus:ring-offset-2 disabled:cursor-not-allowed"
                style={{
                    background: answeredCount === totalVisible
                        ? 'linear-gradient(135deg, #4A9B9B, #2C5F7C)'
                        : 'linear-gradient(135deg, #A8C5B5, #7BB5B5)',
                }}
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Enviando...
                    </span>
                ) : (
                    'Terminar cuestionario'
                )}
            </motion.button>

            {/* WHO Disclaimer */}
            <p className="mt-8 text-center text-[11px] text-[#9CA3AF] leading-relaxed">
                Tus respuestas se guardan automáticamente conforme avanzas.
            </p>
        </div>
    );
}
