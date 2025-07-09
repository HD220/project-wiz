import { createRouter, RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOMClient from "react-dom/client";

import "./globals.css";
// import { detectLocale, dynamicActivate } from '@/config/i18n';

import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

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

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
