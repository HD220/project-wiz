import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProjectSidebar } from "@/features/dashboard/components/project-sidebar";

function ProjectLayout() {
  const { projectId } = Route.useParams();
  
  return (
    <>
      <ProjectSidebar projectId={projectId} />
      <main className="flex-1">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId")({
  component: ProjectLayout,
});