/**
 * Emotion Configuration Definitions
 * 
 * Visual and animation configurations for each emotional state
 * in the EmotionalCompanion component.
 * 
 * Each emotion has:
 * - colors: Three-color gradient array for the blob
 * - duration: Animation cycle time for shape morphing
 * - shapes: Four border-radius configurations (looping seamlessly)
 * - meshGradient: Fluid background gradient configuration
 */

import { EmotionType, EmotionConfig } from '@/types';

/**
 * CALM - Serene, peaceful state
 * Visual: Soft green/teal tones with gentle, flowing shapes
 */
const calmConfig: EmotionConfig = {
  colors: ['#A8C5B5', '#4A9B9B', '#6B9E78'],
  duration: 8,
  shapes: [
    '73% 27% 39% 61% / 58% 71% 29% 42%',
    '38% 62% 51% 49% / 72% 28% 63% 37%',
    '61% 39% 28% 72% / 44% 56% 71% 29%',
    '73% 27% 39% 61% / 58% 71% 29% 42%',
  ],
  meshGradient: {
    stops: [
      { color: '#A8C5B5', position: [20, 30], size: 60 },
      { color: '#4A9B9B', position: [70, 40], size: 65 },
      { color: '#6B9E78', position: [50, 75], size: 55 },
    ],
  },
};

/**
 * OKAY - Managing, getting by
 * Visual: Warm amber tones with moderate movement
 */
const okayConfig: EmotionConfig = {
  colors: ['#E8B563', '#D99B7C', '#E8B563'],
  duration: 7,
  shapes: [
    '67% 33% 49% 51% / 39% 68% 32% 61%',
    '44% 56% 63% 37% / 71% 29% 58% 42%',
    '52% 48% 31% 69% / 47% 53% 69% 31%',
    '67% 33% 49% 51% / 39% 68% 32% 61%',
  ],
  meshGradient: {
    stops: [
      { color: '#E8B563', position: [30, 25], size: 60 },
      { color: '#D99B7C', position: [65, 50], size: 62 },
      { color: '#E8B563', position: [45, 80], size: 58 },
    ],
  },
};

/**
 * CHALLENGING - Difficult, stressful state
 * Visual: Coral tones with more intense, sharp shapes
 */
const challengingConfig: EmotionConfig = {
  colors: ['#D99B7C', '#C97064', '#D99B7C'],
  duration: 6,
  shapes: [
    '41% 59% 68% 32% / 63% 37% 51% 49%',
    '78% 22% 36% 64% / 48% 52% 73% 27%',
    '29% 71% 54% 46% / 69% 31% 42% 58%',
    '41% 59% 68% 32% / 63% 37% 51% 49%',
  ],
  meshGradient: {
    stops: [
      { color: '#D99B7C', position: [25, 35], size: 60 },
      { color: '#C97064', position: [75, 45], size: 63 },
      { color: '#D99B7C', position: [50, 70], size: 57 },
    ],
  },
};

/**
 * MIXED - Processing, uncertain state
 * Visual: Lavender/teal mix with slower, contemplative movement
 */
const mixedConfig: EmotionConfig = {
  colors: ['#B4A5C7', '#A8C5B5', '#4A9B9B'],
  duration: 9,
  shapes: [
    '56% 44% 42% 58% / 67% 33% 48% 52%',
    '35% 65% 71% 29% / 52% 48% 69% 31%',
    '64% 36% 27% 73% / 41% 59% 54% 46%',
    '56% 44% 42% 58% / 67% 33% 48% 52%',
  ],
  meshGradient: {
    stops: [
      { color: '#B4A5C7', position: [35, 30], size: 60 },
      { color: '#A8C5B5', position: [60, 55], size: 62 },
      { color: '#4A9B9B', position: [50, 75], size: 58 },
    ],
  },
};

/**
 * Centralized emotion configurations
 * Export as Record for type-safe access
 */
export const emotionConfigs: Record<EmotionType, EmotionConfig> = {
  calm: calmConfig,
  okay: okayConfig,
  challenging: challengingConfig,
  mixed: mixedConfig,
};

/**
 * Helper function to get emotion config safely
 * @param emotion - The emotion type
 * @returns The corresponding emotion configuration
 */
export function getEmotionConfig(emotion: EmotionType): EmotionConfig {
  return emotionConfigs[emotion];
}

/**
 * Get all available emotion types
 * @returns Array of emotion type strings
 */
export function getAvailableEmotions(): EmotionType[] {
  return Object.keys(emotionConfigs) as EmotionType[];
}
