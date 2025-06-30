import React from 'react';
import { Control } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/presentation/ui/components/ui/form';
import { Textarea } from '@/presentation/ui/components/ui/textarea';

import type { ProjectFormData } from '../ProjectForm';

interface FormFieldProps {
  control: Control<ProjectFormData>;
}

export function ProjectDescriptionField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
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
  );
}
