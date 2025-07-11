import { createRootRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router"; // Added useNavigate, useLocation
import { useState } from "react";
import { TooltipProvider } from "@/ui/tooltip";
import { CreateProjectModal } from "@/renderer/components/modals/create-project-modal";
import { CreateChannelModal } from "@/renderer/components/modals/create-channel-modal";
import { PageTitleProvider } from "@/renderer/contexts/page-title-context";
import { SidebarProvider } from "@/renderer/contexts/sidebar-context";
import { ProjectSidebar } from "@/renderer/components/layout/project-sidebar"; // Added
import { mockProjects } from "@/renderer/lib/placeholders"; // Added mockProjects

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const location = useLocation(); // To derive selectedProjectId

  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false); // Kept, though ProjectSidebar doesn't directly use it.

  const handleCreateProject = () => {
    setShowCreateProjectModal(true);
  };

  // This handler is for the add channel button *within* ChannelsSidebar,
  // not directly used by ProjectSidebar but kept in __root for now.
  // const handleAddChannel = () => {
  // setShowCreateChannelModal(true);
  // };

  const handleProjectNavigation = (projectId: string) => {
    // Ensure the navigation to the project main page (index)
    navigate({ to: "/project/$projectId/", params: { projectId } });
  };

  // Determine selectedProjectId from URL for visual indication on ProjectSidebar
  let currentSelectedProjectId: string | undefined = undefined;
  const pathParts = location.pathname.split('/');
  // Example path: /project/project-id-123/chat -> pathParts = ["", "project", "project-id-123", "chat"]
  if (pathParts.length > 2 && pathParts[1] === 'project') {
    currentSelectedProjectId = pathParts[2];
  }

  return (
    <TooltipProvider>
      <PageTitleProvider>
        <SidebarProvider>
          <div className="flex h-screen w-full bg-background overflow-hidden">
            <ProjectSidebar
              projects={mockProjects} // Pass mock projects
              selectedProjectId={currentSelectedProjectId} // Pass derived selected ID
              onProjectSelect={handleProjectNavigation} // Navigate to /project/$projectId/
              onCreateProject={handleCreateProject} // Opens modal
              onSettings={() => navigate({ to: "/user/settings/" })} // Navigate to user settings
            />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>

          <CreateProjectModal
            open={showCreateProjectModal}
            onOpenChange={setShowCreateProjectModal}
          />
          <CreateChannelModal
            open={showCreateChannelModal}
            onOpenChange={setShowCreateChannelModal}
          />
        </SidebarProvider>
      </PageTitleProvider>
    </TooltipProvider>
  );
}
