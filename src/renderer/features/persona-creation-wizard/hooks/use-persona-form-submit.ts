import { useCallback } from "react";

interface UsePersonaFormSubmitProps {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  handlePersonaSubmission: (
    name: string,
    description: string,
    model: string,
    temperature: number,
    toolsList: string,
  ) => Promise<void>;
  personaName: string;
  personaDescription: string;
  llmModel: string;
  llmTemperature: number;
  tools: string;
}

export function usePersonaFormSubmit({
  setLoading,
  setError,
  handlePersonaSubmission,
  personaName,
  personaDescription,
  llmModel,
  llmTemperature,
  tools,
}: UsePersonaFormSubmitProps) {
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      await handlePersonaSubmission(
        personaName,
        personaDescription,
        llmModel,
        llmTemperature,
        tools,
      );
    },
    [
      personaName,
      personaDescription,
      llmModel,
      llmTemperature,
      tools,
      handlePersonaSubmission,
      setLoading,
      setError,
    ],
  );

  return { handleSubmit };
}
