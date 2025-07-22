import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import ReactDOMClient from "react-dom/client";

import "./globals.css";
// import { detectLocale, dynamicActivate } from '@/config/i18n';

import { AuthProvider, useAuth } from "@/renderer/contexts/auth.context";

import { routeTree } from "./routeTree.gen";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const router = createRouter({ routeTree, context: undefined! });

// Declaração de módulo para o TanStack Router (mantida)
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}
const root = ReactDOMClient.createRoot(rootElement);

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

root.render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>,
);
