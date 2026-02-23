/**
 * /onboarding/questionnaire — Cuestionario dinámico de Wellness
 *
 * Ruta nueva que aloja el motor de cuestionario dinámico de Supabase.
 * La ruta /onboarding original (3 pasos estáticos) no se modifica.
 */

import PageLayout from '@/components/PageLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/Card';
import DynamicOnboarding from '@/components/onboarding/DynamicOnboarding';

export const metadata = {
    title: 'Cuestionario de Acompañamiento | AcompañaMe',
    description: 'Cuéntanos sobre ti para personalizar tu experiencia de acompañamiento.',
};

export default function QuestionnairePage() {
    return (
        <ProtectedRoute>
            <PageLayout className="bg-[#F5F3EF]">
                <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
                    {/* Encabezado */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-deep-calm-blue mb-2">
                            Cuestionario de Acompañamiento
                        </h1>
                        <p className="text-deep-calm-blue/60 text-sm max-w-md mx-auto">
                            Responde a tu ritmo. Puedes escribir con libertad — aquí no hay respuestas correctas o incorrectas.
                        </p>
                    </div>

                    {/* Motor de cuestionario */}
                    <Card className="shadow-sm">
                        <CardContent className="p-5 sm:p-7 md:p-9">
                            <DynamicOnboarding />
                        </CardContent>
                    </Card>

                    {/* Nota de privacidad */}
                    <p className="mt-6 text-center text-xs text-deep-calm-blue/40">
                        Tus respuestas son confidenciales y se usan únicamente para personalizar tu acompañamiento.
                    </p>
                </div>
            </PageLayout>
        </ProtectedRoute>
    );
}
