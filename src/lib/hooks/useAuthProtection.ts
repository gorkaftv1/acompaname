/**
 * useAuthProtection Hook
 * 
 * Hook para proteger rutas que requieren autenticación.
 * Verifica SOLO la existencia de sesión activa (cookies).
 * NO verifica verificación de email - solo que haya un usuario logueado.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';

export function useAuthProtection() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Importante: NO redirigir si aún estamos cargando (inicializando)
    if (isLoading) {
      console.log('⏳ [AUTH PROTECTION] Cargando estado de autenticación...');
      return;
    }

    // Solo verificamos que haya sesión activa (cookies)
    // No importa si el email está verificado o no
    if (!isAuthenticated && !user) {
      console.log('🚫 [AUTH PROTECTION] No hay sesión activa (sin cookies), redirigiendo a /login');
      router.push('/login');
    } else if (user) {
      console.log('✅ [AUTH PROTECTION] Sesión válida detectada:', user.email);
    }
  }, [isLoading, isAuthenticated, user, router]);

  return { user, isAuthenticated, isLoading };
}
