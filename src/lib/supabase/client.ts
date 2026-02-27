/**
 * Supabase Client - Para Client Components
 * 
 * ⚠️ IMPORTANTE: Este archivo usa @supabase/supabase-js
 * Solo debe usarse en Client Components ('use client')
 * 
 * Casos de uso:
 * - Zustand stores (useAuthStore)
 * - Componentes React del lado del cliente
 * - Servicios llamados desde Client Components
 */

import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { logger } from '@/lib/utils/logger'
import { withAutoTrim } from './auto-trim'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null

/**
 * Crea o devuelve un cliente singleton de Supabase para uso en el navegador
 * 
 * IMPORTANTE: Esta función usa @supabase/ssr para que la sesión LocalStorage
 * se sincronice automáticamente con las cookies, permitiendo que los 
 * Server Components (como page.tsx) puedan leer la sesión del usuario.
 */
export function createBrowserClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Prevenir que requests se queden colgados eternamente (ej. tab suspendida al volver de sleep)
  const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 10000) // 10s timeout
    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      return response
    } finally {
      clearTimeout(id)
    }
  }

  supabaseInstance = withAutoTrim(
    createSSRBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: customFetch
      }
    })
  )

  logger.info('Supabase', 'Singleton client created (SSR cookie sync enabled, w/ auto-trim proxy, w/ custom fetch timeout)')

  return supabaseInstance
}

/**
 * Reinicia el singleton (útil para testing o cuando se cierra sesión)
 */
export function resetSupabaseClient() {
  supabaseInstance = null
  logger.info('Supabase', 'Client reset')
}
