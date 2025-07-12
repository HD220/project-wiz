import { PersonaFormContainer } from "./persona-form-container";

interface PersonaFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PersonaForm({ onSuccess, onCancel }: PersonaFormProps) {
  return <PersonaFormContainer onSuccess={onSuccess} onCancel={onCancel} />;
}
