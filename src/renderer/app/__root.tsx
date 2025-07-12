import {
  createRootRoute,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useState } from "react";
import { TooltipProvider } from "@/ui/tooltip";
import { CreateChannelModal } from "@/features/project-management/components/create-channel-modal";
import { PageTitleProvider } from "@/renderer/contexts/page-title-context";
import { TitleBar } from "@/renderer/components/layout/title-bar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CreateProjectModal } from "@/features/project-management/components/create-project-modal";

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


  return (
    <TooltipProvider>
      <PageTitleProvider>
        <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
          <TitleBar />
          <div className="flex flex-1 w-full overflow-hidden">
            <AppSidebar
              onCreateProject={handleCreateProject}
            />
            <div className="flex-1 w-full overflow-hidden bg-background">
              <Outlet />
            </div>
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
