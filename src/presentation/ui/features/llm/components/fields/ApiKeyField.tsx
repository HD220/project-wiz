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

interface ApiKeyFieldProps extends LLMFormFieldProps {
  watchedProvider?: "openai" | "deepseek" | "ollama";
}

export function ApiKeyField({ control, watchedProvider }: ApiKeyFieldProps) {
  if (watchedProvider === "ollama") {
    return null;
  }
  return (
    <FormField
      control={control}
      name="apiKey"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Chave de API (API Key)</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Sua chave de API para o provedor selecionado.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
