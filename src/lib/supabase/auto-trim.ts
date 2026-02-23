import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Función recursiva que itera sobre un objeto (o array/tupla)
 * y aplica .trim() a todas las propiedades de tipo string.
 */
function deepTrim<T>(obj: T): T {
    if (typeof obj === 'string') {
        return obj.trim() as unknown as T;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepTrim(item)) as unknown as T;
    }
    if (obj !== null && typeof obj === 'object') {
        // Evitar alterar objetos pre-existentes como Date
        if (obj instanceof Date) return obj;

        const trimmedObj = {} as Record<string, any>;
        for (const [key, value] of Object.entries(obj)) {
            trimmedObj[key] = deepTrim(value);
        }
        return trimmedObj as T;
    }
    return obj;
}

/**
 * Wrapper (Proxy) sobre el cliente de Supabase.
 * Intercepta las llamadas a supabase.from('...').insert(), .upsert() y .update()
 * para aplicar automáticamente .trim() a todos los strings en el payload.
 *
 * Esto garantiza que la regla de negocio "no strings with leading/trailing spaces"
 * sea estricta y transparente para el resto de la aplicación.
 */
export function withAutoTrim<T extends SupabaseClient<any, any, any>>(client: T): T {
    return new Proxy(client, {
        get(target, prop) {
            if (prop === 'from') {
                const originalFrom = (target as any)[prop];
                return function (...args: any[]) {
                    const queryBuilder = originalFrom.apply(target, args);

                    return new Proxy(queryBuilder, {
                        get(qbTarget, qbProp) {
                            if (qbProp === 'insert' || qbProp === 'upsert' || qbProp === 'update') {
                                const originalMethod = qbTarget[qbProp as keyof typeof qbTarget] as Function;
                                return function (data: any, options?: any) {
                                    return originalMethod.call(qbTarget, deepTrim(data), options);
                                };
                            }

                            const value = qbTarget[qbProp as keyof typeof qbTarget];
                            return typeof value === 'function' ? value.bind(qbTarget) : value;
                        }
                    });
                };
            }

            const value = target[prop as keyof typeof target];
            return typeof value === 'function' ? (value as Function).bind(target) : value;
        }
    });
}
