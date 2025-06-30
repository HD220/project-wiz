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
import { Input } from '@/presentation/ui/components/ui/input';

import type { PersonaTemplateFormData } from '../PersonaTemplateForm';

interface FormFieldProps {
  control: Control<PersonaTemplateFormData>;
}

export function PersonaNameField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome do Template</FormLabel>
          <FormControl>
            <Input placeholder="Ex: Desenvolvedor Python Sênior" {...field} />
          </FormControl>
          <FormDescription>Um nome único e descritivo para este template de persona.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
