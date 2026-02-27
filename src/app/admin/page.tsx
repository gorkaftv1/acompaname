'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, type Variants, type Transition } from 'framer-motion';
import { Plus, AlertCircle, ClipboardList } from 'lucide-react';
import { QuestionnaireCard } from '@/components/admin/QuestionnaireCard';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/auth.store';
import PageLayout from '@/components/PageLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { AdminQuestionnaireService } from '@/lib/services/admin-questionnaire.service';
import type { AdminSurveySummary } from '@/types/admin.types';

// ─── Types ───────────────────────────────────────────────────────────────────

type PageState = 'loading' | 'unauthorized' | 'error' | 'ready';

// ─── Animation variants ───────────────────────────────────────────────────────

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemTransition: Transition = { duration: 0.3, ease: 'easeOut' as const };

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: itemTransition },
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const SurveySkeleton: React.FC = () => (
  <div className="animate-pulse rounded-2xl bg-white p-5 shadow-md ring-1 ring-[#E5E7EB]">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 h-9 w-9 rounded-xl bg-[#F5F3EF]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded-md bg-[#E5E7EB]" />
        <div className="h-3 w-full rounded-md bg-[#F5F3EF]" />
        <div className="h-3 w-4/5 rounded-md bg-[#F5F3EF]" />
      </div>
      <div className="h-6 w-20 rounded-full bg-[#F5F3EF]" />
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-3">
      <div className="h-3 w-24 rounded-md bg-[#F5F3EF]" />
      <div className="flex gap-1">
        <div className="h-7 w-7 rounded-lg bg-[#F5F3EF]" />
        <div className="h-7 w-7 rounded-lg bg-[#F5F3EF]" />
      </div>
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35 }}
    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-white px-8 py-16 text-center"
  >
    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F3EF]">
      <ClipboardList size={26} className="text-[#2C5F7C]" strokeWidth={1.5} />
    </span>
    <h3 className="text-base font-semibold text-[#1A1A1A]">
      Todavía no hay cuestionarios
    </h3>
    <p className="mt-1.5 max-w-xs text-sm text-[#6B7280] leading-relaxed">
      Crea el primer cuestionario para que los usuarios puedan comenzar a responder.
    </p>
    <button
      onClick={onCreateClick}
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2C5F7C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#245170] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9B9B]"
    >
      <Plus size={16} strokeWidth={2.5} />
      Crear cuestionario
    </button>
  </motion.div>
);

// ─── Error banner ─────────────────────────────────────────────────────────────

const ErrorBanner: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
    <div className="flex-1 text-sm text-red-700">
      <span className="font-medium">Error al cargar los cuestionarios:</span>{' '}
      {message}
    </div>
    <button
      onClick={onRetry}
      className="shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
    >
      Reintentar
    </button>
  </div>
);


function AdminContent() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { user } = useAuthStore();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [surveys, setSurveys] = useState<AdminSurveySummary[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: 'default' | 'danger';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  // ── Admin guard + data fetch ──────────────────────────────────────────────
  const initialize = useCallback(async () => {
    setPageState('loading');
    setFetchError(null);

    // Wait for auth store to settle
    if (!user) return;

    // Route guard: redirect non-admins
    if (user.role !== 'admin') {
      setPageState('unauthorized');
      return;
    }

    try {
      const surveysData = await AdminQuestionnaireService.getAllQuestionnaires(supabase);
      setSurveys(surveysData);
      setPageState('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setFetchError(message);
      setPageState('ready');
    }
  }, [supabase, user]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ── Action handlers ─────────────────────────────────────────────────────
  const handleCreateSurvey = () => {
    router.push('/admin/questionnaires/new');
  };

  const handleEditSurvey = (id: string) => {
    router.push(`/admin/questionnaires/${id}`);
  };

  const handleDeleteSurvey = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar cuestionario',
      message: '¿Seguro que quieres eliminar este cuestionario? Esta acción no se puede deshacer.',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await AdminQuestionnaireService.deleteQuestionnaire(id, supabase);
          setSurveys((prev) => prev.filter((s) => s.id !== id));
        } catch (err: any) {
          alert(`No se pudo eliminar: ${err.message}`);
        }
      },
    });
  };

  // ── Render: unauthorized ──────────────────────────────────────────────────
  if (pageState === 'unauthorized') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle size={28} className="text-red-400" />
        </span>
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Acceso denegado</h1>
        <p className="max-w-xs text-sm text-[#6B7280]">
          No tienes permisos de administrador para ver esta página.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="rounded-xl bg-[#2C5F7C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#245170]"
        >
          Ir al dashboard
        </button>
      </div>
    );
  }

  // ── Render: main view ─────────────────────────────────────────────────────
  const isLoading = pageState === 'loading';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* ── Page header ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Cuestionarios</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {isLoading
              ? 'Cargando…'
              : `${surveys.length} ${surveys.length === 1 ? 'cuestionario' : 'cuestionarios'} en total`}
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCreateSurvey}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-[#2C5F7C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#245170] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A9B9B] sm:self-auto"
        >
          <Plus size={16} strokeWidth={2.5} />
          Crear nuevo cuestionario
        </motion.button>
      </div>

      {/* ── Error banner ── */}
      {fetchError && (
        <div className="mb-6">
          <ErrorBanner message={fetchError} onRetry={initialize} />
        </div>
      )}

      {/* ── Survey grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SurveySkeleton key={i} />
          ))}
        </div>
      ) : surveys.length === 0 && !fetchError ? (
        <EmptyState onCreateClick={handleCreateSurvey} />
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {surveys.map((survey) => (
              <motion.div key={survey.id} variants={itemVariants} layout>
                <QuestionnaireCard
                  id={survey.id}
                  title={survey.title}
                  description={survey.description}
                  isActive={survey.status === 'published'}
                  createdAt={survey.created_at}
                  mode="admin"
                  onClick={() => handleEditSurvey(survey.id)}
                  onEdit={() => handleEditSurvey(survey.id)}
                  onDelete={() => handleDeleteSurvey(survey.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

// ─── Page component (wrapped with ProtectedRoute + PageLayout) ────────────

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <PageLayout className="bg-[#F5F3EF]">
        <AdminContent />
      </PageLayout>
    </ProtectedRoute>
  );
}
