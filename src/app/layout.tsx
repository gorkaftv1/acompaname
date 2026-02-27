import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { User } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import "./globals.css";

export const metadata: Metadata = {
  title: "AcompañaMe - Apoyo para Cuidadores",
  description: "Apoyo emocional con IA para personas que cuidan a alguien con enfermedad mental",
};


const mapSupabaseUser = (
  supabaseUser: SupabaseUser,
  profile?: {
    name?: string | null;
    role?: 'admin' | 'user' | null;
    caregiving_for?: string | null;
    relationship_type?: string | null;
    condition?: string | null;
    caregiving_duration?: string | null;
    main_challenges?: string[] | null;
    support_needs?: string | null;
    ai_tone?: 'formal' | 'casual' | 'friendly' | null;
    preferred_language_style?: 'direct' | 'detailed' | 'balanced' | null;
    notification_preferences?: any | null;
  }
): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuario',
  role: profile?.role ?? 'user',
  caregivingFor: profile?.caregiving_for ?? undefined,
  relationshipType: profile?.relationship_type ?? undefined,
  condition: profile?.condition ?? undefined,
  caregivingDuration: profile?.caregiving_duration ?? undefined,
  mainChallenges: profile?.main_challenges ?? undefined,
  supportNeeds: profile?.support_needs ?? undefined,
  aiTone: profile?.ai_tone ?? undefined,
  preferredLanguageStyle: profile?.preferred_language_style ?? undefined,
  notificationPreferences: profile?.notification_preferences ?? undefined,
  createdAt: supabaseUser.created_at,
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient();
  const { data: { user: sessionUser } } = await supabase.auth.getUser();

  let mappedUser: User | null = null;
  if (sessionUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .maybeSingle();

    mappedUser = mapSupabaseUser(sessionUser, profile ?? undefined);
  }

  return (
    <html lang="es">
      <body className="antialiased">
        <AuthProvider initialUser={mappedUser} />
        {children}
      </body>
    </html>
  );
}
