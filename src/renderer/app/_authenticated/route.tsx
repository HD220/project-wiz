import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { RootSidebar } from "@/renderer/features/app/components/root-sidebar";

function AuthenticatedLayout() {
  const { projects, userName, userId } = Route.useLoaderData();

  return (
    <div className="h-full w-full flex">
      <RootSidebar projects={projects} userName={userName} userId={userId} />
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
  loader: async ({ context }) => {
    const { auth } = context;

    // Load all projects for the authenticated user
    const response = await window.api.projects.listAll();

    // Don't fail if projects can't be loaded - return empty array
    const projects = response.success ? response.data : [];

    return {
      projects: projects || [],
      userName: auth.user?.name || "User",
      userId: auth.user?.id || "",
    };
  },
  component: AuthenticatedLayout,
});
