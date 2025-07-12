import {
  createFileRoute,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useState } from "react";
import { ProjectNavigation } from "@/features/project-management/components/project-navigation";
import { AgentsSidebar } from "@/features/project-management/components/agents-sidebar";
import { TopBar } from "@/renderer/components/layout/top-bar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";
import {
  getAgentsByProject,
} from "@/renderer/lib/placeholders";
import { useProjects } from "@/features/project-management/hooks/use-projects.hook";
import { useProjectChannels } from "@/features/communication/hooks/use-channels.hook";
import { CreateChannelModal } from "@/features/project-management/components/create-channel-modal";
import { ProjectDto } from "@/shared/types/project.types";
import { ProjectLayoutSkeleton } from "@/components/skeletons/project-layout-skeleton";

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

  // Get page title and info based on current route
  const getPageInfo = () => {
    const path = location.pathname;

    if (path.includes("/chat/")) {
      // Extract channelId from URL: /project/123/chat/456
      const channelId = path.split('/chat/')[1];
      const selectedChannel = channels.find((c) => c.id === channelId);
      return {
        title: selectedChannel ? `#${selectedChannel.name}` : "Chat",
        subtitle: selectedChannel?.name || "Canal de chat do projeto",
        type: "channel" as const,
        memberCount: 0, // TODO: Implementar contagem de membros
      };
    }

    if (path.includes("/agent/")) {
      // Extract agentId from URL: /project/123/agent/456
      const agentId = path.split('/agent/')[1];
      const selectedAgent = agents.find((a) => a.id === agentId);
      return {
        title: selectedAgent ? `@${selectedAgent.name}` : "Mensagem Direta",
        subtitle: selectedAgent ? `Conversa com ${selectedAgent.name}` : "Mensagem direta com agente",
        type: "channel" as const,
        memberCount: 1,
      };
    }

    if (path.includes("/agents")) {
      return {
        title: "Agentes",
        subtitle: `Gerenciamento de agentes do ${currentProject?.name}`,
        type: "page" as const,
      };
    }

    if (path.includes("/files")) {
      return {
        title: "Arquivos",
        subtitle: "Explorador de arquivos do projeto",
        type: "page" as const,
      };
    }

    if (path.includes("/tasks")) {
      return {
        title: "Tarefas",
        subtitle: "Gerenciamento de tarefas e issues",
        type: "page" as const,
      };
    }

    if (path.includes("/docs")) {
      return {
        title: "Documentação",
        subtitle: "Documentos e wikis do projeto",
        type: "page" as const,
      };
    }

    // Project home
    return {
      title: currentProject?.name || "Projeto",
      subtitle: "Visão geral do projeto",
      type: "project" as const,
    };
  };


  const pageInfo = getPageInfo();

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
    const { projectStore } = await import("@/features/project-management/stores/project.store");
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
