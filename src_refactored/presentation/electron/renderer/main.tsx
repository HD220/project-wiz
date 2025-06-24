import React from 'react';
import ReactDOMClient from 'react-dom/client';
import '../../ui/styles/globals.css'; // Caminho ajustado
import { detectLocale, dynamicActivate } from '../../ui/config/i18n'; // Caminho ajustado
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from '../../ui/routeTree.gen'; // Caminho ajustado

// Declaração de módulo para o TanStack Router (mantida)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({ routeTree }); // routeTree será gerado na nova localização

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Failed to find the root element");
}
const root = ReactDOMClient.createRoot(rootElement);

dynamicActivate(detectLocale()).then(() => {
  root.render(
    <React.StrictMode> {/* Mantido StrictMode */}
      <RouterProvider router={router} />
    </React.StrictMode>
  );
});
