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
import { cn } from "@/renderer/lib/utils";

import type { Agent } from "@/shared/types/agent";
import type { Channel } from "@/shared/types/channel";
import type { Project } from "@/shared/types/project";

interface ProjectSidebarProps {
  project: Project;
  conversations?: Channel[];
  agents?: Agent[];
  className?: string;
}

export function ProjectSidebar(props: ProjectSidebarProps) {
  const { project, conversations = [], className } = props;

  // Use conversations directly as channels
  const channels: Channel[] = conversations;

  return (
    <aside
      className={cn(
        "h-full flex flex-col",
        "bg-sidebar/95 backdrop-blur-md",
        "border-r border-sidebar-border/60",
        "shadow-lg/20",
        "transition-all duration-300 ease-in-out",
        className,
      )}
      role="complementary"
      aria-label={`${project.name} navigation`}
    >
      {/* Project Header */}
      <header className="h-12 bg-sidebar/95 backdrop-blur-md border-b border-sidebar-border/60 flex items-center justify-between px-[var(--spacing-component-md)]">
        <h1 className="text-sidebar-foreground font-semibold text-base truncate">
          {project.name}
        </h1>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/20 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Project settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </header>

      <ScrollArea className="flex-1">
        <nav
          className="p-[var(--spacing-component-md)] space-y-[var(--spacing-component-xs)]"
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
                  "w-full justify-start px-[var(--spacing-component-md)] h-9 text-sm font-normal transition-all duration-200 rounded-lg",
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
                className="w-full justify-start px-[var(--spacing-component-md)] h-8 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                aria-expanded="true"
              >
                <ChevronDown className="w-3 h-3 mr-2 transition-transform duration-200" />
                <span>TEXT CHANNELS</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-[var(--spacing-component-xs)] mt-1">
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
                            "w-full justify-start px-[var(--spacing-component-md)] h-8 text-sm font-normal transition-all duration-200 rounded-lg group",
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
                          {false && !isActive && (
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
                <div className="px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)] text-xs text-muted-foreground text-center">
                  No conversations yet
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </ScrollArea>
    </aside>
  );
}
