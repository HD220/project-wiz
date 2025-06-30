import { Outlet, createFileRoute } from '@tanstack/react-router';
import React from 'react';

// Import actual UserSidebar
import { UserSidebar } from '@/presentation/ui/features/user/components/layout/UserSidebar';

// Temporary UserSidebar placeholder for layout structure - REMOVED
// const UserSidebarPlaceholder = () => (
//   <aside className="w-72 flex-shrink-0 bg-slate-100 dark:bg-slate-800/70 p-4 border-r border-slate-200 dark:border-slate-700 h-full">
//     <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6"></div> {/* User header placeholder */}
//     <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2 w-3/4"></div> {/* Search placeholder */}
//     <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div> {/* Separator */}
//     <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3 w-1/2"></div> {/* DM Title placeholder */}
//     {[...Array(5)].map((_item, index) => ( // DM list placeholder
//       <div key={`dm-${index}`} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
//     ))}
//   </aside>
// );


function UserLayoutComponent() {
  return (
    // This div takes flex-1 and h-full from its parent in (app)/_layout.tsx
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Use actual UserSidebar */}
      <UserSidebar />

      {/* Main Content Area for DMs, User Settings (if routed here), etc. */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        {/*
          The Outlet will render child routes of /user/, for example:
          - /user/ (defined by app/(app)/user/index.tsx)
          - /user/dm/$conversationId (defined by app/(app)/user/dm/$conversationId/index.tsx)
          Child pages should handle their own padding and scroll if necessary.
        */}
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createFileRoute('/(app)/user/_layout')({
  component: UserLayoutComponent,
});
