import { createFileRoute, Outlet } from "@tanstack/react-router";
import { UserSidebar } from "@/features/dashboard/components/user-sidebar";

function UserLayout() {
  return (
    <>
      <UserSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/user")({
  component: UserLayout,
});