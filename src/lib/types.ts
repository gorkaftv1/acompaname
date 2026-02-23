/**
 * @deprecated This file has been moved to src/types/
 * 
 * All type definitions have been centralized to the /types directory.
 * Please update your imports to use '@/types' instead of '@/lib/types'.
 * 
 * This file is kept temporarily for backward compatibility.
 */

// Re-export all types from the new location
export type {
  EmotionType,
  IntensityType,
  EmotionConfig,
  EmotionalCompanionProps,
  User,
  LoginCredentials,
  AuthResponse,
  DailyEmotion,
  JournalEntry,
  MoodEntry,
  AIResponse,
  CalendarEventType,
  CalendarEvent,
} from '@/types';
