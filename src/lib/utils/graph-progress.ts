/**
 * Graph Progress — Cálculo dinámico de progreso en flujos condicionales
 *
 * Dado un grafo de preguntas con flujos condicionales (next_question_id),
 * no todas las preguntas se responden en cada sesión. Por tanto, el cálculo
 * de progreso no puede ser "respondidas / total". En su lugar:
 *
 *  - `maxDepth`: nº de pasos máximos desde la primera pregunta hasta un
 *    nodo terminal (next_question_id = null). Es la ruta MÁS LARGA.
 *
 *  - `minRemaining`: desde la pregunta actual, cuántos pasos MÍNIMOS quedan
 *    hasta un nodo terminal. Es el camino más corto hacia el final.
 *
 *  - `currentStep`: nº de preguntas ya respondidas.
 *
 * Todos los cálculos usan BFS/DFS con cache de visitados para evitar ciclos.
 *
 * @module graph-progress
 */

import type { QuestionNode } from '@/lib/services/questionnaire-engine.types';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface GraphProgress {
    /** Paso actual (preguntas ya respondidas, 1-indexed para UI). */
    currentStep: number;
    /** Máximo de pasos posibles desde la primera pregunta (ruta más larga). */
    maxSteps: number;
    /** Mínimo de pasos restantes desde la pregunta actual hasta un nodo final. */
    minRemaining: number;
}

// ---------------------------------------------------------------------------
// computeMaxDepth — ruta más larga desde un nodo hasta un nodo terminal
// ---------------------------------------------------------------------------

/**
 * Calcula la profundidad máxima del grafo desde `startId` hasta un nodo
 * terminal (next_question_id = null en todas las opciones).
 *
 * Usa DFS con memoización. Se protege contra ciclos con un set de visitados.
 */
export function computeMaxDepth(
    questionsMap: Map<string, QuestionNode>,
    startId: string,
): number {
    const memo = new Map<string, number>();

    function dfs(nodeId: string, visited: Set<string>): number {
        if (memo.has(nodeId)) return memo.get(nodeId)!;
        if (visited.has(nodeId)) return 0; // ciclo detectado

        visited.add(nodeId);
        const node = questionsMap.get(nodeId);
        if (!node) return 1; // nodo desconocido = 1 paso

        const nextIds = node.options
            .map((o) => o.nextQuestionId)
            .filter((id): id is string => id !== null);

        if (nextIds.length === 0) {
            // Nodo terminal
            memo.set(nodeId, 1);
            visited.delete(nodeId);
            return 1;
        }

        let maxChild = 0;
        for (const nextId of nextIds) {
            maxChild = Math.max(maxChild, dfs(nextId, visited));
        }

        const depth = 1 + maxChild;
        memo.set(nodeId, depth);
        visited.delete(nodeId);
        return depth;
    }

    return dfs(startId, new Set());
}

// ---------------------------------------------------------------------------
// computeMinRemaining — camino más corto hasta un nodo terminal
// ---------------------------------------------------------------------------

/**
 * Calcula cuántos pasos MÍNIMOS quedan desde `currentId` hasta un nodo
 * terminal (next_question_id = null).
 *
 * Usa BFS para encontrar el camino más corto (BFS garantiza mínimo en
 * grafos no ponderados).
 */
export function computeMinRemaining(
    questionsMap: Map<string, QuestionNode>,
    currentId: string,
): number {
    const queue: Array<{ id: string; depth: number }> = [{ id: currentId, depth: 0 }];
    const visited = new Set<string>([currentId]);

    while (queue.length > 0) {
        const { id, depth } = queue.shift()!;
        const node = questionsMap.get(id);

        if (!node) return depth + 1;

        const nextIds = node.options
            .map((o) => o.nextQuestionId)
            .filter((id): id is string => id !== null);

        // Si alguna opción lleva a null → este nodo es penúltimo
        const hasTerminal = node.options.some((o) => o.nextQuestionId === null);
        if (hasTerminal) {
            return depth + 1; // contando el nodo actual
        }

        for (const nextId of nextIds) {
            if (!visited.has(nextId)) {
                visited.add(nextId);
                queue.push({ id: nextId, depth: depth + 1 });
            }
        }
    }

    // Si no se encuentra terminal (desconectado), devolvemos 1
    return 1;
}

// ---------------------------------------------------------------------------
// getGraphProgress — función principal de conveniencia
// ---------------------------------------------------------------------------

/**
 * Calcula el progreso del usuario en el grafo de preguntas.
 *
 * @param questionsMap - Mapa completo de preguntas.
 * @param firstQuestionId - ID de la primera pregunta.
 * @param currentQuestionId - ID de la pregunta en la que está el usuario.
 * @param answeredCount - Número de preguntas ya respondidas.
 * @returns Objeto con currentStep, maxSteps y minRemaining.
 *
 * @example
 * ```ts
 * const progress = getGraphProgress(questionsMap, firstQ.id, currentQ.id, 3);
 * // → { currentStep: 4, maxSteps: 12, minRemaining: 3 }
 * // Muestra: "Pregunta 4 de ~12 (faltan al menos 3)"
 * ```
 */
export function getGraphProgress(
    questionsMap: Map<string, QuestionNode>,
    firstQuestionId: string,
    currentQuestionId: string,
    answeredCount: number,
): GraphProgress {
    const maxSteps = computeMaxDepth(questionsMap, firstQuestionId);
    const minRemaining = computeMinRemaining(questionsMap, currentQuestionId);

    return {
        currentStep: answeredCount + 1, // +1 porque la pregunta actual cuenta
        maxSteps,
        minRemaining,
    };
}
