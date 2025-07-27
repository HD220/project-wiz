import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FolderIcon, GitBranch, FileText, Github, Loader2 } from "lucide-react";

import type { InsertProject } from "@/main/features/project/project.types";

import { Button } from "@/renderer/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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

const ProjectFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(100, "Nome deve ter no máximo 100 caracteres")
      .refine(
        (name) => /^[a-zA-Z0-9\s\-_]+$/.test(name),
        "Nome deve conter apenas letras, números, espaços, hífens e underscores",
      ),
    description: z
      .string()
      .max(500, "Descrição deve ter no máximo 500 caracteres")
      .optional(),
    type: z.enum(["blank", "github"], {
      required_error: "Tipo de projeto é obrigatório",
    }),
    gitUrl: z
      .string()
      .url("URL deve ser válida")
      .refine(
        (url) =>
          url.includes("github.com") ||
          url.includes("gitlab.com") ||
          url.includes(".git"),
        "URL deve ser de um repositório Git válido",
      )
      .optional()
      .or(z.literal("")),
    branch: z
      .string()
      .min(1, "Branch é obrigatória quando usando Git")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.type === "github") {
        return data.gitUrl && data.gitUrl.length > 0;
      }
      return true;
    },
    {
      message: "URL do repositório é obrigatória para projetos do GitHub",
      path: ["gitUrl"],
    },
  );

type ProjectFormData = z.infer<typeof ProjectFormSchema>;

interface ProjectFormProps {
  onSuccess?: (projectId: string) => void;
  onCancel?: () => void;
  initialData?: Partial<ProjectFormData>;
  submitLabel?: string;
  disabled?: boolean;
}

export function ProjectForm(props: ProjectFormProps) {
  const {
    onSuccess,
    onCancel,
    initialData,
    submitLabel = "Criar Projeto",
    disabled = false,
  } = props;
  const { user } = useAuth();

  // Standardized mutation with automatic error handling
  const createProjectMutation = useApiMutation(
    (data: InsertProject) => window.api.projects.create(data),
    {
      successMessage: "Projeto criado com sucesso",
      errorMessage: "Falha ao criar projeto",
      invalidateRouter: false, // Disable automatic invalidation to prevent double invalidation
      onSuccess: (project) => {
        onSuccess?.(project.id);
      },
    },
  );

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      type: initialData?.type || "blank",
      gitUrl: initialData?.gitUrl || "",
      branch: initialData?.branch || "main",
    },
  });

  const projectType = form.watch("type");
  const isLoading = createProjectMutation.isPending;
  const isFormDisabled = disabled || isLoading;

  // Form field helper component for better reusability
  function ProjectTypeOption({
    value,
    icon: Icon,
    title,
    description,
  }: {
    value: "blank" | "github";
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }) {
    return (
      <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
        <RadioGroupItem value={value} id={value} className="mt-1" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" aria-hidden="true" />
            <Label htmlFor={value} className="font-medium cursor-pointer">
              {title}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    );
  }

  function onSubmit(data: ProjectFormData) {
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    // Generate local path based on project name (sanitized)
    const sanitizedName = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s\-_]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const localPath = `/projects/${sanitizedName}`;

    const projectData: InsertProject = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      localPath,
      ownerId: user.id,
      status: "active" as const,
      ...(data.type === "github" && {
        gitUrl: data.gitUrl?.trim() || null,
        branch: data.branch?.trim() || "main",
      }),
    };

    createProjectMutation.mutate(projectData);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
        aria-label="Formulário de criação de projeto"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Nome do Projeto
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Meu Projeto Incrível"
                    disabled={isFormDisabled}
                    aria-describedby="name-description"
                    {...field}
                  />
                </FormControl>
                <FormDescription id="name-description">
                  Escolha um nome descritivo para seu projeto (máximo 100
                  caracteres)
                </FormDescription>
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
                  <Textarea
                    placeholder="Descreva o objetivo e escopo do seu projeto..."
                    disabled={isFormDisabled}
                    rows={3}
                    className="resize-none"
                    aria-describedby="description-hint"
                    {...field}
                  />
                </FormControl>
                <FormDescription id="description-hint">
                  Uma breve descrição ajuda a identificar o projeto (máximo 500
                  caracteres)
                </FormDescription>
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
                    value={field.value}
                    disabled={isFormDisabled}
                    className="space-y-3"
                    aria-describedby="type-description"
                  >
                    <ProjectTypeOption
                      value="blank"
                      icon={FolderIcon}
                      title="Projeto em Branco"
                      description="Comece do zero com uma estrutura básica"
                    />
                    <ProjectTypeOption
                      value="github"
                      icon={Github}
                      title="Projeto do GitHub"
                      description="Clone um repositório existente do GitHub"
                    />
                  </RadioGroup>
                </FormControl>
                <FormDescription id="type-description">
                  Escolha como você quer iniciar seu projeto
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {projectType === "github" && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20 bg-primary/5 p-4 rounded-r-lg">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Github className="h-4 w-4" aria-hidden="true" />
                Configurações do Repositório
              </h4>

              <FormField
                control={form.control}
                name="gitUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      URL do Repositório
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://github.com/usuario/repositorio.git"
                        disabled={isFormDisabled}
                        aria-describedby="git-url-hint"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription id="git-url-hint">
                      URL completa do repositório Git (GitHub, GitLab, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm">
                      <GitBranch className="h-4 w-4" aria-hidden="true" />
                      Branch
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="main"
                        disabled={isFormDisabled}
                        list="common-branches"
                        aria-describedby="branch-hint"
                        {...field}
                      />
                    </FormControl>
                    <datalist id="common-branches">
                      <option value="main" />
                      <option value="master" />
                      <option value="develop" />
                      <option value="dev" />
                    </datalist>
                    <FormDescription id="branch-hint">
                      Branch que será clonada (padrão: main)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isFormDisabled}
              className="sm:w-auto w-full"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isFormDisabled}
            className="sm:w-auto w-full"
            aria-describedby={isLoading ? "loading-status" : undefined}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
