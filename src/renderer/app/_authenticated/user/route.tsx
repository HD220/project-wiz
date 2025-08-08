import { createFileRoute, Outlet } from "@tanstack/react-router";

import { UserSidebar } from "@/renderer/components/app/user-sidebar";

function UserLayout() {
  return (
    <div className="h-full w-full flex">
      <div className="w-60 h-full flex-shrink-0 min-w-0 overflow-hidden">
        <UserSidebar />
      </div>
      <main className="flex-1 h-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user")({
  component: UserLayout,
});
