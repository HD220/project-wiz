import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProjectSidebar } from "@/features/app/components/project-sidebar";

function ProjectLayout() {
  const { projectId } = Route.useParams();

  return (
    <>
      <div className="w-60">
        <ProjectSidebar projectId={projectId} />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId")({
  component: ProjectLayout,
});
