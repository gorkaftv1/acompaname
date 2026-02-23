'use client';

/**
 * QuestionText — Pregunta de tipo 'text'
 *
 * Muestra un textarea libre para que el usuario redacte su respuesta.
 * Al pulsar "Siguiente", el motor buscará la opción fantasma de esta
 * pregunta para determinar el next_question_id.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface QuestionTextProps {
    questionText: string;
    /** Se llama cuando el usuario pulsa "Siguiente", con el texto escrito (puede ser vacío). */
    onSubmit: (value: string) => void;
    /** Deshabilita el formulario mientras se guarda la respuesta. */
    disabled?: boolean;
}

export default function QuestionText({
    questionText,
    onSubmit,
    disabled = false,
}: QuestionTextProps) {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        onSubmit(text.trim());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Ctrl/Cmd + Enter para enviar
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <motion.div
            key={questionText}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
        >
            {/* Texto de la pregunta */}
            <h2 className="text-xl md:text-2xl font-semibold text-deep-calm-blue leading-snug">
                {questionText}
            </h2>

            {/* Área de texto */}
            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    rows={5}
                    placeholder="Escribe aquí con libertad…"
                    className={`
            w-full resize-none rounded-xl border-2 border-gray-200 bg-white
            px-4 py-3 text-sm md:text-base text-deep-calm-blue placeholder-gray-400
            leading-relaxed transition-all duration-200
            focus:outline-none focus:border-[#4A9B9B] focus:ring-2 focus:ring-[#4A9B9B]/20
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                />
                <p className="mt-1.5 text-xs text-gray-400 select-none">
                    Puedes pulsar <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">Ctrl</kbd>+<kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">Enter</kbd> para continuar
                </p>
            </div>

            {/* Botón Siguiente */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={disabled}
                    className={`
            inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-[#4A9B9B] to-[#6B9E78] text-white shadow-md
            hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9B9B]
          `}
                >
                    {disabled ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Guardando…
                        </>
                    ) : (
                        <>
                            Siguiente
                            <ChevronRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}
