import { Link } from "@tanstack/react-router";
import { Calendar, Folder, GitBranch } from "lucide-react";

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
} from "@/renderer/components/ui/card";
import { cn, isValidAvatarUrl } from "@/renderer/lib/utils";

interface ProjectCardProps {
  project: SelectProject;
  variant?: "default" | "compact";
  className?: string;
  interactive?: boolean;
}

export function ProjectCard(props: ProjectCardProps) {
  const { project, variant = "default", className, interactive = true } = props;

  const isCompact = variant === "compact";

  // Format creation date with better UX
  const createdDate = new Date(project.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Inline styling based on variant and status
  const cardVariantStyles = cn(
    "transition-all duration-200 group",
    {
      "hover:shadow-md": project.status === "active" && !isCompact,
      "hover:shadow-sm": isCompact,
      "cursor-pointer hover:scale-[1.02]": interactive,
    },
    className,
  );

  return (
    <Card
      className={cardVariantStyles}
      role="article"
      aria-label={`Projeto ${project.name}`}
    >
      <CardHeader
        className={cn("transition-colors duration-200", {
          "pb-2": isCompact,
        })}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200 shrink-0",
              isCompact
                ? "h-8 w-8 bg-muted text-muted-foreground"
                : "h-10 w-10 bg-primary/10 text-primary group-hover:bg-primary/20",
              {
                "group-hover:scale-110": interactive,
              },
            )}
          >
            <Avatar
              className={cn("shrink-0", isCompact ? "h-8 w-8" : "h-10 w-10")}
            >
              <AvatarImage
                src={isValidAvatarUrl(project.avatarUrl) || undefined}
                alt={`Avatar do projeto ${project.name}`}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {project.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-semibold transition-colors duration-200 truncate",
                isCompact ? "text-base" : "text-lg",
              )}
            >
              {project.name}
            </h3>
            {project.description && !isCompact && (
              <p className="text-muted-foreground transition-colors duration-200 text-base mt-2">
                {project.description}
              </p>
            )}
          </div>

          <Badge
            variant={project.status === "active" ? "default" : "secondary"}
            className="shrink-0"
            aria-label={`Status: ${project.status === "active" ? "Ativo" : "Arquivado"}`}
          >
            {project.status === "active" ? "Ativo" : "Arquivado"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent
        className={cn({
          "space-y-4": !isCompact,
          "space-y-2 pt-0": isCompact,
        })}
      >
        {!isCompact && (
          <div className="space-y-4">
            <div className="space-y-4">
              {project.localPath && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Folder className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate" title={project.localPath}>
                    {project.localPath}
                  </span>
                </div>
              )}

              {project.gitUrl && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <GitBranch className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate" title={project.gitUrl}>
                    {project.branch || "main"}
                  </span>
                </div>
              )}

              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Criado em {createdDate}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-full">
          <Link
            to="/project/$projectId"
            params={{ projectId: project.id }}
            className="w-full"
            aria-describedby={`project-${project.id}-description`}
          >
            <Button
              variant={isCompact ? "ghost" : "outline"}
              size={isCompact ? "sm" : "default"}
              className={cn(
                "w-full transition-colors",
                isCompact ? "justify-start" : "justify-center",
              )}
            >
              {isCompact ? "Abrir" : "Abrir Projeto"}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
