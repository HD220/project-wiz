import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import type { ProjectDto } from "../../../../shared/types/domains/projects/project.types";

interface ProjectCardProps {
  project: ProjectDto;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={project.avatar} />
          <AvatarFallback>
            {project.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-muted-foreground truncate">
              {project.description}
            </p>
          )}
        </div>
        {project.unreadCount > 0 && (
          <Badge variant="secondary">{project.unreadCount}</Badge>
        )}
      </div>
    </Card>
  );
}
