import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { ConversationList } from '@/features/conversations';

export const Route = createFileRoute('/conversations')({
  component: ConversationsPage,
});

function ConversationsPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <ConversationList />
      </div>
    </div>
  );
}
