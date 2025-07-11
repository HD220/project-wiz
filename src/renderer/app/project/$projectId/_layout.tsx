import { useState } from "react"; // useEffect import removed
import { Outlet, useNavigate, createFileRoute } from "@tanstack/react-router";
import { ChannelsSidebar } from "@/renderer/components/layout/channels-sidebar";
// useSidebar import removed
import {
  mockProjects,
  getChannelsByProject,
  getAgentsByProject,
} from "@/renderer/lib/placeholders";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/renderer/components/ui/resizable";

export const Route = createFileRoute('/project/$projectId/_layout')({
  component: ProjectLayout,
});

export function ProjectLayout() {
  const { projectId } = Route.useParams();
  // useSidebar hook call removed
  const navigate = useNavigate();

  // useEffect hook that calls setMode removed

  const currentProject = mockProjects.find(p => p.id === projectId);
  const channels = getChannelsByProject(projectId);
  const agents = getAgentsByProject(projectId);
  const [selectedChannelId, setSelectedChannelId] = useState<string | undefined>(channels[0]?.id);


  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    navigate({ to: '/project/$projectId/chat/', params: { projectId } });
    console.log(`Project ${projectId}: Select channel ${channelId}`);
  };

  const handleAgentDMSelect = (agentId: string) => {
    navigate({ to: '/project/$projectId/chat/', params: { projectId } });
    console.log(`Project ${projectId}: Select DM with agent ${agentId}`);
  };

  const handleAddChannel = () => {
    console.log(`Project ${projectId}: Add channel clicked`);
  };

  if (!currentProject) {
    return <div>Projeto não encontrado.</div>;
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="flex-1">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
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
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75} minSize={60}>
        <div className="p-4">
           <Outlet />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
