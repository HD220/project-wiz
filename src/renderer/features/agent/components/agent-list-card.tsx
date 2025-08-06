import { Link } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  RotateCcw,
} from "lucide-react";

import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import type { Agent } from "@/shared/types/agent";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
} from "@/renderer/features/user/components/profile-avatar";
import { cn } from "@/renderer/lib/utils";

interface AgentListCardProps {
  agent: Agent;
  onDelete?: (agent: Agent) => void;
  onRestore?: (agent: Agent) => void;
  onToggleStatus?: (agent: Agent) => void;
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

  return (
    <div
      className={cn(
        // Discord-style compact row layout
        "group flex items-center rounded-md transition-all duration-150",
        "gap-[var(--spacing-component-md)] px-[var(--spacing-component-md)] py-[var(--spacing-component-sm)]",
        "hover:bg-accent/50 cursor-pointer",
        // Inactive state styling
        !agent.isActive && "opacity-60",
      )}
    >
      {/* Avatar with status indicator */}
      <div className="relative shrink-0">
        <ProfileAvatar size="sm">
          <ProfileAvatarImage name={agent.name} className="w-8 h-8" />
          <ProfileAvatarStatus
            status={agent.status === "active" ? "online" : "offline"}
            size="sm"
          />
        </ProfileAvatar>
      </div>

      {/* Agent info - compact layout */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[var(--spacing-component-sm)]">
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
                "h-4 px-[var(--spacing-component-sm)] text-xs font-normal",
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
            <Badge
              variant="outline"
              className="h-4 px-[var(--spacing-component-sm)] text-xs"
            >
              Inactive
            </Badge>
          )}
        </div>

        {/* Secondary info line */}
        <div className="flex items-center gap-[var(--spacing-component-sm)] mt-[var(--spacing-component-xs)]">
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
                    to="/user/agents/$agentId/edit"
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
