'use client';

import PageLayout from '@/components/PageLayout';
import ChatInterface from '@/components/chat/ChatInterface';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <PageLayout className="bg-[#F5F3EF]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ChatInterface />
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
