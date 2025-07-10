import { useCallback } from "react";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type { IPersona } from "@/shared/ipc-types/domain-types";
import { useIpcMutation } from "@/renderer/hooks/use-ipc-mutation.hook";
import type { IpcPersonaRefineSuggestionPayload, IpcPersonaCreatePayload } from "@/shared/ipc-types/ipc-payloads";

interface UsePersonaSubmissionProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  onFinally: () => void;
}

export function usePersonaSubmission({
  onSuccess,
  onError,
  onFinally,
}: UsePersonaSubmissionProps) {
  const { mutate: createPersona } = useIpcMutation<IPersona, Error, IpcPersonaCreatePayload>({
    channel: IpcChannel.PERSONA_CREATE,
    onSuccess: () => {
      onSuccess();
    },
    onError: (err) => {
      onError(err.message || "Failed to create persona");
    },
    onSettled: onFinally,
  });

  const { mutate: refinePersonaSuggestion } = useIpcMutation<IPersona, Error, IpcPersonaRefineSuggestionPayload>({
    channel: IpcChannel.PERSONA_REFINE_SUGGESTION,
    onSuccess: (refinedPersona) => {
      createPersona({
        name: refinedPersona.name,
        description: refinedPersona.description,
        llmModel: refinedPersona.llmConfig.model,
        llmTemperature: refinedPersona.llmConfig.temperature,
        tools: refinedPersona.tools,
      });
    },
    onError: (err) => {
      onError(err.message || "Failed to refine persona suggestion");
    },
  });

  const handlePersonaSubmission = useCallback(
    async (
      name: string,
      description: string,
      model: string,
      temperature: number,
      toolsList: string,
    ) => {
      refinePersonaSuggestion({
        name,
        description,
        llmModel: model,
        llmTemperature: temperature,
        tools: toolsList
          .split(",")
          .map((tool) => tool.trim())
          .filter((tool) => tool),
      });
    },
    [refinePersonaSuggestion, createPersona, onSuccess, onError, onFinally],
  );

  return { handlePersonaSubmission };
}
