import React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';

function PublicLayoutComponent() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-8 sm:pt-12 md:pt-16 p-4 bg-slate-50 dark:bg-slate-900">
      {/*
        This layout is nested within the __root.tsx layout,
        so ThemeProvider and QueryClientProvider are already applied.
        Public pages often have a simpler, centered layout.
      */}
      <main className="w-full max-w-lg px-4 py-8 sm:px-6 lg:px-8">
        {/* Example: A card-like container for content could be added here or in specific pages */}
        <Outlet />
      </main>
      {/* Optional: A minimal public footer could go here */}
      {/*
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} Project Wiz
      </footer>
      */}
    </div>
  );
}

// This defines the layout route for the '(public)' group.
// The path '/' within createFileRoute for a layout usually means it applies to its directory.
// For a group layout `(public)/_layout.tsx`, TanStack Router's generator handles the path implicitly.
// Providing an explicit path like `/(public)/_layout` in createFileRoute can sometimes be necessary
// if the generator isn't perfectly inferring, but often just `component` is enough for layouts.
// However, to be explicit and align with potential strict generation:
export const Route = createFileRoute('/_layout')({
  // Note: The path for `createFileRoute` within a group layout `(group)/_layout.tsx`
  // should typically be just `/` if it's meant to be the layout for that group,
  // or it might be specific if this layout itself has a path segment *within* the group.
  // Given it's `_layout.tsx`, it's defining the layout for the `(public)` group itself.
  // The TanStack Router docs suggest that for a layout route file like `posts/_layout.tsx`,
  // you'd use `createFileRoute('/posts/_layout')`.
  // So for `(public)/_layout.tsx`, `createFileRoute('/(public)/_layout')` is appropriate.
  // Let's use the path that matches its file system location relative to the routes root.
  // The generator will handle the `(public)` part not being in the URL.
  id: 'public-layout', // Optional but good for dev tools and clarity
  component: PublicLayoutComponent,
});
