import { Link } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  User,
  RotateCcw,
  Circle,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import type { SelectAgent } from "@/renderer/features/agent/agent.types";
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

  // Parse model from modelConfig JSON string
  const getModelName = () => {
    try {
      const config = JSON.parse(agent.modelConfig);
      return config.model || "Unknown";
    } catch {
      return "Unknown";
    }
  };

  // Status indicator color based on agent status
  const getStatusColor = () => {
    if (!agent.isActive) return "text-muted-foreground";
    switch (agent.status) {
      case "active":
        return "text-green-500";
      case "busy":
        return "text-orange-500";
      case "inactive":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div
      className={cn(
        // Discord-style compact row layout
        "group flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150",
        "hover:bg-accent/50 cursor-pointer",
        // Inactive state styling
        !agent.isActive && "opacity-60",
      )}
    >
      {/* Avatar with status indicator */}
      <div className="relative shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarImage src={undefined} alt={agent.name} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>

        {/* Status dot - Discord style */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-background border-2 border-background flex items-center justify-center">
          <Circle className={cn("w-2 h-2 fill-current", getStatusColor())} />
        </div>
      </div>

      {/* Agent info - compact layout */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium truncate",
              agent.isActive ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {agent.name}
          </span>

          {/* Compact status badge */}
          {agent.isActive && (
            <Badge
              variant="secondary"
              className={cn(
                "h-4 px-1.5 text-xs font-normal",
                agent.status === "active" &&
                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                agent.status === "busy" &&
                  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                agent.status === "inactive" &&
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              )}
            >
              {agent.status}
            </Badge>
          )}

          {/* Inactive indicator */}
          {!agent.isActive && (
            <Badge variant="outline" className="h-4 px-1.5 text-xs">
              Inactive
            </Badge>
          )}
        </div>

        {/* Secondary info line */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {agent.role}
          </span>

          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground/80 truncate">
            {getModelName()}
          </span>
        </div>
      </div>

      {/* Compact actions - only visible on hover */}
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-accent/80"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {agent.isActive ? (
              // Actions for active agents
              <>
                <DropdownMenuItem asChild>
                  <Link
                    to="/user/agents/edit/$agentId"
                    params={{ agentId: agent.id }}
                    className="cursor-pointer"
                  >
                    <Edit2 className="mr-2 w-3.5 h-3.5" />
                    <span className="text-xs">Edit</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleToggleStatus}
                  className="cursor-pointer"
                >
                  {agent.status === "active" ? (
                    <>
                      <PowerOff className="mr-2 w-3.5 h-3.5" />
                      <span className="text-xs">Deactivate</span>
                    </>
                  ) : (
                    <>
                      <Power className="mr-2 w-3.5 h-3.5" />
                      <span className="text-xs">Activate</span>
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive cursor-pointer focus:text-destructive"
                >
                  <Trash2 className="mr-2 w-3.5 h-3.5" />
                  <span className="text-xs">Delete</span>
                </DropdownMenuItem>
              </>
            ) : (
              // Actions for inactive agents
              <>
                <DropdownMenuItem
                  onClick={handleRestore}
                  className="text-green-600 cursor-pointer focus:text-green-600"
                >
                  <RotateCcw className="mr-2 w-3.5 h-3.5" />
                  <span className="text-xs">Restore</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem disabled className="text-muted-foreground">
                  <Edit2 className="mr-2 w-3.5 h-3.5" />
                  <span className="text-xs">Edit (Unavailable)</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
