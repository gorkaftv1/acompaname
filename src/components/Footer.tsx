'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Twitter, Instagram } from 'lucide-react';

/**
 * Footer link interface
 */
interface FooterLink {
  label: string;
  href: string;
}

/**
 * Props for the Footer component
 */
interface FooterProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * Footer Component
 * 
 * App footer with three-column layout (desktop) and stacked layout (mobile).
 * Includes company info, quick links, and contact/social media.
 * All UI text is in Spanish for the target audience.
 * 
 * @example
 * ```tsx
 * <Footer />
 * ```
 */
export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  // Quick links configuration
  const quickLinks: FooterLink[] = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Características', href: '#caracteristicas' },
    { label: 'Recursos', href: '#recursos' },
    { label: 'Privacidad', href: '#privacidad' },
    { label: 'Términos', href: '#terminos' },
  ];

  // Social media links configuration
  const socialLinks = [
    {
      icon: Mail,
      href: 'mailto:hola@acompañame.app',
      label: 'Email',
    },
    {
      icon: Twitter,
      href: 'https://twitter.com',
      label: 'Twitter',
    },
    {
      icon: Instagram,
      href: 'https://instagram.com',
      label: 'Instagram',
    },
  ];

  return (
    <footer className={`bg-[#2C5F7C] text-[#F5F3EF] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1 - About Us */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">AcompañaMe</h3>
            <p className="text-base font-medium text-[#F5F3EF]/90">
              Apoyo emocional para cuidadores
            </p>
            <p className="text-sm text-[#F5F3EF]/70 leading-relaxed">
              Una plataforma diseñada para acompañar a cuidadores de personas
              con enfermedades mentales, ofreciendo herramientas y apoyo
              emocional en cada paso del camino.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <motion.a
                    href={link.href}
                    className="text-sm text-[#F5F3EF]/80 hover:text-[#A8C5B5] transition-colors inline-block"
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contacto</h3>
            <div className="space-y-3">
              <a
                href="mailto:hola@acompañame.app"
                className="text-sm text-[#F5F3EF]/80 hover:text-[#A8C5B5] transition-colors block"
              >
                hola@acompañame.app
              </a>

              {/* Social Media Icons */}
              <div className="flex space-x-4 pt-2">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      className="text-[#F5F3EF]/70 hover:text-[#4A9B9B] transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconComponent size={20} />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#F5F3EF]/20 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-[#F5F3EF]/70 text-center md:text-left">
              © 2026 AcompañaMe. Todos los derechos reservados.
            </p>

            {/* Made with love */}
            <p className="text-sm text-[#F5F3EF]/70 text-center md:text-right">
              Hecho con <span className="text-red-400">❤️</span> para cuidadores
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
