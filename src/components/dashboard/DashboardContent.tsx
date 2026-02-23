'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import { MessageCircle, BookOpen, Heart, Calendar } from 'lucide-react';
import QuickActionCard from './QuickActionCard';
import ConfigurationCard from './ConfigurationCard';
import { useAuthStore } from '@/lib/store/auth.store';

export default function DashboardContent() {
  const [companionSize, setCompanionSize] = useState(180);
  const user = useAuthStore(state => state.user);
  
  useEffect(() => {
    const updateSize = () => {
      setCompanionSize(window.innerWidth >= 768 ? 220 : 180);
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const daysActive = 0;
  const journalEntries = 0;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Welcome Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12"
      >
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C5F7C]">
            ¡Hola, {user?.name || 'Usuario'}! 👋
          </h1>
          <p className="text-lg text-gray-700">
            Bienvenido a tu espacio personal de apoyo
          </p>
          
          {/* Quick stats badges */}
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 bg-[#6B9E78]/10 text-[#6B9E78] rounded-full font-medium">
              🌱 {daysActive} días contigo
            </span>
            <span className="px-3 py-1 bg-[#E8B563]/10 text-[#E8B563] rounded-full font-medium">
              📝 {journalEntries} entradas
            </span>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <EmotionalCompanion 
            size={companionSize}
            emotion="calm"
            animated={true}
          />
        </div>
      </motion.section>

      {/* Quick Actions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#2C5F7C]">
            Acciones Rápidas
          </h2>
          <p className="text-gray-600">
            ¿Qué te gustaría hacer hoy?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Habla con IA"
            description="Tu compañero siempre disponible"
            icon={MessageCircle}
            color="green"
            href="/chat"
          />
          
          <QuickActionCard
            title="Calendario Emocional"
            description="Registra y visualiza tu día a día"
            icon={Calendar}
            color="lavender"
            href="/calendar"
          />

          <QuickActionCard
            title="Realiza un cuestionario"
            description="Evalúa tu bienestar emocional"
            icon={BookOpen}
            color="coral"
            href="/questionnaires"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12"
      >
        <h2 className="text-2xl font-bold text-[#2C5F7C] mb-6">
          Tu Configuración
        </h2>
        <ConfigurationCard />
      </motion.div>

      {/* Prototype Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-500 italic">
          💡 Dashboard completo próximamente - Esta es una vista previa del prototipo
        </p>
      </motion.div>
    </div>
    </>
  );
}
