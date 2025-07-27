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

export function ProjectSidebar(props: ProjectSidebarProps) {
  const { project, conversations = [], className } = props;

  // Transform conversations into channels format
  const channels: Channel[] = conversations.map((conversation) => ({
    id: conversation.id,
    name: conversation.name || "Conversa sem nome",
    type: "text" as const,
    hasNotification: false, // TODO: Add notification logic from conversation data
  }));

  return (
    <aside
      className={cn(
        "h-full flex flex-col bg-card/50 backdrop-blur-sm",
        className,
      )}
      role="complementary"
      aria-label={`${project.name} navigation`}
    >
      {/* Project Header */}
      <header className="h-12 bg-card/80 border-b border-border/50 flex items-center justify-between px-4 backdrop-blur-sm">
        <h1 className="text-foreground font-semibold text-base truncate">
          {project.name}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Project settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </header>

      <ScrollArea className="flex-1">
        <nav
          className="p-3 space-y-1"
          role="navigation"
          aria-label="Project sections"
        >
          {/* Dashboard */}
          <Link
            to="/project/$projectId"
            params={{ projectId: project.id }}
            activeProps={{
              className: "active",
            }}
          >
            {({ isActive }: { isActive: boolean }) => (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start px-3 h-9 text-sm font-normal transition-all duration-200 rounded-lg",
                  "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                  isActive && "bg-accent text-foreground font-medium shadow-sm",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Hash
                  className={cn(
                    "w-4 h-4 mr-3 transition-colors flex-shrink-0",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                />
                <span className="truncate">Dashboard</span>
              </Button>
            )}
          </Link>

          <Separator className="my-3" />

          {/* Text Channels */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                aria-expanded="true"
              >
                <ChevronDown className="w-3 h-3 mr-2 transition-transform duration-200" />
                <span>Canais de Texto</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {channels.length > 0 ? (
                <div role="list" aria-label="Text channels">
                  {channels.map((channel) => (
                    <Link
                      key={channel.id}
                      to="/project/$projectId/channel/$channelId"
                      params={{ projectId: project.id, channelId: channel.id }}
                      activeProps={{
                        className: "active",
                      }}
                    >
                      {({ isActive }: { isActive: boolean }) => (
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start px-3 h-8 text-sm font-normal transition-all duration-200 rounded-lg group",
                            "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                            isActive &&
                              "bg-accent text-foreground font-medium shadow-sm",
                          )}
                          role="listitem"
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Hash
                            className={cn(
                              "w-4 h-4 mr-3 transition-colors flex-shrink-0",
                              isActive
                                ? "text-foreground"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                          <span className="truncate flex-1 text-left">
                            {channel.name}
                          </span>
                          {channel.hasNotification && !isActive && (
                            <div
                              className="ml-2 w-2 h-2 bg-destructive rounded-full flex-shrink-0"
                              aria-label="Unread messages"
                            />
                          )}
                        </Button>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                  Nenhuma conversa ainda
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </ScrollArea>
    </aside>
  );
}
