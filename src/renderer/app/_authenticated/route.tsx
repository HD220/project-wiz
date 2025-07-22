import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { RootSidebar } from "@/renderer/features/app/components/root-sidebar";

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
  beforeLoad: async ({ context }) => {
    const { isAuthenticated, isLoading } = context.auth;

    // Wait for auth to finish loading
    if (isLoading) {
      // Let the component handle loading state
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: AuthenticatedLayout,
});
