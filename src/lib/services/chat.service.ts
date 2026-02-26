/**
 * Chat Service
 *
 * Gestiona la persistencia de mensajes de chat en Supabase.
 *
 * RLS:
 *  - SELECT / INSERT / DELETE → solo el propio usuario (auth.uid() = user_id)
 *
 * Saneamiento:
 *  - El proxy withAutoTrim() garantiza que `content` no tenga espacios en los bordes.
 */

import { createBrowserClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import type { Database } from '@/lib/supabase/database.types';

// ---------------------------------------------------------------------------
// Tipos internos (derivados directamente del schema tipado)
// ---------------------------------------------------------------------------
type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'];
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];

// ---------------------------------------------------------------------------
// Successful API / n8n response
// ---------------------------------------------------------------------------
export interface ChatApiMessage {
  id: string;
  user_id: string;
  role: string;
  content: string;
  emotion: 'calm' | 'okay' | 'challenging' | 'mixed';
  created_at: string;
}
type ChatApiSuccess = ChatApiMessage | ChatApiMessage[];

// ---------------------------------------------------------------------------
// Tipo de dominio (camelCase)
// ---------------------------------------------------------------------------
export interface MessageData {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  emotion?: 'calm' | 'okay' | 'challenging' | 'mixed' | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------
function mapRowToMessage(row: ChatMessageRow): MessageData {
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    content: row.content,
    emotion: row.emotion,
    createdAt: row.created_at,
  };
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = createBrowserClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

// ---------------------------------------------------------------------------
// Servicio
// ---------------------------------------------------------------------------
export class ChatService {
  /**
   * Envía un mensaje del usuario y guarda la respuesta de IA.
   * Ambos mensajes se persisten en la base de datos.
   */
  static async sendMessage(data: {
    content: string;
    emotion?: 'calm' | 'okay' | 'challenging' | 'mixed';
  }): Promise<{
    success: boolean;
    userMessage?: MessageData;
    aiMessage?: MessageData;
    error?: string;
  }> {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const supabase = createBrowserClient();


      const userPayload: ChatMessageInsert = {
        user_id: userId,
        role: 'user',
        content: data.content,
        emotion: null,
      };

      const { data: userMessageRow, error: userMessageError } = await supabase
        .from('chat_messages')
        .insert(userPayload)
        .select()
        .single<ChatMessageRow>();

      if (userMessageError) {
        logger.error('ChatService', 'sendMessage: error al guardar mensaje de usuario', userMessageError);
        return { success: false, error: 'Error al enviar el mensaje' };
      }

      const userMessage = mapRowToMessage(userMessageRow);

      const apiRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: data.content,
          currentEmotion: data.emotion ?? null,
        }),
      });

      const rawText = await apiRes.text();
      const apiData: Record<string, unknown> = rawText
        ? (() => { try { return JSON.parse(rawText) as Record<string, unknown>; } catch { return {}; } })()
        : {};

      if (!apiRes.ok) {
        const err = String(apiData?.error ?? 'Error al obtener respuesta de la IA');
        const errorMsg = apiData?.details
          ? `${err} (${String(apiData.details).slice(0, 120)})`
          : err;
        logger.error('ChatService', 'sendMessage: error API chat', errorMsg);
        return {
          success: false,
          userMessage,
          error: errorMsg,
        };
      }

      const raw = (Array.isArray(apiData?.data) ? apiData.data : apiData) as ChatApiSuccess;
      const msg: ChatApiMessage | undefined = Array.isArray(raw) ? raw[0] : raw;
      const content = msg?.content ?? (msg as { message?: string })?.message;
      if (!msg || typeof content !== 'string') {
        logger.warn('ChatService', 'sendMessage: response without message', {
          isArray: Array.isArray(apiData),
          hasData: !!apiData?.data,
          keys: typeof apiData === 'object' && apiData !== null ? Object.keys(apiData) : [],
          preview: typeof apiData === 'object' ? JSON.stringify(apiData).slice(0, 300) : String(apiData),
        });
        return { success: false, userMessage, error: 'AI User Message Error' };
      }

      const emotion = ['calm', 'okay', 'challenging', 'mixed'].includes(msg.emotion)
        ? msg.emotion
        : null;

      const aiMessage: MessageData = {
        id: (msg as ChatApiMessage).id ?? `n8n-${Date.now()}`,
        userId,
        role: 'assistant',
        content,
        emotion: emotion,
        createdAt: (msg as ChatApiMessage).created_at ?? new Date().toISOString(),
      };

      return { success: true, userMessage, aiMessage };
    } catch (error) {
      logger.error('ChatService', 'sendMessage: error inesperado', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'TimeOut' };
      }
      return { success: false, error: 'System Error' };
    }
  }

  /**
   * Obtiene el historial de chat del usuario autenticado.
   *
   * @param limit - Máximo de mensajes a devolver (default: 100).
   * @param beforeDate - Paginación: mensajes anteriores a esta fecha.
   */
  static async getChatHistory(options?: {
    limit?: number;
    beforeDate?: Date;
  }): Promise<{ success: boolean; messages?: MessageData[]; error?: string }> {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const supabase = createBrowserClient();
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (options?.beforeDate) {
        query = query.lt('created_at', options.beforeDate.toISOString());
      }

      query = query.limit(options?.limit ?? 100);

      const { data: messages, error } = await query;

      if (error) {
        logger.error('ChatService', 'getChatHistory failed', error);
        return { success: false, error: 'Error al obtener el historial del chat' };
      }

      return { success: true, messages: messages.map(mapRowToMessage) };
    } catch (error) {
      logger.error('ChatService', 'getChatHistory: error inesperado', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'Error de conexión. Intenta recargar la página.' };
      }
      return { success: false, error: 'Error inesperado al obtener el historial' };
    }
  }

  /**
   * Devuelve los últimos N mensajes en orden cronológico (más antiguo primero).
   * Útil para proporcionar contexto conversacional a la IA.
   */
  static async getRecentMessages(count: number = 10): Promise<{
    success: boolean;
    messages?: MessageData[];
    error?: string;
  }> {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const supabase = createBrowserClient();
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(count)
        .returns<ChatMessageRow[]>();

      if (error) {
        logger.error('ChatService', 'getRecentMessages failed', error);
        return { success: false, error: 'Error al obtener mensajes recientes' };
      }

      // Invertir para obtener orden cronológico ascendente
      return { success: true, messages: messages.reverse().map(mapRowToMessage) };
    } catch (error) {
      logger.error('ChatService', 'getRecentMessages: error inesperado', error);
      return { success: false, error: 'Error inesperado' };
    }
  }

  /**
   * Borra el historial de chat del usuario.
   * Operación destructiva — sin soft delete.
   */
  static async clearChatHistory(): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const supabase = createBrowserClient();
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

      if (error) {
        logger.error('ChatService', 'clearChatHistory failed', error);
        return { success: false, error: 'Error al borrar el historial' };
      }

      return { success: true };
    } catch (error) {
      logger.error('ChatService', 'clearChatHistory: error inesperado', error);
      return { success: false, error: 'Error inesperado al borrar el historial' };
    }
  }

  /**
   * Devuelve estadísticas del chat del usuario.
   */
  static async getChatStats(): Promise<{
    success: boolean;
    stats?: {
      totalMessages: number;
      userMessages: number;
      aiMessages: number;
      firstMessageDate?: string;
      lastMessageDate?: string;
    };
    error?: string;
  }> {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const supabase = createBrowserClient();
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('role, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .returns<Pick<ChatMessageRow, 'role' | 'created_at'>[]>();

      if (error) {
        logger.error('ChatService', 'getChatStats failed', error);
        return { success: false, error: 'Error al obtener estadísticas' };
      }

      if (!messages || messages.length === 0) {
        return { success: true, stats: { totalMessages: 0, userMessages: 0, aiMessages: 0 } };
      }

      return {
        success: true,
        stats: {
          totalMessages: messages.length,
          userMessages: messages.filter(m => m.role === 'user').length,
          aiMessages: messages.filter(m => m.role === 'assistant').length,
          firstMessageDate: messages.at(0)?.created_at,
          lastMessageDate: messages.at(-1)?.created_at,
        },
      };
    } catch (error) {
      logger.error('ChatService', 'getChatStats: error inesperado', error);
      return { success: false, error: 'Error inesperado al obtener estadísticas' };
    }
  }

  /**
   * Devuelve la emoción más reciente del usuario registrada en el chat de hoy.
   */
  static async getTodayEmotion(): Promise<{
    success: boolean;
    emotion?: 'calm' | 'okay' | 'challenging' | 'mixed';
    error?: string;
  }> {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = new Date(today.getTime() + 86_400_000).toISOString().split('T')[0];

      const supabase = createBrowserClient();
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('emotion, created_at')
        .eq('user_id', userId)
        .gte('created_at', `${todayStr}T00:00:00`)
        .lt('created_at', `${tomorrowStr}T00:00:00`)
        .not('emotion', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .returns<Pick<ChatMessageRow, 'emotion' | 'created_at'>[]>();

      if (error) {
        logger.error('ChatService', 'getTodayEmotion failed', error);
        return { success: false, error: 'Error al obtener emoción del chat' };
      }

      return { success: true, emotion: messages?.[0]?.emotion ?? undefined };
    } catch (error) {
      logger.error('ChatService', 'getTodayEmotion: error inesperado', error);
      return { success: false, error: 'Error inesperado' };
    }
  }
}
