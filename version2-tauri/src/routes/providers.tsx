import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { ProviderList } from '@/features/providers';

export const Route = createFileRoute('/providers')({
  component: ProvidersPage,
});

function ProvidersPage() {
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
        <ProviderList />
      </div>
    </div>
  );
}
