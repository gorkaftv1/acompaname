/**
 * Template Parser — Interpolación de placeholders en textos del cuestionario
 *
 * El seed de Supabase usa `{{X}}` e `{{Y}}` como placeholders genéricos.
 * Esta función los reemplaza por los nombres reales introducidos por el usuario
 * durante las primeras dos preguntas del onboarding.
 *
 * Los valores inyectados pasan por `sanitizeString` para garantizar que no
 * haya espacios en blanco accidentales (trim + colapso de espacios internos).
 *
 * @example
 * ```typescript
 * parseTemplatePlaceholders('¿Qué es {{X}} para ti?', { X: ' Ana ', Y: 'Carlos' })
 * // → '¿Qué es Ana para ti?'
 *
 * parseTemplatePlaceholders('¡Gracias, {{Y}}!', { X: null, Y: 'Carlos' })
 * // → '¡Gracias, Carlos!'
 *
 * parseTemplatePlaceholders('{{X}} se altera', { X: null })
 * // → 'la persona que acompañas se altera'   ← fallback
 * ```
 */

import { sanitizeString } from '@/lib/utils/sanitize';

/** Valores de fallback cuando el placeholder aún no tiene un nombre. */
const FALLBACKS: Record<string, string> = {
    X: 'la persona que acompañas',
    Y: 'Cuidadores',
};

/**
 * Reemplaza todos los `{{KEY}}` en `text` usando los valores del mapa.
 * Si un valor es `null`, `undefined` o vacío, usa el fallback humanizado.
 * Cada valor inyectado pasa por `sanitizeString` (trim + colapso de espacios).
 *
 * @param text  Texto crudo del cuestionario con posibles placeholders.
 * @param vars  Mapa de variables conocidas (ej. `{ X: 'Ana', Y: 'Carlos' }`).
 * @returns     Texto con los placeholders resueltos y saneados.
 */
export function parseTemplatePlaceholders(
    text: string,
    vars: Record<string, string | null | undefined>,
): string {
    // Regex: captura cualquier {{KEY}} con key alfanumérica
    return text.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
        const value = vars[key];
        if (value && value.trim().length > 0) {
            return sanitizeString(value, `placeholder:${key}`);
        }
        return FALLBACKS[key] ?? key;
    });
}
