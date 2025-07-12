import {
  createFileRoute,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useState } from "react";
import { ChannelsSidebar } from "@/renderer/components/layout/channels-sidebar";
import { AgentsSidebar } from "@/renderer/components/layout/agents-sidebar";
import { TopBar } from "@/renderer/components/layout/top-bar";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";
import {
  mockProjects,
  getChannelsByProject,
  getAgentsByProject,
} from "@/renderer/lib/placeholders";

function ProjectLayout() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [agentsSidebarOpen, setAgentsSidebarOpen] = useState(false);

  const currentProject = mockProjects.find((p) => p.id === projectId);
  const channels = getChannelsByProject(projectId);
  const agents = getAgentsByProject(projectId);
  const [selectedChannelId, setSelectedChannelId] = useState<
    string | undefined
  >(channels[0]?.id);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    navigate({ to: "/project/$projectId/chat", params: { projectId } });
    console.log(`Project ${projectId}: Select channel ${channelId}`);
  };

  const handleAgentDMSelect = (agentId: string) => {
    navigate({ to: "/project/$projectId/chat", params: { projectId } });
    console.log(`Project ${projectId}: Select DM with agent ${agentId}`);
  };

  const handleAddChannel = () => {
    console.log(`Project ${projectId}: Add channel clicked`);
  };

  // Get page title and info based on current route
  const getPageInfo = () => {
    const path = location.pathname;

    if (path.includes("/chat")) {
      const selectedChannel = channels.find((c) => c.id === selectedChannelId);
      return {
        title: selectedChannel ? `#${selectedChannel.name}` : "Chat",
        subtitle: selectedChannel?.name || "Canal de chat do projeto",
        type: "channel" as const,
        memberCount: selectedChannel?.unreadCount || 0,
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

  if (!currentProject) {
    return <div>Projeto não encontrado.</div>;
  }

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-full">
      <ResizablePanelGroup direction="horizontal">
        {/* Channels Sidebar - Resizable */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <ChannelsSidebar
            projectName={currentProject.name}
            projectId={projectId}
            channels={channels}
            agents={agents}
            selectedChannelId={selectedChannelId}
            onChannelSelect={handleChannelSelect}
            onAgentDMSelect={handleAgentDMSelect}
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
    </div>
  );
}

export const Route = createFileRoute("/project/$projectId")({
  component: ProjectLayout,
});
