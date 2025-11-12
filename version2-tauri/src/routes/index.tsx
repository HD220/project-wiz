import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { LoginForm, RegisterForm } from '@/features/auth/components';
import { useAuthStore } from '@/features/auth/store';

export const Route = createFileRoute('/')({
  component: AuthPage,
});

function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = () => {
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {showRegister ? (
        <RegisterForm
          onSuccess={handleSuccess}
          onLoginClick={() => setShowRegister(false)}
        />
      ) : (
        <LoginForm
          onSuccess={handleSuccess}
          onRegisterClick={() => setShowRegister(true)}
        />
      )}
    </div>
  );
}
