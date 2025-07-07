import { createFileRoute, useRouter, useParams } from "@tanstack/react-router";
import React from "react";
import { toast } from "sonner";

import { ProjectSettingsError } from "@/ui/features/project/components/settings/ProjectSettingsError";
import { ProjectSettingsForm } from "@/ui/features/project/components/settings/ProjectSettingsForm";
import { ProjectSettingsLoading } from "@/ui/features/project/components/settings/ProjectSettingsLoading";
import { useIpcQuery } from "@/ui/hooks/ipc/use-ipc-query.hook";

import { IPC_CHANNELS } from "@/shared/ipc-channels.constants";
import type {
  GetProjectDetailsRequest,
  GetProjectDetailsResponse,
} from "@/shared/ipc-types/project.types";

function ProjectSettingsPage() {
  const router = useRouter();
  const { projectId } = useParams({ from: "/app/projects/$projectId/settings/" });

  const { data: project, isLoading, error } = useIpcQuery<
    GetProjectDetailsResponse,
    GetProjectDetailsRequest
  >(
    IPC_CHANNELS.GET_PROJECT_DETAILS,
    { projectId },
    {
      staleTime: 5 * 60 * 1000,
      onError: (err: Error) => {
        toast.error(`Erro ao buscar detalhes do projeto: ${err.message}`);
      },
    }
  );

  if (isLoading) {
    return <ProjectSettingsLoading />;
  }

  if (error) {
    return (
      <ProjectSettingsError error={error} onBack={() => router.history.back()} />
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

  return <ProjectSettingsForm project={project} />;
}

export const Route = createFileRoute("/app/projects/$projectId/settings/")({
  component: ProjectSettingsPage,
});
