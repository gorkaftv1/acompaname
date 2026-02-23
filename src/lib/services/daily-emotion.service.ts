/**
 * Daily Emotion Service
 *
 * Gestiona las emociones diarias del usuario (estado emocional + reflexiones).
 *
 * RLS:
 *  - SELECT / INSERT / UPDATE / DELETE → solo el propio usuario (auth.uid() = user_id)
 *
 * Saneamiento:
 *  - El proxy withAutoTrim() cubre .insert(), .upsert() y .update().
 *  - El auto-trim garantiza que no se persistan strings con espacios en los bordes.
 */

import { createBrowserClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import type { Database } from '@/lib/supabase/database.types';
import type { DailyEmotion } from '@/types';

// ---------------------------------------------------------------------------
// Tipo interno (extraído una sola vez, DRY)
// ---------------------------------------------------------------------------
type DailyEmotionRow = Database['public']['Tables']['daily_emotions']['Row'];
type DailyEmotionInsert = Database['public']['Tables']['daily_emotions']['Insert'];

// ---------------------------------------------------------------------------
// Helper de mapeo (snake_case DB → camelCase dominio)
// ---------------------------------------------------------------------------
function mapRowToEmotion(row: DailyEmotionRow): DailyEmotion {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    emotion: row.emotion,
    intensity: row.intensity,
    title: row.title ?? undefined,
    content: row.content ?? undefined,
    tags: row.tags ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Servicio
// ---------------------------------------------------------------------------
export class DailyEmotionService {
  /**
   * Obtiene todas las emociones del usuario, ordenadas por fecha descendente.
   */
  static async getAllEmotions(userId: string): Promise<DailyEmotion[]> {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('daily_emotions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .returns<DailyEmotionRow[]>();

    if (error) {
      logger.error('DailyEmotionService', 'getAllEmotions failed', error);
      return [];
    }

    return data.map(mapRowToEmotion);
  }

  /**
   * Obtiene las emociones de un rango de fechas (inclusive).
   */
  static async getEmotionsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<DailyEmotion[]> {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('daily_emotions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .returns<DailyEmotionRow[]>();

    if (error) {
      logger.error('DailyEmotionService', 'getEmotionsByDateRange failed', error);
      return [];
    }

    return data.map(mapRowToEmotion);
  }

  /**
   * Obtiene la emoción de una fecha específica.
   * Devuelve null si no existe registro para ese día.
   */
  static async getEmotionByDate(
    userId: string,
    date: string,
  ): Promise<DailyEmotion | null> {
    const supabase = createBrowserClient();

    const { data, error } = await supabase
      .from('daily_emotions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single<DailyEmotionRow>();

    if (error) {
      // PGRST116 = no row found — es un caso válido, no un error
      if (error.code === 'PGRST116') return null;
      logger.error('DailyEmotionService', 'getEmotionByDate failed', error);
      return null;
    }

    return mapRowToEmotion(data);
  }

  /**
   * Crea o actualiza la emoción del día (upsert por user_id + date).
   * El proxy auto-trim garantiza que title, content y tags estén saneados.
   */
  static async saveEmotion(
    userId: string,
    emotion: Omit<DailyEmotion, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<DailyEmotion | null> {
    const supabase = createBrowserClient();

    const payload: DailyEmotionInsert = {
      user_id: userId,
      date: emotion.date,
      emotion: emotion.emotion,
      intensity: emotion.intensity,
      title: emotion.title ?? null,
      content: emotion.content ?? null,
      tags: emotion.tags ?? null,
    };

    const { data, error } = await supabase
      .from('daily_emotions')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select()
      .single<DailyEmotionRow>();

    if (error) {
      logger.error('DailyEmotionService', 'saveEmotion failed', error);
      return null;
    }

    return mapRowToEmotion(data);
  }

  /**
   * Elimina la emoción de una fecha específica.
   */
  static async deleteEmotion(userId: string, date: string): Promise<boolean> {
    const supabase = createBrowserClient();

    const { error } = await supabase
      .from('daily_emotions')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      logger.error('DailyEmotionService', 'deleteEmotion failed', error);
      return false;
    }

    return true;
  }

  /**
   * Devuelve estadísticas agregadas de las emociones del usuario.
   * Se calcula en memoria a partir de getAllEmotions().
   */
  static async getEmotionStats(userId: string): Promise<{
    total: number;
    byEmotion: Record<string, number>;
    byIntensity: Record<string, number>;
  }> {
    const emotions = await this.getAllEmotions(userId);

    const byEmotion: Record<string, number> = {};
    const byIntensity: Record<string, number> = {};

    for (const entry of emotions) {
      byEmotion[entry.emotion] = (byEmotion[entry.emotion] ?? 0) + 1;
      byIntensity[entry.intensity] = (byIntensity[entry.intensity] ?? 0) + 1;
    }

    return { total: emotions.length, byEmotion, byIntensity };
  }
}
