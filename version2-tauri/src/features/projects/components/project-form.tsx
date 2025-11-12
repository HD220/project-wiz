import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProjectsStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import type { Project } from '@/lib/types';

const projectFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().optional(),
  local_path: z.string().min(1, 'Local path is required'),
  git_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  git_branch: z.string().optional().or(z.literal('')),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

type ProjectFormProps = {
  project?: Project;
  onSuccess?: (project: Project) => void;
  onCancel?: () => void;
};

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const { token } = useAuthStore();
  const { createProject, updateProject, isLoading } = useProjectsStore();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? {
          name: project.name,
          description: project.description ?? '',
          local_path: project.local_path,
          git_url: project.git_url ?? '',
          git_branch: project.git_branch ?? '',
        }
      : {
          name: '',
          description: '',
          local_path: '',
          git_url: '',
          git_branch: '',
        },
  });

  const handleSubmit = async (data: ProjectFormData) => {
    if (!token) return;

    try {
      // Convert empty strings to undefined
      const description = data.description === '' ? undefined : data.description;
      const gitUrl = data.git_url === '' ? undefined : data.git_url;
      const gitBranch = data.git_branch === '' ? undefined : data.git_branch;

      const result = project
        ? await updateProject(
            {
              id: project.id,
              name: data.name,
              description,
              local_path: data.local_path,
              git_url: gitUrl,
              git_branch: gitBranch,
            },
            token
          )
        : await createProject(
            {
              name: data.name,
              description,
              local_path: data.local_path,
              git_url: gitUrl,
              git_branch: gitBranch,
            },
            token
          );

      form.reset();
      onSuccess?.(result);
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Project" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="local_path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local Path</FormLabel>
              <FormControl>
                <Input
                  placeholder="C:/projects/my-project"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Local filesystem path to your project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="git_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Git Repository URL (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://github.com/user/repo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="git_branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Git Branch (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="main"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : project
              ? 'Update Project'
              : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
