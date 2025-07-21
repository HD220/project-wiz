import { createFileRoute, Outlet } from "@tanstack/react-router";

import { UserSidebar } from "@/renderer/features/app/components/user-sidebar";

function UserLayout() {
  return (
    <div className="h-full w-full flex">
      <div className="w-60 h-full">
        <UserSidebar />
      </div>
      <main className="flex-1 h-full">
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user")({
  component: UserLayout,
});
