import { create } from 'zustand';
import { createBrowserClient, resetSupabaseClient } from '@/lib/supabase/client';
import { User } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';
import { ResponseService } from '@/lib/services/response.service';

/**
 * Authentication Store
 * 
 * Manages authentication state and actions using Zustand + Supabase Auth.
 * Uses @supabase/supabase-js for client-side authentication.
 * 
 * Features:
 * - Login/Register/Logout with Supabase Auth
 * - Session persistence via localStorage
 * - Automatic profile creation on signup
 * - Session initialization on app load
 */

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  // SSR Hydration
  hydrate: (user: User | null) => void;
  setSessionListener: (event: string, session: any, supabase: any) => Promise<void>;
}

/**
 * Helper: Convert Supabase User to our User type
 */
const mapSupabaseUser = (
  supabaseUser: SupabaseUser,
  profile?: {
    name?: string | null;
    role?: 'admin' | 'user' | null;
    caregiving_for?: string | null;
    relationship_type?: string | null;
    condition?: string | null;
    caregiving_duration?: string | null;
    main_challenges?: string[] | null;
    support_needs?: string | null;
    ai_tone?: 'formal' | 'casual' | 'friendly' | null;
    preferred_language_style?: 'direct' | 'detailed' | 'balanced' | null;
    notification_preferences?: any | null;
  }
): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuario',
  role: profile?.role ?? 'user',
  caregivingFor: profile?.caregiving_for ?? undefined,
  relationshipType: profile?.relationship_type ?? undefined,
  condition: profile?.condition ?? undefined,
  caregivingDuration: profile?.caregiving_duration ?? undefined,
  mainChallenges: profile?.main_challenges ?? undefined,
  supportNeeds: profile?.support_needs ?? undefined,
  aiTone: profile?.ai_tone ?? undefined,
  preferredLanguageStyle: profile?.preferred_language_style ?? undefined,
  notificationPreferences: profile?.notification_preferences ?? undefined,
  createdAt: supabaseUser.created_at,
});

// ── Subscription management ─────────────────────────────────────────────────
// Module-level reference para limpiar la suscripción anterior al re-inicializar.
let currentAuthSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize authentication state synchronously from SSR
  hydrate: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });
    logger.info('Auth', `Estado hidratado del SSR: ${user ? 'autenticado' : 'sin sesión'}`);
  },

  // Manejar eventos de cambio de sesión en el cliente
  setSessionListener: async (event, session, supabase) => {
    if (event === 'SIGNED_OUT') {
      set({ user: null, isAuthenticated: false });
    } else if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const user = mapSupabaseUser(session.user, profile ?? undefined);

      set({
        user,
        isAuthenticated: true,
      });
    }
  },

  // Login action
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const supabase = createBrowserClient();

      logger.debug('Auth', 'Intentando login');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      logger.debug('Auth', 'Resultado signInWithPassword:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
        error: error?.message,
      });

      if (error) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.message === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos'
            : error.message,
        });
        return;
      }

      if (!data.user) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Error al iniciar sesión',
        });
        return;
      }

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const user = mapSupabaseUser(data.user, profile ?? undefined);

      logger.info('Auth', 'Login exitoso');

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Post-login sync: push guest progress to Supabase
      const guestProgress = ResponseService.getGuestProgress();
      if (guestProgress) {
        logger.info('Auth', 'Progreso de invitado detectado en Login, sincronizando…');
        try {
          await ResponseService.syncGuestToCloud(data.user.id);
          logger.info('Auth', 'Sincronización completada en Login.');
        } catch (syncErr) {
          logger.error('Auth', 'Error sincronizando progreso de invitado en Login:', syncErr);
        }
      }
    } catch (error) {
      logger.error('Auth', 'Login error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
      });
    }
  },

  // Register action
  register: async (userData: { name: string; email: string; password: string }) => {
    set({ isLoading: true, error: null });

    try {
      const supabase = createBrowserClient();

      // Sign up with Supabase Auth
      // Note: Email verification might be required depending on Supabase settings
      // For development, disable email confirmation in Supabase Dashboard:
      // Authentication > Settings > Email Auth > Confirm email = OFF
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            display_name: userData.name,
          },
          emailRedirectTo: undefined, // Don't require email confirmation
        },
      });

      if (error) {
        logger.error('Auth', 'Registration error from Supabase:', error);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.message === 'User already registered'
            ? 'Este email ya está registrado'
            : error.message,
        });
        return;
      }

      if (!data.user) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Error al crear la cuenta',
        });
        return;
      }

      // Profile is automatically created by the trigger in the database
      // Wait a bit for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the created profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const user = mapSupabaseUser(data.user, profile ?? undefined);

      logger.info('Auth', 'Registro exitoso');

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Post-registration sync: push guest progress to Supabase
      const guestProgress = ResponseService.getGuestProgress();
      if (guestProgress) {
        logger.info('Auth', 'Progreso de invitado detectado en Registro, sincronizando…');
        try {
          await ResponseService.syncGuestToCloud(data.user.id);
          logger.info('Auth', 'Sincronización completada en Registro.');
        } catch (syncErr) {
          logger.error('Auth', 'Error sincronizando progreso de invitado en Registro:', syncErr);
        }
      }
    } catch (error) {
      logger.error('Auth', 'Register error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
      });
    }
  },

  // Logout action
  logout: async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();

      // Reset the Supabase singleton to avoid stale clients
      resetSupabaseClient();

      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });

      logger.info('Auth', 'Logout exitoso, cliente Supabase reseteado');
    } catch (error) {
      logger.error('Auth', 'Logout error:', error);
      // Still clear the user even if logout fails
      resetSupabaseClient();
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  // Clear error action
  clearError: () => {
    set({ error: null });
  },
}));
