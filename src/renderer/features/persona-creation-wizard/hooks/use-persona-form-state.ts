import { useState, useCallback } from "react";

export function usePersonaFormState() {
  const [step, setStep] = useState(1);
  const [personaName, setPersonaName] = useState("");
  const [personaDescription, setPersonaDescription] = useState("");
  const [llmModel, setLlmModel] = useState("");
  const [llmTemperature, setLlmTemperature] = useState(0.7);
  const [tools, setTools] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFormState = useCallback(() => {
    setStep(1);
    setPersonaName("");
    setPersonaDescription("");
    setLlmModel("");
    setLlmTemperature(0.7);
    setTools("");
  }, []);

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
    setLoading,
    error,
    setError,
    resetFormState,
  };
}
