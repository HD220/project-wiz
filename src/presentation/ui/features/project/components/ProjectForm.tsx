
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { Project } from "@/core/domain/entities/project";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useIpcMutation } from "@/ui/hooks/ipc/useIpcMutation";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  CreateProjectRequest,
  CreateProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
} from "@/shared/ipc-types/project.types";


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
    CreateProjectResponse,
    CreateProjectRequest
  >(IPC_CHANNELS.CREATE_PROJECT, {
    onSuccess: (data) => {
      toast.success(`Projeto "${data.name}" criado com sucesso!`);
      onSuccess?.(data);
      router.navigate({
        to: "/app/projects/$projectId",
        params: { projectId: data.id },
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar projeto: ${error.message}`);
    },
  });

  const updateProjectMutation = useIpcMutation<
    UpdateProjectResponse,
    UpdateProjectRequest
  >(IPC_CHANNELS.UPDATE_PROJECT, {
    onSuccess: (data) => {
      toast.success(`Projeto "${data.name}" atualizado com sucesso!`);
      onSuccess?.(data);
      router.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar projeto: ${error.message}`);
    },
  });

  const isSubmitting =
    createProjectMutation.isPending || updateProjectMutation.isPending;

  const handleSubmit = (data: ProjectFormData) => {
    if (isEditing && project) {
      updateProjectMutation.mutate({ projectId: project.id, data });
    } else {
      createProjectMutation.mutate(data);
    }
  };

  const submitButtonText = isEditing ? "Salvar Alterações" : "Criar Projeto";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ProjectNameField control={form.control} />
        <ProjectDescriptionField control={form.control} />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || (isEditing && !form.formState.isDirty)}
          >
            {isSubmitting ? "Salvando..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}

