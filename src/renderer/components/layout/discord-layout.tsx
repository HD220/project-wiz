import { ReactNode } from "react";
import { ProjectSidebar } from "./project-sidebar";
import { ChannelsSidebar } from "./channels-sidebar";
import { Project, Channel, Agent } from "@/lib/placeholders";

interface DiscordLayoutProps {
  children: ReactNode;
  projects: Project[];
  selectedProjectId?: string;
  projectName: string;
  channels: Channel[];
  agents: Agent[];
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
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Project Sidebar */}
      <div className="flex-none">
        <ProjectSidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={onProjectSelect}
          onCreateProject={onCreateProject}
          onSettings={onSettings}
        />
      </div>

      {/* Channels Sidebar */}
      <div className="flex-none">
        <ChannelsSidebar
          projectName={projectName}
          channels={channels}
          agents={agents}
          selectedChannelId={selectedChannelId}
          onChannelSelect={onChannelSelect}
          onAgentDMSelect={onAgentDMSelect}
          onAddChannel={onAddChannel}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full bg-background overflow-hidden">
        {children}
      </div>

      {/* Right Panel (responsive) */}
      <div className="w-80 bg-card border-l border-border hidden xl:flex flex-col flex-none">
        {/* Right panel content will be contextual */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm text-muted-foreground">
            Painel Contextual
          </h3>
        </div>
        <div className="flex-1 p-4">
          <p className="text-sm text-muted-foreground">
            Conteúdo contextual será exibido aqui baseado na página atual.
          </p>
        </div>
      </div>
    </div>
  );
}
