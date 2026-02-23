/**
 * InitAuth Component
 * 
 * Client Component que inicializa la autenticación al cargar la aplicación.
 * Se ejecuta una sola vez cuando la app se monta.
 * 
 * Debe estar en el layout.tsx para asegurar que se ejecute en todas las páginas.
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';

export function InitAuth() {
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  
  useEffect(() => {
    console.log('🔄 [INIT AUTH] Iniciando inicialización de autenticación...');
    // Inicializar la sesión de autenticación al montar el componente
    initializeAuth();
  }, [initializeAuth]);
  
  // Este componente no renderiza nada
  return null;
}
