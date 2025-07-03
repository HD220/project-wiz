import { createFileRoute, useRouter, useParams } from "@tanstack/react-router";
import React from "react";
import { toast } from "sonner";

import { ProjectFormData } from "@/ui/features/project/components/ProjectForm";
import { ProjectSettingsError } from "@/ui/features/project/components/settings/ProjectSettingsError";
import { ProjectSettingsForm } from "@/ui/features/project/components/settings/ProjectSettingsForm";
import { ProjectSettingsLoading } from "@/ui/features/project/components/settings/ProjectSettingsLoading";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";
import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  GetProjectDetailsRequest,
  GetProjectDetailsResponseData,
  UpdateProjectRequest,
  UpdateProjectResponseData,
  IPCResponse,
} from "@/shared/ipc-types";

function ProjectSettingsPage() {
  const router = useRouter();
  const params = useParams({ from: "/(app)/projects/$projectId/settings/" });
  const projectId = params.projectId;

  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
    refetch,
  } = useIpcQuery<
    GetProjectDetailsRequest,
    GetProjectDetailsResponseData
  >(
    IPC_CHANNELS.GET_PROJECT_DETAILS,
    { projectId },
    {
      staleTime: 5 * 60 * 1000,
      onError: (err) => {
        toast.error(`Erro ao buscar detalhes do projeto: ${err.message}`);
      },
    },
  );

  const updateProjectMutation = useIpcMutation<
    UpdateProjectRequest,
    IPCResponse<UpdateProjectResponseData>
  >(IPC_CHANNELS.UPDATE_PROJECT, {
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success(
          `Projeto "${response.data.name}" atualizado com sucesso!`,
        );
        refetch();
      } else {
        toast.error(
          `Falha ao atualizar o projeto: ${response.error?.message || "Erro desconhecido"}`,
        );
      }
    },
    onError: (error) => {
      toast.error(`Falha ao atualizar o projeto: ${error.message}`);
    },
  });

  const handleSubmit = async (formData: ProjectFormData) => {
    console.log("Dados atualizados do projeto:", projectId, formData);
    updateProjectMutation.mutate({ projectId, data: formData });
  };

  if (isLoadingProject) {
    return <ProjectSettingsLoading />;
  }

  if (projectError) {
    return (
      <ProjectSettingsError
        error={projectError}
        onBack={() => router.history.back()}
      />
    );
  }

  if (!project) {
    return (
      <ProjectSettingsError
        error={new Error("Projeto não encontrado ou falha ao carregar dados.")}
        onBack={() => router.history.back()}
      />
    );
  }

  return (
    <ProjectSettingsForm
      project={project}
      handleSubmit={handleSubmit}
      isSubmitting={updateProjectMutation.isLoading}
    />
  );
}

export const Route = createFileRoute("/app/projects/$projectId/settings/")({
  component: ProjectSettingsPage,
});
