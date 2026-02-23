/**
 * Onboarding Type Definitions
 * 
 * Types for the multi-step onboarding flow.
 */

import type { Database } from '@/lib/supabase/database.types';

/**
 * Profile update type for Supabase
 */
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Form data collected during onboarding process
 */
export interface OnboardingFormData {
  // Step 1: About the Person You Care For
  userName: string;
  caregivingFor: string;
  relationshipType: string;
  condition: string;
  
  // Step 2: About You as a Caregiver
  caregivingDuration: string;
  mainChallenges: string[];
  supportNeeds: string;
  
  // Step 3: AI Companion Preferences
  aiTone: 'formal' | 'casual' | 'friendly';
  preferredLanguageStyle: 'direct' | 'detailed' | 'balanced';
  notificationPreferences: {
    dailyReminders: boolean;
    emotionalSuggestions: boolean;
    weeklyProgress: boolean;
  };
}

/**
 * Default values for onboarding form
 */
export const defaultOnboardingFormData: OnboardingFormData = {
  // Step 1
  userName: '',
  caregivingFor: '',
  relationshipType: '',
  condition: '',
  
  // Step 2
  caregivingDuration: '',
  mainChallenges: [],
  supportNeeds: '',
  
  // Step 3
  aiTone: 'friendly',
  preferredLanguageStyle: 'balanced',
  notificationPreferences: {
    dailyReminders: true,
    emotionalSuggestions: true,
    weeklyProgress: true,
  },
};
