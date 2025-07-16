import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { CreateProjectFormData } from "../schemas/create-project.schema";
import { ProjectFormNameField } from "./project-form-name-field";
import { ProjectFormDescriptionField } from "./project-form-description-field";
import { ProjectFormGitField } from "./project-form-git-field";
import { ProjectFormAvatarField } from "./project-form-avatar-field";
import { ProjectFormSubmitButton } from "./project-form-submit-button";

interface ProjectFormFieldsProps {
  form: UseFormReturn<CreateProjectFormData>;
  onSubmit: (data: CreateProjectFormData) => Promise<void>;
  isLoading: boolean;
}

export function ProjectFormFields({
  form,
  onSubmit,
  isLoading,
}: ProjectFormFieldsProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ProjectFormNameField form={form} />
        <ProjectFormDescriptionField form={form} />
        <ProjectFormGitField form={form} />
        <ProjectFormAvatarField form={form} />
        <ProjectFormSubmitButton isLoading={isLoading} />
      </form>
    </Form>
  );
}