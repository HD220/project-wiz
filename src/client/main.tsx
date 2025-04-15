const csp = `default-src 'self'; script-src 'self' 'nonce-abc123'; style-src 'self' 'nonce-abc123'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'self';`;⏎⏎const meta = document.createElement('meta');⏎meta.httpEquiv = 'Content-Security-Policy';⏎meta.content = csp;⏎document.head.appendChild(meta);⏎
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return (
    <RouterProvider router={router} />
  );
}

