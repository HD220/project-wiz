import { createFileRoute, useRouter, useParams } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { ProjectForm, ProjectFormData } from '@/presentation/ui/features/project/components/ProjectForm';
import { Project } from '@/presentation/ui/features/project/components/ProjectListItem'; // Reusing the Project type

// Mock data - replace with actual data fetching for the specific project
const mockProjectsData: Record<string, Project> = {
  mockId1: { id: '1', name: 'Projeto Phoenix', description: 'Reconstrução da plataforma principal com foco em escalabilidade e IA...', status: 'active', lastActivity: '', agentCount: 0, taskCount: 0 }, // Key changed
  mockId2: { id: '2', name: 'Operação Quimera', description: 'Integração de múltiplos serviços legados...', status: 'paused', lastActivity: '', agentCount: 0, taskCount: 0 }, // Key changed
  // Add other projects if needed for testing direct navigation
};


function ProjectSettingsPage() {
  const router = useRouter();
  const params = useParams({ from: '/(app)/projects/$projectId/settings/' }); // Corrected from path
  const projectId = params.projectId;
  const [project, setProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching project data
    setTimeout(() => {
      const foundProject = mockProjectsData[projectId];
      if (foundProject) {
        setProject(foundProject);
      } else {
        toast.error(`Projeto com ID "${projectId}" não encontrado para configuração.`);
        // Optionally redirect if project not found, though the parent page might handle this
      }
      setIsLoading(false);
    }, 300);
  }, [projectId]);

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    console.log('Dados atualizados do projeto:', projectId, data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update mock data (client-side only for this simulation)
    if (project) {
      const updatedProject = { ...project, ...data };
      mockProjectsData[projectId] = updatedProject; // Note: this mutates mock, not ideal for real apps
      setProject(updatedProject);
      toast.success(`Projeto "${data.name}" atualizado com sucesso (simulado)!`);
    } else {
      toast.error("Não foi possível atualizar o projeto.");
    }

    setIsSubmitting(false);
    // Optionally navigate back to project details overview or stay on settings page
    // router.navigate({ to: '/projects/$projectId', params: { projectId } });
  };

  if (isLoading) {
    return <div className="p-6 text-center">Carregando configurações do projeto...</div>;
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p>Projeto não encontrado ou falha ao carregar dados.</p>
        <Button onClick={() => router.history.back()} variant="outline" className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    // This component might be rendered within a tab on ProjectDetailView,
    // so it might not need its own Card wrapper if the parent tab provides it.
    // For standalone route testing, a Card is fine.
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
          initialValues={{ name: project.name, description: project.description }}
          isSubmitting={isSubmitting}
          submitButtonText="Salvar Alterações"
        />
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute('/(app)/projects/$projectId/settings/')({
  component: ProjectSettingsPage,
});
