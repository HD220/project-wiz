import React from 'react';
import ReactDOMClient from 'react-dom/client';
import './styles/globals.css'; // Caminho ajustado para o novo local
// import { detectLocale, dynamicActivate } from './config/i18n'; // Caminho ajustado se i18n for re-adicionado aqui
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen'; // Caminho ajustado para o novo local

// Declaração de módulo para o TanStack Router (mantida)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({ routeTree });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Failed to find the root element");
}
const root = ReactDOMClient.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
