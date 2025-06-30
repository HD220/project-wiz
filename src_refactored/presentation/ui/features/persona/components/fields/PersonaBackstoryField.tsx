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

export function PersonaBackstoryField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="backstory"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Backstory / Contexto (Opcional)</FormLabel>
          <FormControl>
            <Textarea placeholder="Forneça um breve histórico ou contexto para esta persona, se relevante. Ex: 'Trabalhou em X empresas, especialista em Y tecnologias...' " {...field} className="min-h-[100px]" />
          </FormControl>
          <FormDescription>Informações adicionais que ajudam a definir a personalidade e o conhecimento da persona.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
