'use client';

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

/**
 * DemoBanner Component
 * 
 * Shows a prominent notice that this is a demo prototype.
 * Appears at the top of the app for team demonstrations.
 */
export default function DemoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-[#4A9B9B] to-[#6B9E78] text-white py-2 px-4 text-center text-sm md:text-base font-medium shadow-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>
          <strong>Modo Demo:</strong> Prototipo funcional con datos de ejemplo (María García)
        </span>
      </div>
    </motion.div>
  );
}
