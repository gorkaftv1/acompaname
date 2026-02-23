'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui';

interface MonthNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

/**
 * MonthNavigation Component
 * 
 * Displays current month/year with navigation arrows.
 * Allows users to move between months to view mood history.
 */
export default function MonthNavigation({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}: MonthNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex items-center justify-between mb-6"
    >
      <Button
        onClick={onPreviousMonth}
        variant="secondary"
        className="px-4 py-2"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <h2 className="text-xl md:text-2xl font-bold text-[#2C5F7C] capitalize">
        {format(currentMonth, 'MMMM yyyy', { locale: es })}
      </h2>

      <Button
        onClick={onNextMonth}
        variant="secondary"
        className="px-4 py-2"
        aria-label="Mes siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </motion.div>
  );
}
