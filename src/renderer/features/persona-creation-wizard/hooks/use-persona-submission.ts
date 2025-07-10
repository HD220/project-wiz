import { useCallback } from "react";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import { IPersona } from "@/shared/ipc-types/domain-types";

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
  const handlePersonaSubmission = useCallback(
    async (
      name: string,
      description: string,
      model: string,
      temperature: number,
      toolsList: string,
    ) => {
      try {
        const refinedPersonaResult = await window.electronIPC.invoke(
          IpcChannel.PERSONA_REFINE_SUGGESTION,
          {
            name,
            description,
            llmModel: model,
            llmTemperature: temperature,
            tools: toolsList
              .split(",")
              .map((tool) => tool.trim())
              .filter((tool) => tool),
          },
        );

        if (!refinedPersonaResult.success || !refinedPersonaResult.data) {
          onError(
            refinedPersonaResult.error?.message ||
              "Failed to refine persona suggestion",
          );
          return;
        }

        const finalPersona = refinedPersonaResult.data as IPersona;

        const createPersonaResult = await window.electronIPC.invoke(
          IpcChannel.PERSONA_CREATE,
          {
            name: finalPersona.name,
            description: finalPersona.description,
            llmModel: finalPersona.llmConfig.model,
            llmTemperature: finalPersona.llmConfig.temperature,
            tools: finalPersona.tools,
          },
        );

        if (!createPersonaResult.success) {
          onError(
            createPersonaResult.error?.message || "Failed to create persona",
          );
          return;
        }

        onSuccess();
      } catch (err: unknown) {
        onError((err as Error).message);
      } finally {
        onFinally();
      }
    },
    [onSuccess, onError, onFinally],
  );

  return { handlePersonaSubmission };
}
