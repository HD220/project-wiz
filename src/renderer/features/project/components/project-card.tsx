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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/renderer/components/ui/card";
import { cn } from "@/renderer/lib/utils";

interface ProjectCardProps {
  project: SelectProject;
  variant?: "default" | "compact";
  className?: string;
}

function ProjectCard(props: ProjectCardProps) {
  const { project, variant = "default", className } = props;

  const isCompact = variant === "compact";

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className={cn("pb-4", isCompact && "pb-2")}>
        <div className="flex items-start space-x-3">
          <Avatar className={cn("h-10 w-10", isCompact && "h-8 w-8")}>
            <AvatarImage src={project.avatarUrl || undefined} />
            <AvatarFallback>
              {project.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className={cn("text-base", isCompact && "text-sm")}>
              {project.name}
            </CardTitle>
            {project.description && !isCompact && (
              <CardDescription className="mt-1 line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </div>
          <Badge
            variant={project.status === "active" ? "default" : "secondary"}
          >
            {project.status === "active" ? "Ativo" : "Arquivado"}
          </Badge>
        </div>
      </CardHeader>

      {!isCompact && (
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm text-muted-foreground">
            {project.localPath && (
              <div className="flex items-center space-x-2">
                <Folder className="h-4 w-4" />
                <span className="truncate">{project.localPath}</span>
              </div>
            )}

            {project.gitUrl && (
              <div className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4" />
                <span className="truncate">{project.branch || "main"}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>
                Criado em {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Link to="/project/$projectId" params={{ projectId: project.id }}>
              <Button variant="outline" className="w-full">
                Abrir Projeto
              </Button>
            </Link>
          </div>
        </CardContent>
      )}

      {isCompact && (
        <CardContent className="pt-0 pb-3">
          <Link to="/project/$projectId" params={{ projectId: project.id }}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              Abrir
            </Button>
          </Link>
        </CardContent>
      )}
    </Card>
  );
}

export { ProjectCard };
