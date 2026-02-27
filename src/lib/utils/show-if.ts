import type { AnswerEntry } from '@/types/questionnaire-engine.types';
import type { Json } from '@/lib/supabase/database.types';

export interface ShowIfCondition {
    question_id: string;
    option_ids: string[];
}

export interface ShowIfRule {
    operator: 'OR' | 'AND';
    conditions: ShowIfCondition[];
}

export function evaluateShowIf(showIf: Json | null | undefined, answersMap: Map<string, AnswerEntry>): boolean {
    if (!showIf) return true; // Si no hay regla, siempre se muestra

    try {
        const rule = showIf as unknown as ShowIfRule;
        if (!rule.operator || !Array.isArray(rule.conditions)) return true;

        const results = rule.conditions.map((cond) => {
            const answer = answersMap.get(cond.question_id);
            if (!answer || !answer.selectedOptionId) return false;
            return cond.option_ids.includes(answer.selectedOptionId);
        });

        if (rule.operator === 'AND') {
            return results.length > 0 && results.every((r) => r);
        } else if (rule.operator === 'OR') {
            return results.length > 0 && results.some((r) => r);
        }

        return true;
    } catch {
        return true; // Ante cualquier error de parseo, por seguridad mostrar
    }
}
