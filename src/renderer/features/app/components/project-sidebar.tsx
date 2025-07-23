import { Link } from "@tanstack/react-router";
import { Hash, Users, Bot, Settings, ChevronDown } from "lucide-react";

import type { SelectProject } from "@/main/features/project/project.types";

import { Button } from "@/renderer/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/renderer/components/ui/collapsible";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import { cn } from "@/renderer/lib/utils";

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  hasNotification?: boolean;
}

interface Agent {
  id: string;
  name: string;
  status: "online" | "offline" | "busy";
}

interface ProjectSidebarProps {
  projectId: string;
  project: SelectProject;
  conversations?: any[]; // TODO: Type this properly when conversation types are available
  agents?: any[]; // TODO: Type this properly when agent types are available
  className?: string;
}

function ProjectSidebar(props: ProjectSidebarProps) {
  const {
    projectId,
    project,
    conversations = [],
    agents = [],
    className,
  } = props;

  // Transform conversations into channels format
  const channels: Channel[] = conversations.map((conv: any) => ({
    id: conv.id,
    name: conv.title || conv.name || "Conversa sem nome",
    type: "text" as const,
    hasNotification: false, // TODO: Add notification logic from conversation data
  }));

  // Transform agents data to match the expected format
  const projectAgents: Agent[] =
    agents.length > 0
      ? agents.map((agent: any) => ({
          id: agent.id,
          name: agent.name || "Unnamed Agent",
          status: agent.status === "active" ? "online" : ("offline" as const),
        }))
      : [];

  return (
    <div className={cn("h-full flex flex-col bg-card", className)}>
      {/* Project Header */}
      <div className="h-12 bg-card border-b flex items-center justify-center relative">
        <h1 className="text-foreground font-semibold">{project.name}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 w-6 h-6"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Text Channels */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 h-7 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                CANAIS DE TEXTO
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {channels.length > 0 ? (
                channels.map((channel) => (
                  <Link
                    key={channel.id}
                    to="/project/$projectId/channel/$channelId"
                    params={{ projectId, channelId: channel.id }}
                    className="block"
                    activeProps={{
                      className: "active",
                    }}
                  >
                    {({ isActive }: { isActive: boolean }) => (
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start px-2 h-8 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-accent",
                          isActive && "bg-accent text-foreground",
                        )}
                      >
                        <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                        {channel.name}
                        {channel.hasNotification && !isActive && (
                          <div className="ml-auto w-2 h-2 bg-destructive rounded-full" />
                        )}
                      </Button>
                    )}
                  </Link>
                ))
              ) : (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  Nenhuma conversa ainda
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <div className="my-2">
            <Separator />
          </div>

          {/* Project Agents */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 h-7 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                AGENTES DO PROJETO
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {projectAgents.length > 0 ? (
                projectAgents.map((agent) => (
                  <Button
                    key={agent.id}
                    variant="ghost"
                    className="w-full justify-start px-2 h-8 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <Bot className="w-4 h-4 mr-2 text-muted-foreground" />
                    {agent.name}
                    <div
                      className={cn(
                        "ml-auto w-2 h-2 rounded-full",
                        agent.status === "online" && "bg-green-500",
                        agent.status === "offline" && "bg-gray-400",
                        agent.status === "busy" && "bg-yellow-500",
                      )}
                    />
                  </Button>
                ))
              ) : (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  Nenhum agente configurado
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          <div className="my-2">
            <Separator />
          </div>

          {/* Members */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 h-7 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                MEMBROS
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start px-2 h-8 text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                View all members
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}

export { ProjectSidebar };
