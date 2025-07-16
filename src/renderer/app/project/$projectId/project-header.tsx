import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProjectDto } from "@/shared/types";

interface ProjectHeaderProps {
  project: ProjectDto;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground">
          {project.description || "Visão geral do projeto"}
        </p>
      </div>
      <Button variant="outline" size="sm">
        <Settings className="w-4 h-4 mr-2" />
        Configurações
      </Button>
    </div>
  );
}
