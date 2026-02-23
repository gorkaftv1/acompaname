import { create } from 'zustand';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from './auth.store';
import type { OnboardingFormData, Database } from '@/types';
import { defaultOnboardingFormData } from '@/types';
import type { Json } from '@/lib/supabase/database.types';

/**
 * Onboarding Store
 * 
 * Manages multi-step onboarding flow and form data.
 * Persists data across steps and handles completion.
 */

interface OnboardingState {
  currentStep: number;
  formData: OnboardingFormData;
  
  // Actions
  setStep: (step: number) => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetOnboarding: () => void;
  completeOnboarding: () => Promise<void>;
}

// Initial form data with default values
const initialFormData: OnboardingFormData = defaultOnboardingFormData;

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  // Initial state
  currentStep: 1,
  formData: initialFormData,
  
  // Set specific step
  setStep: (step: number) => {
    if (step >= 1 && step <= 3) {
      set({ currentStep: step });
    }
  },
  
  // Update form data (merge with existing)
  updateFormData: (data: Partial<OnboardingFormData>) => {
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    }));
  },
  
  // Move to next step
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 3) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  // Move to previous step
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  // Reset onboarding to initial state
  resetOnboarding: () => {
    set({
      currentStep: 1,
      formData: initialFormData,
    });
  },
  
  // Complete onboarding
  completeOnboarding: async () => {
    const { formData } = get();
    
    try {
      // Get current user from auth store (already loaded)
      const authUser = useAuthStore.getState().user;
      
      if (!authUser) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión primero.');
      }
      
      console.log('🔄 Guardando onboarding para usuario:', authUser.id);
      
      // Update profile with onboarding data
      const supabase = createBrowserClient();
      
      // TypeScript has issues with Supabase's generic type inference in singleton pattern
      // The types are correct at runtime, so we suppress the error
      const { error: updateError } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase client type inference issue
        .update({
          name: formData.userName,
          caregiving_for: formData.caregivingFor,
          relationship_type: formData.relationshipType,
          condition: formData.condition,
          caregiving_duration: formData.caregivingDuration,
          main_challenges: formData.mainChallenges,
          support_needs: formData.supportNeeds,
          ai_tone: formData.aiTone,
          preferred_language_style: formData.preferredLanguageStyle,
          notification_preferences: formData.notificationPreferences as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error('No se pudo guardar la configuración');
      }
      
      // Save to localStorage for quick access
      localStorage.setItem('acompañame_onboarding', JSON.stringify(formData));
      localStorage.setItem('acompañame_onboarding_completed', 'true');
      
      console.log('✅ Onboarding completed successfully');
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error instanceof Error 
        ? error 
        : new Error('No se pudo completar el proceso. Por favor, intenta de nuevo.');
    }
  },
}));
