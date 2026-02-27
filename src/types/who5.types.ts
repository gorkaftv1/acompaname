import type { EmotionType } from '@/types';

export interface WHO5ScoreCategory {
  label: string;
  emotion: EmotionType;
  description: string;
  /** Minimum score (inclusive) */
  min: number;
  /** Maximum score (inclusive) */
  max: number;
}

export interface WHO5Result {
  rawScore: number;
  finalScore: number;
  category: WHO5ScoreCategory;
}
