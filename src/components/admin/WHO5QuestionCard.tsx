'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Save, X,
} from 'lucide-react';
import ShowIfBuilder from '@/components/admin/ShowIfBuilder';
import type { ShowIfRule } from '@/types/admin.types';
import type { OptionNode, QuestionNode } from '@/types/admin.types';

// ─── Props ───────────────────────────────────────────────────────────────────
interface QuestionCardProps {
    question: QuestionNode;
    index: number;
    totalQuestions: number;
    isEditing: boolean;
    isPublished: boolean;
    isDraft: boolean;
    previousQuestions: QuestionNode[];
    onEdit: (id: string) => void;
    onCancelEdit: () => void;
    onSaveQuestion: (id: string, data: Partial<QuestionNode>) => void;
    onDeleteQuestion: (id: string) => void;
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onAddOption: (questionId: string) => void;
    onUpdateOption: (questionId: string, optionId: string, updates: Partial<OptionNode>) => void;
    onDeleteOption: (questionId: string, optionId: string) => void;
    onMoveOptionUp: (questionId: string, optionIndex: number) => void;
    onMoveOptionDown: (questionId: string, optionIndex: number) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseShowIf(raw: any): ShowIfRule | null {
    if (!raw) return null;
    try {
        const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (obj && typeof obj === 'object' && Array.isArray(obj.conditions)) {
            return obj as ShowIfRule;
        }
    } catch {
        // ignore malformed legacy JSON
    }
    return null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WHO5QuestionCard({
    question: q,
    index: idx,
    totalQuestions,
    isEditing,
    isDraft,
    previousQuestions,
    onEdit,
    onCancelEdit,
    onSaveQuestion,
    onDeleteQuestion,
    onMoveUp,
    onMoveDown,
    onAddOption,
    onUpdateOption,
    onDeleteOption,
    onMoveOptionUp,
    onMoveOptionDown,
}: QuestionCardProps) {
    const isWHO5 = true;
    const [expanded, setExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editForm, setEditForm] = useState<{
        title: string;
        description: string;
        type: QuestionNode['type'];
        show_if: ShowIfRule | null;
    }>({
        title: q.title,
        description: q.description || '',
        type: q.type,
        show_if: parseShowIf(q.show_if),
    });

    useEffect(() => {
        if (isEditing) {
            setEditForm({
                title: q.title,
                description: q.description || '',
                type: q.type,
                show_if: parseShowIf(q.show_if),
            });
        }
    }, [isEditing]);

    const hasChanged = (field: 'title' | 'description' | 'type') => {
        const original: Record<string, string> = {
            title: q.title,
            description: q.description || '',
            type: q.type,
        };
        return editForm[field] !== original[field];
    };

    const showIfChanged = JSON.stringify(editForm.show_if) !== JSON.stringify(parseShowIf(q.show_if));

    const handleSave = async () => {
        setIsSaving(true);
        console.log('[WHO5QuestionCard] handleSave clicked for question:', q.id);
        console.log('[WHO5QuestionCard] editForm state:', editForm);
        try {
            const payload = {
                title: editForm.title,
                description: editForm.description || null,
                type: editForm.type,
                show_if: editForm.show_if ? JSON.stringify(editForm.show_if) : null,
            };
            console.log('[WHO5QuestionCard] calling onSaveQuestion with payload:', payload);
            await onSaveQuestion(q.id, payload);
            console.log('[WHO5QuestionCard] onSaveQuestion success. Closing edit mode.');
            onCancelEdit();
        } catch (err) {
            console.error('[WHO5QuestionCard] Error in handleSave:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            {/* Header / Summary View */}
            <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 w-full">
                        {isDraft && (
                            <div className="flex flex-col gap-1 items-center justify-center border-r border-gray-200 pr-3 mt-1">
                                <button
                                    onClick={() => onMoveUp(idx)}
                                    disabled={idx === 0}
                                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                                >
                                    <ArrowUp size={14} />
                                </button>
                                <button
                                    onClick={() => onMoveDown(idx)}
                                    disabled={idx === totalQuestions - 1}
                                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
                                >
                                    <ArrowDown size={14} />
                                </button>
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-[#1A1A1A]">{q.order_index + 1}. {q.title}</h3>
                            <p className="text-xs text-[#6B7280] mb-2">
                                Tipo: {isWHO5 ? 'WHO-5 Standard' : q.type} | {q.question_options.length} opciones
                            </p>

                            {/* Mostrar opciones en modo colapsado siempre y lectura */}
                            {!expanded && !isEditing && (
                                <div className="mt-2 pl-2 border-l-2 border-gray-200">
                                    {q.question_options.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No hay opciones definidas.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {q.question_options.map(opt => (
                                                <span key={opt.id} className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-gray-600">
                                                    {opt.text}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4 self-center">
                        {isDraft && !expanded && !isEditing && (
                            <>
                                <button
                                    onClick={() => { setExpanded(true); onEdit(q.id); }}
                                    className="p-2 text-gray-500 hover:text-[#4A9B9B] hover:bg-teal-50 rounded-lg transition-colors"
                                    title="Editar pregunta"
                                >
                                    <Edit2 size={16} />
                                </button>
                                {!isWHO5 && (
                                    <button
                                        onClick={() => onDeleteQuestion(q.id)}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar pregunta"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </>
                        )}
                        <button
                            onClick={() => {
                                if (!expanded && isDraft) onEdit(q.id);
                                if (expanded && isEditing) onCancelEdit();
                                setExpanded(prev => !prev);
                            }}
                            className="p-2 text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Expanded Edit Form & Options */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`transition-colors duration-300 ${isSaving ? 'bg-white' : 'bg-white'}`}
                    >
                        <div className="p-4 border-b border-[#E5E7EB]">
                            <h4 className="text-sm font-semibold text-gray-600 mb-4">Configuración de la Pregunta</h4>

                            <div className="space-y-4 max-w-4xl">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        disabled={!isDraft || !isEditing}
                                        onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                                        className={`w-full text-sm rounded-lg border px-3 py-2 transition-colors duration-200 ${hasChanged('title')
                                            ? 'border-amber-300 bg-amber-50/60 text-gray-700'
                                            : 'border-gray-300 bg-white'
                                            } ${(!isDraft || !isEditing) && 'bg-gray-50 cursor-not-allowed text-gray-500'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción (Opcional)</label>
                                    <input
                                        type="text"
                                        value={editForm.description || ''}
                                        disabled={!isDraft || !isEditing || isWHO5}
                                        onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                                        className={`w-full text-sm rounded-lg border px-3 py-2 transition-colors duration-200 ${hasChanged('description')
                                            ? 'border-amber-300 bg-amber-50/60 text-gray-700'
                                            : 'border-gray-300 bg-white'
                                            } ${(!isDraft || !isEditing || isWHO5) && 'bg-gray-50 cursor-not-allowed text-gray-500'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Respuesta</label>
                                    <select
                                        value={editForm.type}
                                        disabled={!isDraft || !isEditing || isWHO5}
                                        onChange={(e) => setEditForm(f => ({ ...f, type: e.target.value as QuestionNode['type'] }))}
                                        className={`w-full text-sm rounded-lg border px-3 py-2 transition-colors duration-200 ${hasChanged('type')
                                            ? 'border-amber-300 bg-amber-50/60 text-gray-700'
                                            : 'border-gray-300 bg-white'
                                            } ${(!isDraft || !isEditing || isWHO5) && 'bg-gray-50 cursor-not-allowed text-gray-500'}`}
                                    >
                                        <option value="single_choice">Selección Única</option>
                                        <option value="multiple_choice">Selección Múltiple</option>
                                        <option value="text">Texto Libre</option>
                                    </select>
                                </div>
                                {!isWHO5 && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">Condición de visibilidad</label>
                                        {isDraft && isEditing ? (
                                            <>
                                                <ShowIfBuilder
                                                    value={editForm.show_if}
                                                    previousQuestions={previousQuestions}
                                                    onChange={(v) => setEditForm(f => ({ ...f, show_if: v }))}
                                                />
                                                {showIfChanged && (
                                                    <p className="mt-1 text-[10px] text-amber-600">· Condición modificada (sin guardar)</p>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-sm text-gray-500 bg-gray-50 p-2 border rounded">
                                                {q.show_if ? 'Condiciones configuradas (Habilitar edición para modificarlas)' : 'No hay condiciones asociadas a esta pregunta.'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Options Section inside expanded view */}
                        <div className="p-4 bg-gray-50/50">
                            <h4 className="text-sm font-semibold text-gray-600 mb-3">Opciones de respuesta</h4>

                            {q.question_options.length === 0 ? (
                                <p className="text-sm text-gray-400 italic mb-2">
                                    No hay opciones definidas. {q.type === 'text' && '(Campo de texto libre no requiere opciones prestablecidas)'}
                                </p>
                            ) : (
                                <ul className="space-y-2 mb-4 max-w-4xl">
                                    {q.question_options.map((opt, oIdx) => (
                                        <li key={opt.id} className="flex items-center gap-3 bg-white p-2 text-sm rounded-lg border border-gray-200 shadow-sm">
                                            {isDraft && isEditing && (
                                                <div className="flex flex-col gap-0 items-center justify-center pr-2 border-r border-gray-200">
                                                    <button
                                                        onClick={() => onMoveOptionUp(q.id, oIdx)}
                                                        disabled={oIdx === 0}
                                                        className="text-gray-400 hover:text-gray-700 disabled:opacity-30 p-0.5"
                                                    >
                                                        <ArrowUp size={12} />
                                                    </button>
                                                    <button
                                                        onClick={() => onMoveOptionDown(q.id, oIdx)}
                                                        disabled={oIdx === q.question_options.length - 1}
                                                        className="text-gray-400 hover:text-gray-700 disabled:opacity-30 p-0.5"
                                                    >
                                                        <ArrowDown size={12} />
                                                    </button>
                                                </div>
                                            )}

                                            <input
                                                type="text"
                                                defaultValue={opt.text}
                                                disabled={!isDraft || !isEditing}
                                                onBlur={(e) => { onUpdateOption(q.id, opt.id, { text: e.target.value }) }}
                                                className="flex-1 bg-transparent focus:bg-white focus:ring-1 focus:ring-[#4A9B9B] rounded px-2 py-1 disabled:text-gray-600"
                                            />

                                            {isDraft && isEditing && !isWHO5 && (
                                                <button
                                                    onClick={() => onDeleteOption(q.id, opt.id)}
                                                    className="text-red-400 hover:text-red-600 p-1 ml-2"
                                                    title="Eliminar opción"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {isDraft && isEditing && q.type !== 'text' && !isWHO5 && (
                                <button
                                    onClick={() => onAddOption(q.id)}
                                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A9B9B] hover:text-[#2C5F7C] transition-colors"
                                >
                                    <Plus size={14} /> Añadir opción
                                </button>
                            )}
                        </div>

                        {/* Save Actions */}
                        {isDraft && isEditing && (
                            <div className="p-4 border-t border-[#E5E7EB] bg-gray-50 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setExpanded(false); onCancelEdit(); }}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <X size={16} /> Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#4A9B9B] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a8888] transition-colors"
                                >
                                    <Save size={16} /> Guardar Cambios
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
