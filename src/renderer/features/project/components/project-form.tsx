import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { InsertProject } from "@/main/features/project/project.types";

import { Button } from "@/renderer/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/renderer/components/ui/radio-group";
import { Textarea } from "@/renderer/components/ui/textarea";
import { useAuth } from "@/renderer/contexts/auth.context";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

const ProjectFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["blank", "github"]),
  gitUrl: z.string().optional(),
  branch: z.string().optional(),
});

type ProjectFormData = z.infer<typeof ProjectFormSchema>;

interface ProjectFormProps {
  onSuccess?: (projectId: string) => void;
  onCancel?: () => void;
}

function ProjectForm(props: ProjectFormProps) {
  const { onSuccess, onCancel } = props;
  const router = useRouter();
  const { user } = useAuth();

  // Standardized mutation with automatic error handling
  const createProjectMutation = useApiMutation(
    (data: InsertProject) => window.api.projects.create(data),
    {
      successMessage: "Project created successfully",
      errorMessage: "Failed to create project",
      invalidateRouter: false, // Disable automatic invalidation to prevent double invalidation
      onSuccess: (project) => {
        onSuccess?.(project.id);
      },
    },
  );

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "blank",
      gitUrl: "",
      branch: "main",
    },
  });

  const projectType = form.watch("type");

  function onSubmit(data: ProjectFormData) {
    // Generate local path based on project name
    const localPath = `/projects/${data.name.toLowerCase().replace(/\s+/g, "-")}`;

    const projectData = {
      name: data.name,
      description: data.description || "",
      localPath,
      ownerId: user?.id || "",
      ...(data.type === "github" && {
        gitUrl: data.gitUrl,
        branch: data.branch || "main",
      }),
    };

    createProjectMutation.mutate(projectData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Projeto</FormLabel>
              <FormControl>
                <Input placeholder="Meu Projeto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva seu projeto..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Projeto</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="blank" id="blank" />
                    <Label htmlFor="blank">Projeto em Branco</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="github" id="github" />
                    <Label htmlFor="github">Projeto do GitHub</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {projectType === "github" && (
          <>
            <FormField
              control={form.control}
              name="gitUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do GitHub</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/user/repo.git"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <FormControl>
                    <Input placeholder="main" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createProjectMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={createProjectMutation.isPending}>
            {createProjectMutation.isPending ? "Criando..." : "Criar Projeto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { ProjectForm };
