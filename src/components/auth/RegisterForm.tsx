'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth.store';
import { EmotionalCompanion } from '@/components/EmotionalCompanion';
import { Button, Input, Checkbox } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { ResponseService } from '@/services/response.service';

export default function RegisterForm() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Auto-fill from guest onboarding progress
  useEffect(() => {
    const guestProgress = ResponseService.getGuestProgress();
    if (guestProgress?.userName) {
      setName(guestProgress.userName);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    // Validate password match
    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validate terms acceptance
    if (!acceptedTerms) {
      setValidationError('Debes aceptar los términos y condiciones');
      return;
    }

    // Sanitize name
    const sanitizedName = name.trim();
    if (!sanitizedName) {
      setValidationError('El nombre no puede estar vacío');
      return;
    }

    await register({ name: sanitizedName, email: email.trim(), password });

    // If registration successful, redirect to onboarding
    const state = useAuthStore.getState();
    if (state.isAuthenticated) {
      router.push('/onboarding');
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
            Únete a AcompañaMe
          </h1>

          {/* Subheading */}
          <p className="text-base text-center text-gray-600 mb-8">
            Crea tu cuenta para comenzar
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre completo"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Escribe de nuevo tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <div className="mt-4">
              <Checkbox
                label="Acepto los términos y condiciones"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms(!acceptedTerms)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-600 mt-1 ml-8">
                Lee nuestros{' '}
                <a href="#" className="text-[#4A9B9B] hover:underline">
                  términos y condiciones
                </a>
              </p>
            </div>

            {(error || validationError) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 text-center mt-2"
              >
                {error || validationError}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-[#2C5F7C]">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#4A9B9B] hover:underline font-medium">
              Inicia sesión
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
