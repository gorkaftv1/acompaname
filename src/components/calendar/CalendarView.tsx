'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { DailyEmotion, EmotionType } from '@/types';
import { DailyEmotionService } from '@/lib/services/daily-emotion.service';
import { ChatService } from '@/lib/services/chat.service';
import { useAuthStore } from '@/lib/store/auth.store';
import MonthNavigation from './MonthNavigation';
import CalendarGrid from './CalendarGrid';
import TodayCard from './TodayCard';
import CalendarStats from './CalendarStats';
import EmotionLegend from './EmotionLegend';
import CalendarInsights from './CalendarInsights';

/**
 * CalendarView Component
 * 
 * Main calendar view orchestrating all calendar sub-components.
 * Manages state and coordinates data flow between components.
 */
export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [emotionData, setEmotionData] = useState<DailyEmotion[]>([]);
  const [todayChatEmotion, setTodayChatEmotion] = useState<'calm' | 'okay' | 'challenging' | 'mixed' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore(state => state.user);

  // Load emotion data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadEmotionData();
    }
  }, [user]);

  const loadEmotionData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Load both manual emotions and today's chat emotion
      const [emotions, chatEmotionResult] = await Promise.all([
        DailyEmotionService.getAllEmotions(user.id),
        ChatService.getTodayEmotion(),
      ]);
      
      setEmotionData(emotions);
      setTodayChatEmotion(chatEmotionResult.emotion || null);
    } catch (error) {
      console.error('Error loading emotion data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get emotion for specific day
  const getEmotionForDay = (date: Date): DailyEmotion | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    const manualEmotion = emotionData.find((emotion) => emotion.date === dateStr);
    
    // If there's a manual emotion entry, return it
    if (manualEmotion) {
      return manualEmotion;
    }
    
    // For today, if no manual entry but chat emotion exists, create a synthetic entry
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today && todayChatEmotion) {
      return {
        id: 'chat-today',
        userId: user?.id || '',
        date: today,
        emotion: todayChatEmotion,
        intensity: 'medium',
        title: 'Detectado desde el chat',
        content: undefined,
        tags: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    return undefined;
  };

  // Get today's emotion
  const getTodayEmotion = (): DailyEmotion | undefined => {
    return getEmotionForDay(new Date());
  };

  // Calculate most common emotion
  const getMostCommonEmotion = (): EmotionType => {
    if (emotionData.length === 0) return 'calm';

    const counts = emotionData.reduce((acc, emotion) => {
      acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
      return acc;
    }, {} as Record<EmotionType, number>);

    const entries = Object.entries(counts) as [EmotionType, number][];
    entries.sort(([, a], [, b]) => b - a);

    return entries[0]?.[0] || 'calm';
  };

  // Calculate tracking streak (consecutive days with emotion entries)
  const getTrackingStreak = (): number => {
    if (emotionData.length === 0) return 0;

    const sortedEmotions = [...emotionData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const emotion of sortedEmotions) {
      const emotionDate = new Date(emotion.date);
      emotionDate.setHours(0, 0, 0, 0);

      if (isSameDay(emotionDate, currentDate)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Get days in current month with padding for calendar grid
  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  // Count emotions this month
  const getEmotionsThisMonth = (): number => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return emotionData.filter((emotion) => {
      const emotionDate = new Date(emotion.date);
      return emotionDate >= monthStart && emotionDate <= monthEnd;
    }).length;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const calendarDays = getCalendarDays();
  const mostCommonEmotion = getMostCommonEmotion();
  const trackingStreak = getTrackingStreak();
  const emotionsThisMonth = getEmotionsThisMonth();
  const selectedEmotion = getEmotionForDay(selectedDate);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-[#2C5F7C] mb-2">
          Tu Progreso Emocional
        </h1>
        <p className="text-gray-600">
          Visualiza tu bienestar emocional a lo largo del tiempo
        </p>
      </motion.div>

      {/* Selected Day Card */}
      <TodayCard selectedDate={selectedDate} selectedMood={selectedEmotion} />

      {/* Month Navigation */}
      <MonthNavigation
        currentMonth={currentMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Calendar Grid */}
      <CalendarGrid
        calendarDays={calendarDays}
        currentMonth={currentMonth}
        getMoodForDay={getEmotionForDay}
        selectedDate={selectedDate}
        onDayClick={handleDayClick}
      />

      {/* Emotion Legend */}
      <EmotionLegend />

      {/* Statistics Section */}
      <CalendarStats
        moodsThisMonth={emotionsThisMonth}
        mostCommonEmotion={mostCommonEmotion}
        trackingStreak={trackingStreak}
      />

      {/* Insights Section */}
      <CalendarInsights
        totalMoods={emotionData.length}
        moodsThisMonth={emotionsThisMonth}
        trackingStreak={trackingStreak}
        mostCommonEmotion={mostCommonEmotion}
      />
    </div>
  );
}
