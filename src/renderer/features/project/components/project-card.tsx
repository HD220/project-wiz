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
import { FeatureCard } from "@/renderer/components/shared/feature-card";
import { cn, isValidAvatarUrl } from "@/renderer/lib/utils";

interface ProjectCardProps {
  project: SelectProject;
  variant?: "default" | "compact";
  className?: string;
  interactive?: boolean;
}

function ProjectCard(props: ProjectCardProps) {
  const { project, variant = "default", className, interactive = true } = props;

  const isCompact = variant === "compact";
  const featureCardVariant =
    project.status === "active" ? "default" : "compact";

  // Format creation date with better UX
  const createdDate = new Date(project.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <FeatureCard.Root
      variant={featureCardVariant}
      interactive={interactive}
      className={className}
      role="article"
      aria-label={`Projeto ${project.name}`}
    >
      <FeatureCard.Header>
        <div className="flex items-start gap-3">
          <FeatureCard.Icon asChild>
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
          </FeatureCard.Icon>

          <div className="flex-1 min-w-0">
            <FeatureCard.Title className="truncate">
              {project.name}
            </FeatureCard.Title>
            {project.description && !isCompact && (
              <FeatureCard.Description className="mt-1">
                {project.description}
              </FeatureCard.Description>
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
      </FeatureCard.Header>

      <FeatureCard.Content className={isCompact ? "pt-0" : undefined}>
        {!isCompact && (
          <div className="space-y-3">
            <div className="space-y-2">
              {project.localPath && (
                <FeatureCard.Meta className="flex items-center gap-2">
                  <Folder className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate" title={project.localPath}>
                    {project.localPath}
                  </span>
                </FeatureCard.Meta>
              )}

              {project.gitUrl && (
                <FeatureCard.Meta className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate" title={project.gitUrl}>
                    {project.branch || "main"}
                  </span>
                </FeatureCard.Meta>
              )}

              <FeatureCard.Meta className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Criado em {createdDate}</span>
              </FeatureCard.Meta>
            </div>
          </div>
        )}
      </FeatureCard.Content>

      <FeatureCard.Footer>
        <FeatureCard.Action asChild>
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
        </FeatureCard.Action>
      </FeatureCard.Footer>
    </FeatureCard.Root>
  );
}

export { ProjectCard };
