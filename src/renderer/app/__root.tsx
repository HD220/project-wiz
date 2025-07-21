import { createRootRoute, Outlet } from "@tanstack/react-router";

import { Titlebar } from "@/components/layout/titlebar";

function RootComponent() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Titlebar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
