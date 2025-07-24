import { Link } from "@tanstack/react-router";
import { Hash, Settings, ChevronDown } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/renderer/components/ui/collapsible";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Separator } from "@/renderer/components/ui/separator";
import type { SelectAgent } from "@/renderer/features/agent/agent.types";
import type { SelectConversation } from "@/renderer/features/conversation/types";
import type { SelectProject } from "@/renderer/features/project/project.types";
import { cn } from "@/renderer/lib/utils";

interface Channel {
  id: string;
  name: string;
  type: "text" | "voice";
  hasNotification?: boolean;
}

interface ProjectSidebarProps {
  project: SelectProject;
  conversations?: SelectConversation[];
  agents?: SelectAgent[];
  className?: string;
}

function ProjectSidebar(props: ProjectSidebarProps) {
  const { project, conversations = [], className } = props;

  // Transform conversations into channels format
  const channels: Channel[] = conversations.map((conversation) => ({
    id: conversation.id,
    name: conversation.name || "Conversa sem nome",
    type: "text" as const,
    hasNotification: false, // TODO: Add notification logic from conversation data
  }));

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
          {/* Dashboard */}
          <Link
            to="/project/$projectId"
            params={{ projectId: project.id }}
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
                Dashboard
              </Button>
            )}
          </Link>

          <div className="my-2">
            <Separator />
          </div>

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
                    params={{ projectId: project.id, channelId: channel.id }}
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
        </div>
      </ScrollArea>
    </div>
  );
}

export { ProjectSidebar };
