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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/ui/components/ui/select';

import type { PersonaTemplate } from '@/shared/ipc-types';

import type { AgentInstanceFormData } from '../AgentInstanceForm';

interface AgentFormFieldProps {
  control: Control<AgentInstanceFormData>;
}

interface AgentPersonaTemplateSelectFieldProps extends AgentFormFieldProps {
  personaTemplates: Pick<PersonaTemplate, 'id' | 'name'>[];
}

export function AgentPersonaTemplateSelectField({ control, personaTemplates }: AgentPersonaTemplateSelectFieldProps) {
  return (
    <FormField
      control={control}
      name="personaTemplateId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Template de Persona</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template de persona" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {personaTemplates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>Define o comportamento, papel e objetivos base do agente.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
