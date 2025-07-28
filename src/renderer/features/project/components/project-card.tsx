import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Folder,
  GitBranch,
  MoreHorizontal,
  Pencil,
  Archive,
  ExternalLink,
} from "lucide-react";
import * as React from "react";

import type { SelectProject } from "@/main/features/project/project.types";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
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
import { cn, isValidAvatarUrl } from "@/renderer/lib/utils";

// Base ProjectCard container component
interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  project: SelectProject;
  children?: React.ReactNode;
}

// ProjectCard Actions interface
interface ProjectCardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  project: SelectProject;
  onArchive?: (project: SelectProject) => void;
  onEdit?: (project: SelectProject) => void;
}

// Legacy interface for backward compatibility
interface LegacyProjectCardProps {
  project: SelectProject;
  variant?: "default" | "compact";
  className?: string;
  interactive?: boolean;
  onArchive?: (project: SelectProject) => void;
  onEdit?: (project: SelectProject) => void;
}

// Base ProjectCard component
export function ProjectCard({
  project,
  className,
  children,
  ...props
}: ProjectCardProps) {
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

// ProjectCard Header with avatar and info
interface ProjectCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  project: SelectProject;
  children?: React.ReactNode;
}

export function ProjectCardHeader({
  project,
  className,
  children,
  ...props
}: ProjectCardHeaderProps) {
  return (
    <CardHeader className={cn("pb-4", className)} {...props}>
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src={isValidAvatarUrl(project.avatarUrl) || undefined}
            alt={`${project.name} avatar`}
          />
          <AvatarFallback className="bg-primary/5 text-primary border border-primary/10">
            <Folder className="size-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          <CardTitle className="text-base font-semibold leading-tight truncate">
            {project.name}
          </CardTitle>
          <CardDescription className="text-sm truncate">
            {project.description || "No description provided"}
          </CardDescription>
        </div>

        {children}
      </div>
    </CardHeader>
  );
}

// ProjectCard Actions (dropdown menu)
export function ProjectCardActions({
  project,
  onArchive,
  onEdit,
  className,
  ...props
}: ProjectCardActionsProps) {
  // Inline handlers following INLINE-FIRST principles
  function handleArchive() {
    onArchive?.(project);
  }

  function handleEdit() {
    onEdit?.(project);
  }

  return (
    <CardAction className={className} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Actions for ${project.name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link
              to="/project/$projectId"
              params={{ projectId: project.id }}
              className="cursor-pointer"
            >
              <ExternalLink className="mr-2 size-4" />
              Open Project
            </Link>
          </DropdownMenuItem>
          {onEdit && (
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil className="mr-2 size-4" />
              Edit Project
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {onArchive && (
            <DropdownMenuItem
              onClick={handleArchive}
              className="text-orange-600 focus:text-orange-600"
            >
              <Archive className="mr-2 size-4" />
              {project.status === "active" ? "Archive" : "Restore"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </CardAction>
  );
}

// ProjectCard Content with metadata
interface ProjectCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  project: SelectProject;
}

export function ProjectCardContent({
  project,
  className,
  ...props
}: ProjectCardContentProps) {
  return (
    <CardContent className={cn("pb-4 space-y-3", className)} {...props}>
      {/* Repository information */}
      <div className="space-y-2">
        {project.localPath && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Folder className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate font-mono text-xs bg-muted px-2 py-1 rounded">
              {project.localPath}
            </span>
          </div>
        )}

        {project.gitUrl && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <GitBranch className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">
              Branch:{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                {project.branch || "main"}
              </code>
            </span>
          </div>
        )}
      </div>
    </CardContent>
  );
}

// ProjectCard Footer with status and date
interface ProjectCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  project: SelectProject;
}

export function ProjectCardFooter({
  project,
  className,
  ...props
}: ProjectCardFooterProps) {
  // Inline date formatting following INLINE-FIRST principles
  const formattedDate = new Date(project.createdAt).toLocaleDateString(
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
        <Badge
          variant={project.status === "active" ? "default" : "secondary"}
          className="border"
        >
          {project.status === "active" ? "Active" : "Archived"}
        </Badge>

        <time
          dateTime={project.createdAt.toISOString()}
          className="text-sm text-muted-foreground font-medium flex items-center gap-1"
        >
          <Calendar className="h-3 w-3" />
          {formattedDate}
        </time>
      </div>
    </CardFooter>
  );
}

// Complete ProjectCard component with actions
interface ProjectCardWithActionsProps {
  project: SelectProject;
  onArchive?: (project: SelectProject) => void;
  onEdit?: (project: SelectProject) => void;
  className?: string;
}

export function ProjectCardWithActions({
  project,
  onArchive,
  onEdit,
  className,
}: ProjectCardWithActionsProps) {
  return (
    <ProjectCard project={project} className={className}>
      <ProjectCardHeader project={project}>
        <ProjectCardActions
          project={project}
          onArchive={onArchive}
          onEdit={onEdit}
        />
      </ProjectCardHeader>
      <ProjectCardContent project={project} />
      <ProjectCardFooter project={project} />
    </ProjectCard>
  );
}

// Legacy component for backward compatibility
export function LegacyProjectCard(props: LegacyProjectCardProps) {
  const { project, variant = "default", className, onArchive, onEdit } = props;
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <ProjectCard
        project={project}
        className={cn("hover:shadow-sm", className)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage
                src={isValidAvatarUrl(project.avatarUrl) || undefined}
                alt={`${project.name} avatar`}
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                <Folder className="size-3" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {project.name}
              </h3>
            </div>
            <Badge
              variant={project.status === "active" ? "default" : "secondary"}
              className="shrink-0 text-xs"
            >
              {project.status === "active" ? "Active" : "Archived"}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter>
          <Link
            to="/project/$projectId"
            params={{ projectId: project.id }}
            className="w-full"
          >
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Abrir
            </Button>
          </Link>
        </CardFooter>
      </ProjectCard>
    );
  }

  return (
    <ProjectCardWithActions
      project={project}
      onArchive={onArchive}
      onEdit={onEdit}
      className={className}
    />
  );
}
