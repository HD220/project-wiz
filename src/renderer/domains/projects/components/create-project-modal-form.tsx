import { ProjectForm } from "@/components/forms/project-form";

interface CreateProjectModalFormProps {
  name: string;
  description: string;
  gitUrl: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onGitUrlChange: (gitUrl: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export function CreateProjectModalForm({
  name,
  description,
  gitUrl,
  onNameChange,
  onDescriptionChange,
  onGitUrlChange,
  isSubmitting,
  onSubmit,
  onCancel,
}: CreateProjectModalFormProps) {
  return (
    <ProjectForm
      name={name}
      description={description}
      gitUrl={gitUrl}
      onNameChange={onNameChange}
      onDescriptionChange={onDescriptionChange}
      onGitUrlChange={onGitUrlChange}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  );
}
