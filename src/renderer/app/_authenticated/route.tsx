import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { RootSidebar } from "@/renderer/components/app/root-sidebar";
import { loadApiData } from "@/renderer/lib/route-loader";

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
    try {
      const projects = await loadApiData(
        () => window.api.project.list({
          isActive: true,
          isArchived: false
        }),
        "Failed to load projects",
      );
      return { projects };
    } catch (error) {
      // Fallback to empty array for projects
      return { projects: [] };
    }
  },
  component: AuthenticatedLayout,
});
