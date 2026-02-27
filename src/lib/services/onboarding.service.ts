import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import { ProfileService } from '@/lib/services/profile.service';
import { ResponseService } from '@/lib/services/response.service';
import type { QuestionNode, OptionNode } from '@/types/questionnaire-engine.types';

type QuestionnaireRow = Database['public']['Tables']['questionnaires']['Row'];

export const ONBOARDING_PROFILE_DESCRIPTIONS = {
    NAME: "Usaremos este nombre para personalizar tus notificaciones y mensajes.",
    CAREGIVING_FOR: "Puede ser el nombre de la persona o un apodo. Esto nos ayuda a contextualizar las tareas.",
    RELATIONSHIP_TYPE: "Nos gustaría saber que relación tienes con {{X}}",
    CAREGIVING_DURATION: "Ayúdanos a entender tu experiencia"
} as const;

export class OnboardingService {
    /**
     * Checks if a user has completed the onboarding.
     */
    static async hasCompletedOnboarding(
        userId: string,
        supabaseClient?: SupabaseClient<Database>
    ): Promise<boolean> {
        const supabase = supabaseClient ?? createBrowserClient();

        const { data, error } = await supabase
            .from('questionnaire_sessions')
            .select(`
                id,
                questionnaires!inner(type)
            `)
            .eq('user_id', userId)
            .eq('status', 'completed')
            .eq('questionnaires.type', 'onboarding')
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('[OnboardingService][hasCompletedOnboarding] Error:', error.message);
            return false;
        }

        return !!data;
    }

    /**
     * Fetches the currently published onboarding questionnaire.
     */
    static async getPublishedOnboarding(
        supabaseClient?: SupabaseClient<Database>
    ): Promise<Pick<QuestionnaireRow, 'id' | 'title' | 'description' | 'status'> | null> {
        const supabase = supabaseClient ?? createBrowserClient();

        const { data, error } = await supabase
            .from('questionnaires')
            .select('id, title, description, status')
            .eq('type', 'onboarding')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error('[OnboardingService][getPublishedOnboarding] Error:', error.message);
            return null;
        }

        return data;
    }

    /**
     * Publishes a new onboarding questionnaire, archiving any previously published one.
     */
    static async publishOnboarding(
        questionnaireId: string,
        supabaseClient?: SupabaseClient<Database>
    ): Promise<void> {
        const supabase = supabaseClient ?? createBrowserClient();

        // Find existing published onboarding
        const existingOnboarding = await this.getPublishedOnboarding(supabase);

        if (existingOnboarding && existingOnboarding.id !== questionnaireId) {
            // Archive the previously published onboarding
            const { error: archiveError } = await supabase
                .from('questionnaires')
                .update({ status: 'archived' })
                .eq('id', existingOnboarding.id);

            if (archiveError) {
                console.error('[OnboardingService][publishOnboarding] Error archiving previous:', archiveError.message);
                throw new Error(`Error archiving previous onboarding: ${archiveError.message}`);
            }
        }

        // Publish the new onboarding questionnaire
        const { error: publishError } = await supabase.rpc('publish_questionnaire', { p_questionnaire_id: questionnaireId });
        if (publishError) {
            throw new Error(publishError.message || 'Error al publicar onboarding.');
        }
    }

    /**
     * Extrae información para el perfil a partir de las respuestas del onboarding
     * basándose en las descripciones fijas (ONBOARDING_PROFILE_DESCRIPTIONS).
     */
    static async extractAndSaveProfileData(
        userId: string | undefined,
        questionnaireId: string,
        question: QuestionNode,
        option: OptionNode | null,
        freeText: string | null
    ): Promise<{ userName?: string; caregivingName?: string }> {
        const result: { userName?: string; caregivingName?: string } = {};

        if (!question.description) return result;

        switch (question.description.trim()) {
            case ONBOARDING_PROFILE_DESCRIPTIONS.NAME:
                if (freeText) {
                    result.userName = freeText;
                    if (!userId) {
                        ResponseService.saveGuestName(questionnaireId, 'userName', freeText);
                    } else {
                        await ProfileService.updateProfile(userId, { name: freeText }).catch((e: unknown) =>
                            console.error('[OnboardingService] Error guardando nombre de usuario:', e)
                        );
                    }
                }
                break;
            case ONBOARDING_PROFILE_DESCRIPTIONS.CAREGIVING_FOR:
                if (freeText) {
                    result.caregivingName = freeText;
                    if (!userId) {
                        ResponseService.saveGuestName(questionnaireId, 'caregivingName', freeText);
                    } else {
                        await ProfileService.updateProfile(userId, { caregivingFor: freeText }).catch((e: unknown) =>
                            console.error('[OnboardingService] Error guardando nombre de acompañado:', e)
                        );
                    }
                }
                break;
            case ONBOARDING_PROFILE_DESCRIPTIONS.RELATIONSHIP_TYPE:
                if (option?.optionText && userId) {
                    await ProfileService.updateProfile(userId, { relationshipType: option.optionText }).catch((e: unknown) =>
                        console.error('[OnboardingService] Error guardando relación:', e)
                    );
                }
                break;
            case ONBOARDING_PROFILE_DESCRIPTIONS.CAREGIVING_DURATION:
                if (option?.optionText && userId) {
                    await ProfileService.updateProfile(userId, { caregivingDuration: option.optionText }).catch((e: unknown) =>
                        console.error('[OnboardingService] Error guardando duración:', e)
                    );
                }
                break;
        }

        return result;
    }
}
