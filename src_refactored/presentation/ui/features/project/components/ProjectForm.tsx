import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import React from "react";
// Control removed as it's now in field components
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
// Other Form components are used by fields
import { Form } from "@/components/ui/form";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  CreateProjectRequest,
  CreateProjectResponseData,
  Project,
  UpdateProjectRequest,
  UpdateProjectResponseData,
} from "@/shared/ipc-types";

import { ProjectDescriptionField } from "./fields/ProjectDescriptionField";
import { ProjectNameField } from "./fields/ProjectNameField";

const projectFormSchema = z.object({
  name: z
    .string()
    .min(3, "O nome do projeto deve ter pelo menos 3 caracteres.")
    .max(100, "O nome do projeto não pode exceder 100 caracteres."),
  description: z
    .string()
    .max(500, "A descrição não pode exceder 500 caracteres.")
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: Project;
  onSuccess?: (data: Project) => void;
  submitButtonText?: string;
  onSubmit?: (data: ProjectFormData) => Promise<void>;
  isSubmitting?: boolean;
  initialValues?: Partial<ProjectFormData>;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!project;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
    },
  });

  const createProjectMutation = useIpcMutation<
    CreateProjectRequest,
    CreateProjectResponseData
  >(IPC_CHANNELS.CREATE_PROJECT, {
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success(`Projeto "${response.data.name}" criado com sucesso!`);
        onSuccess?.(response.data);
        router.navigate({
          to: "/app/projects/$projectId",
          params: { projectId: response.data.id },
        });
      } else {
        toast.error(response.error?.message || "Falha ao criar o projeto.");
      }
    },
    onError: (error) => {
      toast.error(`Erro ao criar projeto: ${error.message}`);
    },
  });

  const updateProjectMutation = useIpcMutation<
    UpdateProjectRequest,
    UpdateProjectResponseData
  >(IPC_CHANNELS.UPDATE_PROJECT, {
    onSuccess: (response) => {
      if (response.success && response.data) {
        toast.success(
          `Projeto "${response.data.name}" atualizado com sucesso!`
        );
        onSuccess?.(response.data);
        router.invalidate();
      } else {
        toast.error(response.error?.message || "Falha ao atualizar o projeto.");
      }
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar projeto: ${error.message}`);
    },
  });

  const isSubmitting =
    createProjectMutation.isLoading || updateProjectMutation.isLoading;

  const handleSubmit = (data: ProjectFormData) => {
    if (isEditing && project) {
      updateProjectMutation.mutate({ projectId: project.id, data: data });
    } else {
      createProjectMutation.mutate(data);
    }
  };

  const effectiveSubmitButtonText = isEditing
    ? "Salvar Alterações"
    : "Criar Projeto";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ProjectNameField control={form.control} />
        <ProjectDescriptionField control={form.control} />

        {/* Futuros campos podem ser adicionados aqui */}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || (isEditing && !form.formState.isDirty)}
          >
            {isSubmitting ? "Salvando..." : effectiveSubmitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
