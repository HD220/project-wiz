import { usePersonaFormState } from "./use-persona-form-state";
import { usePersonaFormNavigation } from "./use-persona-form-navigation";
import { usePersonaSubmission } from "./use-persona-submission";
import { usePersonaFormSubmit } from "./use-persona-form-submit";

interface UsePersonaWizardProps {
  onPersonaCreated?: () => void;
}

export function usePersonaWizard({ onPersonaCreated }: UsePersonaWizardProps) {
  const {
    step,
    setStep,
    personaName,
    setPersonaName,
    personaDescription,
    setPersonaDescription,
    llmModel,
    setLlmModel,
    llmTemperature,
    setLlmTemperature,
    tools,
    setTools,
    loading,
    setLoading,
    error,
    setError,
    resetFormState,
  } = usePersonaFormState();

  const { handleNext, handleBack } = usePersonaFormNavigation({
    step,
    personaName,
    personaDescription,
    setStep,
    setError,
  });

  const { handlePersonaSubmission } = usePersonaSubmission({
    onSuccess: () => {
      resetFormState();
      onPersonaCreated?.();
    },
    onError: (message) => setError(message),
    onFinally: () => setLoading(false),
  });

  const { handleSubmit } = usePersonaFormSubmit({
    setLoading,
    setError,
    handlePersonaSubmission,
    personaName,
    personaDescription,
    llmModel,
    llmTemperature,
    tools,
  });

  return {
    step,
    setStep,
    personaName,
    setPersonaName,
    personaDescription,
    setPersonaDescription,
    llmModel,
    setLlmModel,
    llmTemperature,
    setLlmTemperature,
    tools,
    setTools,
    loading,
    error,
    handleNext,
    handleBack,
    handleSubmit,
    resetFormState,
  };
}
