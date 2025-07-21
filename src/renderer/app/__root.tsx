import { createRootRoute, Outlet } from "@tanstack/react-router";

import { Titlebar } from "@/components/layout/titlebar";
import { Toaster } from "@/components/ui/sonner";

function RootComponent() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Titlebar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
