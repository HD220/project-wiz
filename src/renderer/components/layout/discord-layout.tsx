import { ReactNode } from "react";
import { ProjectSidebar } from "./project-sidebar";
import { ChannelsSidebar } from "./channels-sidebar";
import { Project, Channel, Agent } from "@/lib/placeholders";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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
      {/* Project Sidebar - Fixed width */}
      <div className="flex-none">
        <ProjectSidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={onProjectSelect}
          onCreateProject={onCreateProject}
          onSettings={onSettings}
        />
      </div>

      {/* Resizable area for Channels Sidebar and Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Channels Sidebar - Resizable */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <ChannelsSidebar
            projectName={projectName}
            channels={channels}
            agents={agents}
            selectedChannelId={selectedChannelId}
            onChannelSelect={onChannelSelect}
            onAgentDMSelect={onAgentDMSelect}
            onAddChannel={onAddChannel}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content Area */}
        <ResizablePanel defaultSize={75} minSize={40}>
          <div className="flex flex-col h-full min-w-0 w-full bg-background overflow-hidden">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Right Panel (responsive) - Fixed width */}
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
