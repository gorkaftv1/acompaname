// /**
//  * Supabase Server Client - Para Server Components y Server Actions
//  * 
//  * ⚠️ IMPORTANTE: Este archivo usa @supabase/ssr
//  * Solo debe usarse en contextos del servidor
//  * Casos de uso:
//  * - Server Components (app/*/page.tsx sin 'use client')
//  * - Server Actions (funciones async con 'use server')
//  * - Route Handlers (app/api/*/route.ts)
//  */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'
import { withAutoTrim } from './auto-trim'

/**
 * Crea un cliente de Supabase para Server Components
 * 
 * Este cliente maneja cookies correctamente en el contexto del servidor
 * y sincroniza la sesión automáticamente.
 * 
 * @returns Cliente de Supabase configurado para el servidor
 * 
 * @example
 * ```typescript
 * // En un Server Component
 * import { createServerSupabaseClient } from '@/lib/supabase/server';
 * 
 * export default async function Page() {
 *   const supabase = await createServerSupabaseClient();
 *   const { data } = await supabase.from('profiles').select('*');
 *   return <div>...</div>;
 * }
 * ```
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return withAutoTrim(
    createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Cookie setting can only happen in Server Actions or Route Handlers
              // Silently fail if called from a Server Component during rendering
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // Cookie removal can only happen in Server Actions or Route Handlers
            }
          },
        },
      }
    )
  )
}
