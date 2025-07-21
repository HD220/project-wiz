import { Link } from "@tanstack/react-router";
import { Hash, Users, Bot, Settings, ChevronDown } from "lucide-react";

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
  className?: string;
}

function ProjectSidebar(props: ProjectSidebarProps) {
  const { projectId, className } = props;
  // Mock data - in real app this would come from stores
  const projectName = "Project Alpha";

  const channels: Channel[] = [
    { id: "general", name: "geral", type: "text", hasNotification: true },
    { id: "development", name: "desenvolvimento", type: "text" },
    { id: "design", name: "design", type: "text" },
  ];

  const agents: Agent[] = [
    { id: "agent-1", name: "CodeBot", status: "online" },
    { id: "agent-2", name: "DesignBot", status: "offline" },
    { id: "agent-3", name: "TestBot", status: "busy" },
  ];

  return (
    <div className={cn("h-full flex flex-col bg-card", className)}>
      {/* Project Header */}
      <div className="h-12 bg-card border-b flex items-center justify-center relative">
        <h1 className="text-foreground font-semibold">{projectName}</h1>
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
              {channels.map((channel) => (
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
              ))}
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
              {agents.map((agent) => (
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
              ))}
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
                Ver todos os membros
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}

export { ProjectSidebar };
