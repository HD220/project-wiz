import { Link } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  User,
  RotateCcw,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import { Card } from "@/renderer/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";
import type { SelectAgent } from "@/renderer/features/agent/agent.types";
import { AgentStatus } from "@/renderer/components/agent-status";
import { cn } from "@/renderer/lib/utils";

interface AgentListCardProps {
  agent: SelectAgent;
  onDelete?: (agent: SelectAgent) => void;
  onRestore?: (agent: SelectAgent) => void;
  onToggleStatus?: (agent: SelectAgent) => void;
}

export function AgentListCard(props: AgentListCardProps) {
  const { agent, onDelete, onRestore, onToggleStatus } = props;

  function handleDelete() {
    onDelete?.(agent);
  }

  function handleRestore() {
    onRestore?.(agent);
  }

  function handleToggleStatus() {
    onToggleStatus?.(agent);
  }

  // Format deactivation date
  const formatDeactivationDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card
      className={cn(
        // Enhanced card styling using design tokens
        "relative group",
        "p-[var(--spacing-component-lg)]",
        "border border-border",
        "bg-card",
        "rounded-[var(--radius)]",
        "transition-all duration-200 ease-out",
        "hover:border-ring/30",
        "hover:shadow-lg",
        "hover:shadow-foreground/5",
        "hover:-translate-y-0.5",
        // Active state visual distinction
        agent.isActive
          ? ["opacity-100", "border-solid"]
          : ["opacity-75", "border-dashed border-border/50", "bg-card/60"],
      )}
    >
      {/* Active indicator line */}
      {agent.isActive && agent.status === "active" && (
        <div className="absolute top-0 left-0 w-1 h-full bg-chart-5 rounded-l-[var(--radius)]" />
      )}

      <div className="flex items-center gap-[var(--spacing-component-lg)]">
        {/* Avatar and Info */}
        <div className="flex items-center gap-[var(--spacing-component-md)] flex-1 min-w-0">
          <div className="relative">
            <Avatar
              className={cn(
                "h-12 w-12 shrink-0 ring-2 ring-transparent transition-all duration-200",
                agent.isActive
                  ? "ring-border/20 group-hover:ring-ring/20"
                  : "opacity-70",
              )}
            >
              <AvatarImage src={undefined} alt={agent.name} />
              <AvatarFallback
                className={cn(
                  "text-[var(--font-size-sm)] font-[var(--font-weight-medium)]",
                  "transition-colors duration-200",
                  agent.isActive
                    ? "bg-primary/10 text-primary group-hover:bg-primary/15"
                    : "bg-muted/30 text-muted-foreground",
                )}
              >
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>

            {/* Status indicator overlay on avatar */}
            {agent.isActive && (
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card",
                  "transition-colors duration-200",
                  agent.status === "active" && "bg-chart-5",
                  agent.status === "busy" && "bg-chart-4 animate-pulse",
                  agent.status === "inactive" && "bg-muted-foreground",
                )}
              />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-[var(--spacing-component-xs)]">
            <div className="flex items-center gap-[var(--spacing-component-sm)]">
              <h3
                className={cn(
                  "text-[var(--font-size-base)] font-[var(--font-weight-semibold)]",
                  "truncate transition-colors duration-200",
                  agent.isActive
                    ? "text-card-foreground group-hover:text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {agent.name}
              </h3>

              {/* Enhanced inactive badge */}
              {!agent.isActive && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-5 px-[var(--spacing-component-sm)]",
                          "text-[var(--font-size-xs)] font-[var(--font-weight-medium)]",
                          "bg-muted/60 text-muted-foreground border-0",
                          "rounded-[calc(var(--radius)-1px)]",
                        )}
                      >
                        Inativo
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="text-[var(--font-size-xs)]">
                      <p>
                        Desativado em{" "}
                        {formatDeactivationDate(agent.deactivatedAt)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex items-center gap-[var(--spacing-component-xs)]">
              <p className="text-[var(--font-size-sm)] text-muted-foreground truncate">
                <span className="font-[var(--font-weight-medium)]">
                  {agent.role}
                </span>
                <span className="mx-[var(--spacing-component-xs)] opacity-60">
                  •
                </span>
                <span>
                  {!agent.isActive ? (
                    <>
                      Desativado em{" "}
                      {formatDeactivationDate(agent.deactivatedAt)}
                    </>
                  ) : (
                    <>
                      Criado em {new Date(agent.createdAt).toLocaleDateString()}
                    </>
                  )}
                </span>
              </p>
            </div>

            {/* Model information */}
            {agent.model && (
              <div className="flex items-center gap-[var(--spacing-component-xs)]">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-4 px-[var(--spacing-component-xs)]",
                    "text-[10px] font-[var(--font-weight-medium)]",
                    "border-border/40 text-muted-foreground",
                    "bg-transparent",
                  )}
                >
                  {agent.model}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center gap-[var(--spacing-component-md)] shrink-0">
          {/* Enhanced status indicator for active agents */}
          {agent.isActive && (
            <div className="flex items-center gap-[var(--spacing-component-xs)]">
              <AgentStatus
                status={agent.status}
                size="sm"
                className="ring-1 ring-border/20"
              />
              <span className="text-[var(--font-size-xs)] text-muted-foreground capitalize hidden sm:inline">
                {agent.status}
              </span>
            </div>
          )}

          {/* Enhanced Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  "transition-all duration-200",
                  "hover:bg-accent/60",
                  "hover:scale-105",
                  "focus:bg-accent/60",
                  "active:scale-95",
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-border/50 bg-popover/95 backdrop-blur-sm"
            >
              {agent.isActive ? (
                // Enhanced actions for active agents
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/user/agents/edit/$agentId"
                      params={{ agentId: agent.id }}
                      className="cursor-pointer"
                    >
                      <Edit2 className="mr-[var(--spacing-component-sm)] h-4 w-4" />
                      <span className="text-[var(--font-size-sm)]">Edit</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleToggleStatus}
                    className="cursor-pointer"
                  >
                    {agent.status === "active" ? (
                      <>
                        <PowerOff className="mr-[var(--spacing-component-sm)] h-4 w-4" />
                        <span className="text-[var(--font-size-sm)]">
                          Deactivate
                        </span>
                      </>
                    ) : (
                      <>
                        <Power className="mr-[var(--spacing-component-sm)] h-4 w-4" />
                        <span className="text-[var(--font-size-sm)]">
                          Activate
                        </span>
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive cursor-pointer focus:text-destructive"
                  >
                    <Trash2 className="mr-[var(--spacing-component-sm)] h-4 w-4" />
                    <span className="text-[var(--font-size-sm)]">Delete</span>
                  </DropdownMenuItem>
                </>
              ) : (
                // Enhanced actions for inactive agents
                <>
                  <DropdownMenuItem
                    onClick={handleRestore}
                    className="text-chart-5 cursor-pointer focus:text-chart-5"
                  >
                    <RotateCcw className="mr-[var(--spacing-component-sm)] h-4 w-4" />
                    <span className="text-[var(--font-size-sm)]">
                      Restore Agent
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem disabled className="text-muted-foreground">
                    <Edit2 className="mr-[var(--spacing-component-sm)] h-4 w-4" />
                    <span className="text-[var(--font-size-sm)]">
                      Edit (Unavailable)
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
