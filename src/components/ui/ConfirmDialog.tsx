'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

export interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Continuar',
    cancelLabel = 'Cancelar',
    variant = 'default',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    // Close on Escape
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
    }, [onCancel]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent body scroll while open
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    const confirmClass = variant === 'danger'
        ? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-500 text-white'
        : 'bg-[#4A9B9B] hover:bg-[#3a8888] focus-visible:ring-[#4A9B9B] text-white';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
                        onClick={onCancel}
                        aria-hidden="true"
                    />

                    {/* Dialog */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            key="dialog"
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="confirm-title"
                            aria-describedby="confirm-message"
                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 8 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="pointer-events-auto w-full max-wxl rounded-2xl border border-[#E5E7EB] bg-white shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 p-6 pb-4">
                                <div className="flex items-center gap-3">
                                    {variant === 'danger' ? (
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                                            <AlertTriangle size={18} className="text-red-500" />
                                        </div>
                                    ) : (
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50">
                                            <HelpCircle size={18} className="text-[#4A9B9B]" />
                                        </div>
                                    )}
                                    <h2 id="confirm-title" className="text-base font-bold text-[#1A1A1A]">
                                        {title}
                                    </h2>
                                </div>
                                <button
                                    onClick={onCancel}
                                    className="p-1 text-[#6B7280] hover:text-[#1A1A1A] rounded-lg hover:bg-gray-100 transition-colors"
                                    aria-label="Cerrar"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Body */}
                            <p id="confirm-message" className="px-6 pb-6 text-sm leading-relaxed text-[#6B7280]">
                                {message}
                            </p>

                            {/* Footer */}
                            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-6 py-4">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="rounded-xl border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    className={`rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 ${confirmClass}`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
