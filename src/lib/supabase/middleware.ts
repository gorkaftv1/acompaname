/**
 * Supabase Middleware Helper - Para middleware.ts
 * 
 * ⚠️ IMPORTANTE: Este archivo usa @supabase/ssr
 * Solo debe usarse en middleware.ts (raíz del proyecto) para gestión de sesiones
 * 
 * Este helper actualiza la sesión del usuario en cada request
 * y mantiene las cookies sincronizadas.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'

/**
 * Actualiza la sesión de Supabase en el middleware
 * 
 * Esta función:
 * 1. Crea un cliente de Supabase configurado para middleware
 * 2. Refresca la sesión si es necesario
 * 3. Sincroniza las cookies entre request y response
 * 4. Devuelve el usuario actual (si existe)
 * 
 * @param request - El NextRequest del middleware
 * @returns Objeto con response, user y error
 * 
 * @example
 * ```typescript
 * // En middleware.ts (raíz del proyecto)
 * import { updateSession } from '@/lib/supabase/middleware';
 * 
 * export async function middleware(request: NextRequest) {
 *   const { response, user } = await updateSession(request);
 *   
 *   if (!user && protectedPath) {
 *     return NextResponse.redirect(new URL('/login', request.url));
 *   }
 *   
 *   return response;
 * }
 * ```
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Actualizar cookies en el request para que estén disponibles
          // en el resto del procesamiento
          request.cookies.set({
            name,
            value,
            ...options,
          })
          
          // Crear un nuevo response con las cookies actualizadas
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remover del request
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          
          // Remover del response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refrescar la sesión si es necesario
  // Esto también maneja la renovación automática del token
  const { data: { user }, error } = await supabase.auth.getUser()

  return { response, user, error }
}
