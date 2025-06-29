import { Outlet, createFileRoute } from '@tanstack/react-router';
import React from 'react'; // Removed useState as it's no longer used directly here

import { AppSidebar } from '@/presentation/ui/components/layout/AppSidebar';
// Mobile toggle related imports and logic are removed as the new AppSidebar is fixed width
// and mobile handling would be a separate, more complex feature.

function AppLayoutComponent() {
  return (
    <div className="flex h-screen bg-background text-foreground"> {/* Use theme variables */}
      {/* AppSidebar is now always visible and has a fixed width (w-16) */}
      <AppSidebar /> {/* Removed className prop, styling is now self-contained or via its own props if needed */}

      {/*
        Main content area will now be to the right of the thin AppSidebar.
        It will be the container for further nested layouts
        (e.g., User layout with UserSidebar + Content, or Project layout with ProjectContextSidebar + Content + ParticipantsSidebar)
      */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/*
          The <Outlet /> here will render the next level of layout or page.
          For example, if navigating to /user/conversations, it might render UserLayout.
          If navigating to /projects/$projectId, it might render ProjectLayout.
          These nested layouts will then be responsible for their own multi-panel setups if needed.
          The padding previously on this div is removed, as child layouts/pages should handle their own padding.
        */}
        <Outlet />
      </div>
    </div>
  );
}

// This defines the layout route for the '(app)' group.
export const Route = createFileRoute('/(app)/_layout')({
  component: AppLayoutComponent,
});
