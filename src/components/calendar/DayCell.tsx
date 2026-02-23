'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import { DailyEmotion, EmotionType } from '@/types';

const EMOTION_LABELS: Record<EmotionType, string> = {
  calm: 'Tranquilo',
  okay: 'Bien',
  challenging: 'Desafiante',
  mixed: 'Mixto',
};

interface DayCellProps {
  day: Date;
  mood?: DailyEmotion;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * DayCell Component
 * 
 * Displays a single day in the calendar with optional mood indicator.
 * Shows EmotionalCompanion blob if mood data exists for that day.
 */
export default function DayCell({
  day,
  mood,
  isCurrentMonth,
  isToday,
  isSelected,
  onClick,
}: DayCellProps) {
  const dayNumber = format(day, 'd');

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        aspect-square flex flex-col items-center justify-center p-2 rounded-lg
        cursor-pointer hover:bg-gray-50 transition-colors
        ${isToday ? 'ring-2 ring-[#4A9B9B] bg-[#4A9B9B]/5' : ''}
        ${isSelected && !isToday ? 'ring-2 ring-[#2C5F7C] bg-[#2C5F7C]/5' : ''}
        ${!isCurrentMonth ? 'opacity-30' : ''}
      `}
      onClick={onClick}
      aria-label={`${format(day, 'PPP', { locale: es })}${
        mood ? ` - ${EMOTION_LABELS[mood.emotion]}` : ''
      }`}
      role="button"
      tabIndex={0}
    >
      {/* Day number */}
      <span
        className={`text-xs md:text-sm mb-1 md:mb-2 ${
          isToday ? 'font-bold text-[#4A9B9B]' : 'text-gray-500'
        }`}
      >
        {dayNumber}
      </span>

      {/* EmotionalCompanion if mood exists */}
      {mood ? (
        <EmotionalCompanion
          size={36}
          emotion={mood.emotion}
          animated={false}
          intensity="low"
        />
      ) : (
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-200" />
      )}
    </motion.div>
  );
}
