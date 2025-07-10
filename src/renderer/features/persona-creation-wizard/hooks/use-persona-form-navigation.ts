import { useCallback } from "react";

interface UsePersonaFormNavigationProps {
  step: number;
  personaName: string;
  personaDescription: string;
  setStep: (step: number) => void;
  setError: (error: string | null) => void;
}

export function usePersonaFormNavigation({
  step,
  personaName,
  personaDescription,
  setStep,
  setError,
}: UsePersonaFormNavigationProps) {
  const handleNext = useCallback(() => {
    setError(null);
    if (step === 1 && (!personaName || !personaDescription)) {
      setError("Name and Description are required.");
      return;
    }
    setStep(step + 1);
  }, [step, personaName, personaDescription, setStep, setError]);

  const handleBack = useCallback(() => {
    setStep(step - 1);
  }, [step, setStep]);

  return { handleNext, handleBack };
}
