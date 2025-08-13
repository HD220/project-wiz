import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProjectSidebar } from "@/renderer/components/app/project-sidebar";
import { loadApiData } from "@/renderer/lib/route-loader";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";

function ProjectLayout() {
  const { project } = Route.useLoaderData();

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full"
        id="project-layout"
      >
        <ResizablePanel
          defaultSize={15}
          minSize={15}
          maxSize={35}
          className="min-w-0 overflow-hidden"
        >
          <ProjectSidebar project={project} conversations={[]} agents={[]} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel className="min-w-0">
          <main className="h-full w-full">
            <Outlet />
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId")({
  loader: async ({ params }) => {
    // Get basic project info for sidebar using loadApiData for consistency
    const project = await loadApiData(
      () => window.api.project.get(params.projectId),
      "Project not found",
    );

    return {
      project,
    };
  },
  component: ProjectLayout,
});
