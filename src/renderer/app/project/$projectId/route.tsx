import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useState } from "react";
import { ChannelsSidebar } from "@/renderer/components/layout/channels-sidebar";
import {
  mockProjects,
  getChannelsByProject,
  getAgentsByProject,
} from "@/renderer/lib/placeholders";

function ProjectLayout() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  
  console.log("ProjectLayout rendering for project:", projectId);

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
    <div className="flex h-full">
      <div className="w-64 flex-none">
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
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute('/project/$projectId')({
  component: ProjectLayout,
})