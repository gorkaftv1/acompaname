/**
 * Profiles Service
 *
 * Gestiona el perfil del usuario autenticado.
 *
 * RLS:
 *  - SELECT / INSERT / UPDATE → solo el propio usuario (auth.uid() = id)
 *  - No hay política DELETE: los perfiles se eliminan en cascada al borrar
 *    el usuario de auth.users.
 *
 * Nota: el perfil se crea automáticamente mediante el trigger
 * `on_auth_user_created` → `handle_new_user()` al registrarse.
 * Por eso no exponemos un método `createProfile` público.
 */

import { createBrowserClient } from '@/lib/supabase/client';
import { sanitizeData } from '@/lib/utils/sanitize';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type AiTone = 'formal' | 'casual' | 'friendly';
export type LanguageStyle = 'direct' | 'detailed' | 'balanced';
export type UserRole = 'admin' | 'user';

export interface NotificationPreferences {
  dailyReminders: boolean;
  emotionalSuggestions: boolean;
  weeklyProgress: boolean;
}

/** Representa una fila completa de la tabla `profiles`. */
export interface Profile {
  id: string;
  name: string;
  caregivingFor: string | null;
  relationshipType: string | null;
  condition: string | null;
  caregivingDuration: string | null;
  mainChallenges: string[] | null;
  supportNeeds: string | null;
  aiTone: AiTone;
  preferredLanguageStyle: LanguageStyle;
  notificationPreferences: NotificationPreferences;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para actualizar el perfil.
 * Todos los campos son opcionales; solo se envían los que cambian.
 */
export type UpdateProfileDTO = Partial<
  Pick<
    Profile,
    | 'name'
    | 'caregivingFor'
    | 'relationshipType'
    | 'condition'
    | 'caregivingDuration'
    | 'mainChallenges'
    | 'supportNeeds'
    | 'aiTone'
    | 'preferredLanguageStyle'
    | 'notificationPreferences'
  >
>;

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/** Fila raw tal como llega de Supabase (snake_case). */
type ProfileRow = {
  id: string;
  name: string;
  caregiving_for: string | null;
  relationship_type: string | null;
  condition: string | null;
  caregiving_duration: string | null;
  main_challenges: string[] | null;
  support_needs: string | null;
  ai_tone: AiTone;
  preferred_language_style: LanguageStyle;
  notification_preferences: NotificationPreferences;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

/** Convierte una fila de BD al tipo de dominio `Profile`. */
function mapRowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    caregivingFor: row.caregiving_for,
    relationshipType: row.relationship_type,
    condition: row.condition,
    caregivingDuration: row.caregiving_duration,
    mainChallenges: row.main_challenges,
    supportNeeds: row.support_needs,
    aiTone: row.ai_tone,
    preferredLanguageStyle: row.preferred_language_style,
    notificationPreferences: row.notification_preferences,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Servicio
// ---------------------------------------------------------------------------

export class ProfileService {
  /**
   * Obtiene el perfil del usuario autenticado actualmente.
   *
   * @throws Error si no hay sesión activa o si ocurre un error de BD.
   */
  static async getMyProfile(): Promise<Profile> {
    const supabase = createBrowserClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('ProfilesService.getMyProfile: No hay sesión activa.');
    }

    console.log('[ProfileService][getMyProfile] Cargando perfil del usuario actual', { userId: user.id });

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single<ProfileRow>();

    if (error) {
      console.error('[ProfileService][getMyProfile] Error obteniendo perfil', { error, userId: user.id });
      throw new Error(`ProfilesService.getMyProfile: ${error.message}`);
    }

    console.log('[ProfileService][getMyProfile] Perfil cargado', { userId: user.id });

    return mapRowToProfile(data);
  }

  /**
   * Obtiene el perfil de un usuario por su ID.
   * Solo funcionará si el usuario solicitante es el mismo (RLS).
   *
   * @param userId - UUID del usuario.
   * @throws Error si el perfil no existe o hay un fallo de BD.
   */
  static async getProfileById(userId: string): Promise<Profile> {
    const supabase = createBrowserClient();

    console.log('[ProfileService][getProfileById] Cargando perfil', { userId });
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single<ProfileRow>();

    if (error) {
      console.error('[ProfileService][getProfileById] Error obteniendo perfil', { error, userId });
      throw new Error(`ProfilesService.getProfileById: ${error.message}`);
    }
    console.log('[ProfileService][getProfileById] Perfil cargado', { userId });

    return mapRowToProfile(data);
  }

  /**
   * Actualiza los campos del perfil del usuario autenticado.
   *
   * @param userId - UUID del usuario (debe coincidir con auth.uid() para pasar RLS).
   * @param dto    - Campos a actualizar.
   * @returns Perfil actualizado.
   * @throws Error si falla la operación de BD.
   */
  static async updateProfile(
    userId: string,
    dto: UpdateProfileDTO,
  ): Promise<Profile> {
    const supabase = createBrowserClient();

    // Saneamos todos los strings del DTO (trim + colapsar espacios)
    const clean = sanitizeData(dto as Record<string, unknown>) as UpdateProfileDTO;

    // Mapeamos de camelCase a snake_case antes de enviar a Supabase
    const payload: Partial<Record<string, unknown>> = {};
    if (clean.name !== undefined) payload.name = clean.name;
    if (clean.caregivingFor !== undefined) payload.caregiving_for = clean.caregivingFor;
    if (clean.relationshipType !== undefined) payload.relationship_type = clean.relationshipType;
    if (clean.condition !== undefined) payload.condition = clean.condition;
    if (clean.caregivingDuration !== undefined) payload.caregiving_duration = clean.caregivingDuration;
    if (clean.mainChallenges !== undefined) payload.main_challenges = clean.mainChallenges;
    if (clean.supportNeeds !== undefined) payload.support_needs = clean.supportNeeds;
    if (clean.aiTone !== undefined) payload.ai_tone = clean.aiTone;
    if (clean.preferredLanguageStyle !== undefined)
      payload.preferred_language_style = clean.preferredLanguageStyle;
    if (clean.notificationPreferences !== undefined)
      payload.notification_preferences = clean.notificationPreferences as any;

    console.log('[ProfileService][updateProfile] Actualizando perfil', { userId, payload });
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single<ProfileRow>();

    if (error) {
      console.error('[ProfileService][updateProfile] Error actualizando perfil', { error, userId });
      throw new Error(`ProfilesService.updateProfile: ${error.message}`);
    }
    console.log('[ProfileService][updateProfile] Perfil actualizado exitosamente', { userId });

    return mapRowToProfile(data);
  }

  /**
   * Realiza un upsert del perfil (útil durante el flujo de onboarding).
   * El trigger handle_new_user() ya crea el perfil al registrarse, pero
   * este método permite completar/sobreescribir los datos de onboarding
   * en una sola llamada.
   *
   * @param userId - UUID del usuario.
   * @param dto    - Datos del perfil a insertar/actualizar.
   * @returns Perfil resultante.
   * @throws Error si falla la operación de BD.
   */
  static async upsertProfile(
    userId: string,
    dto: UpdateProfileDTO & { name: string },
  ): Promise<Profile> {
    const supabase = createBrowserClient();

    // Saneamos todos los strings del DTO (trim + colapsar espacios internos)
    const clean = sanitizeData(dto as Record<string, unknown>) as typeof dto;

    const payload = {
      id: userId,
      name: clean.name,
      ...(clean.caregivingFor !== undefined && { caregiving_for: clean.caregivingFor }),
      ...(clean.relationshipType !== undefined && { relationship_type: clean.relationshipType }),
      ...(clean.condition !== undefined && { condition: clean.condition }),
      ...(clean.caregivingDuration !== undefined && { caregiving_duration: clean.caregivingDuration }),
      ...(clean.mainChallenges !== undefined && { main_challenges: clean.mainChallenges }),
      ...(clean.supportNeeds !== undefined && { support_needs: clean.supportNeeds }),
      ...(clean.aiTone !== undefined && { ai_tone: clean.aiTone }),
      ...(clean.preferredLanguageStyle !== undefined && {
        preferred_language_style: clean.preferredLanguageStyle,
      }),
      ...(clean.notificationPreferences !== undefined && {
        notification_preferences: clean.notificationPreferences as any,
      }),
    };

    console.log('[ProfileService][upsertProfile] Upsert de perfil', { userId, payload });
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single<ProfileRow>();

    if (error) {
      console.error('[ProfileService][upsertProfile] Error en upsert de perfil', { error, userId });
      throw new Error(`ProfilesService.upsertProfile: ${error.message}`);
    }
    console.log('[ProfileService][upsertProfile] Perfil guardado (upsert) exitosamente', { userId });

    return mapRowToProfile(data);
  }
}
