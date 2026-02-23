'use client';

import PageLayout from '@/components/PageLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <PageLayout className="bg-[#F5F3EF]">
        <DashboardContent />
      </PageLayout>
    </ProtectedRoute>
  );
}
