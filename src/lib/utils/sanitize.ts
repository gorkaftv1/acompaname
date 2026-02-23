/**
 * Sanitize — Utilidad de saneamiento de strings
 *
 * Centraliza la limpieza de valores antes de enviarlos a Supabase
 * (queries, inserciones, updates) y al leer datos de la BD.
 *
 * Evita errores de coincidencia causados por espacios en blanco
 * accidentales en títulos, nombres, IDs, etc.
 */

import { logger } from '@/lib/utils/logger';

const CTX = 'Sanitizer';

/**
 * Limpia un string individual: elimina espacios al inicio y al final
 * y colapsa múltiples espacios internos en uno solo.
 *
 * Loguea una advertencia si el valor fue transformado.
 *
 * @param value - El string a sanear.
 * @param label - Etiqueta opcional para el log (ej. 'title', 'name').
 * @returns El string limpio.
 */
export function sanitizeString(value: string, label?: string): string {
    const cleaned = value.trim().replace(/\s+/g, ' ');
    if (cleaned !== value) {
        logger.debug(CTX, `🧹 Valor${label ? ` [${label}]` : ''} "${value}" → "${cleaned}"`);
    }
    return cleaned;
}

/**
 * Sanea recursivamente todos los valores string de un objeto plano.
 * Los valores null, undefined, number, boolean se dejan intactos.
 * Los arrays de strings también se limpian.
 *
 * @param data - Objeto con campos a sanear.
 * @returns Nuevo objeto con los strings limpios.
 *
 * @example
 * ```ts
 * sanitizeData({ name: '  Ana ', age: 30, tags: [' a ', 'b'] })
 * // → { name: 'Ana', age: 30, tags: ['a', 'b'] }
 * ```
 */
export function sanitizeData<T extends Record<string, unknown>>(data: T): T {
    const cleaned = { ...data };

    for (const key of Object.keys(cleaned)) {
        const value = cleaned[key];

        if (typeof value === 'string') {
            (cleaned as Record<string, unknown>)[key] = sanitizeString(value, key);
        } else if (Array.isArray(value)) {
            (cleaned as Record<string, unknown>)[key] = value.map((item) =>
                typeof item === 'string' ? sanitizeString(item, key) : item,
            );
        }
        // null, undefined, number, boolean → intactos
    }

    return cleaned;
}
