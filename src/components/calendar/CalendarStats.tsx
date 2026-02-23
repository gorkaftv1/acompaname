'use client';

import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import { EmotionType } from '@/types';

const EMOTION_LABELS: Record<EmotionType, string> = {
  calm: 'Tranquilo',
  okay: 'Bien',
  challenging: 'Desafiante',
  mixed: 'Mixto',
};

interface CalendarStatsProps {
  moodsThisMonth: number;
  mostCommonEmotion: EmotionType;
  trackingStreak: number;
}

/**
 * CalendarStats Component
 * 
 * Displays key statistics about the user's mood tracking:
 * - Days tracked this month
 * - Most common emotion
 * - Current tracking streak
 */
export default function CalendarStats({
  moodsThisMonth,
  mostCommonEmotion,
  trackingStreak,
}: CalendarStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="p-6">
        <h3 className="text-xl font-bold text-[#2C5F7C] mb-6">
          Estadísticas del Mes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Days tracked */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#4A9B9B]/10 flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-[#4A9B9B]" />
            </div>
            <div className="text-4xl font-bold text-[#4A9B9B]">
              {moodsThisMonth}
            </div>
            <p className="text-sm text-gray-600">días registrados este mes</p>
          </div>

          {/* Most common emotion */}
          <div className="flex flex-col items-center text-center space-y-3">
            <EmotionalCompanion
              size={80}
              emotion={mostCommonEmotion}
              animated={true}
              intensity="medium"
            />
            <div className="text-lg font-medium text-[#2C5F7C]">
              {EMOTION_LABELS[mostCommonEmotion]}
            </div>
            <p className="text-sm text-gray-600">Tu emoción más frecuente</p>
          </div>

          {/* Current streak */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#6B9E78]/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#6B9E78]" />
            </div>
            <div className="text-4xl font-bold text-[#6B9E78]">
              {trackingStreak}
            </div>
            <p className="text-sm text-gray-600">días seguidos registrando</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
