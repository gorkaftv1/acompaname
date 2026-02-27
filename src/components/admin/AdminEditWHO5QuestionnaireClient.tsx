'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { ChevronLeft, Plus, AlertCircle, Archive, Globe } from 'lucide-react';
import Link from 'next/link';
import WHO5QuestionCard from '@/components/admin/WHO5QuestionCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { AdminQuestionnaireService } from '@/lib/services/admin-questionnaire.service';
import type { QuestionNode, OptionNode, QuestionnaireData } from '@/types/admin.types';

// ─── Main Component ────────────────────────────────────────────────────────
export default function AdminEditWHO5QuestionnaireClient({ initialData }: { initialData: QuestionnaireData }) {
    const router = useRouter();
    const supabase = createBrowserClient();

    const [data, setData] = useState<QuestionnaireData>(initialData);

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Edit Form State for Questions
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    // Pending confirmation action
    const [pendingAction, setPendingAction] = useState<{
        title: string;
        message: string;
        variant?: 'default' | 'danger';
        confirmLabel?: string;
        action: () => void;
    } | null>(null);

    const confirm = (opts: NonNullable<typeof pendingAction>) => setPendingAction(opts);
    const clearConfirm = () => setPendingAction(null);

    const isDraft = data.status === 'draft';
    const isPublished = data.status === 'published';
    const isArchived = data.status === 'archived';

    // ─── Status Actions ─────────────────────────────────────────────────────
    const handlePublish = async () => {
        if (!isDraft) return;
        confirm({
            title: 'Publicar cuestionario',
            message: 'Al publicar el cuestionario se hará visible a los usuarios y NO se podrá modificar más. ¿Continuar?',
            confirmLabel: 'Publicar',
            action: async () => {
                setIsSaving(true);
                setError(null);
                try {
                    await AdminQuestionnaireService.publishQuestionnaire(data.id, supabase);
                    setData(prev => ({ ...prev, status: 'published' }));
                    setSuccessMsg('Cuestionario publicado correctamente.');
                } catch (err: any) {
                    console.error('Error publishing:', err);
                    setError(err.message || 'Error al publicar.');
                } finally {
                    setIsSaving(false);
                }
            },
        });
    };

    const handleArchive = async () => {
        if (!isPublished) return;
        confirm({
            title: 'Archivar cuestionario',
            message: '¿Archivar cuestionario? Ya no será visible para los usuarios activos.',
            variant: 'danger',
            confirmLabel: 'Archivar',
            action: async () => {
                setIsSaving(true);
                setError(null);
                try {
                    await AdminQuestionnaireService.archiveQuestionnaire(data.id, supabase);
                    setData(prev => ({ ...prev, status: 'archived' }));
                    setSuccessMsg('Cuestionario archivado correctamente.');
                } catch (err: any) {
                    console.error('Error archiving:', err);
                    setError(err.message || 'Error al archivar.');
                } finally {
                    setIsSaving(false);
                }
            },
        });
    };

    // ─── Base Info Edit ─────────────────────────────────────────────────────
    const handleUpdateBaseInfo = async (field: 'title' | 'description' | 'type', value: string) => {
        if (!isDraft) return;
        try {
            await AdminQuestionnaireService.updateQuestionnaireBaseInfo(data.id, { [field]: value }, supabase);
            setData(prev => ({ ...prev, [field]: value }));
        } catch (err) {
            console.error('Error updating base info:', err);
            setError('Error al actualizar información básica.');
        }
    };

    // ─── Question Logic ──────────────────────────────────────────────────────
    // Omit add question

    const handleUpdateQuestion = async (qId: string, updates: Partial<QuestionNode>) => {
        if (!isDraft) return;
        console.log('[AdminEditWHO5QuestionnaireClient] handleUpdateQuestion triggered for qId:', qId, 'with updates:', updates);
        try {
            const payload = { ...updates };
            if (payload.show_if && typeof payload.show_if === 'object') {
                payload.show_if = JSON.stringify(payload.show_if);
            }
            console.log('[AdminEditWHO5QuestionnaireClient] Prepared payload to send to Service:', payload);

            await AdminQuestionnaireService.updateQuestion(qId, payload, supabase);
            console.log('[AdminEditWHO5QuestionnaireClient] Service update successful');

            // Revert strict JSON conversion back for React State holding object
            if (updates.show_if && typeof updates.show_if === 'string') {
                updates.show_if = JSON.parse(updates.show_if);
            }

            setData(prev => ({
                ...prev,
                questionnaire_questions: prev.questionnaire_questions.map(q => q.id === qId ? { ...q, ...payload } as QuestionNode : q)
            }));
            console.log('[AdminEditWHO5QuestionnaireClient] Local state updated');
            // Note: do NOT close the edit panel here — closing is always explicit via onCancelEdit
        } catch (err: any) {
            console.error('[AdminEditWHO5QuestionnaireClient] handleUpdateQuestion error:', err);
            setError(err.message || 'Error al actualizar pregunta. Verifica el formato JSON.');
            throw err;
        }
    };

    const handleReorderQuestion = async (index: number, direction: 'up' | 'down') => {
        if (!isDraft) return;
        const sorted = [...data.questionnaire_questions].sort((a, b) => a.order_index - b.order_index);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sorted.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const normalized = sorted.map((q, i) => ({ ...q, order_index: i }));

        const tempOrder = normalized[index].order_index;
        normalized[index].order_index = normalized[targetIndex].order_index;
        normalized[targetIndex].order_index = tempOrder;

        try {
            await AdminQuestionnaireService.reorderQuestions(
                { id: normalized[index].id, order_index: normalized[index].order_index },
                { id: normalized[targetIndex].id, order_index: normalized[targetIndex].order_index },
                supabase
            );
            setData(prev => ({
                ...prev,
                questionnaire_questions: normalized.sort((a, b) => a.order_index - b.order_index),
            }));
        } catch (err) {
            console.error(err);
            setError('Error al reordenar.');
        }
    };

    // Omit delete question

    // Omit reorder

    // ─── Options Logic ───────────────────────────────────────────────────────
    // Omit add option

    const handleUpdateOption = async (qId: string, optId: string, updates: Partial<OptionNode>) => {
        if (!isDraft) return;
        try {
            await AdminQuestionnaireService.updateOption(optId, updates, supabase);

            setData(prev => ({
                ...prev,
                questionnaire_questions: prev.questionnaire_questions.map(q =>
                    q.id === qId
                        ? {
                            ...q,
                            question_options: q.question_options.map(o => o.id === optId ? { ...o, ...updates } : o)
                        }
                        : q
                )
            }));
        } catch (err) {
            console.error(err);
            setError('Error al actualizar opción.');
        }
    };

    const handleReorderOption = async (qId: string, optIndex: number, direction: 'up' | 'down') => {
        if (!isDraft) return;
        const q = data.questionnaire_questions.find(x => x.id === qId);
        if (!q) return;

        const sorted = [...q.question_options].sort((a, b) => a.order_index - b.order_index);
        if (direction === 'up' && optIndex === 0) return;
        if (direction === 'down' && optIndex === sorted.length - 1) return;

        const targetIndex = direction === 'up' ? optIndex - 1 : optIndex + 1;
        const normalized = sorted.map((o, i) => ({ ...o, order_index: i }));

        const tempOrder = normalized[optIndex].order_index;
        normalized[optIndex].order_index = normalized[targetIndex].order_index;
        normalized[targetIndex].order_index = tempOrder;

        try {
            await AdminQuestionnaireService.reorderOptions(
                { id: normalized[optIndex].id, order_index: normalized[optIndex].order_index },
                { id: normalized[targetIndex].id, order_index: normalized[targetIndex].order_index },
                supabase
            );
            setData(prev => ({
                ...prev,
                questionnaire_questions: prev.questionnaire_questions.map(x =>
                    x.id === qId
                        ? { ...x, question_options: normalized.sort((a, b) => a.order_index - b.order_index) }
                        : x
                ),
            }));
        } catch (err) {
            console.error(err);
            setError('Error al reordenar opción.');
        }
    };

    // Omit delete option
    // Omit reorder option

    return (
        <>
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                {/* Header / Back */}
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] mb-8 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Volver al panel
                </Link>

                {/* Error / Success Banners */}
                {error && (
                    <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={18} className="shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 p-1 underline text-xs">Ocultar</button>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={18} className="shrink-0 text-green-500" />
                            <span>{successMsg}</span>
                        </div>
                        <button onClick={() => setSuccessMsg(null)} className="text-green-500 hover:text-green-700 p-1 underline text-xs">Ocultar</button>
                    </div>
                )}

                {/* Main Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {isDraft && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold uppercase">Borrador</span>}
                                {isPublished && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold uppercase">Publicado</span>}
                                {isArchived && <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold uppercase">Archivado</span>}
                                {data.type === 'onboarding' && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase">Onboarding</span>}
                                {data.type === 'who5' && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold uppercase">WHO-5</span>}
                            </div>
                            <h1 className="text-2xl font-bold text-[#1A1A1A]">Modificar Cuestionario</h1>
                        </div>

                        <div className="flex gap-3">
                            {isDraft && (
                                <button
                                    onClick={handlePublish}
                                    disabled={isSaving || data.questionnaire_questions.length === 0}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#4A9B9B] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#3a8888] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9B9B] disabled:opacity-50"
                                >
                                    <Globe size={16} />
                                    Publicar
                                </button>
                            )}
                            {isPublished && (
                                <button
                                    onClick={handleArchive}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50"
                                >
                                    <Archive size={16} />
                                    Archivar
                                </button>
                            )}
                        </div>
                    </div>

                    {!isDraft && (
                        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
                            {isPublished ? 'Este cuestionario está activo y es inmutable. Si deseas hacer modificaciones, debes archivar este primero y crear una copia nueva.' : 'Este cuestionario ha sido retirado. Es de solo-lectura.'}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">Título</label>
                            <input
                                type="text"
                                value={data.title}
                                disabled={!isDraft}
                                onChange={(e) => setData(prev => ({ ...prev, title: e.target.value }))}
                                onBlur={(e) => {
                                    if (e.target.value !== initialData.title) handleUpdateBaseInfo('title', e.target.value);
                                }}
                                className="w-full rounded-xl border border-[#D1D5DB] px-4 py-2 text-[#1A1A1A] focus:border-[#4A9B9B] focus:outline-none focus:ring-1 focus:ring-[#4A9B9B] disabled:bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">Descripción</label>
                            <textarea
                                value={data.description || ''}
                                disabled={!isDraft}
                                onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                                onBlur={(e) => {
                                    if (e.target.value !== initialData.description) handleUpdateBaseInfo('description', e.target.value);
                                }}
                                rows={3}
                                className="w-full rounded-xl border border-[#D1D5DB] px-4 py-2 text-[#1A1A1A] resize-y focus:border-[#4A9B9B] focus:outline-none focus:ring-1 focus:ring-[#4A9B9B] disabled:bg-gray-50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">Tipo de Cuestionario</label>
                        <select
                            value={data.type}
                            disabled={!isDraft}
                            onChange={(e) => {
                                const newType = e.target.value as 'onboarding' | 'who5' | 'standard';
                                setData(prev => ({ ...prev, type: newType }));
                                handleUpdateBaseInfo('type', newType);
                            }}
                            className="w-full rounded-xl border border-[#D1D5DB] px-4 py-2 text-[#1A1A1A] focus:border-[#4A9B9B] focus:outline-none focus:ring-1 focus:ring-[#4A9B9B] disabled:bg-gray-50"
                        >
                            <option value="standard">Estándar</option>
                            <option value="onboarding">Onboarding (Primer uso)</option>
                            <option value="who5">WHO-5 (Bienestar)</option>
                        </select>
                    </div>
                </div>

                {/* Questions Container */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Preguntas ({data.questionnaire_questions.length})</h2>

                    {data.questionnaire_questions.map((q, idx) => (
                        <WHO5QuestionCard
                            key={q.id}
                            question={q}
                            index={idx}
                            totalQuestions={data.questionnaire_questions.length}
                            isEditing={editingQuestionId === q.id}
                            isPublished={isPublished}
                            isDraft={isDraft}
                            previousQuestions={data.questionnaire_questions.filter(
                                pq => pq.order_index < q.order_index
                            )}
                            onEdit={(id) => setEditingQuestionId(id)}
                            onCancelEdit={() => setEditingQuestionId(null)}
                            onSaveQuestion={handleUpdateQuestion}
                            onDeleteQuestion={() => { }}
                            onMoveUp={(i) => handleReorderQuestion(i, 'up')}
                            onMoveDown={(i) => handleReorderQuestion(i, 'down')}
                            onAddOption={() => { }}
                            onUpdateOption={(qId, optId, updates) => handleUpdateOption(qId, optId, updates)}
                            onDeleteOption={() => { }}
                            onMoveOptionUp={(qId, oIdx) => handleReorderOption(qId, oIdx, 'up')}
                            onMoveOptionDown={(qId, oIdx) => handleReorderOption(qId, oIdx, 'down')}
                        />
                    ))}


                    {data.questionnaire_questions.length === 0 && (
                        <div className="text-center py-10 bg-white border border-dashed border-gray-300 rounded-xl">
                            <p className="text-gray-500 text-sm">El cuestionario aún no tiene preguntas.</p>
                        </div>
                    )}

                    {/* WHO-5 forms cannot add structured questions manually */}
                </div>
            </div>

            <ConfirmDialog
                isOpen={pendingAction !== null}
                title={pendingAction?.title ?? ''}
                message={pendingAction?.message ?? ''}
                variant={pendingAction?.variant}
                confirmLabel={pendingAction?.confirmLabel}
                onCancel={clearConfirm}
                onConfirm={() => {
                    pendingAction?.action();
                    clearConfirm();
                }}
            />
        </>
    );
}
