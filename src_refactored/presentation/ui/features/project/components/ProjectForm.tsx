import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
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

// Esquema de validação com Zod
const projectFormSchema = z.object({
  name: z.string()
    .min(3, 'O nome do projeto deve ter pelo menos 3 caracteres.')
    .max(100, 'O nome do projeto não pode exceder 100 caracteres.'),
  description: z.string()
    .max(500, 'A descrição não pode exceder 500 caracteres.')
    .optional(),
  // Adicionar mais campos conforme necessário (ex: template, repositório Git inicial)
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void> | void;
  initialValues?: Partial<ProjectFormData>;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export function ProjectForm({
  onSubmit,
  initialValues,
  isSubmitting = false,
  submitButtonText
}: ProjectFormProps) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialValues?.name || '',
      description: initialValues?.description || '',
    },
  });

  const effectiveSubmitButtonText = submitButtonText || (initialValues ? 'Salvar Alterações' : 'Criar Projeto');

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
          <Button type="submit" disabled={isSubmitting || !form.formState.isDirty && !initialValues}>
            {isSubmitting ? 'Salvando...' : effectiveSubmitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
