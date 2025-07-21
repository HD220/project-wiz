import { Hash, Users, Bot, Settings, ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

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

export function ProjectSidebar({ projectId, className }: ProjectSidebarProps) {
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
    <div className={cn("w-60 h-full flex flex-col bg-card border-r", className)}>
      {/* Project Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b bg-muted/30">
        <h2 className="font-semibold text-sm truncate">{projectName}</h2>
        <Button variant="ghost" size="icon" className="w-5 h-5">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
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
                    className: "active"
                  }}
                >
                  {({ isActive }) => (
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start px-2 h-8 text-sm font-normal",
                        isActive && "bg-muted text-foreground"
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

          <Separator />

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
                  className="w-full justify-start px-2 h-8 text-sm font-normal"
                >
                  <Bot className="w-4 h-4 mr-2 text-muted-foreground" />
                  {agent.name}
                  <div
                    className={cn(
                      "ml-auto w-2 h-2 rounded-full",
                      agent.status === "online" && "bg-green-500",
                      agent.status === "offline" && "bg-gray-400",
                      agent.status === "busy" && "bg-yellow-500"
                    )}
                  />
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

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
                className="w-full justify-start px-2 h-8 text-sm font-normal"
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