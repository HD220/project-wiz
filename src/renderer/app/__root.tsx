import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { TooltipProvider } from "@/ui/tooltip";
import { DiscordLayout } from "@/renderer/components/layout/discord-layout";
import {
  mockProjects,
  getChannelsByProject,
  getAgentsByProject,
} from "@/renderer/lib/placeholders";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    mockProjects[0]?.id,
  );
  const [selectedChannelId, setSelectedChannelId] = useState<string>();

  const selectedProject = mockProjects.find(
    (project) => project.id === selectedProjectId,
  );
  const projectChannels = selectedProjectId
    ? getChannelsByProject(selectedProjectId)
    : [];
  const projectAgents = selectedProjectId
    ? getAgentsByProject(selectedProjectId)
    : [];

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedChannelId(undefined);
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
  };

  const handleAgentDMSelect = (agentId: string) => {
    // Navigate to DM with agent
    console.log("Opening DM with agent:", agentId);
  };

  const handleCreateProject = () => {
    console.log("Creating new project");
  };

  const handleAddChannel = () => {
    console.log("Adding new channel");
  };

  const handleSettings = () => {
    console.log("Opening settings");
  };

  return (
    <TooltipProvider>
      <DiscordLayout
        projects={mockProjects}
        selectedProjectId={selectedProjectId}
        projectName={selectedProject?.name || "Selecione um projeto"}
        channels={projectChannels}
        agents={projectAgents}
        selectedChannelId={selectedChannelId}
        onProjectSelect={handleProjectSelect}
        onChannelSelect={handleChannelSelect}
        onAgentDMSelect={handleAgentDMSelect}
        onCreateProject={handleCreateProject}
        onAddChannel={handleAddChannel}
        onSettings={handleSettings}
      >
        <Outlet />
      </DiscordLayout>
    </TooltipProvider>
  );
}
