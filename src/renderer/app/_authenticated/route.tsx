import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { RootSidebar } from "@/renderer/features/app/components/root-sidebar";
import { useAuthStore } from "@/renderer/store/auth.store";
import { useAuthSync } from "@/renderer/hooks/use-auth-sync";

function AuthenticatedLayout() {
  // Ensure auth state is synced with query cache
  useAuthSync();

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
    const { isAuthenticated, user } = useAuthStore.getState();

    // If not authenticated at all, redirect to login
    if (!isAuthenticated || !user) {
      throw redirect({ to: "/auth/login" });
    }

    // If authenticated from localStorage, allow access
    // The useAuthSync hook will handle validation and query refresh in the component
  },
  component: AuthenticatedLayout,
});
