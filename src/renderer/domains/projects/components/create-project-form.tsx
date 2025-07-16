import { useCreateProjectForm } from "../hooks/use-create-project-form.hook";

import { ProjectFormFields } from "./project-form-fields";

interface CreateProjectFormProps {
  onSuccess?: () => void;
}

export function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const { form, onSubmit, isLoading } = useCreateProjectForm(onSuccess);

  return (
    <ProjectFormFields form={form} onSubmit={onSubmit} isLoading={isLoading} />
  );
}
