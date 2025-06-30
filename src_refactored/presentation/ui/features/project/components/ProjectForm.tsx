import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/presentation/ui/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/ui/components/ui/form';
import { Input } from '@/presentation/ui/components/ui/input';
import { Textarea } from '@/presentation/ui/components/ui/textarea';
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type { CreateProjectRequest, CreateProjectResponse, Project, UpdateProjectRequest, UpdateProjectResponse } from '@/shared/ipc-types';

// Esquema de validação com Zod
const projectFormSchema = z.object({
  name: z.string()
    .min(3, 'O nome do projeto deve ter pelo menos 3 caracteres.')
    .max(100, 'O nome do projeto não pode exceder 100 caracteres.'),
  description: z.string()
    .max(500, 'A descrição não pode exceder 500 caracteres.')
    .optional()
    .transform(val => val === '' ? undefined : val), // Ensure empty string becomes undefined
  // Adicionar mais campos conforme necessário (ex: template, repositório Git inicial)
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  project?: Project; // Pass existing project for editing
  onSuccess?: (data: Project) => void; // Optional: callback on successful submission
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!project;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
    },
  });

  const createProjectMutation = useIpcMutation<CreateProjectRequest, CreateProjectResponse>(
    IPC_CHANNELS.CREATE_PROJECT,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(`Projeto "${response.data.name}" criado com sucesso!`);
          onSuccess?.(response.data);
          router.navigate({ to: '/projects/$projectId', params: { projectId: response.data.id } });
        } else {
          toast.error(response.error || 'Falha ao criar o projeto.');
        }
      },
      onError: (error) => {
        toast.error(`Erro ao criar projeto: ${error.message}`);
      },
    }
  );

  const updateProjectMutation = useIpcMutation<UpdateProjectRequest, UpdateProjectResponse>(
    IPC_CHANNELS.UPDATE_PROJECT,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(`Projeto "${response.data.name}" atualizado com sucesso!`);
          onSuccess?.(response.data);
          // Optionally, refresh data or navigate
          router.invalidate(); // Invalidate current route data to refetch if on detail page
        } else {
          toast.error(response.error || 'Falha ao atualizar o projeto.');
        }
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar projeto: ${error.message}`);
      },
    }
  );

  const isSubmitting = createProjectMutation.isLoading || updateProjectMutation.isLoading;

  const handleSubmit = (data: ProjectFormData) => {
    if (isEditing && project) {
      updateProjectMutation.mutate({ id: project.id, ...data });
    } else {
      createProjectMutation.mutate(data);
    }
  };

  const effectiveSubmitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Projeto';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Projeto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Minha Nova Aplicação Web" {...field} />
              </FormControl>
              <FormDescription>
                O nome principal do seu projeto. Seja claro e conciso.
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
              <FormLabel>Descrição do Projeto (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva brevemente o objetivo e o escopo deste projeto..."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Um resumo do que se trata o projeto.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Futuros campos podem ser adicionados aqui, como:
            - Seleção de template de projeto
            - URL de repositório Git existente
            - Configurações de visibilidade
        */}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting || (isEditing && !form.formState.isDirty) }>
            {isSubmitting ? 'Salvando...' : effectiveSubmitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
