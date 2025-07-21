import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { RootSidebar } from "@/renderer/features/app/components/root-sidebar";
import { useAuthStore } from "@/renderer/store/auth.store";

function AuthenticatedLayout() {
  return (
    <div className="h-full w-full flex">
      <RootSidebar />
      <div className="flex-1 flex">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { isAuthenticated, getCurrentUser } = useAuthStore.getState();

    if (!isAuthenticated) {
      await getCurrentUser();

      const { isAuthenticated: stillAuthenticated } = useAuthStore.getState();
      if (!stillAuthenticated) {
        throw redirect({ to: "/auth/login" });
      }
    }
  },
  component: AuthenticatedLayout,
});
