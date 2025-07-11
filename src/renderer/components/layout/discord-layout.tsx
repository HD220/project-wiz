import { ReactNode, useState } from "react";
import { ProjectSidebar } from "./project-sidebar";
import { ChannelsSidebar } from "./channels-sidebar";
import { UserSidebar } from "./user-sidebar";
import { Project, Channel, Agent } from "@/lib/placeholders";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Users, X, Loader2 } from "lucide-react";
import { usePageTitle } from "@/renderer/contexts/page-title-context";
import { useSidebar } from "@/renderer/contexts/sidebar-context";

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
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const { title, icon } = usePageTitle();
  const { mode } = useSidebar();

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "executing":
        return "bg-blue-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const onlineAgents = agents.filter((a) => a.status !== "offline");
  const offlineAgents = agents.filter((a) => a.status === "offline");
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
        {/* Dynamic Sidebar - Resizable */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          {mode === "server" ? (
            <ChannelsSidebar
              projectName={projectName}
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
            {/* Header with channel title and toggle button */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {icon && <div className="flex-shrink-0">{icon}</div>}
                {title && <h1 className="font-semibold text-foreground truncate">{title}</h1>}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className="w-8 h-8"
              >
                {isRightPanelOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Main content */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Right Panel (responsive) - Agents List */}
      {isRightPanelOpen && (
        <div className="w-60 bg-card border-l border-border hidden xl:flex flex-col flex-none">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {/* Online Agents */}
              {onlineAgents.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Online — {onlineAgents.length}
                  </h4>
                  <div className="space-y-2">
                    {onlineAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                        onClick={() => onAgentDMSelect(agent.id)}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={agent.avatar} />
                            <AvatarFallback className="text-xs">
                              {agent.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-card rounded-full",
                              getStatusColor(agent.status),
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium truncate">
                              {agent.name}
                            </span>
                            {agent.isExecuting && (
                              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                            )}
                          </div>
                          {agent.currentTask && (
                            <div className="text-xs text-muted-foreground truncate">
                              {agent.currentTask}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offline Agents */}
              {offlineAgents.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Offline — {offlineAgents.length}
                  </h4>
                  <div className="space-y-2">
                    {offlineAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer opacity-60"
                        onClick={() => onAgentDMSelect(agent.id)}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={agent.avatar} />
                            <AvatarFallback className="text-xs">
                              {agent.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-card rounded-full",
                              getStatusColor(agent.status),
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {agent.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
