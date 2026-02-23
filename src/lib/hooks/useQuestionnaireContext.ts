/**
 * useQuestionnaireContext — Hook centralizado para resolución de placeholders
 *
 * Proporciona una función `resolvePlaceholders(text)` que reemplaza
 * `{{Y}}` (nombre del usuario) y `{{X}}` (nombre de la persona cuidada)
 * siguiendo un orden de prioridad estricto:
 *
 *  1. **Datos locales / en memoria**: valores pasados directamente como
 *     opciones del hook (ej. durante el onboarding mid-flow) o almacenados
 *     en el progreso de invitado (`localStorage`).
 *  2. **Datos de perfil (Supabase)**: campos `name` y `caregivingFor`
 *     del objeto `user` en `useAuthStore`.
 *  3. **Fallbacks**: `{{Y}}` → "Cuidadores", `{{X}}` → "la persona que acompañas".
 *
 * Todos los valores inyectados pasan por `sanitizeString` (trim + colapso
 * de espacios internos) a través de `parseTemplatePlaceholders`.
 *
 * @example
 * ```tsx
 * // En DynamicOnboarding (con overrides locales del estado del motor):
 * const { resolvePlaceholders } = useQuestionnaireContext({
 *   localUserName: state.userName,
 *   localCaregivingName: state.caregivingName,
 * });
 * <p>{resolvePlaceholders('¿Cómo estás, {{Y}}?')}</p>
 *
 * // En /questionnaires (sin overrides, usa perfil Supabase automáticamente):
 * const { resolvePlaceholders } = useQuestionnaireContext();
 * <p>{resolvePlaceholders(questionnaire.description)}</p>
 * ```
 */

import { useMemo, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { ResponseService } from '@/services/response.service';
import { parseTemplatePlaceholders } from '@/lib/utils/template-parser';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface UseQuestionnaireContextOptions {
    /** Override local para el nombre del usuario (ej. estado del motor de onboarding). */
    localUserName?: string | null;
    /** Override local para el nombre de la persona cuidada. */
    localCaregivingName?: string | null;
}

export interface UseQuestionnaireContextReturn {
    /** Reemplaza `{{X}}` y `{{Y}}` en el texto usando la cascada de prioridades. */
    resolvePlaceholders: (text: string) => string;
    /** Variables crudas resueltas (para debug o inspección). */
    templateVars: Record<string, string | null | undefined>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useQuestionnaireContext(
    options: UseQuestionnaireContextOptions = {},
): UseQuestionnaireContextReturn {
    const { localUserName, localCaregivingName } = options;

    // Datos de perfil autenticado (Supabase)
    const user = useAuthStore((s) => s.user);

    // Construir las variables con la cascada de prioridades:
    //   1. Local override (estado del motor / mid-flow)
    //   2. LocalStorage guest progress
    //   3. Perfil de Supabase (auth store)
    //   4. null → el template-parser aplicará los fallbacks
    const templateVars = useMemo(() => {
        // Intentar leer el progreso de invitado de localStorage
        const guestData = ResponseService.getGuestProgress();

        const Y =
            localUserName
            ?? guestData?.userName
            ?? user?.name
            ?? null;

        const X =
            localCaregivingName
            ?? guestData?.caregivingName
            ?? user?.caregivingFor
            ?? null;

        return { X, Y };
    }, [localUserName, localCaregivingName, user?.name, user?.caregivingFor]);

    const resolvePlaceholders = useCallback(
        (text: string): string => parseTemplatePlaceholders(text, templateVars),
        [templateVars],
    );

    return { resolvePlaceholders, templateVars };
}
