import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CreateProjectDto } from "../../../../shared/types/projects/project.types";
import {
  CreateProjectFormData,
  createProjectSchema,
} from "../schemas/create-project.schema";

import { useProjects } from "./use-projects.hook";

export function useCreateProjectForm(onSuccess?: () => void) {
  const { createProject, isLoading } = useProjects();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      gitUrl: "",
      avatar: "",
    },
  });

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      const createData: CreateProjectDto = {
        name: data.name,
        description: data.description || undefined,
        gitUrl: data.gitUrl || undefined,
        avatar: data.avatar || undefined,
      };

      await createProject(createData);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
    }
  };

  return {
    form,
    onSubmit,
    isLoading,
  };
}
