import { createFileRoute, useRouter, useParams } from '@tanstack/react-router';
import { Loader2, ServerCrash } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/ui/components/ui/card';
import { ProjectForm, ProjectFormData } from '@/presentation/ui/features/project/components/ProjectForm';
// Removed Project type import from list item, will use shared type
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation';
import { useIpcQuery } from '@/presentation/ui/hooks/ipc/useIpcQuery';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type {
  GetProjectDetailsRequest,
  GetProjectDetailsResponseData,
  UpdateProjectRequest,
  UpdateProjectResponseData,
  IPCResponse
} from '@/shared/ipc-types';


function ProjectSettingsPage() {
  const router = useRouter();
  const params = useParams({ from: '/(app)/projects/$projectId/settings/' });
  const projectId = params.projectId;

  const { data: project, isLoading: isLoadingProject, error: projectError, refetch } = useIpcQuery<
    GetProjectDetailsRequest,
    GetProjectDetailsResponseData
  >(
    IPC_CHANNELS.GET_PROJECT_DETAILS,
    { projectId },
    {
      staleTime: 5 * 60 * 1000,
      onError: (err) => {
        toast.error(`Erro ao buscar detalhes do projeto: ${err.message}`);
      }
    }
  );

  const updateProjectMutation = useIpcMutation<
    UpdateProjectRequest,
    IPCResponse<UpdateProjectResponseData>
  >(
    IPC_CHANNELS.UPDATE_PROJECT,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(`Projeto "${response.data.name}" atualizado com sucesso!`);
          refetch();
        } else {
          toast.error(`Falha ao atualizar o projeto: ${response.error?.message || 'Erro desconhecido'}`);
        }
      },
      onError: (error) => {
        toast.error(`Falha ao atualizar o projeto: ${error.message}`);
      },
    }
  );

  const handleSubmit = async (formData: ProjectFormData) => {
    console.log('Dados atualizados do projeto:', projectId, formData);
    updateProjectMutation.mutate({ projectId, data: formData });
  };

  if (isLoadingProject) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-400">Carregando configurações do projeto...</p>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Falha ao carregar dados do projeto</h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{projectError.message}</p>
        <Button onClick={() => router.history.back()} variant="destructive" className="mt-4">
          Voltar
        </Button>
      </div>
    );
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
          isSubmitting={updateProjectMutation.isLoading}
          submitButtonText="Salvar Alterações"
        />
      </CardContent>
    </Card>
  );
}

export const Route = createFileRoute('/(app)/projects/$projectId/settings/')({
  component: ProjectSettingsPage,
});
