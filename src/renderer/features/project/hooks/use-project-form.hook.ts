import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/renderer/contexts/auth.context";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

import { ProjectSchema } from "@/shared/types";

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

export type ProjectFormData = z.infer<typeof ProjectFormSchema>;

// Schema for creating projects - omit auto-generated and system-managed fields
const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  ownerId: true,
  deactivatedAt: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
});

type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

interface UseProjectFormProps {
  onSuccess?: (projectId: string) => void;
  initialData?: Partial<ProjectFormData>;
}

export function useProjectForm({
  onSuccess,
  initialData,
}: UseProjectFormProps) {
  const { user } = useAuth();

  const createProjectMutation = useApiMutation(
    (data: CreateProjectInput) => window.api.project.create(data),
    {
      successMessage: "Project created successfully",
      errorMessage: "Failed to create project",
      invalidateRouter: false,
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

  function onSubmit(data: ProjectFormData) {
    if (!user?.id) {
      return;
    }

    const sanitizedName = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s\-_]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const localPath = `/projects/${sanitizedName}`;

    const projectData: CreateProjectInput = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      avatarUrl: null,
      localPath,
      gitUrl: data.type === "github" ? data.gitUrl?.trim() || null : null,
      branch: data.type === "github" ? data.branch?.trim() || "main" : null,
    };

    createProjectMutation.mutate(projectData);
  }

  return {
    form,
    onSubmit,
    projectType,
    isLoading,
  };
}
