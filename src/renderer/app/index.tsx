import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../store/auth-store';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    // This will be the main entry point that redirects based on auth state
  },
  component: IndexComponent,
});

function IndexComponent() {
  const { isAuthenticated, isLoading, validateToken, isFirstRun, createDefaultAccount, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    async function checkAuthState() {
      try {
        // Check if this is the first run
        const firstRun = await isFirstRun();
        
        if (firstRun) {
          setIsFirstTime(true);
          setIsChecking(false);
          return;
        }

        // Try to validate existing token
        if (await validateToken()) {
          // Redirect to dashboard if authenticated
          window.location.hash = '/user';
        } else {
          // Redirect to login if not authenticated
          window.location.hash = '/login';
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.hash = '/login';
      } finally {
        setIsChecking(false);
      }
    }

    checkAuthState();
  }, [validateToken, isFirstRun]);

  const handleCreateDefaultAccount = async () => {
    try {
      await createDefaultAccount();
      // Redirect to dashboard after creating default account
      window.location.hash = '/user';
    } catch (error) {
      console.error('Failed to create default account:', error);
    }
  };

  // Show loading spinner while checking auth state
  if (isChecking || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Project Wiz...</p>
        </div>
      </div>
    );
  }

  // First run setup
  if (isFirstTime) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Project Wiz</CardTitle>
            <p className="text-muted-foreground">
              Let's set up your workspace
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This appears to be your first time using Project Wiz. We'll create a default administrator account for you to get started.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Default Account:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Username: admin</li>
                <li>• Password: admin123</li>
                <li>• Display Name: Administrator</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              You can change these credentials later in the settings.
            </p>
            <Button 
              onClick={handleCreateDefaultAccount} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Account & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This should not be reached as we redirect above
  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirecting...</p>
    </div>
  );
}