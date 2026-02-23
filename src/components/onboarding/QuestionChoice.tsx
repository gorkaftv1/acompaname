'use client';

/**
 * QuestionChoice — Pregunta de tipo single_choice
 *
 * Muestra el texto de la pregunta y las opciones como tarjetas interactivas.
 * Al hacer clic en una opción, llama a `onSelect` de forma inmediata
 * (sin necesidad de un paso extra de confirmación).
 */

import { motion } from 'framer-motion';
import type { OptionNode } from '@/lib/services/questionnaire-engine.types';

interface QuestionChoiceProps {
    questionText: string;
    options: OptionNode[];
    /** Se llama cuando el usuario selecciona una opción. No incluye las opciones fantasma. */
    onSelect: (option: OptionNode) => void;
    /** Deshabilita los botones mientras se guarda la respuesta. */
    disabled?: boolean;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function QuestionChoice({
    questionText,
    options,
    onSelect,
    disabled = false,
}: QuestionChoiceProps) {
    // Las opciones fantasma nunca se muestran al usuario.
    const visibleOptions = options.filter((o) => !o.isPhantom);

    return (
        <motion.div
            key={questionText}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Texto de la pregunta */}
            <h2 className="text-xl md:text-2xl font-semibold text-deep-calm-blue leading-snug">
                {questionText}
            </h2>

            {/* Opciones */}
            <motion.ul
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {visibleOptions.map((option) => (
                    <motion.li key={option.id} variants={itemVariants}>
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => onSelect(option)}
                            className={`
                w-full text-left px-5 py-4 rounded-xl border-2 text-sm md:text-base
                font-medium leading-snug transition-all duration-200
                bg-white text-deep-calm-blue border-gray-200
                hover:border-[#4A9B9B] hover:bg-teal-50/60 hover:shadow-md
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9B9B]
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-[0.98]
              `}
                        >
                            {option.optionText}
                        </button>
                    </motion.li>
                ))}
            </motion.ul>
        </motion.div>
    );
}
