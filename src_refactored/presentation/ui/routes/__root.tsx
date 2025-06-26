import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/presentation/ui/components/common/theme-provider';

const queryClient = new QueryClient();

function RootApplicationLayout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-foreground">
          <Outlet />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default RootApplicationLayout;
