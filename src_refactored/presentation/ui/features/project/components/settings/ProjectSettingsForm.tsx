import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ProjectForm,
  ProjectFormData,
} from "@/ui/features/project/components/ProjectForm";

import { Project } from "@/shared/ipc-types";
import { GetProjectDetailsResponseData } from "@/shared/ipc-types";

interface ProjectSettingsFormProps {
  project: GetProjectDetailsResponseData;
  handleSubmit: (formData: ProjectFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ProjectSettingsForm({
  project,
  handleSubmit,
  isSubmitting,
}: ProjectSettingsFormProps) {
  if (!project) {
    return null; // Or a loading/error state
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Projeto: {project.name}</CardTitle>
        <CardDescription>
          Edite o nome e a descrição do seu projeto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectForm
          onSubmit={handleSubmit}
          initialValues={{
            name: project.name,
            description: project.description ?? undefined,
          }}
          isSubmitting={isSubmitting}
          submitButtonText="Salvar Alterações"
        />
      </CardContent>
    </Card>
  );
}
