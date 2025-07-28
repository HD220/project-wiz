import { zodResolver } from "@hookform/resolvers/zod";
import {
  FolderIcon,
  GitBranch,
  FileText,
  Github,
  Loader2,
  Info,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { cn } from "@/renderer/lib/utils";

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

  // Enhanced form field helper component with modern design
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
    const isSelected = form.watch("type") === value;

    return (
      <div
        className={cn(
          "flex items-start space-x-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group",
          "hover:shadow-md hover:scale-[1.01]",
          isSelected
            ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
            : "border-border hover:border-border/80 hover:bg-muted/30",
        )}
      >
        <RadioGroupItem value={value} id={value} className="mt-1" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={cn(
                "p-2 rounded-lg transition-colors",
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-muted/80",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <Label
              htmlFor={value}
              className="font-semibold cursor-pointer text-base"
            >
              {title}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
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
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-base font-semibold">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Project Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., My Awesome Project"
                    disabled={isFormDisabled}
                    aria-describedby="name-description"
                    className="h-11 text-base bg-background/50 border-border/80 focus:bg-background"
                    {...field}
                  />
                </FormControl>
                <FormDescription
                  id="name-description"
                  className="flex items-start gap-2"
                >
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>
                    Choose a descriptive name for your project (maximum 100
                    characters)
                  </span>
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
                <FormLabel className="text-base font-semibold">
                  Description (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the purpose and scope of your project..."
                    disabled={isFormDisabled}
                    rows={4}
                    className="resize-none text-base bg-background/50 border-border/80 focus:bg-background"
                    aria-describedby="description-hint"
                    {...field}
                  />
                </FormControl>
                <FormDescription
                  id="description-hint"
                  className="flex items-start gap-2"
                >
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>
                    A brief description helps identify the project (maximum 500
                    characters)
                  </span>
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
                <FormLabel className="text-base font-semibold">
                  Project Type
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    className="space-y-4"
                    aria-describedby="type-description"
                  >
                    <ProjectTypeOption
                      value="blank"
                      icon={FolderIcon}
                      title="Blank Project"
                      description="Start from scratch with a basic structure"
                    />
                    <ProjectTypeOption
                      value="github"
                      icon={Github}
                      title="GitHub Project"
                      description="Clone an existing repository from GitHub"
                    />
                  </RadioGroup>
                </FormControl>
                <FormDescription
                  id="type-description"
                  className="flex items-start gap-2"
                >
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>Choose how you want to start your project</span>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {projectType === "github" && (
            <div className="space-y-6 p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
              <div className="flex items-center gap-3 pb-2 border-b border-primary/20">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Github className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-foreground">
                    Repository Configuration
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Connect your project to a Git repository
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="gitUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Repository URL
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="url"
                          placeholder="https://github.com/username/repository.git"
                          disabled={isFormDisabled}
                          aria-describedby="git-url-hint"
                          className="pl-10 bg-background/50 border-border/80 focus:bg-background"
                          {...field}
                        />
                        <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription
                      id="git-url-hint"
                      className="flex items-start gap-2"
                    >
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span>
                        Complete URL of the Git repository (GitHub, GitLab,
                        etc.)
                      </span>
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
                    <FormLabel className="flex items-center gap-2 text-sm font-medium">
                      <GitBranch className="h-4 w-4" aria-hidden="true" />
                      Branch
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="main"
                          disabled={isFormDisabled}
                          list="common-branches"
                          aria-describedby="branch-hint"
                          className="pl-10 bg-background/50 border-border/80 focus:bg-background"
                          {...field}
                        />
                        <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <datalist id="common-branches">
                      <option value="main" />
                      <option value="master" />
                      <option value="develop" />
                      <option value="dev" />
                    </datalist>
                    <FormDescription
                      id="branch-hint"
                      className="flex items-start gap-2"
                    >
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span>Branch to be cloned (default: main)</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-border/50">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isFormDisabled}
              className="sm:w-auto w-full h-11 font-medium"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isFormDisabled}
            className="sm:w-auto w-full h-11 font-medium shadow-md hover:shadow-lg transition-shadow"
            aria-describedby={isLoading ? "loading-status" : undefined}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderIcon className="mr-2 h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
