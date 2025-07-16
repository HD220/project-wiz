import { ProjectFormActions } from "./project-form-actions";
import { ProjectFormFields } from "./project-form-fields";

interface ProjectFormProps {
  name: string;
  description: string;
  gitUrl: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGitUrlChange: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export function ProjectForm({
  name,
  description,
  gitUrl,
  onNameChange,
  onDescriptionChange,
  onGitUrlChange,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ProjectFormFields
        name={name}
        description={description}
        gitUrl={gitUrl}
        onNameChange={onNameChange}
        onDescriptionChange={onDescriptionChange}
        onGitUrlChange={onGitUrlChange}
        isSubmitting={isSubmitting}
      />
      <ProjectFormActions
        name={name}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </form>
  );
}
