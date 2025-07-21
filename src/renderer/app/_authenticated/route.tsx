import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { useAuthStore } from "@/renderer/store/auth-store";

import { RootSidebar } from "@/features/app/components/root-sidebar";

function AuthenticatedLayout() {
  return (
    <div className="h-full flex">
      <RootSidebar />
      <div className="flex-1 flex">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated')({
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
