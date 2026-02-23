/**
 * ProtectedRoute Component
 * 
 * Wrapper component that protects routes requiring authentication.
 * Redirects to login if user is not authenticated.
 * Shows loading state while checking authentication.
 */

'use client';

import { useAuthProtection } from '@/lib/hooks/useAuthProtection';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuthProtection();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#4A9B9B] border-t-transparent mb-4"></div>
          <p className="text-[#2C5F7C] font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  // If not authenticated, useAuthProtection will redirect to login
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}
