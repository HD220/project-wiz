import { ReactNode } from "react";
import { ProjectSidebar } from "./project-sidebar";
import { ChannelsSidebar } from "./channels-sidebar";

interface DiscordLayoutProps {
  children: ReactNode;
  projects: any[];
  selectedProjectId?: string;
  projectName: string;
  channels: any[];
  agents: any[];
  selectedChannelId?: string;
  onProjectSelect: (projectId: string) => void;
  onChannelSelect: (channelId: string) => void;
  onAgentDMSelect: (agentId: string) => void;
  onCreateProject: () => void;
  onAddChannel: () => void;
  onSettings: () => void;
}

export function DiscordLayout({
  children,
  projects,
  selectedProjectId,
  projectName,
  channels,
  agents,
  selectedChannelId,
  onProjectSelect,
  onChannelSelect,
  onAgentDMSelect,
  onCreateProject,
  onAddChannel,
  onSettings,
}: DiscordLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-700">
      {/* Project Sidebar */}
      <ProjectSidebar
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectSelect={onProjectSelect}
        onCreateProject={onCreateProject}
        onSettings={onSettings}
      />

      {/* Channels Sidebar */}
      <ChannelsSidebar
        projectName={projectName}
        channels={channels}
        agents={agents}
        selectedChannelId={selectedChannelId}
        onChannelSelect={onChannelSelect}
        onAgentDMSelect={onAgentDMSelect}
        onAddChannel={onAddChannel}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}