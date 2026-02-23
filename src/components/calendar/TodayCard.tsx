'use client';

import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import { DailyEmotion, EmotionType } from '@/types';

const EMOTION_LABELS: Record<EmotionType, string> = {
  calm: 'Tranquilo',
  okay: 'Bien',
  challenging: 'Desafiante',
  mixed: 'Mixto',
};

interface TodayCardProps {
  selectedDate: Date;
  selectedMood?: DailyEmotion;
}

/**
 * TodayCard Component
 * 
 * Highlighted card displaying the selected day's mood with details.
 * Shows the user's emotional state for the selected day with notes if available.
 */
export default function TodayCard({ selectedDate, selectedMood }: TodayCardProps) {
  const isTodaySelected = isToday(selectedDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <Card className="p-6 bg-gradient-to-br from-[#4A9B9B]/5 to-[#6B9E78]/5 border-l-4 border-[#4A9B9B]">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <EmotionalCompanion
              size={80}
              emotion={selectedMood?.emotion || 'calm'}
              animated={true}
              intensity="medium"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-xl font-bold text-[#2C5F7C]">
                {isTodaySelected ? 'Hoy' : format(selectedDate, 'd MMMM', { locale: es })}
              </h3>
              <span className="text-sm text-gray-600">
                {format(selectedDate, 'EEEE', { locale: es })}
              </span>
            </div>
            
            {selectedMood ? (
              <>
                <p className="text-lg font-medium text-[#2C5F7C] mb-2">
                  Te {isTodaySelected ? 'sientes' : 'sentiste'}: <span className="text-[#4A9B9B]">{EMOTION_LABELS[selectedMood.emotion]}</span>
                  {selectedMood.intensity && (
                    <span className="text-sm text-gray-600 ml-2">
                      (Intensidad: {selectedMood.intensity === 'low' ? 'Baja' : selectedMood.intensity === 'medium' ? 'Media' : 'Alta'})
                    </span>
                  )}
                </p>
                {selectedMood.title && (
                  <p className="text-base font-medium text-gray-800 mb-1">
                    {selectedMood.title}
                  </p>
                )}
                {selectedMood.content && (
                  <p className="text-sm text-gray-700 italic line-clamp-3">
                    &quot;{selectedMood.content}&quot;
                  </p>
                )}
                {selectedMood.tags && selectedMood.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedMood.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-[#4A9B9B]/10 text-[#2C5F7C] rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-600">
                {isTodaySelected 
                  ? 'Aún no has registrado tu estado emocional hoy.'
                  : 'No hay registro de estado emocional para este día.'}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
