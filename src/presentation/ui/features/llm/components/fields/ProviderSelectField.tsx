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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { LLMConfigFormData } from "../LLMConfigForm";

const supportedProviders = [
  { id: "openai", name: "OpenAI (GPT-3.5, GPT-4, etc.)" },
  { id: "deepseek", name: "DeepSeek Coder" },
  { id: "ollama", name: "Ollama (Local LLMs)" },
];

interface LLMFormFieldProps {
  control: Control<LLMConfigFormData>;
}

type ProviderSelectFieldProps = LLMFormFieldProps;

export function ProviderSelectField({ control }: ProviderSelectFieldProps) {
  return (
    <FormField
      control={control}
      name="providerId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Provedor LLM</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um provedor" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {supportedProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Escolha o serviço de LLM que você deseja configurar.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
