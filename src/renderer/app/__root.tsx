import {
  createRootRoute,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useState } from "react";
import { TooltipProvider } from "@/ui/tooltip";
import { CreateProjectModal } from "@/renderer/components/modals/create-project-modal";
import { CreateChannelModal } from "@/renderer/components/modals/create-channel-modal";
import { PageTitleProvider } from "@/renderer/contexts/page-title-context";
// SidebarProvider import removed
import { ProjectSidebar } from "@/renderer/components/layout/project-sidebar";
import { mockProjects } from "@/renderer/lib/placeholders";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);


  const handleCreateProject = () => {
    setShowCreateProjectModal(true);
  };

  const handleProjectNavigation = (projectId: string) => {
    navigate({ to: "/project/$projectId/", params: { projectId } });
  };

  let currentSelectedProjectId: string | undefined = undefined;
  const pathParts = location.pathname.split("/");
  if (pathParts.length > 2 && pathParts[1] === "project") {
    currentSelectedProjectId = pathParts[2];
  }

  return (
    <TooltipProvider>
      <PageTitleProvider>
        <div className="flex h-screen w-full bg-background overflow-hidden">
          <ProjectSidebar
            projects={mockProjects}
            selectedProjectId={currentSelectedProjectId}
            onProjectSelect={handleProjectNavigation}
            onCreateProject={handleCreateProject}
            onSettings={() => navigate({ to: "/user/settings/" })}
          />
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </div>

        <CreateProjectModal
          open={showCreateProjectModal}
          onOpenChange={setShowCreateProjectModal}
        />
        <CreateChannelModal
          open={showCreateChannelModal}
          onOpenChange={setShowCreateChannelModal}
        />
      </PageTitleProvider>
    </TooltipProvider>
  );
}
