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

export function PersonaGoalField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="goal"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Objetivo Principal (Goal)</FormLabel>
          <FormControl>
            <Textarea placeholder="Defina o objetivo primário que esta persona deve alcançar. Ex: 'Desenvolver e manter APIs robustas e escaláveis.' " {...field} className="min-h-[100px]" />
          </FormControl>
          <FormDescription>Qual é a meta ou resultado principal esperado das ações desta persona?</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
