'use client';

/**
 * QuestionnaireLoadingScreen — Estado de carga inicial del cuestionario
 *
 * Se muestra mientras se cargan las preguntas desde Supabase.
 * Diseño empático, coherente con la paleta de AcompañaMe.
 */

import { motion } from 'framer-motion';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';

export default function QuestionnaireLoadingScreen() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 gap-8 text-center"
        >
            {/* Companion animado */}
            <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
                <EmotionalCompanion emotion="calm" size={120} />
            </motion.div>

            {/* Spinner + texto */}
            <div className="space-y-3">
                <div className="flex justify-center">
                    <span className="w-8 h-8 border-4 border-[#4A9B9B]/30 border-t-[#4A9B9B] rounded-full animate-spin" />
                </div>
                <p className="text-deep-calm-blue font-semibold text-lg">
                    Preparando tu cuestionario…
                </p>
                <p className="text-deep-calm-blue/60 text-sm max-w-3xl mx-auto">
                    Solo tardará un momento. Estamos cargando las preguntas para conocerte mejor.
                </p>
            </div>
        </motion.div>
    );
}
