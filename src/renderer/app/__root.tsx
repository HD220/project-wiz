import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { Titlebar } from "@/renderer/components/layout/titlebar";
import { Toaster } from "@/renderer/components/ui/sonner";
import type { AuthContextType } from "@/renderer/contexts/auth.context";

interface RouterContext {
  auth: AuthContextType;
}

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

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
