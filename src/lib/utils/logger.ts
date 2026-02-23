/**
 * Logger — Módulo centralizado de logging
 *
 * Reemplaza los `console.log` directos para:
 *  1. NUNCA imprimir datos sensibles en producción.
 *  2. Ofrecer niveles semánticos (debug, info, warn, error).
 *  3. Permitir añadir prefijos y metadata de forma consistente.
 *
 * Los métodos `debug` e `info` solo imprimen en development.
 * Los métodos `warn` y `error` siempre imprimen (necesarios para monitoreo).
 *
 * @example
 * ```typescript
 * import { logger } from '@/lib/utils/logger';
 *
 * logger.info('Auth', 'Login exitoso');
 * logger.debug('Auth', 'Session data', { userId: '...' });   // Solo en dev
 * logger.error('Middleware', 'Error inesperado', error);       // Siempre
 * ```
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ICONS: Record<LogLevel, string> = {
    debug: '🐛',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
};

function formatPrefix(level: LogLevel, context: string): string {
    return `${LEVEL_ICONS[level]} [${context}]`;
}

/**
 * Logger con niveles y protección de entorno.
 *
 * - `debug` y `info` → solo en `NODE_ENV === 'development'`
 * - `warn` y `error` → siempre (necesarios para monitoreo en producción)
 *
 * Cada método acepta un `context` (ej. 'Auth', 'Middleware', 'Engine')
 * seguido del mensaje y datos opcionales.
 */
export const logger = {
    /**
     * Información detallada de depuración. Solo visible en desarrollo.
     * Ideal para datos sensibles que nunca deben llegar a producción.
     */
    debug(context: string, message: string, ...data: unknown[]): void {
        if (isDev) {
            console.log(formatPrefix('debug', context), message, ...data);
        }
    },

    /**
     * Información general de flujo. Solo visible en desarrollo.
     */
    info(context: string, message: string, ...data: unknown[]): void {
        if (isDev) {
            console.log(formatPrefix('info', context), message, ...data);
        }
    },

    /**
     * Advertencias. Siempre visible (incluso en producción).
     * NO incluir datos sensibles (emails, IDs, tokens) en el mensaje.
     */
    warn(context: string, message: string, ...data: unknown[]): void {
        console.warn(formatPrefix('warn', context), message, ...data);
    },

    /**
     * Errores. Siempre visible.
     * OK incluir el objeto Error, pero NO datos de usuario.
     */
    error(context: string, message: string, ...data: unknown[]): void {
        console.error(formatPrefix('error', context), message, ...data);
    },
};
