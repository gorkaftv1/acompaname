'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { User } from '@/types';
import { createBrowserClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

interface AuthProviderProps {
    initialUser: User | null;
}

export function AuthProvider({ initialUser }: AuthProviderProps) {
    const { hydrate, setSessionListener } = useAuthStore();
    const hydratedRef = useRef(false);

    // Sync server state to client state on first mount immediately
    if (!hydratedRef.current) {
        hydrate(initialUser);
        hydratedRef.current = true;
    }

    useEffect(() => {
        // Escuchar cambios de sesión solo en cliente (ej: login en otra pestaña o en la app actual)
        const supabase = createBrowserClient();

        // Defer registration to avoid blocking render
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                logger.info('Auth', 'Auth state cambió en el cliente:', event);
                setSessionListener(event, session, supabase);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [setSessionListener]);

    return null;
}
