'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store/auth.store';

export default function ConfigurationCard() {
  const user = useAuthStore(state => state.user);
  const emotionalProfile = user?.emotionalProfile;

  // If no emotional profile data, show placeholder
  if (!emotionalProfile?.communicationPreferences) {
    return (
      <Card>
        <CardContent className="p-6 md:p-8">
          <h3 className="text-xl font-bold text-[#2C5F7C] mb-4">
            Tu Configuración
          </h3>
          <p className="text-gray-600">
            Completa el proceso de onboarding para personalizar tu experiencia.
          </p>
        </CardContent>
      </Card>
    );
  }

  const prefs = emotionalProfile.communicationPreferences;

  const configItems = [
    {
      label: 'Tono de comunicación',
      value: prefs.aiTone || 'No configurado',
      emoji: '💬',
    },
    {
      label: 'Estilo de respuesta',
      value: prefs.preferredLanguageStyle || 'No configurado',
      emoji: '📝',
    },
  ];

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <h3 className="text-xl font-bold text-[#2C5F7C] mb-6">
          Tu Configuración
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm text-gray-600">
                {item.emoji} {item.label}:
              </p>
              <span className="inline-block px-3 py-1 bg-[#4A9B9B]/10 text-[#4A9B9B] rounded-full text-sm font-medium capitalize">
                {item.value}
              </span>
            </div>
          ))}
          
          {prefs.caregivingDuration && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                ⏳ Tiempo cuidando:
              </p>
              <span className="inline-block px-3 py-1 bg-[#4A9B9B]/10 text-[#4A9B9B] rounded-full text-sm font-medium">
                {prefs.caregivingDuration}
              </span>
            </div>
          )}
          
          {emotionalProfile.primaryConcerns && emotionalProfile.primaryConcerns.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                🎯 Desafíos principales:
              </p>
              <span className="inline-block px-3 py-1 bg-[#4A9B9B]/10 text-[#4A9B9B] rounded-full text-sm font-medium">
                {emotionalProfile.primaryConcerns.length} seleccionados
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
