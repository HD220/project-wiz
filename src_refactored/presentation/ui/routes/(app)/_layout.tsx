import React, { useState } from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import { AppSidebar } from '@/presentation/ui/components/layout/AppSidebar';
// import { Button } from '@/presentation/ui/components/ui/button'; // For potential mobile toggle
// import { Menu } from 'lucide-react'; // For potential mobile toggle icon

function AppLayoutComponent() {
  // Placeholder for mobile sidebar toggle state if we were to implement it here
  // const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
      {/*
        AppSidebar is styled with `fixed md:static ... -translate-x-full md:translate-x-0`
        This means on md+ screens, it will take its w-64 space.
        On smaller screens, it's fixed and initially off-screen.
        A button (likely in a top header, not part of this specific layout task)
        would toggle a class or prop to bring it into view (e.g. 'translate-x-0').
      */}
      <AppSidebar
        className="md:flex hidden" // Standard desktop: always flex (visible). Mobile: hidden by default.
                                     // A parent component or a header bar would handle the mobile toggle.
                                     // For example, a header could have a button that sets `isMobileSidebarOpen`
                                     // which would then pass a different className to AppSidebar like:
                                     // className={isMobileSidebarOpen ? 'fixed translate-x-0' : 'fixed -translate-x-full'}
      />

      {/* Mobile Sidebar (example of how it might be toggled, actual toggle button is external) */}
      {/* {isMobileSidebarOpen && (
        <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={toggleMobileSidebar} // Backdrop click to close
        />
      )}
      <AppSidebar
        className={`md:hidden fixed transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        // Pass a close function to NavLinks inside AppSidebar for mobile
        // navLinkOnClick={toggleMobileSidebar}
      /> */}


      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Optional: A top header bar for the main content area could go here */}
        {/* <header className="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Page Title</h1>
        </header> */}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// This defines the layout route for the '(app)' group.
export const Route = createFileRoute('/(app)/_layout')({
  component: AppLayoutComponent,
});
