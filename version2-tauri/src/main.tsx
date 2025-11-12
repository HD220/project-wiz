import { StrictMode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { useAuthStore } from './features/auth/store';
import './index.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Root component
function App() {
  const { checkAuth } = useAuthStore();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
