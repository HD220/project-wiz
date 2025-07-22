import { Link } from "@tanstack/react-router";
import { MoreHorizontal, Pencil, Power, Trash2, User } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Button } from "@/renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/renderer/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { cn } from "@/renderer/lib/utils";

import { AgentStatusBadge } from "./agent-status-badge";

import type { SelectAgent } from "../agent.types";

interface AgentCardProps {
  agent: SelectAgent;
  onDelete?: (agent: SelectAgent) => void;
  onToggleStatus?: (agent: SelectAgent) => void;
  className?: string;
}

function AgentCard(props: AgentCardProps) {
  const { agent, onDelete, onToggleStatus, className } = props;

  function handleDelete() {
    onDelete?.(agent);
  }

  function handleToggleStatus() {
    onToggleStatus?.(agent);
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={(agent as any)?.avatar} alt={agent.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm leading-none">
                {agent.name}
              </h3>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem asChild>
                <Link
                  to="/user/agents/edit/$agentId"
                  params={{ agentId: agent.id }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                <Power className="mr-2 h-4 w-4" />
                {agent.status === "active" ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {agent.backstory}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <AgentStatusBadge status={agent.status} />
          <div className="text-xs text-muted-foreground">
            {new Date(agent.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export { AgentCard };
