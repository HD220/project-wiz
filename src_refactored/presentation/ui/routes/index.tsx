import React, { useEffect } from 'react';
import { Navigate, useRouter, createFileRoute } from '@tanstack/react-router';

function RootIndexPageComponent() {
  // Placeholder for authentication logic
  // In a real application, this would come from an auth context, store, or service.
  const isAuthenticated = false; // TODO: Replace with actual authentication check

  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // TODO: Redirect to a default authenticated route, e.g., '/dashboard' or '/projects'
      // For now, let's imagine a '/dashboard' route.
      // router.navigate({ to: '/dashboard', replace: true });
      console.log("User is authenticated, would redirect to dashboard (not implemented yet).");
      // Since dashboard isn't implemented, and Navigate might cause issues if target doesn't exist,
      // we'll just log for now if authenticated. The primary path is unauthenticated -> onboarding.
    }
    // If not authenticated, the <Navigate /> component below will handle it.
  }, [isAuthenticated, router]);

  // If authenticated, logic above would ideally handle navigation.
  // If not authenticated, redirect to onboarding.
  // The Navigate component is preferred for declarative redirects within the render phase.
  if (!isAuthenticated) {
    // Assuming '/onboarding' will be a route within the '(public)' layout group.
    // TanStack Router handles relative paths well. If onboarding is at the root of public,
    // and public layout is just `(public)/_layout.tsx`, then `/onboarding` is correct.
    // If `onboarding` is `(public)/onboarding/index.tsx`, then this is also correct.
    return <Navigate to="/onboarding" replace />;
  }

  // Fallback content if authenticated and not redirected by useEffect yet (e.g., during initial check)
  // Or if the target authenticated route doesn't exist yet.
  return (
    <div className="p-4">
      <p>Loading application...</p>
      {/* Or, if authenticated and dashboard isn't ready: */}
      {isAuthenticated && <p>Authenticated. Dashboard redirect pending or target not ready.</p>}
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: RootIndexPageComponent,
});
