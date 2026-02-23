'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth.store';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import { Button, Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';

export default function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    await login(email, password);
    
    // If login successful (isAuthenticated will be true), redirect
    const state = useAuthStore.getState();
    if (state.isAuthenticated) {
      router.push('/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 md:p-8">
        <div>
          {/* EmotionalCompanion */}
          <div className="flex justify-center mb-6">
            <EmotionalCompanion emotion="calm" size={120} />
          </div>
          
          {/* Heading */}
          <h1 className="text-2xl md:text-3xl font-bold text-center text-[#2C5F7C] mb-2">
            Bienvenido de nuevo
          </h1>
          
          {/* Subheading */}
          <p className="text-base text-center text-gray-600 mb-8">
            Inicia sesión para continuar
          </p>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 text-center mt-2"
              >
                {error}
              </motion.div>
            )}
            
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-[#2C5F7C]">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-[#4A9B9B] hover:underline font-medium">
              Regístrate
            </Link>
          </div>
        </div>
      </Card>
      
      {/* Back Link */}
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-gray-600 hover:text-[#2C5F7C]">
          ← Volver al inicio
        </Link>
      </div>
    </motion.div>
  );
}
