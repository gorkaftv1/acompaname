'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, ChevronRight, Pencil, Trash2 } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Controls how the card is rendered:
 * - 'admin': shows status badge, edit/delete actions, full metadata
 * - 'user' : shows only the call-to-action arrow to begin the questionnaire
 */
type QuestionnaireCardMode = 'admin' | 'user';

export interface QuestionnaireCardProps {
  /** Unique questionnaire identifier */
  id: string;
  /** Questionnaire title */
  title: string;
  /** Optional questionnaire description */
  description?: string | null;
  /** Publication status */
  isActive: boolean;
  /** ISO timestamp of creation */
  createdAt?: string;
  /** Number of questions (optional enrichment) */
  questionCount?: number;
  /**
   * Render mode:
   * - 'admin' → edit + delete actions + status badge
   * - 'user'  → start questionnaire CTA
   * @default 'admin'
   */
  mode?: QuestionnaireCardMode;
  /** Called when the card body or start-arrow is clicked */
  onClick?: () => void;
  /** Admin only: called when the edit action is triggered */
  onEdit?: () => void;
  /** Admin only: called when the delete action is triggered */
  onDelete?: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Badge that reflects the publication status of a questionnaire.
 * Only rendered in 'admin' mode.
 */
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        isActive
          ? 'bg-[#6B9E78]/15 text-[#4a7a56]'
          : 'bg-[#E8B563]/20 text-[#9a6f1e]',
      ].join(' ')}
    >
      {isActive ? (
        <CheckCircle2 size={12} strokeWidth={2.5} />
      ) : (
        <Clock size={12} strokeWidth={2.5} />
      )}
      {isActive ? 'Publicado' : 'Borrador'}
    </span>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * QuestionnaireCard
 *
 * Displays a single questionnaire with metadata and contextual actions.
 */
export const QuestionnaireCard: React.FC<QuestionnaireCardProps> = ({
  id: _id,
  title,
  description,
  isActive,
  createdAt,
  questionCount,
  mode = 'admin',
  onClick,
  onEdit,
  onDelete,
}) => {
  const isAdmin = mode === 'admin';

  const formattedDate = createdAt
    ? new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(createdAt))
    : null;

  return (
    <motion.article
      whileHover={{ y: -3, boxShadow: '0 12px 24px -6px rgb(0 0 0 / 0.09)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-md ring-1 ring-[#E5E7EB]"
    >
      {/* ── Top row ── */}
      <div className="flex items-start justify-between gap-3">

        {/* Icon + title */}
        <button
          onClick={onClick}
          className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9B9B] rounded-lg"
          aria-label={`Abrir cuestionario: ${title}`}
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F3EF]">
            <FileText size={18} className="text-[#2C5F7C]" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[#1A1A1A] leading-snug">
              {title}
            </h3>
            {description && (
              <p className="mt-1 line-clamp-2 text-sm text-[#6B7280] leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </button>

        {/* Status badge — admin only */}
        {isAdmin && (
          <div className="shrink-0 pt-0.5">
            <StatusBadge isActive={isActive} />
          </div>
        )}

        {/* Arrow CTA — user only */}
        {!isAdmin && onClick && (
          <button
            onClick={onClick}
            aria-label="Empezar cuestionario"
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-[#4A9B9B] transition-colors hover:bg-[#4A9B9B]/10"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* ── Footer metadata ── */}
      <div className="flex items-center justify-between gap-4 border-t border-[#E5E7EB] pt-3">

        {/* Meta info */}
        <div className="flex items-center gap-3 text-xs text-[#6B7280]">
          {formattedDate && <span>{formattedDate}</span>}
          {questionCount !== undefined && (
            <>
              {formattedDate && <span>·</span>}
              <span>{questionCount} {questionCount === 1 ? 'pregunta' : 'preguntas'}</span>
            </>
          )}
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label="Editar cuestionario"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F5F3EF] hover:text-[#2C5F7C]"
              >
                <Pencil size={14} />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Eliminar cuestionario"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 size={14} />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
};
