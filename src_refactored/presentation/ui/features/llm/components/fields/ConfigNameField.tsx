import React from "react";
import { Control } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { LLMConfigFormData } from "../LLMConfigForm";

interface LLMFormFieldProps {
  control: Control<LLMConfigFormData>;
}

export function ConfigNameField({ control }: LLMFormFieldProps) {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome da Configuração</FormLabel>
          <FormControl>
            <Input
              placeholder="Ex: Meu OpenAI Pessoal, Ollama Local"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Um nome amigável para identificar esta configuração LLM.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
