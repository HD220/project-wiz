import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectForm } from "@/ui/features/project/components/ProjectForm";
import type { Project } from "@/core/domain/entities/project";

interface ProjectSettingsFormProps {
  project: Project;
}

export function ProjectSettingsForm({ project }: ProjectSettingsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Projeto: {project.name}</CardTitle>
        <CardDescription>
          Edite o nome e a descrição do seu projeto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectForm project={project} />
      </CardContent>
    </Card>
  );
}
