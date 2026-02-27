'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createBrowserClient } from '@/lib/supabase/client';
import { ChevronLeft, Plus, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';
import { AdminQuestionnaireService } from '@/lib/services/admin-questionnaire.service';

export default function AdminCreateQuestionnaireClient({ userId }: { userId: string }) {
    const router = useRouter();
    const supabase = createBrowserClient();
    const { user } = useAuthStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'onboarding' | 'who5' | 'standard'>('standard');

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // If somehow authStore hasn't synced but server thinks it's ok, let's keep going.

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('El título es obligatorio.');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const newId = await AdminQuestionnaireService.createQuestionnaire({
                title: title.trim(),
                description: description.trim() || null,
                type: type
            }, supabase);

            router.push(`/admin/questionnaires/${newId}`);
        } catch (err: any) {
            console.error('Error creating questionnaire:', err);
            setError(err.message || 'Error inesperado al crear el cuestionario.');
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            {/* Header / Back */}
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1A1A] mb-8 transition-colors"
            >
                <ChevronLeft size={16} />
                Volver al panel
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#1A1A1A]">Nuevo Cuestionario</h1>
                <p className="mt-1 text-sm text-[#6B7280]">
                    Configura los detalles básicos del cuestionario. Se guardará en estado borrador (draft).
                </p>
            </div>

            {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                    <div className="flex-1">{error}</div>
                </div>
            )}

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden"
                onSubmit={handleSave}
            >
                <div className="p-6 sm:p-8 space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                            Título <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Encuesta de Satisfacción"
                            className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#4A9B9B] focus:outline-none focus:ring-1 focus:ring-[#4A9B9B] transition-colors"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve explicación del objetivo del cuestionario (opcional)..."
                            rows={4}
                            className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[#4A9B9B] focus:outline-none focus:ring-1 focus:ring-[#4A9B9B] transition-colors resize-y"
                        />
                    </div>

                    {/* Type selection */}
                    <div className="flex flex-col gap-2 bg-[#F9FAFB] p-4 rounded-xl border border-[#F3F4F6]">
                        <label htmlFor="questionnaireType" className="text-sm font-medium text-[#1A1A1A]">
                            Tipo de Cuestionario
                        </label>
                        <select
                            id="questionnaireType"
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="bg-white rounded-lg border border-[#D1D5DB] px-3 py-2 text-sm text-[#1A1A1A] focus:border-[#4A9B9B] focus:outline-none focus:ring-1 focus:ring-[#4A9B9B]"
                        >
                            <option value="standard">Estándar</option>
                            <option value="onboarding">Onboarding (Primer uso)</option>
                            <option value="who5">WHO-5 (Bienestar)</option>
                        </select>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-[#F9FAFB] px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-[#E5E7EB]">
                    <Link
                        href="/admin"
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#4B5563] bg-white border border-[#D1D5DB] shadow-sm hover:bg-gray-50 transition-colors text-center"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-[#2C5F7C] shadow-sm hover:bg-[#245170] transition-colors focus:ring-2 focus:ring-[#4A9B9B] focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : (
                            <>
                                <Save size={16} />
                                Guardar Cuestionario
                            </>
                        )}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
