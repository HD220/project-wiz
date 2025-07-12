import PersonaForm from "./components/persona-form";
import { usePersonaWizard } from "./hooks/use-persona-wizard";

interface PersonaCreationWizardProps {
  onPersonaCreated?: () => void;
}

function PersonaCreationWizard({
  onPersonaCreated,
}: PersonaCreationWizardProps) {
  const {
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
    loading,
    error,
    handleNext,
    handleBack,
    handleSubmit,
  } = usePersonaWizard({ onPersonaCreated });

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Create New Persona (AI-Assisted)
      </h2>

      {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

      <PersonaForm
        step={step}
        personaName={personaName}
        setPersonaName={setPersonaName}
        personaDescription={personaDescription}
        setPersonaDescription={setPersonaDescription}
        llmModel={llmModel}
        setLlmModel={setLlmModel}
        llmTemperature={llmTemperature}
        setLlmTemperature={setLlmTemperature}
        tools={tools}
        setTools={setTools}
        handleNext={handleNext}
        handleBack={handleBack}
        handleSubmit={handleSubmit}
        loading={loading}
        _error={error}
      />
    </div>
  );
}

export { PersonaCreationWizard };
