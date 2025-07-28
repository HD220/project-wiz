import { Link } from "@tanstack/react-router";
import { MoreHorizontal, Pencil, Power, Trash2, User } from "lucide-react";

import { AgentStatus } from "@/renderer/components/agent-status/agent-status";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Button } from "@/renderer/components/ui/button";
import { StatusIndicator } from "@/renderer/components/ui/status-indicator";
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
import type { AgentWithAvatar } from "@/renderer/features/agent/agent.types";
import { cn, isValidAvatarUrl } from "@/renderer/lib/utils";

// Main AgentCard component with INLINE-FIRST approach
interface AgentCardProps {
  agent: AgentWithAvatar;
  onDelete?: (agent: AgentWithAvatar) => void;
  onToggleStatus?: (agent: AgentWithAvatar) => void;
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
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start gap-[var(--spacing-component-md)]">
          {/* Avatar with status indicator */}
          <div className="relative">
            <Avatar className="size-12 shrink-0 ring-2 ring-primary/10 transition-all duration-200 group-hover:ring-primary/20">
              <AvatarImage
                src={isValidAvatarUrl(agent.avatar) || undefined}
                alt={`${agent.name} avatar`}
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/20">
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>
            {/* Status indicator */}
            <StatusIndicator
              status={agent.status}
              size="lg"
              variant="dot"
              className="absolute -bottom-1 -right-1 border-2 border-card"
            />
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
                    to="/user/agents/edit/$agentId"
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

      <CardContent className="pb-4 px-6 relative z-10">
        <div className="space-y-[var(--spacing-component-md)]">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {agent.backstory || "No backstory provided."}
          </p>

          {/* Model information with error handling */}
          {agent.modelConfig && (
            <div className="flex items-center gap-[var(--spacing-component-sm)] text-xs text-muted-foreground">
              <StatusIndicator status="active" size="sm" variant="dot" />
              <span className="font-medium">{getModelName()}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 px-6 pb-6 border-t border-border/40 bg-card/30 relative z-10">
        <div className="flex items-center justify-between w-full">
          <AgentStatus
            status={agent.status}
            size="sm"
            className="border border-border/50 shadow-sm"
          />

          <time
            dateTime={agent.createdAt.toISOString()}
            className="text-xs text-muted-foreground font-medium bg-muted/30 px-2 py-1 rounded-md"
          >
            {formattedDate}
          </time>
        </div>
      </CardFooter>
    </Card>
  );
}

// Alias for backward compatibility
export const AgentCardWithActions = AgentCard;
