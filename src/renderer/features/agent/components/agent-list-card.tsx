import { Link } from "@tanstack/react-router";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  User,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Button } from "@/renderer/components/ui/button";
import { Card } from "@/renderer/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import type { SelectAgent } from "@/renderer/features/agent/agent.types";
import { AgentStatusBadge } from "@/renderer/features/agent/components/agent-status-badge";

interface AgentListCardProps {
  agent: SelectAgent;
  onDelete?: (agent: SelectAgent) => void;
  onToggleStatus?: (agent: SelectAgent) => void;
}

function AgentListCard(props: AgentListCardProps) {
  const { agent, onDelete, onToggleStatus } = props;

  function handleDelete() {
    onDelete?.(agent);
  }

  function handleToggleStatus() {
    onToggleStatus?.(agent);
  }

  return (
    <Card className="p-4 transition-colors hover:bg-accent/50">
      <div className="flex items-center gap-4">
        {/* Avatar and Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={undefined} alt={agent.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{agent.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {agent.role} • Created{" "}
              {new Date(agent.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 shrink-0">
          <AgentStatusBadge status={agent.status} />

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}

export { AgentListCard };
