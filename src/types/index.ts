/**
 * Type Definitions Index
 * 
 * Central export point for all application types.
 */

// Common types (EmotionType, User, DailyEmotion, etc.)
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
} from './common.types';

// Onboarding types
export type { OnboardingFormData, ProfileUpdate } from './onboarding.types';
export { defaultOnboardingFormData } from './onboarding.types';

// Database types
export type { Database } from '@/lib/supabase/database.types';
