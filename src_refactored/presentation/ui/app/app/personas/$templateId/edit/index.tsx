import {
  createFileRoute,
  useRouter,
  useParams,
} from "@tanstack/react-router";
import React from "react";
import { toast } from "sonner";

import { EditPersonaTemplateFormRenderer } from "@/ui/features/persona/components/edit/EditPersonaTemplateFormRenderer";
import { EditPersonaTemplateLoadingErrorDisplay } from "@/ui/features/persona/components/edit/EditPersonaTemplateLoadingErrorDisplay";
import { PersonaTemplateFormData } from "@/ui/features/persona/components/PersonaTemplateForm";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";
import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  GetPersonaTemplateDetailsRequest,
  GetPersonaTemplateDetailsResponseData,
  UpdatePersonaTemplateRequest,
  UpdatePersonaTemplateResponseData,
  IPCResponse,
} from "@/shared/ipc-types";

function EditPersonaTemplatePage() {
  const router = useRouter();
  const params = useParams({ from: "/app/personas/$templateId/edit/" });
  const templateId = params.templateId;

  const {
    data: personaTemplate,
    isLoading: isLoadingTemplate,
    error: templateError,
    refetch,
  } = useIpcQuery<
    GetPersonaTemplateDetailsRequest,
    IPCResponse<GetPersonaTemplateDetailsResponseData>
  >(
    IPC_CHANNELS.GET_PERSONA_TEMPLATE_DETAILS,
    { templateId },
    {
      staleTime: 5 * 60 * 1000,
      onError: (err: Error) => {
        toast.error(`Erro ao buscar detalhes do template: ${err.message}`);
      },
    },
  );

  const updatePersonaMutation = useIpcMutation<
    UpdatePersonaTemplateRequest,
    IPCResponse<UpdatePersonaTemplateResponseData>
  >(IPC_CHANNELS.UPDATE_PERSONA_TEMPLATE, {
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success(
          `Template "${response.data.name}" atualizado com sucesso!`,
        );
        refetch();
        router.navigate({
          to: "/app/personas/$templateId",
          params: { templateId: response.data.id },
          replace: true,
        });
      } else {
        toast.error(
          `Falha ao atualizar o template: ${response.error?.message || "Erro desconhecido."}`,
        );
      }
    },
    onError: (error) => {
      toast.error(`Falha ao atualizar o template: ${error.message}`);
    },
  });

  const handleSubmit = async (formData: PersonaTemplateFormData) => {
    console.log(
      "Dados atualizados do template de persona:",
      templateId,
      formData,
    );
    updatePersonaMutation.mutate({ templateId, data: formData });
  };

  const loadingOrError = EditPersonaTemplateLoadingErrorDisplay({
    isLoading: isLoadingTemplate,
    error: templateError,
    templateId,
  });
  if (loadingOrError) {
    return loadingOrError;
  }

  if (!personaTemplate) {
    return (
      <EditPersonaTemplateLoadingErrorDisplay
        isLoading={false}
        error={null}
        templateId={templateId}
      />
    );
  }

  return (
    <EditPersonaTemplateFormRenderer
      templateId={templateId}
      personaTemplate={personaTemplate}
      handleSubmit={handleSubmit}
      isSubmitting={updatePersonaMutation.isLoading}
    />
  );
}

export const Route = createFileRoute("/app/personas/$templateId/edit/")({
  component: EditPersonaTemplatePage,
});

