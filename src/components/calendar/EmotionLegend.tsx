'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';

/**
 * EmotionLegend Component
 * 
 * Displays a visual legend explaining the different emotion colors.
 * Helps users understand the meaning of each mood indicator.
 */
export default function EmotionLegend() {
  const emotions = [
    { type: 'calm' as const, label: 'Tranquilo', description: 'Estado sereno y equilibrado' },
    { type: 'okay' as const, label: 'Bien', description: 'Manejando la situación' },
    { type: 'challenging' as const, label: 'Desafiante', description: 'Día difícil o estresante' },
    { type: 'mixed' as const, label: 'Mixto', description: 'Emociones variadas' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <Card className="p-6">
        <h3 className="text-xl font-bold text-[#2C5F7C] mb-4">
          Guía de Emociones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {emotions.map((emotion) => (
            <div
              key={emotion.type}
              className="flex flex-col items-center text-center space-y-2"
            >
              <EmotionalCompanion
                size={50}
                emotion={emotion.type}
                animated={false}
                intensity="low"
              />
              <div>
                <p className="font-medium text-[#2C5F7C] text-sm">
                  {emotion.label}
                </p>
                <p className="text-xs text-gray-600">
                  {emotion.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
