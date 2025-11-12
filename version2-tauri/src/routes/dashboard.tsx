import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Wiz</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => navigate({ to: '/agents' })}
          >
            <CardHeader>
              <CardTitle>Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your AI agents
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => navigate({ to: '/providers' })}
          >
            <CardHeader>
              <CardTitle>Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure LLM providers
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => navigate({ to: '/projects' })}
          >
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your development projects
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => navigate({ to: '/conversations' })}
          >
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Channels and direct messages
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
