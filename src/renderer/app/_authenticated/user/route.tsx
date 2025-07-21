import { createFileRoute, Outlet } from "@tanstack/react-router";

import { UserSidebar } from "@/features/app/components/user-sidebar";

function UserLayout() {
  return (
    <>
      <div className="w-60">
        <UserSidebar />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/user")({
  component: UserLayout,
});
