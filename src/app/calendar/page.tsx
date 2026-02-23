'use client';

import PageLayout from '@/components/PageLayout';
import CalendarView from '@/components/calendar/CalendarView';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <PageLayout className="bg-[#F5F3EF]">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <CalendarView />
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
