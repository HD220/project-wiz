import { createFileRoute, useRouter } from '@tanstack/react-router';
import React from 'react'; // Removed useState
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { ProjectForm, ProjectFormData } from '@/presentation/ui/features/project/components/ProjectForm';
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type { CreateProjectRequest, CreateProjectResponseData, IPCResponse } from '@/shared/ipc-types';


function NewProjectPage() {
  const router = useRouter();

  const createProjectMutation = useIpcMutation<
    CreateProjectRequest, // Request type is ProjectFormData
    IPCResponse<CreateProjectResponseData> // Expected response structure
  >(
    IPC_CHANNELS.CREATE_PROJECT,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(`Projeto "${response.data.name}" criado com sucesso!`);
          // Navigate to the newly created project's detail page
          router.navigate({ to: '/projects/$projectId', params: { projectId: response.data.id }, replace: true });
        } else {
          // This case should ideally be handled by onError if the IPCResponse wrapper is consistent
          toast.error(`Falha ao criar o projeto: ${response.error?.message || 'Erro desconhecido retornando sucesso.'}`);
        }
      },
      onError: (error) => {
        toast.error(`Falha ao criar o projeto: ${error.message}`);
      },
    }
  );

  const handleSubmit = async (data: ProjectFormData) => {
    console.log('Dados do novo projeto:', data);
    createProjectMutation.mutate(data);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Criar Novo Projeto</CardTitle>
          <CardDescription>
            Forneça os detalhes abaixo para iniciar um novo projeto de software.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            onSubmit={handleSubmit}
            isSubmitting={createProjectMutation.isLoading}
            submitButtonText="Criar Projeto"
          />
        </CardContent>
      </Card>
       <Button variant="link" onClick={() => router.history.back()} className="mt-4" disabled={createProjectMutation.isLoading}>
        Cancelar e Voltar
      </Button>
    </div>
  );
}

export const Route = createFileRoute('/(app)/projects/new/')({
  component: NewProjectPage,
});
