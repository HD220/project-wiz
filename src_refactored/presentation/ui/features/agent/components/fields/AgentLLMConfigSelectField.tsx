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

import type { LLMConfig } from "@/shared/ipc-types";

// Path to AgentInstanceFormData is now fixed relative to this file's new location
import type { AgentInstanceFormData } from "../AgentInstanceForm";

interface AgentFormFieldProps {
  control: Control<AgentInstanceFormData>;
}

interface AgentLLMConfigSelectFieldProps extends AgentFormFieldProps {
  llmConfigs: Pick<LLMConfig, "id" | "name" | "providerName">[];
}

export function AgentLLMConfigSelectField({
  control,
  llmConfigs,
}: AgentLLMConfigSelectFieldProps) {
  return (
    <FormField
      control={control}
      name="llmProviderConfigId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Configuração do Provedor LLM</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma configuração LLM" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {llmConfigs.map((config) => (
                <SelectItem key={config.id} value={config.id}>
                  {config.name} ({config.providerName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Define qual modelo de linguagem e API Key o agente utilizará.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
