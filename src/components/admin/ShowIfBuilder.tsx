'use client';

import React from 'react';
import { Plus, X, Eye, EyeOff } from 'lucide-react';
import type { QuestionNode } from '@/components/admin/QuestionCard';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShowIfCondition {
    question_id: string;
    option_ids: string[];
}

export interface ShowIfRule {
    operator: 'OR' | 'AND';
    conditions: ShowIfCondition[];
}

interface ShowIfBuilderProps {
    value: ShowIfRule | null;
    previousQuestions: QuestionNode[];
    onChange: (value: ShowIfRule | null) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_RULE: ShowIfRule = { operator: 'OR', conditions: [{ question_id: '', option_ids: [] }] };

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShowIfBuilder({ value, previousQuestions, onChange }: ShowIfBuilderProps) {
    const isActive = value !== null;

    // ── First-question guard ──────────────────────────────────────────────
    if (previousQuestions.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-400 italic">
                Esta es la primera pregunta — no puede tener condiciones de visibilidad.
            </div>
        );
    }

    // ── Toggle visibility mode ────────────────────────────────────────────
    const handleToggle = (active: boolean) => {
        onChange(active ? { ...DEFAULT_RULE } : null);
    };

    const rule = value ?? DEFAULT_RULE;

    // ── Operator ─────────────────────────────────────────────────────────
    const setOperator = (op: 'OR' | 'AND') => {
        onChange({ ...rule, operator: op });
    };

    // ── Conditions ───────────────────────────────────────────────────────
    const setCondition = (idx: number, partial: Partial<ShowIfCondition>) => {
        const updated = rule.conditions.map((c, i) =>
            i === idx ? { ...c, ...partial } : c
        );
        onChange({ ...rule, conditions: updated });
    };

    const addCondition = () => {
        onChange({ ...rule, conditions: [...rule.conditions, { question_id: '', option_ids: [] }] });
    };

    const removeCondition = (idx: number) => {
        const updated = rule.conditions.filter((_, i) => i !== idx);
        onChange(updated.length === 0 ? null : { ...rule, conditions: updated });
    };

    const toggleOptionId = (condIdx: number, optId: string) => {
        const cond = rule.conditions[condIdx];
        const next = cond.option_ids.includes(optId)
            ? cond.option_ids.filter((id) => id !== optId)
            : [...cond.option_ids, optId];
        setCondition(condIdx, { option_ids: next });
    };

    return (
        <div className="space-y-3">
            {/* ── Toggle: Siempre visible / Solo si... ── */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => handleToggle(false)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${!isActive
                            ? 'border-[#4A9B9B] bg-teal-50 text-[#2C5F7C]'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                >
                    <Eye size={12} />
                    Siempre visible
                </button>
                <button
                    type="button"
                    onClick={() => handleToggle(true)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${isActive
                            ? 'border-[#4A9B9B] bg-teal-50 text-[#2C5F7C]'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                >
                    <EyeOff size={12} />
                    Solo si se cumplen condiciones
                </button>
            </div>

            {/* ── Builder (only when active) ── */}
            {isActive && (
                <div className="rounded-xl border border-[#E5E7EB] bg-gray-50 p-3 space-y-3">
                    {/* Operator selector */}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Mostrar si se cumple</span>
                        <select
                            value={rule.operator}
                            onChange={(e) => setOperator(e.target.value as 'OR' | 'AND')}
                            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 focus:border-[#4A9B9B] focus:outline-none"
                        >
                            <option value="OR">CUALQUIERA</option>
                            <option value="AND">TODAS</option>
                        </select>
                        <span>de estas reglas:</span>
                    </div>

                    {/* Condition rows */}
                    <div className="space-y-2">
                        {rule.conditions.map((cond, condIdx) => {
                            const selectedQ = previousQuestions.find((pq) => pq.id === cond.question_id);
                            const hasOpts = selectedQ && selectedQ.question_options.length > 0;

                            return (
                                <div
                                    key={condIdx}
                                    className="rounded-lg border border-gray-200 bg-white p-3 space-y-2"
                                >
                                    {/* Row header */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 shrink-0">Si en la pregunta</span>
                                        <select
                                            value={cond.question_id}
                                            onChange={(e) =>
                                                setCondition(condIdx, { question_id: e.target.value, option_ids: [] })
                                            }
                                            className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:border-[#4A9B9B] focus:outline-none"
                                        >
                                            <option value="">— selecciona —</option>
                                            {previousQuestions.map((pq) => (
                                                <option key={pq.id} value={pq.id}>
                                                    {pq.order_index + 1}. {pq.title}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeCondition(condIdx)}
                                            className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Eliminar condición"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {/* Options */}
                                    {cond.question_id && (
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1.5">la respuesta es:</p>
                                            {!selectedQ ? null : !hasOpts ? (
                                                <p className="text-xs text-amber-600 italic">
                                                    Esta pregunta no tiene opciones definidas aún.
                                                </p>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedQ.question_options.map((opt) => {
                                                        const active = cond.option_ids.includes(opt.id);
                                                        return (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() => toggleOptionId(condIdx, opt.id)}
                                                                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${active
                                                                        ? 'border-[#4A9B9B] bg-[#4A9B9B] text-white'
                                                                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-[#4A9B9B] hover:bg-teal-50'
                                                                    }`}
                                                            >
                                                                {opt.text}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Add condition + Clear */}
                    <div className="flex items-center justify-between pt-1">
                        <button
                            type="button"
                            onClick={addCondition}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#4A9B9B] hover:text-[#2C5F7C] transition-colors"
                        >
                            <Plus size={13} />
                            Añadir otra regla
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
                        >
                            Limpiar condiciones
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
