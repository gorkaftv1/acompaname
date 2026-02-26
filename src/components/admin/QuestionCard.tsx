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
    isOnboarding: boolean;
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

export default function QuestionCard({
    question: q,
    index: idx,
    totalQuestions,
    isEditing,
    isDraft,
    isOnboarding,
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
        try {
            await onSaveQuestion(q.id, {
                title: editForm.title,
                description: editForm.description || null,
                type: editForm.type,
                show_if: editForm.show_if ? JSON.stringify(editForm.show_if) : null,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            {/* Question Header */}
            <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {isDraft && (
                        <div className="flex flex-col gap-1 items-center justify-center border-r border-gray-200 pr-3">
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
                    <div>
                        <h3 className="font-semibold text-[#1A1A1A]">{q.order_index + 1}. {q.title}</h3>
                        <p className="text-xs text-[#6B7280]">Tipo: {q.type} | {q.question_options.length} opciones</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isDraft && (
                        <>
                            <button
                                onClick={() => isEditing ? onCancelEdit() : onEdit(q.id)}
                                className="p-2 text-gray-500 hover:text-[#4A9B9B] hover:bg-teal-50 rounded-lg transition-colors"
                                title="Editar estructura de la pregunta"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => onDeleteQuestion(q.id)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar pregunta"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setExpanded(prev => !prev)}
                        className="p-2 text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {/* Inline Edit Form */}
            <AnimatePresence>
                {isEditing && isDraft && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={`max-w-4xl p-4 border-b border-[#E5E7EB] transition-colors duration-300 ${isSaving ? 'bg-white' : 'bg-white-50/30'
                            }`}
                    >
                        <div className="space-y-4 max-w-4xl">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                                    className={`w-full text-sm rounded-lg border px-3 py-2 transition-colors duration-200 ${hasChanged('title')
                                        ? 'border-amber-300 bg-amber-50/60 text-gray-700'
                                        : 'border-gray-300 bg-white'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción (Opcional)</label>
                                <input
                                    type="text"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                                    className={`w-full text-sm rounded-lg border px-3 py-2 transition-colors duration-200 ${hasChanged('description')
                                        ? 'border-amber-300 bg-amber-50/60 text-gray-700'
                                        : 'border-gray-300 bg-white'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Respuesta</label>
                                <select
                                    value={editForm.type}
                                    onChange={(e) => setEditForm(f => ({ ...f, type: e.target.value as QuestionNode['type'] }))}
                                    className={`w-full text-sm rounded-lg border px-3 py-2 transition-colors duration-200 ${hasChanged('type')
                                        ? 'border-amber-300 bg-amber-50/60 text-gray-700'
                                        : 'border-gray-300 bg-white'
                                        }`}
                                >
                                    <option value="single_choice">Selección Única</option>
                                    <option value="multiple_choice">Selección Múltiple</option>
                                    <option value="text">Texto Libre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Condición de visibilidad</label>
                                <ShowIfBuilder
                                    value={editForm.show_if}
                                    previousQuestions={previousQuestions}
                                    onChange={(v) => setEditForm(f => ({ ...f, show_if: v }))}
                                />
                                {showIfChanged && (
                                    <p className="mt-1 text-[10px] text-amber-600">· Condición modificada (sin guardar)</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={onCancelEdit}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <X size={13} /> Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#4A9B9B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3a8888] transition-colors"
                                >
                                    <Save size={13} /> Guardar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Options List */}
            <AnimatePresence>
                {(expanded || !isDraft) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="max-w-6xl p-4 bg-white"
                    >
                        <h4 className="text-sm font-semibold text-gray-600 mb-3 ml-2">Opciones de respuesta</h4>

                        {q.question_options.length === 0 ? (
                            <p className="text-sm text-gray-400 italic ml-2 mb-2">
                                No hay opciones definidas. {q.type === 'text' && '(Campo de texto libre no requiere opciones prestablecidas)'}
                            </p>
                        ) : (
                            <ul className="space-y-2 mb-4">
                                {q.question_options.map((opt, oIdx) => (
                                    <li key={opt.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        {isDraft && (
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
                                            disabled={!isDraft}
                                            onBlur={(e) => onUpdateOption(q.id, opt.id, { text: e.target.value })}
                                            className="flex-1 bg-transparent text-sm focus:bg-white focus:ring-1 focus:ring-[#4A9B9B] rounded px-2 py-1 disabled:text-gray-600"
                                        />

                                        {!isOnboarding && (
                                            <input
                                                type="number"
                                                defaultValue={opt.score || 0}
                                                disabled={!isDraft}
                                                onBlur={(e) => onUpdateOption(q.id, opt.id, { score: parseFloat(e.target.value) || 0 })}
                                                className="w-20 bg-transparent text-sm focus:bg-white focus:ring-1 focus:ring-[#4A9B9B] border border-gray-200 rounded px-2 py-1 text-center"
                                                title="Valoración (Score)"
                                            />
                                        )}

                                        {isDraft && (
                                            <button
                                                onClick={() => onDeleteOption(q.id, opt.id)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                                title="Eliminar opción"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {isDraft && q.type !== 'text' && (
                            <button
                                onClick={() => onAddOption(q.id)}
                                className="ml-2 mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A9B9B] hover:text-[#2C5F7C] transition-colors"
                            >
                                <Plus size={14} /> Añadir opción
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
