'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { EmotionType } from '@/types';

const EMOTION_LABELS: Record<EmotionType, string> = {
  calm: 'Tranquilo',
  okay: 'Bien',
  challenging: 'Desafiante',
  mixed: 'Mixto',
};

interface CalendarInsightsProps {
  totalMoods: number;
  moodsThisMonth: number;
  trackingStreak: number;
  mostCommonEmotion: EmotionType;
}

/**
 * CalendarInsights Component
 * 
 * Displays personalized insights and observations about the user's
 * mood tracking patterns and progress.
 */
export default function CalendarInsights({
  totalMoods,
  moodsThisMonth,
  trackingStreak,
  mostCommonEmotion,
}: CalendarInsightsProps) {
  if (totalMoods === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="p-6">
        <h3 className="text-xl font-bold text-[#2C5F7C] mb-4">
          Observaciones
        </h3>
        <div className="space-y-3 text-gray-700">
          <p className="flex items-start gap-2">
            <span className="text-[#4A9B9B] mt-1">•</span>
            <span>
              Has registrado tus emociones <strong>{totalMoods}</strong> veces en total.
            </span>
          </p>
          
          {trackingStreak > 0 && (
            <p className="flex items-start gap-2">
              <span className="text-[#6B9E78] mt-1">•</span>
              <span>
                ¡Excelente! Llevas <strong>{trackingStreak}</strong> día{trackingStreak > 1 ? 's' : ''}{' '}
                seguido{trackingStreak > 1 ? 's' : ''} registrando tu estado emocional.
              </span>
            </p>
          )}
          
          <p className="flex items-start gap-2">
            <span className="text-[#E8B563] mt-1">•</span>
            <span>
              Tu emoción predominante este mes ha sido:{' '}
              <strong>{EMOTION_LABELS[mostCommonEmotion]}</strong>
            </span>
          </p>
          
          {moodsThisMonth > 0 && (
            <p className="flex items-start gap-2">
              <span className="text-[#D99B7C] mt-1">•</span>
              <span>
                Este mes has registrado tu estado <strong>{moodsThisMonth}</strong> veces. ¡Sigue así!
              </span>
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
