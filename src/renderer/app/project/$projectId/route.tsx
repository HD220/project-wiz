import {
  createFileRoute,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { useState } from "react";

import { TopBar } from "@/renderer/components/layout/top-bar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";
import { getAgentsByProject } from "@/renderer/lib/placeholders";

import { ProjectLayoutSkeleton } from "@/components/skeletons/project-layout-skeleton";

import { getPageInfo } from "./route-page-info";

import { AgentsSidebar } from "@/domains/agents/components/agents-sidebar";
import { CreateChannelModal } from "@/domains/projects/components/create-channel-modal";
import { ProjectNavigation } from "@/domains/projects/components/project-navigation";
import { useProjectChannels } from "@/domains/projects/hooks/use-project-channels.hook";

function ProjectLayout() {
  const { projectId } = Route.useParams();
  const { project: currentProject } = Route.useLoaderData();
  const location = useLocation();
  const [agentsSidebarOpen, setAgentsSidebarOpen] = useState(false);
  const [createChannelModalOpen, setCreateChannelModalOpen] = useState(false);

  const { channels } = useProjectChannels(projectId);
  const agents = getAgentsByProject(projectId);

  const handleAddChannel = () => {
    setCreateChannelModalOpen(true);
  };

  const pageInfo = getPageInfo(location.pathname, channels, agents, currentProject);

  return (
    <div className="flex h-full">
      <ResizablePanelGroup direction="horizontal">
        {/* Project Navigation - Resizable */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <ProjectNavigation
            projectName={currentProject?.name || "Projeto"}
            projectId={projectId}
            channels={channels}
            onAddChannel={handleAddChannel}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Main area with TopBar and content */}
        <ResizablePanel defaultSize={agentsSidebarOpen ? 60 : 80}>
          <div className="flex flex-col h-full overflow-hidden">
            {/* Top Bar */}
            <TopBar
              title={pageInfo.title}
              subtitle={pageInfo.subtitle}
              type={pageInfo.type}
              memberCount={pageInfo.memberCount}
              onToggleAgentsSidebar={() =>
                setAgentsSidebarOpen(!agentsSidebarOpen)
              }
              agentsSidebarOpen={agentsSidebarOpen}
            />

            {/* Content area */}
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
          </div>
        </ResizablePanel>

        {/* Agents Sidebar - Right side - Resizable when open */}
        {agentsSidebarOpen && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
              <AgentsSidebar
                isOpen={agentsSidebarOpen}
                onAgentSelect={(agent) => console.log("Selected agent:", agent)}
                projectId={projectId}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>

      {/* Modal de criação de canal */}
      <CreateChannelModal
        open={createChannelModalOpen}
        onOpenChange={setCreateChannelModalOpen}
        projectId={projectId}
      />
    </div>
  );
}

export const Route = createFileRoute("/project/$projectId")({
  component: ProjectLayout,
  pendingComponent: ProjectLayoutSkeleton,
  loader: async ({ params }) => {
    const { projectStore } = await import(
      "@/domains/projects/stores/project.store"
    );
    const project = await projectStore.getProjectById({ id: params.projectId });
    return {
      project,
    };
  },
  errorComponent: ({ error }) => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-destructive">
        <h3 className="font-semibold text-lg mb-2">Erro ao carregar projeto</h3>
        <p>{error.message}</p>
      </div>
    </div>
  ),
});
