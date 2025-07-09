import React, { useState } from 'react';
import { Step1 } from './components/step1';
import { Step2 } from './components/step2';

interface PersonaCreationWizardProps {
  onPersonaCreated?: () => void;
}

function PersonaCreationWizard({ onPersonaCreated }: PersonaCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [personaName, setPersonaName] = useState('');
  const [personaDescription, setPersonaDescription] = useState('');
  const [llmModel, setLlmModel] = useState('');
  const [llmTemperature, setLlmTemperature] = useState(0.7);
  const [tools, setTools] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setError(null);
    if (step === 1 && (!personaName || !personaDescription)) {
      setError("Name and Description are required.");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const refinedPersonaResult = await window.electronIPC.invoke('persona:refine-suggestion', {
        name: personaName,
        description: personaDescription,
        llmModel,
        llmTemperature,
        tools: tools.split(',').map(t => t.trim()).filter(t => t),
      });

      if (!refinedPersonaResult.success || !refinedPersonaResult.data) {
        setError(refinedPersonaResult.error?.message || 'Failed to refine persona suggestion');
        setLoading(false);
        return;
      }

      const finalPersona = refinedPersonaResult.data;

      const createPersonaResult = await window.electronIPC.invoke('persona:create', {
        name: finalPersona.name,
        description: finalPersona.description,
        llmModel: finalPersona.llmConfig.model,
        llmTemperature: finalPersona.llmConfig.temperature,
        tools: finalPersona.tools,
      });

      if (!createPersonaResult.success) {
        setError(createPersonaResult.error?.message || 'Failed to create persona');
        setLoading(false);
        return;
      }

      setStep(1);
      setPersonaName('');
      setPersonaDescription('');
      setLlmModel('');
      setLlmTemperature(0.7);
      setTools('');
      onPersonaCreated?.();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Persona (AI-Assisted)</h2>

      {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

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
    </div>
  );
}

export { PersonaCreationWizard };
