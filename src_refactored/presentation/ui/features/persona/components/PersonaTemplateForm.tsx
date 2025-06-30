import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/presentation/ui/components/ui/button';
import { Form } from '@/presentation/ui/components/ui/form';
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type { CreatePersonaTemplateRequest, CreatePersonaTemplateResponse, PersonaTemplate, UpdatePersonaTemplateRequest, UpdatePersonaTemplateResponse } from '@/shared/ipc-types';

import { PersonaBackstoryField } from './fields/PersonaBackstoryField';
import { PersonaGoalField } from './fields/PersonaGoalField';
import { PersonaNameField } from './fields/PersonaNameField';
import { PersonaRoleField } from './fields/PersonaRoleField';
import { PersonaToolsField } from './fields/PersonaToolsField';

const personaTemplateFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres.').max(100, 'Nome muito longo.'),
  role: z.string().min(10, 'Papel deve ter ao menos 10 caracteres.').max(500, 'Papel muito longo.'),
  goal: z.string().min(10, 'Objetivo deve ter ao menos 10 caracteres.').max(1000, 'Objetivo muito longo.'),
  backstory: z.string().max(2000, 'Backstory muito longo.').optional().transform(val => val === '' ? undefined : val),
  toolNames: z.array(z.string()).optional().default([]),
});

export type PersonaTemplateFormData = z.infer<typeof personaTemplateFormSchema>;

interface PersonaTemplateFormProps {
  template?: PersonaTemplate;
  onSuccess?: (data: PersonaTemplate) => void;
}

export function PersonaTemplateForm({ template, onSuccess }: PersonaTemplateFormProps) {
  const router = useRouter();
  const isEditing = !!template;

  const form = useForm<PersonaTemplateFormData>({
    resolver: zodResolver(personaTemplateFormSchema),
    defaultValues: {
      name: template?.name || '',
      role: template?.role || '',
      goal: template?.goal || '',
      backstory: template?.backstory || '',
      toolNames: template?.toolNames || [],
    },
  });

  const createTemplateMutation = useIpcMutation<CreatePersonaTemplateRequest, CreatePersonaTemplateResponse>(
    IPC_CHANNELS.CREATE_PERSONA_TEMPLATE,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(`Template "${response.data.name}" criado com sucesso!`);
          onSuccess?.(response.data);
          router.navigate({ to: '/personas/$templateId', params: { templateId: response.data.id } });
        } else {
          toast.error(response.error || 'Falha ao criar o template.');
        }
      },
      onError: (error) => {
        toast.error(`Erro ao criar template: ${error.message}`);
      },
    }
  );

  const updateTemplateMutation = useIpcMutation<UpdatePersonaTemplateRequest, UpdatePersonaTemplateResponse>(
    IPC_CHANNELS.UPDATE_PERSONA_TEMPLATE,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          toast.success(`Template "${response.data.name}" atualizado com sucesso!`);
          onSuccess?.(response.data);
          router.invalidate();
        } else {
          toast.error(response.error || 'Falha ao atualizar o template.');
        }
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar template: ${error.message}`);
      },
    }
  );

  const isSubmitting = createTemplateMutation.isLoading || updateTemplateMutation.isLoading;

  const handleSubmit = (data: PersonaTemplateFormData) => {
    if (isEditing && template) {
      updateTemplateMutation.mutate({ id: template.id, ...data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const [currentToolInput, setCurrentToolInput] = React.useState('');

  const handleAddTool = () => {
    const toolValue = currentToolInput.trim().toLowerCase();
    if (toolValue && !form.getValues('toolNames')?.includes(toolValue)) {
      const currentTools = form.getValues('toolNames') || [];
      form.setValue('toolNames', [...currentTools, toolValue], { shouldValidate: true, shouldDirty: true });
      setCurrentToolInput('');
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    const currentTools = form.getValues('toolNames') || [];
    form.setValue('toolNames', currentTools.filter(tool => tool !== toolToRemove), { shouldValidate: true, shouldDirty: true });
  };

  const effectiveSubmitButtonText = isEditing ? 'Atualizar Template' : 'Salvar Template';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <PersonaNameField control={form.control} />
        <PersonaRoleField control={form.control} />
        <PersonaGoalField control={form.control} />
        <PersonaBackstoryField control={form.control} />
        <PersonaToolsField
          control={form.control}
          currentToolInput={currentToolInput}
          setCurrentToolInput={setCurrentToolInput}
          handleAddTool={handleAddTool}
          handleRemoveTool={handleRemoveTool}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting || (isEditing && !form.formState.isDirty)}>
            {isSubmitting ? 'Salvando Template...' : effectiveSubmitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
