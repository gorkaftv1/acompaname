/**
 * Centralized type definitions for the Companion app
 * 
 * This file contains all shared TypeScript types and interfaces
 * used across the Companion caregiver support application.
 */

import { MeshGradientStop } from '@/lib/animations/mesh-gradient';

/**
 * Emotion types supported by the companion
 * 
 * - calm: Serene, peaceful state with green/teal tones
 * - okay: Managing state with amber tones  
 * - challenging: Difficult state with coral tones
 * - mixed: Processing/uncertain state with lavender tones
 */
export type EmotionType = 'calm' | 'okay' | 'challenging' | 'mixed';

/**
 * Intensity levels for movement and animation
 * 
 * - low: Subtle, gentle movement (scale: 1.0 → 1.03)
 * - medium: Moderate, noticeable movement (scale: 1.0 → 1.05)
 * - high: More pronounced, energetic movement (scale: 1.0 → 1.08)
 */
export type IntensityType = 'low' | 'medium' | 'high';

/**
 * Configuration for each emotional state
 * 
 * Defines the visual appearance and animation behavior
 * for each emotion type in the EmotionalCompanion component.
 */
export interface EmotionConfig {
  /**
   * Three-color gradient array [start, middle, end]
   */
  colors: [string, string, string];

  /**
   * Animation duration in seconds for the morphing cycle
   */
  duration: number;

  /**
   * Four border-radius shapes for seamless looping
   * 
   * The first shape is repeated at the end (4th position) to create
   * a smooth, seamless loop without visual jumps.
   */
  shapes: [string, string, string, string];

  /**
   * Mesh gradient configuration for fluid background animation
   */
  meshGradient: {
    stops: MeshGradientStop[];
  };
}

/**
 * Props for the EmotionalCompanion component
 */
export interface EmotionalCompanionProps {
  /**
   * Size of the companion blob in pixels
   * @default 200
   */
  size?: number;

  /**
   * Current emotional state of the companion
   * @default 'calm'
   */
  emotion?: EmotionType;

  /**
   * Whether to animate the companion
   * @default true
   */
  animated?: boolean;

  /**
   * Intensity of movement and animation
   * @default 'medium'
   */
  intensity?: IntensityType;
}

// ============================================================================
// User & Authentication Types
// ============================================================================

/**
 * User account information
 */
export interface User {
  /**
   * Unique user identifier
   */
  id: string;

  /**
   * User's full name
   */
  name: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * Account creation date (ISO string)
   */
  createdAt: string;

  /**
   * User role: admin or regular user
   */
  role?: 'admin' | 'user';

  /**
   * Name of the person being cared for (optional)
   */
  caregivingFor?: string;

  /**
   * Relationship with the person being cared for (optional)
   */
  relationshipType?: string;

  /**
   * Condition or diagnosis of the person being cared for (optional)
   */
  condition?: string;

  /**
   * Duration of caregiving (optional)
   */
  caregivingDuration?: string;

  /**
   * Main challenges faced as a caregiver (optional)
   */
  mainChallenges?: string[];

  /**
   * Specific support needs (optional)
   */
  supportNeeds?: string;

  /**
   * AI communication tone preference
   */
  aiTone?: 'formal' | 'casual' | 'friendly';

  /**
   * Preferred response style
   */
  preferredLanguageStyle?: 'direct' | 'detailed' | 'balanced';

  /**
   * Notification preferences
   */
  notificationPreferences?: {
    dailyReminders?: boolean;
    emotionalSuggestions?: boolean;
    weeklyProgress?: boolean;
  };

  /**
   * @deprecated Legacy field - use individual preference fields instead
   */
  emotionalProfile?: {
    primaryConcerns: string[];
    communicationPreferences: {
      aiTone?: string;
      preferredLanguageStyle?: string;
      caregivingDuration?: string;
      [key: string]: any;
    };
  };
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  /**
   * User email
   */
  email: string;

  /**
   * User password
   */
  password: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  /**
   * Whether authentication was successful
   */
  success: boolean;

  /**
   * User object if authentication succeeded
   */
  user?: User;

  /**
   * Authentication token if successful
   */
  token?: string;

  /**
   * Error message if authentication failed
   */
  error?: string;
}

// ============================================================================
// Journal Types
// ============================================================================

/**
 * Journal entry for caregiver reflections
 */
// ============================================================================
// Daily Emotions Types (Unificado: Mood + Journal)
// ============================================================================

/**
 * Daily emotion entry - combina estado emocional y reflexiones del día
 */
export interface DailyEmotion {
  /**
   * Unique entry identifier
   */
  id: string;

  /**
   * User who created the entry
   */
  userId: string;

  /**
   * Date of the entry (ISO 8601 date string: YYYY-MM-DD)
   */
  date: string;

  /**
   * Emotional state of the day
   */
  emotion: EmotionType;

  /**
   * Intensity level of the emotion
   */
  intensity: 'low' | 'medium' | 'high';

  /**
   * Optional title for the day's reflection
   */
  title?: string;

  /**
   * Optional detailed content/notes about the day
   */
  content?: string;

  /**
   * Optional tags for categorization
   */
  tags?: string[];

  /**
   * Creation timestamp
   */
  createdAt?: string;

  /**
   * Last update timestamp
   */
  updatedAt?: string;
}

// ============================================================================
// DEPRECATED: Types kept for backward compatibility
// ============================================================================

/** @deprecated Use DailyEmotion instead */
export interface JournalEntry {
  id: string;
  userId: string;
  date: Date;
  emotion: EmotionType;
  title: string;
  content: string;
  tags?: string[];
}

/** @deprecated Use DailyEmotion instead */
export interface MoodEntry {
  id: string;
  userId: string;
  date: string;
  emotion: EmotionType;
  intensity: number;
  notes?: string;
}

// ============================================================================
// AI Types
// ============================================================================

/**
 * AI response with suggestions
 */
export interface AIResponse {
  /**
   * Response message
   */
  message: string;

  /**
   * Detected or suggested emotion
   */
  emotion?: EmotionType;

  /**
   * Actionable suggestions
   */
  suggestions?: string[];
}

// ============================================================================
// Calendar Types
// ============================================================================

/**
 * Calendar event types
 */
export type CalendarEventType = 'appointment' | 'medication' | 'task' | 'reminder';

/**
 * Calendar event
 */
export interface CalendarEvent {
  /**
   * Unique event identifier
   */
  id: string;

  /**
   * Event title
   */
  title: string;

  /**
   * Event date and time
   */
  date: Date;

  /**
   * Type of event
   */
  type: CalendarEventType;

  /**
   * Whether the event/task is completed
   */
  completed?: boolean;

  /**
   * Additional notes
   */
  notes?: string;
}
