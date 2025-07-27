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
import {
  StatusIndicator,
  StatusDot,
  StatusLabel,
} from "@/renderer/features/agent/components/agent-status-badge";
import { cn } from "@/renderer/lib/utils";

interface AgentListCardProps {
  agent: SelectAgent;
  onDelete?: (agent: SelectAgent) => void;
  onRestore?: (agent: SelectAgent) => void;
  onToggleStatus?: (agent: SelectAgent) => void;
}

function AgentListCard(props: AgentListCardProps) {
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
        "p-4 transition-colors hover:bg-accent/50",
        // Visual distinction for inactive agents
        !agent.isActive && "opacity-60 border-dashed",
      )}
    >
      <div className="flex items-center gap-4">
        {/* Avatar and Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar
            className={cn(
              "h-10 w-10 shrink-0",
              !agent.isActive && "opacity-70",
            )}
          >
            <AvatarImage src={undefined} alt={agent.name} />
            <AvatarFallback
              className={cn(
                "bg-primary/10 text-primary",
                !agent.isActive && "bg-muted/50 text-muted-foreground",
              )}
            >
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={cn(
                  "font-medium truncate",
                  !agent.isActive && "text-muted-foreground",
                )}
              >
                {agent.name}
              </h3>

              {/* Inactive badge */}
              {!agent.isActive && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="secondary"
                        className="h-4 px-1.5 text-xs font-medium bg-muted/50 text-muted-foreground border-0"
                      >
                        Inativo
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Desativado em{" "}
                        {formatDeactivationDate(agent.deactivatedAt)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <p className="text-sm text-muted-foreground truncate">
              {agent.role} •{" "}
              {!agent.isActive ? (
                <>Desativado em {formatDeactivationDate(agent.deactivatedAt)}</>
              ) : (
                <>Criado em {new Date(agent.createdAt).toLocaleDateString()}</>
              )}
            </p>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Only show status indicator for active agents */}
          {agent.isActive && (
            <StatusIndicator status={agent.status} size="sm" className="border">
              <StatusDot status={agent.status} size="sm" />
              <StatusLabel status={agent.status} />
            </StatusIndicator>
          )}

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {agent.isActive ? (
                // Actions for active agents
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/user/agents/edit/$agentId"
                      params={{ agentId: agent.id }}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleToggleStatus}>
                    {agent.status === "active" ? (
                      <>
                        <PowerOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Power className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : (
                // Actions for inactive agents
                <>
                  <DropdownMenuItem
                    onClick={handleRestore}
                    className="text-green-600 dark:text-green-400"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore Agent
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem disabled className="text-muted-foreground">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit (Unavailable)
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

export { AgentListCard };
