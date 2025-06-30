import { createRouter, RouterProvider } from '@tanstack/react-router';
import React from 'react';
import ReactDOMClient from 'react-dom/client';

import '@/ui/styles/globals.css';
// import { detectLocale, dynamicActivate } from '@/config/i18n';
// eslint-disable-next-line import/no-unresolved
import { routeTree } from '@/ui/routeTree.gen';

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
