'use client';

/**
 * /onboarding — Página de Onboarding Dinámico
 *
 * Contenedor limpio que monta el motor DynamicOnboarding.
 * La carga de preguntas, la sesión y el progressive profiling
 * se gestionan internamente en el componente.
 *
 * NOTA: Esta página es accesible sin autenticación.
 */

import DynamicOnboarding from '@/components/onboarding/DynamicOnboarding';
import PageLayout from '@/components/PageLayout';

export default function OnboardingPage() {
  return (
    <PageLayout className="bg-[#F5F3EF]">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <DynamicOnboarding />
      </div>
    </PageLayout>
  );
}