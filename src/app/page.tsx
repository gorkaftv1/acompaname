'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Users, ArrowRight } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  return (
    <PageLayout className="bg-[#F5F3EF]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2C5F7C] leading-tight mb-4 md:mb-6">
                No estás solo en este camino
              </h1>
              
              {/* Subheading */}
              <p className="text-lg md:text-xl text-gray-700 max-w-6xl mx-auto leading-relaxed mb-8 md:mb-12">
                AcompañaMe es tu espacio seguro de apoyo emocional, diseñado especialmente 
                para personas que cuidan a alguien con enfermedad mental.
              </p>
            </motion.div>
            
            {/* EmotionalCompanion with responsive sizes */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center mb-8 md:mb-12"
            >
              <div className="block sm:hidden">
                <EmotionalCompanion emotion="calm" size={200} />
              </div>
              <div className="hidden sm:block md:hidden">
                <EmotionalCompanion emotion="calm" size={250} />
              </div>
              <div className="hidden md:block">
                <EmotionalCompanion emotion="calm" size={300} />
              </div>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto px-8 py-3 text-lg group">
                  Comenzar
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/chat" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto px-8 py-3 text-lg">
                  Hablar con IA
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white/50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C5F7C] mb-4">
              ¿Cómo te ayudamos?
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto">
              Herramientas diseñadas para apoyarte en tu día a día
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1: Compañía Emocional */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card variant="default" className="h-full p-6 md:p-8 hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-[#4A9B9B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-12 h-12 text-[#4A9B9B]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C5F7C] mb-3">
                  Compañía Emocional
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Un compañero de IA empático que te escucha sin juzgar, 
                  disponible las 24 horas para brindarte apoyo cuando lo necesites.
                </p>
              </Card>
            </motion.div>
            
            {/* Feature 2: Diario Personal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card variant="default" className="h-full p-6 md:p-8 hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-[#A8C5B5]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-12 h-12 text-[#2C5F7C]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C5F7C] mb-3">
                  Diario Personal
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Registra tus emociones, experiencias y desafíos diarios. 
                  Visualiza tu progreso y reconoce tus fortalezas con el tiempo.
                </p>
              </Card>
            </motion.div>
            
            {/* Feature 3: Recursos Útiles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card variant="default" className="h-full p-6 md:p-8 hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-[#4A9B9B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-[#4A9B9B]" />
                </div>
                <h3 className="text-xl font-bold text-[#2C5F7C] mb-3">
                  Recursos Útiles
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  Accede a información sobre cuidados, estrategias de autocuidado 
                  y conexión con una comunidad que entiende tu experiencia.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

