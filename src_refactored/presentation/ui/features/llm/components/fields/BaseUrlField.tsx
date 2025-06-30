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

import type { LLMConfigFormData } from '../LLMConfigForm';

interface LLMFormFieldProps {
  control: Control<LLMConfigFormData>;
}

type BaseUrlFieldProps = LLMFormFieldProps;

export function BaseUrlField({ control }: BaseUrlFieldProps) {
  return (
    <FormField
      control={control}
      name="baseUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>URL Base (Opcional)</FormLabel>
          <FormControl>
            <Input placeholder="Ex: https://api.example.com/v1 (para proxies ou Ollama)" {...field} />
          </FormControl>
          <FormDescription>
            Se você estiver usando um proxy, um endpoint auto-hospedado (como Ollama: http://localhost:11434),
            ou um provedor compatível com API OpenAI, insira a URL base aqui.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
