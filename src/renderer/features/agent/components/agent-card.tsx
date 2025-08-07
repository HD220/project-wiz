import { Link } from "@tanstack/react-router";
import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";

import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/renderer/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { AgentStatus } from "@/renderer/features/agent/components/agent-status";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
} from "@/renderer/features/user/components/profile-avatar";
import { cn } from "@/renderer/lib/utils";

import type { Agent } from "@/shared/types/agent";

// Main AgentCard component with INLINE-FIRST approach
interface AgentCardProps {
  agent: Agent;
  onDelete?: (agent: Agent) => void;
  onToggleStatus?: (agent: Agent) => void;
  className?: string;
}

export function AgentCard({
  agent,
  onDelete,
  onToggleStatus,
  className,
}: AgentCardProps) {
  // Inline model parsing with error handling
  const getModelName = () => {
    if (!agent.modelConfig) return "Unknown Model";

    try {
      const config = JSON.parse(agent.modelConfig);
      return config.model || "Unknown Model";
    } catch {
      return "Invalid Model Config";
    }
  };

  // Inline date formatting
  const formattedDate = new Date(agent.createdAt).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  // Inline action handlers
  const handleDelete = () => onDelete?.(agent);
  const handleToggleStatus = () => onToggleStatus?.(agent);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden",
        "bg-card/50 backdrop-blur-sm border border-border/60",
        "transition-all duration-200 ease-out",
        "hover:shadow-md hover:scale-[1.01]",
        "hover:border-primary/30 hover:bg-card/80",
        className,
      )}
    >
      <CardHeader className="pb-[var(--spacing-component-md)] relative z-10">
        <div className="flex items-start gap-[var(--spacing-component-md)]">
          {/* Avatar with status indicator */}
          <div className="relative">
            <ProfileAvatar size="lg">
              <ProfileAvatarImage
                name={agent.name}
                className="shrink-0 ring-2 ring-primary/10 transition-all duration-200 group-hover:ring-primary/20"
              />
              <ProfileAvatarStatus
                status={agent.status === "active" ? "online" : "offline"}
                size="sm"
              />
            </ProfileAvatar>
          </div>

          <div className="flex-1 min-w-0 space-y-[var(--spacing-component-xs)]">
            <CardTitle className="text-lg font-semibold leading-tight truncate text-foreground group-hover:text-primary transition-colors duration-200">
              {agent.name}
            </CardTitle>
            <CardDescription className="text-sm truncate text-muted-foreground">
              {agent.role}
            </CardDescription>
          </div>

          {/* Actions dropdown */}
          <CardAction className="relative z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "size-9 p-0 rounded-lg",
                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                    "hover:bg-accent/50",
                    "focus:opacity-100 focus:bg-accent/50",
                  )}
                  aria-label={`Actions for ${agent.name}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-card/95 backdrop-blur-sm border border-border/60 shadow-lg"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/user/agents/$agentId/edit"
                    params={{ agentId: agent.id }}
                    className="cursor-pointer focus:bg-accent/50 transition-colors"
                  >
                    <Pencil className="mr-3 size-4 text-chart-3" />
                    <span className="font-medium">Edit Agent</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleToggleStatus}
                  className="focus:bg-accent/50 transition-colors"
                >
                  <Power
                    className={cn(
                      "mr-3 size-4",
                      agent.status === "active"
                        ? "text-destructive"
                        : "text-chart-2",
                    )}
                  />
                  <span className="font-medium">
                    {agent.status === "active" ? "Deactivate" : "Activate"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="mr-3 size-4" />
                  <span className="font-medium">Delete Agent</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="pb-[var(--spacing-component-md)] relative z-10">
        <div className="space-y-[var(--spacing-component-md)]">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {agent.backstory || "No backstory provided."}
          </p>

          {/* Model information with error handling */}
          {agent.modelConfig && (
            <div className="flex items-center gap-[var(--spacing-component-sm)] text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="font-medium">{getModelName()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 border-t border-border/40 bg-card/30 relative z-10">
        <div className="flex items-center justify-between w-full">
          <AgentStatus
            status={agent.status}
            size="sm"
            className="border border-border/50 shadow-sm"
          />

          <time
            dateTime={agent.createdAt.toISOString()}
            className="text-xs text-muted-foreground font-medium bg-muted/30 px-[var(--spacing-component-sm)] py-[var(--spacing-component-xs)] rounded-md"
          >
            {formattedDate}
          </time>
        </div>
      </CardFooter>
    </Card>
  );
}

// Horizontal list item component following provider card style
interface AgentListItemProps {
  agent: Agent;
  onDelete?: (agent: Agent) => void;
  onToggleStatus?: (agent: Agent) => void;
  isLoading?: boolean;
}

export function AgentListItem({
  agent,
  onDelete,
  onToggleStatus,
  isLoading = false,
}: AgentListItemProps) {
  // Inline model parsing with error handling
  const getModelName = () => {
    if (!agent.modelConfig) return "Unknown Model";

    try {
      const config = JSON.parse(agent.modelConfig);
      return config.model || "Unknown Model";
    } catch {
      return "Invalid Model Config";
    }
  };

  // Inline action handlers
  const handleDelete = () => onDelete?.(agent);
  const handleToggleStatus = () => onToggleStatus?.(agent);

  return (
    <div
      className={cn(
        "group flex items-center rounded-lg border transition-all duration-150",
        "gap-[var(--spacing-component-md)] p-[var(--spacing-component-md)]",
        "hover:bg-accent/50 hover:border-accent-foreground/20",
        "bg-card border-border",
        isLoading && "opacity-50 pointer-events-none",
      )}
    >
      {/* Agent Avatar */}
      <div className="relative shrink-0">
        <ProfileAvatar size="md">
          <ProfileAvatarImage
            name={agent.name}
            className="ring-2 ring-primary/10 transition-all duration-200 group-hover:ring-primary/20"
          />
          <ProfileAvatarStatus
            status={agent.status === "active" ? "online" : "offline"}
            size="sm"
          />
        </ProfileAvatar>
      </div>

      {/* Agent Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[var(--spacing-component-sm)] mb-[var(--spacing-component-xs)]">
          <h3 className="text-sm font-medium text-foreground truncate">
            {agent.name}
          </h3>
          {agent.status === "busy" && (
            <Badge
              variant="secondary"
              className="h-4 px-[var(--spacing-component-sm)] text-xs"
            >
              Busy
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-[var(--spacing-component-sm)] text-xs text-muted-foreground">
          <span className="truncate">{agent.role || "AI Agent"}</span>
          <span>•</span>
          <span className="truncate">{getModelName()}</span>
          {agent.backstory && (
            <>
              <span>•</span>
              <span className="truncate max-w-32">
                {agent.backstory.slice(0, 30)}
                {agent.backstory.length > 30 ? "..." : ""}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="shrink-0">
        <Badge
          variant={!agent.deactivatedAt ? "default" : "secondary"}
          className={cn(
            "h-5 px-[var(--spacing-component-sm)] text-xs",
            !agent.deactivatedAt
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : "bg-gray-500/10 text-gray-600 border-gray-500/20",
          )}
        >
          {!agent.deactivatedAt ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Actions Menu */}
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={isLoading}
              aria-label={`Actions for ${agent.name}`}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link
                to="/user/agents/$agentId/edit"
                params={{ agentId: agent.id }}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleToggleStatus}>
              <Power className="mr-2 size-4" />
              {agent.status === "active" ? "Deactivate" : "Activate"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Alias for backward compatibility
export const AgentCardWithActions = AgentCard;
