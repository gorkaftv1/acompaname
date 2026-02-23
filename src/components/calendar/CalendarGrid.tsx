'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { DailyEmotion } from '@/types';
import DayCell from './DayCell';

interface CalendarGridProps {
  calendarDays: Date[];
  currentMonth: Date;
  getMoodForDay: (date: Date) => DailyEmotion | undefined;
  selectedDate: Date;
  onDayClick: (day: Date) => void;
}

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * CalendarGrid Component
 * 
 * Displays the calendar grid with week day headers and all day cells.
 * Handles the layout and spacing for the calendar view.
 */
export default function CalendarGrid({
  calendarDays,
  currentMonth,
  getMoodForDay,
  selectedDate,
  onDayClick,
}: CalendarGridProps) {
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-4 md:p-6">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {calendarDays.map((day, index) => {
            const mood = getMoodForDay(day);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);
            const isSelectedDay = isSelected(day);

            return (
              <DayCell
                key={index}
                day={day}
                mood={mood}
                isCurrentMonth={isCurrentMonthDay}
                isToday={isTodayDay}
                isSelected={isSelectedDay}
                onClick={() => onDayClick(day)}
              />
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
