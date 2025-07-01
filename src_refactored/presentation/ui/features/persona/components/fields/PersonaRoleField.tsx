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

import type { PersonaTemplateFormData } from '../PersonaTemplateForm';

interface FormFieldProps {
  control: Control<PersonaTemplateFormData>;
}

export function PersonaRoleField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Papel (Role)</FormLabel>
          <FormControl>
            <Textarea placeholder="Descreva o papel principal desta persona. Ex: 'Um engenheiro de software especializado em...' " {...field} className="min-h-[80px]" />
          </FormControl>
          <FormDescription>Qual é a função ou especialidade principal desta persona?</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
