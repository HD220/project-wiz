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

interface ProjectSettingsFormProps {
  project: {
    name: string;
    description?: string;
  };
  handleSubmit: (formData: ProjectFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ProjectSettingsForm({
  project,
  handleSubmit,
  isSubmitting,
}: ProjectSettingsFormProps) {
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
            description: project.description,
          }}
          isSubmitting={isSubmitting}
          submitButtonText="Salvar Alterações"
        />
      </CardContent>
    </Card>
  );
}
