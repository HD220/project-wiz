import * as React from "react";
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
import { AgentStatus } from "@/renderer/components/agent-status/agent-status";
import { cn, isValidAvatarUrl } from "@/renderer/lib/utils";

// Base AgentCard container component
interface AgentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  agent: AgentWithAvatar;
  children?: React.ReactNode;
}

export function AgentCard({
  agent,
  className,
  children,
  ...props
}: AgentCardProps) {
  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

// AgentCard Header with avatar and info
interface AgentCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  agent: AgentWithAvatar;
  children?: React.ReactNode;
}

export function AgentCardHeader({
  agent,
  className,
  children,
  ...props
}: AgentCardHeaderProps) {
  return (
    <CardHeader className={cn("pb-4", className)} {...props}>
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src={isValidAvatarUrl(agent.avatar) || undefined}
            alt={`${agent.name} avatar`}
          />
          <AvatarFallback className="bg-primary/5 text-primary border border-primary/10">
            <User className="size-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          <CardTitle className="text-base font-semibold leading-tight truncate">
            {agent.name}
          </CardTitle>
          <CardDescription className="text-sm truncate">
            {agent.role}
          </CardDescription>
        </div>

        {children}
      </div>
    </CardHeader>
  );
}

// AgentCard Actions (dropdown menu)
interface AgentCardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  agent: AgentWithAvatar;
  onDelete?: (agent: AgentWithAvatar) => void;
  onToggleStatus?: (agent: AgentWithAvatar) => void;
}

export function AgentCardActions({
  agent,
  onDelete,
  onToggleStatus,
  className,
  ...props
}: AgentCardActionsProps) {
  // Inline handlers following INLINE-FIRST principles
  function handleDelete() {
    onDelete?.(agent);
  }

  function handleToggleStatus() {
    onToggleStatus?.(agent);
  }

  return (
    <CardAction className={className} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Actions for ${agent.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link
              to="/user/agents/edit/$agentId"
              params={{ agentId: agent.id }}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 size-4" />
              Edit Agent
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
            Delete Agent
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardAction>
  );
}

// AgentCard Content with backstory
interface AgentCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  agent: AgentWithAvatar;
}

export function AgentCardContent({
  agent,
  className,
  ...props
}: AgentCardContentProps) {
  return (
    <CardContent className={cn("pb-4", className)} {...props}>
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {agent.backstory || "No backstory provided."}
      </p>
    </CardContent>
  );
}

// AgentCard Footer with status and date
interface AgentCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  agent: AgentWithAvatar;
}

export function AgentCardFooter({
  agent,
  className,
  ...props
}: AgentCardFooterProps) {
  // Inline date formatting following INLINE-FIRST principles
  const formattedDate = new Date(agent.createdAt).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <CardFooter
      className={cn("pt-0 border-t border-border/50", className)}
      {...props}
    >
      <div className="flex items-center justify-between w-full">
        <AgentStatus status={agent.status} size="sm" className="border" />

        <time
          dateTime={agent.createdAt.toISOString()}
          className="text-sm text-muted-foreground font-medium"
        >
          {formattedDate}
        </time>
      </div>
    </CardFooter>
  );
}

// Complete AgentCard component for backward compatibility
interface AgentCardWithActionsProps {
  agent: AgentWithAvatar;
  onDelete?: (agent: AgentWithAvatar) => void;
  onToggleStatus?: (agent: AgentWithAvatar) => void;
  className?: string;
}

export function AgentCardWithActions({
  agent,
  onDelete,
  onToggleStatus,
  className,
}: AgentCardWithActionsProps) {
  return (
    <AgentCard agent={agent} className={className}>
      <AgentCardHeader agent={agent}>
        <AgentCardActions
          agent={agent}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </AgentCardHeader>
      <AgentCardContent agent={agent} />
      <AgentCardFooter agent={agent} />
    </AgentCard>
  );
}
