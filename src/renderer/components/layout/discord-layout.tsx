import { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { ChannelsSidebar } from "./channels-sidebar";
import { UserSidebar } from "./user-sidebar";
import { MainHeader } from "./main-header";
import { RightPanel } from "./right-panel";
import { Project, Channel, Agent } from "@/lib/placeholders";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useLayoutState } from "@/renderer/hooks/use-layout-state";

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
  const { isRightPanelOpen, sidebarMode, toggleRightPanel } = useLayoutState({
    selectedProjectId,
  });
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Project Sidebar - Fixed width */}
      <div className="flex-none">
        <AppSidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={onProjectSelect}
          onCreateProject={onCreateProject}
          onSettings={onSettings}
        />
      </div>

      {/* Resizable area for Channels Sidebar and Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Dynamic Sidebar - Resizable */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          {sidebarMode === "server" ? (
            <ChannelsSidebar
              projectName={projectName}
              projectId={selectedProjectId || ""}
              channels={channels}
              agents={agents}
              selectedChannelId={selectedChannelId}
              onChannelSelect={onChannelSelect}
              onAgentDMSelect={onAgentDMSelect}
              onAddChannel={onAddChannel}
            />
          ) : (
            <UserSidebar
              agents={agents}
              onAgentDMSelect={onAgentDMSelect}
              onSettings={onSettings}
            />
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Content Area */}
        <ResizablePanel defaultSize={75} minSize={40}>
          <div className="flex flex-col h-full min-w-0 w-full bg-background overflow-hidden">
            <MainHeader
              isRightPanelOpen={isRightPanelOpen}
              onToggleRightPanel={toggleRightPanel}
            />
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <RightPanel
        agents={agents}
        isOpen={isRightPanelOpen}
        onAgentSelect={onAgentDMSelect}
      />
    </div>
  );
}
