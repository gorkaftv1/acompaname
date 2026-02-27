'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth.store';

/**
 * Navigation link interface
 */
interface NavLink {
  label: string;
  href: string;
}

/**
 * Props for the Header component
 */
interface HeaderProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * Header Component
 * 
 * Sticky navigation header with mobile menu support.
 * Features smooth scroll detection, responsive design, and animations.
 * All UI text is in Spanish for the target audience.
 * 
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isOnAdminPage = pathname?.startsWith('/admin');

  // Navigation links configuration - conditional based on auth state
  const navigationLinks: NavLink[] = isAuthenticated
    ? [
      { label: 'Inicio', href: '/dashboard' },
      { label: 'Chat', href: '/chat' },
      { label: 'Cuestionarios', href: '/questionnaires' },
      { label: 'Calendario', href: '/calendar' },
    ]
    : [
      { label: 'Inicio', href: '/' },
    ];

  // Handle scroll detection for sticky header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#F5F3EF] shadow-md' : 'bg-transparent'
        } ${className}`}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <motion.a
            href={isAuthenticated ? '/dashboard' : '/'}
            onClick={(e) => {
              e.preventDefault();
              router.push(isAuthenticated ? '/dashboard' : '/');
            }}
            className="text-xl font-bold text-[#2C5F7C] hover:text-[#4A9B9B] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            AcompañaMe
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(link.href);
                }}
                className="text-base text-[#1A1A1A] hover:text-[#4A9B9B] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons / User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/50">
                  <User size={18} className="text-[#2C5F7C]" />
                  <span className="text-sm text-[#1A1A1A]">
                    Hola, <span className="font-medium">{user.name.split(' ')[0]}</span>
                  </span>
                </div>
                {isAdmin && (
                  <Button
                    variant={isOnAdminPage ? 'secondary' : 'primary'}
                    size="md"
                    onClick={() => {
                      router.push(isOnAdminPage ? '/dashboard' : '/admin');
                    }}
                  >
                    <Shield size={16} className="mr-1.5" />
                    {isOnAdminPage ? 'Dashboard' : 'Panel Admin'}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="md"
                  onClick={async () => {
                    await logout();
                    router.push('/');
                  }}
                >
                  <LogOut size={18} className="mr-2" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push('/login')}
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push('/register')}
                >
                  Registrarse
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            className="md:hidden p-2 text-[#2C5F7C] hover:text-[#4A9B9B] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              className="fixed top-14 left-0 right-0 bg-[#F5F3EF] shadow-lg z-50 md:hidden"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Navigation Links */}
                {navigationLinks.map((link, index) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className="block py-3 px-4 text-base text-[#1A1A1A] hover:text-[#4A9B9B] hover:bg-white/50 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(link.href);
                      handleLinkClick();
                    }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {link.label}
                  </motion.a>
                ))}

                {/* Mobile CTA Buttons / User Menu */}
                <motion.div
                  className="pt-4 space-y-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: navigationLinks.length * 0.1 }}
                >
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-white/50">
                        <User size={20} className="text-[#2C5F7C]" />
                        <span className="text-sm text-[#1A1A1A]">
                          Hola, <span className="font-medium">{user.name}</span>
                        </span>
                      </div>
                      {isAdmin && (
                        <Button
                          variant={isOnAdminPage ? 'secondary' : 'primary'}
                          size="md"
                          fullWidth
                          onClick={() => {
                            router.push(isOnAdminPage ? '/dashboard' : '/admin');
                            handleLinkClick();
                          }}
                        >
                          <Shield size={16} className="mr-1.5" />
                          {isOnAdminPage ? 'Dashboard' : 'Panel Admin'}
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="md"
                        fullWidth
                        onClick={async () => {
                          await logout();
                          handleLinkClick();
                          router.push('/');
                        }}
                      >
                        <LogOut size={18} className="mr-2" />
                        Cerrar sesión
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="md"
                        fullWidth
                        onClick={() => {
                          router.push('/login');
                          handleLinkClick();
                        }}
                      >
                        Iniciar sesión
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={() => {
                          router.push('/register');
                          handleLinkClick();
                        }}
                      >
                        Registrarse
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
