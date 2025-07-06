import {
  createFileRoute,
  useParams,
} from "@tanstack/react-router";
import React from "react";

import { EditPersonaTemplateFormRenderer } from "@/ui/features/persona/components/edit/EditPersonaTemplateFormRenderer";
import { EditPersonaTemplateLoadingErrorDisplay } from "@/ui/features/persona/components/edit/EditPersonaTemplateLoadingErrorDisplay";
import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  GetPersonaTemplateDetailsRequest,
} from "@/shared/ipc-types/persona.types";

function EditPersonaTemplatePage() {
  const { templateId } = useParams({ from: "/app/personas/$templateId/edit/" });

  const { data: personaTemplate, isLoading, error } = useIpcQuery<
    GetPersonaTemplateDetailsResponse,
    GetPersonaTemplateDetailsRequest
  >(
    IPC_CHANNELS.GET_PERSONA_TEMPLATE_DETAILS,
    { templateId },
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading || !personaTemplate) {
    return (
      <EditPersonaTemplateLoadingErrorDisplay
        isLoading={isLoading}
        error={error}
        templateId={templateId}
      />
    );
  }

  return (
    <EditPersonaTemplateFormRenderer
      templateId={templateId}
      personaTemplate={personaTemplate}
    />
  );
}

export const Route = createFileRoute("/app/personas/$templateId/edit/")({
  component: EditPersonaTemplatePage,
});

