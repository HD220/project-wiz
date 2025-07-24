import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { RootSidebar } from "@/renderer/features/app/components/root-sidebar";
import { loadApiDataWithFallback } from "@/renderer/lib/route-loader";

function AuthenticatedLayout() {
  const { projects } = Route.useLoaderData();

  return (
    <div className="h-full w-full flex">
      <RootSidebar projects={projects} />
      <div className="flex-1 flex">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  loader: async () => {
    // Load projects with fallback (non-critical data)
    const projects = await loadApiDataWithFallback(
      () => window.api.projects.listAll(),
      [], // Fallback to empty array
      "Failed to load projects",
    );

    return { projects };
  },
  component: AuthenticatedLayout,
});
