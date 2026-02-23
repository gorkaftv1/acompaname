'use client';

/**
 * DynamicOnboarding — Motor de cuestionario dinámico
 *
 * Orquesta el flujo completo:
 *  1. Carga el cuestionario 'Onboarding'
 *  2. Navega pregunta a pregunta siguiendo el grafo de next_question_id
 *  3. Guarda cada respuesta (upsert con user_id o localStorage para guest)
 *  4. Captura nombre (Q1) y caregivingName (Q2). Los escribe en profiles.
 *  5. Interpola {{X}} e {{Y}} en preguntas y opciones con nombres reales.
 *  6. Al llegar a next_question_id = null → redirige al dashboard
 *
 * Ya no usa sesiones: el progreso se gestiona directamente con user_id.
 * Progreso calculado dinámicamente con análisis de grafo (graph-progress.ts).
 */

import { useEffect, useReducer, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import { QuestionnaireService } from '@/services/questionnaire.service';
import { ResponseService } from '@/services/response.service';
import { ProfileService } from '@/services/profile.service';
import type {
    OptionNode,
    QuestionNode,
    QuestionnaireEngineState,
} from '@/lib/services/questionnaire-engine.types';
import { useQuestionnaireContext } from '@/lib/hooks/useQuestionnaireContext';
import { getGraphProgress, type GraphProgress } from '@/lib/utils/graph-progress';
import { logger } from '@/lib/utils/logger';
import { useAuthStore } from '@/lib/store/auth.store';

import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import QuestionChoice from './QuestionChoice';
import QuestionText from './QuestionText';
import QuestionnaireLoadingScreen from './QuestionnaireLoadingScreen';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const QUESTIONNAIRE_TITLE = 'Onboarding';
const DASHBOARD_ROUTE = '/dashboard';

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

type Action =
    | { type: 'INIT_START' }
    | { type: 'INIT_SUCCESS'; question: QuestionNode; answeredCount?: number }
    | { type: 'INIT_ERROR'; message: string }
    | { type: 'SAVING_START' }
    | { type: 'ADVANCE'; nextQuestion: QuestionNode | null }
    | { type: 'SAVE_ERROR'; message: string }
    | { type: 'COMPLETE' }
    | { type: 'SET_NAME'; key: 'userName' | 'caregivingName'; value: string };

function reducer(state: QuestionnaireEngineState, action: Action): QuestionnaireEngineState {
    switch (action.type) {
        case 'INIT_START':
            return { ...state, status: 'loading', errorMessage: null };

        case 'INIT_SUCCESS':
            return {
                ...state,
                status: 'answering',
                currentQuestion: action.question,
                answeredCount: action.answeredCount ?? 0,
                errorMessage: null,
            };

        case 'INIT_ERROR':
            return { ...state, status: 'error', errorMessage: action.message };

        case 'SAVING_START':
            return { ...state, status: 'saving' };

        case 'ADVANCE':
            if (action.nextQuestion === null) {
                return { ...state, status: 'completed' };
            }
            return {
                ...state,
                status: 'answering',
                currentQuestion: action.nextQuestion,
                answeredCount: state.answeredCount + 1,
                errorMessage: null,
            };

        case 'SAVE_ERROR':
            return { ...state, status: 'answering', errorMessage: action.message };

        case 'COMPLETE':
            return { ...state, status: 'completed' };

        case 'SET_NAME':
            return { ...state, [action.key]: action.value };

        default:
            return state;
    }
}

const initialState: QuestionnaireEngineState = {
    status: 'loading',
    currentQuestion: null,
    answersMap: new Map(),
    errorMessage: null,
    answeredCount: 0,
    userName: null,
    caregivingName: null,
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

interface DynamicOnboardingProps {
    questionsMap: Map<string, QuestionNode>;
    questionnaireId: string;
}

function DynamicOnboardingEngine({ questionsMap, questionnaireId }: DynamicOnboardingProps) {
    const router = useRouter();
    const [state, dispatch] = useReducer(reducer, initialState);
    const userId = useAuthStore((s) => s.user?.id);

    // ── Encontrar primera pregunta (para cálculos de progreso) ────────────
    const firstQuestion = useMemo(() => {
        try { return QuestionnaireService.findFirstQuestion(questionsMap); }
        catch { return null; }
    }, [questionsMap]);

    // ── Inicialización (con recuperación de progreso) ─────────────────────

    useEffect(() => {
        let mounted = true;

        async function initializeState() {
            dispatch({ type: 'INIT_START' });
            if (!firstQuestion) {
                if (mounted) dispatch({ type: 'INIT_ERROR', message: 'No hay preguntas marcadas como primera.' });
                return;
            }

            if (!userId) {
                if (mounted) dispatch({ type: 'INIT_SUCCESS', question: firstQuestion, answeredCount: 0 });
                return;
            }

            try {
                const { isCompleted, currentQuestionId, answeredCount } = await ResponseService.getUserProgress(
                    userId, questionnaireId, questionsMap
                );

                if (!mounted) return;

                if (isCompleted) {
                    dispatch({ type: 'COMPLETE' });
                } else if (currentQuestionId && questionsMap.has(currentQuestionId)) {
                    dispatch({
                        type: 'INIT_SUCCESS',
                        question: questionsMap.get(currentQuestionId)!,
                        answeredCount
                    });
                } else {
                    dispatch({ type: 'INIT_SUCCESS', question: firstQuestion, answeredCount: 0 });
                }
            } catch (err) {
                logger.error('DynamicOnboarding', 'Error recuperando progreso al inicializar', err);
                if (mounted) {
                    dispatch({ type: 'INIT_SUCCESS', question: firstQuestion, answeredCount: 0 });
                }
            }
        }

        initializeState();

        return () => { mounted = false; };
    }, [firstQuestion, userId, questionnaireId, questionsMap]);

    // ── Navegación al completar ──────────────────────────────────────────

    useEffect(() => {
        if (state.status !== 'completed') return;
        if (!userId) {
            router.push('/register');
        } else {
            router.push(DASHBOARD_ROUTE);
        }
    }, [state.status, router, userId]);

    // ── Progreso dinámico (grafo) ────────────────────────────────────────

    const graphProgress: GraphProgress | null = useMemo(() => {
        if (!firstQuestion || !state.currentQuestion) return null;
        return getGraphProgress(
            questionsMap,
            firstQuestion.id,
            state.currentQuestion.id,
            state.answeredCount,
        );
    }, [questionsMap, firstQuestion, state.currentQuestion, state.answeredCount]);

    // ── Handlers ─────────────────────────────────────────────────────────

    const handleNavigate = useCallback(
        async (option: OptionNode, freeText: string | null) => {
            if (!state.currentQuestion) return;

            dispatch({ type: 'SAVING_START' });

            try {
                await ResponseService.saveResponse(
                    userId,
                    questionnaireId,
                    state.currentQuestion.id,
                    option.id,
                    freeText,
                );

                // ── Captura de nombres (Q1 y Q2) ───────────────────────
                if (state.currentQuestion.isFirstQuestion && freeText) {
                    dispatch({ type: 'SET_NAME', key: 'userName', value: freeText });
                    if (!userId) {
                        ResponseService.saveGuestName(questionnaireId, 'userName', freeText);
                    } else {
                        await ProfileService.updateProfile(userId, { name: freeText }).catch((e: unknown) =>
                            logger.error('DynamicOnboarding', 'Error guardando nombre de usuario:', e),
                        );
                    }
                } else if (state.answeredCount === 1 && freeText) {
                    dispatch({ type: 'SET_NAME', key: 'caregivingName', value: freeText });
                    if (!userId) {
                        ResponseService.saveGuestName(questionnaireId, 'caregivingName', freeText);
                    } else {
                        await ProfileService.updateProfile(userId, { caregivingFor: freeText }).catch((e: unknown) =>
                            logger.error('DynamicOnboarding', 'Error guardando nombre de acompañado:', e),
                        );
                    }
                }

                const nextQuestion = option.nextQuestionId
                    ? (questionsMap.get(option.nextQuestionId) ?? null)
                    : null;

                dispatch({ type: 'ADVANCE', nextQuestion });
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Error al guardar la respuesta.';
                dispatch({ type: 'SAVE_ERROR', message: msg });
            }
        },
        [userId, questionnaireId, state.currentQuestion, state.answeredCount, questionsMap],
    );

    const handleOptionSelect = useCallback(
        (option: OptionNode) => handleNavigate(option, null),
        [handleNavigate],
    );

    const handleTextSubmit = useCallback(
        (freeText: string) => {
            if (!state.currentQuestion) return;
            const phantom = state.currentQuestion.options.find((o) => o.isPhantom);
            if (!phantom) {
                logger.error('DynamicOnboarding', 'No hay opción fantasma para la pregunta de texto.');
                return;
            }
            handleNavigate(phantom, freeText);
        },
        [state.currentQuestion, handleNavigate],
    );

    // ── Render ───────────────────────────────────────────────────────────

    const { status, currentQuestion, errorMessage, userName, caregivingName } = state;
    const isSaving = status === 'saving';

    const { resolvePlaceholders } = useQuestionnaireContext({
        localUserName: userName,
        localCaregivingName: caregivingName,
    });

    if (status === 'loading') return <QuestionnaireLoadingScreen />;

    if (status === 'completed') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-6 text-center"
            >
                <EmotionalCompanion emotion="calm" size={140} />
                <div className="space-y-2">
                    <p className="text-deep-calm-blue font-bold text-xl">¡Gracias por compartir!</p>
                    <p className="text-deep-calm-blue/70 text-sm">
                        Preparando tu experiencia personalizada…
                    </p>
                </div>
                <span className="w-7 h-7 border-4 border-[#4A9B9B]/30 border-t-[#4A9B9B] rounded-full animate-spin" />
            </motion.div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-center py-16 space-y-4">
                <EmotionalCompanion emotion="challenging" size={100} />
                <p className="text-red-500 font-semibold">Algo ha salido mal</p>
                <p className="text-deep-calm-blue/70 text-sm max-w-sm mx-auto">{errorMessage}</p>
                <button
                    onClick={() => router.push(DASHBOARD_ROUTE)}
                    className="mt-4 underline text-[#4A9B9B] text-sm hover:text-[#3a8888]"
                >
                    Ir al inicio de todas formas
                </button>
            </div>
        );
    }

    if (!currentQuestion) return null;

    return (
        <div className="space-y-6">
            {/* Barra de progreso dinámica (basada en grafo) */}
            {graphProgress && (
                <DynamicProgressBar progress={graphProgress} />
            )}

            {/* Error no fatal */}
            <AnimatePresence>
                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                    >
                        {errorMessage} — Por favor, inténtalo de nuevo.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pregunta activa */}
            <AnimatePresence mode="wait">
                {currentQuestion.questionType === 'single_choice' && (
                    <QuestionChoice
                        key={currentQuestion.id}
                        questionText={resolvePlaceholders(currentQuestion.questionText)}
                        options={currentQuestion.options.map((o) => ({
                            ...o,
                            optionText: resolvePlaceholders(o.optionText),
                        }))}
                        onSelect={handleOptionSelect}
                        disabled={isSaving}
                    />
                )}

                {currentQuestion.questionType === 'text' && (
                    <QuestionText
                        key={currentQuestion.id}
                        questionText={resolvePlaceholders(currentQuestion.questionText)}
                        onSubmit={handleTextSubmit}
                        disabled={isSaving}
                    />
                )}
            </AnimatePresence>

            {/* Guest: guardar y registrarse */}
            {!userId && state.answeredCount > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center pt-4"
                >
                    <button
                        onClick={() => router.push('/register')}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#4A9B9B] px-5 py-2.5 text-sm font-medium text-[#4A9B9B] transition-colors hover:bg-[#4A9B9B] hover:text-white pointer-events-auto"
                        type="button"
                    >
                        Guardar progreso y registrarse
                    </button>
                </motion.div>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Barra de progreso dinámica (basada en análisis de grafo)
// ---------------------------------------------------------------------------

function DynamicProgressBar({ progress }: { progress: GraphProgress }) {
    const { currentStep, maxSteps, minRemaining } = progress;
    const pct = Math.min(Math.round((currentStep / maxSteps) * 100), 95);

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-deep-calm-blue/50">
                <span>Pregunta {currentStep} de ~{maxSteps}</span>
                <span>Faltan al menos {minRemaining}</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#4A9B9B] to-[#6B9E78]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Loader — carga preguntas antes de montar el motor
// ---------------------------------------------------------------------------

export default function DynamicOnboarding() {
    const router = useRouter();
    const [questionsMap, setQuestionsMap] = useReducerState<Map<string, QuestionNode> | null>(null);
    const [questionnaireId, setQuestionnaireId] = useReducerState<string | null>(null);
    const [loadError, setLoadError] = useReducerState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function preload() {
            try {
                const data = await QuestionnaireService.getByTitle(QUESTIONNAIRE_TITLE);
                const map = await QuestionnaireService.getQuestionsMap(data.id);
                if (!cancelled) {
                    setQuestionnaireId(data.id);
                    setQuestionsMap(map);
                }
            } catch (err) {
                if (!cancelled) {
                    const msg = err instanceof Error ? err.message : 'Error al pre-cargar el cuestionario.';
                    setLoadError(msg);
                }
            }
        }

        preload();
        return () => { cancelled = true; };
    }, []);

    if (loadError) {
        return (
            <div className="text-center py-16 space-y-4">
                <EmotionalCompanion emotion="challenging" size={100} />
                <p className="text-red-500 font-semibold">No pudimos cargar el cuestionario</p>
                <p className="text-deep-calm-blue/70 text-sm max-w-sm mx-auto">{loadError}</p>
                <button
                    onClick={() => router.push(DASHBOARD_ROUTE)}
                    className="mt-4 underline text-[#4A9B9B] text-sm hover:text-[#3a8888]"
                >
                    Ir al inicio sin completar el cuestionario
                </button>
            </div>
        );
    }

    if (!questionsMap) return <QuestionnaireLoadingScreen />;

    return <DynamicOnboardingEngine questionsMap={questionsMap} questionnaireId={questionnaireId!} />;
}

// ---------------------------------------------------------------------------
// Helper — useState simplificado
// ---------------------------------------------------------------------------

function useReducerState<T>(initial: T): [T, (v: T) => void] {
    const [state, dispatch] = useReducer((_: T, v: T) => v, initial);
    return [state, dispatch];
}
