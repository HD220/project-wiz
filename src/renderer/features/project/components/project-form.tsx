import { zodResolver } from "@hookform/resolvers/zod";
import { FolderIcon, Github, Loader2 } from "lucide-react";
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
import { cn } from "@/renderer/lib/utils";

const ProjectFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Project name is required")
      .max(100, "Project name must be 100 characters or less")
      .refine(
        (name) => /^[a-zA-Z0-9\s\-_]+$/.test(name),
        "Project name can only contain letters, numbers, spaces, hyphens and underscores",
      ),
    description: z
      .string()
      .max(500, "Description must be 500 characters or less")
      .optional(),
    type: z.enum(["blank", "github"], {
      required_error: "Project type is required",
    }),
    gitUrl: z
      .string()
      .url("URL must be valid")
      .refine(
        (url) =>
          url.includes("github.com") ||
          url.includes("gitlab.com") ||
          url.includes(".git"),
        "URL must be a valid Git repository",
      )
      .optional()
      .or(z.literal("")),
    branch: z
      .string()
      .min(1, "Branch is required when using Git")
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
      message: "Repository URL is required for GitHub projects",
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
    submitLabel = "Create Project",
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

  // Compact Discord-style option component
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
          "flex items-center space-x-[var(--spacing-component-sm)] p-[var(--spacing-component-sm)] rounded-md border cursor-pointer transition-colors",
          isSelected
            ? "border-primary bg-primary/10"
            : "border-input hover:bg-accent",
        )}
      >
        <RadioGroupItem value={value} id={value} />
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <div className="flex-1">
          <Label htmlFor={value} className="font-medium cursor-pointer text-sm">
            {title}
          </Label>
          <p className="text-xs text-muted-foreground">{description}</p>
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
        className="space-y-[var(--spacing-component-md)]"
        noValidate
        aria-label="Create project form"
      >
        <div className="space-y-[var(--spacing-component-md)]">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Project Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="My Awesome Project"
                    disabled={isFormDisabled}
                    {...field}
                  />
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
                <FormLabel className="text-sm font-medium">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What's this project about?"
                    disabled={isFormDisabled}
                    rows={3}
                    className="resize-none"
                    {...field}
                  />
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
                <FormLabel className="text-sm font-medium">
                  Project Type
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isFormDisabled}
                    className="space-y-[var(--spacing-component-sm)]"
                  >
                    <ProjectTypeOption
                      value="blank"
                      icon={FolderIcon}
                      title="Start fresh"
                      description="Create a new empty project"
                    />
                    <ProjectTypeOption
                      value="github"
                      icon={Github}
                      title="Import from GitHub"
                      description="Clone an existing repository"
                    />
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {projectType === "github" && (
            <div className="space-y-[var(--spacing-component-md)] p-[var(--spacing-component-md)] bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-[var(--spacing-component-sm)]">
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Repository Details</span>
              </div>

              <FormField
                control={form.control}
                name="gitUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Repository URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://github.com/username/repository.git"
                        disabled={isFormDisabled}
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
                    <FormLabel className="text-sm font-medium">
                      Branch
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="main"
                        disabled={isFormDisabled}
                        list="common-branches"
                        {...field}
                      />
                    </FormControl>
                    <datalist id="common-branches">
                      <option value="main" />
                      <option value="master" />
                      <option value="develop" />
                      <option value="dev" />
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="flex gap-[var(--spacing-component-sm)] pt-[var(--spacing-component-md)]">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isFormDisabled}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isFormDisabled} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
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
