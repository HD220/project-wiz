import { usePersonaFormState } from "../hooks/use-persona-form-state";
import { PersonaFormSteps } from "./persona-form-steps";
import { usePersonaFormNavigation } from "../hooks/use-persona-form-navigation";
import { usePersonaFormSubmit } from "../hooks/use-persona-form-submit";

interface PersonaFormContainerProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PersonaFormContainer({
  onSuccess,
  onCancel,
}: PersonaFormContainerProps) {
  const formState = usePersonaFormState();
  const navigation = usePersonaFormNavigation(formState);
  const { handleSubmit } = usePersonaFormSubmit({
    formState,
    onSuccess,
  });

  return (
    <form onSubmit={handleSubmit}>
      <PersonaFormSteps
        {...formState}
        {...navigation}
        handleSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </form>
  );
}
