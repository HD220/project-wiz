import { createRootRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TooltipProvider } from "@/ui/tooltip";
import { DiscordLayout } from "@/renderer/components/layout/discord-layout";
import { CreateProjectModal } from "@/renderer/components/modals/create-project-modal";
import { CreateChannelModal } from "@/renderer/components/modals/create-channel-modal";
import {
  mockProjects,
  getChannelsByProject,
  getAgentsByProject,
} from "@/renderer/lib/placeholders";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    mockProjects[0]?.id,
  );
  const [selectedChannelId, setSelectedChannelId] = useState<string>();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);

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
    navigate({ to: "/" });
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    navigate({ to: "/chat" });
  };

  const handleAgentDMSelect = (agentId: string) => {
    navigate({ to: "/chat" });
  };

  const handleCreateProject = () => {
    setShowCreateProjectModal(true);
  };

  const handleAddChannel = () => {
    setShowCreateChannelModal(true);
  };

  const handleSettings = () => {
    navigate({ to: "/settings" });
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

      {/* Modals */}
      <CreateProjectModal
        open={showCreateProjectModal}
        onOpenChange={setShowCreateProjectModal}
      />
      <CreateChannelModal
        open={showCreateChannelModal}
        onOpenChange={setShowCreateChannelModal}
      />
    </TooltipProvider>
  );
}
