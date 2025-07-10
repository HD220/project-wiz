import React from "react";
import { Step1 } from "./step1";
import { Step2 } from "./step2";

interface PersonaFormProps {
  step: number;
  personaName: string;
  setPersonaName: (name: string) => void;
  personaDescription: string;
  setPersonaDescription: (description: string) => void;
  llmModel: string;
  setLlmModel: (model: string) => void;
  llmTemperature: number;
  setLlmTemperature: (temperature: number) => void;
  tools: string;
  setTools: (tools: string) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  _error: string | null;
}

const PersonaForm: React.FC<PersonaFormProps> = ({
  step,
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
  handleNext,
  handleBack,
  handleSubmit,
  loading,
  _error,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      {step === 1 && (
        <Step1
          personaName={personaName}
          setPersonaName={setPersonaName}
          personaDescription={personaDescription}
          setPersonaDescription={setPersonaDescription}
          handleNext={handleNext}
        />
      )}

      {step === 2 && (
        <Step2
          llmModel={llmModel}
          setLlmModel={setLlmModel}
          llmTemperature={llmTemperature}
          setLlmTemperature={setLlmTemperature}
          tools={tools}
          setTools={setTools}
          handleBack={handleBack}
          loading={loading}
        />
      )}
    </form>
  );
};

export default PersonaForm;
