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

import type { AgentInstanceFormData } from "../AgentInstanceForm";

interface AgentFormFieldProps {
  control: Control<AgentInstanceFormData>;
}

type AgentNameFieldProps = AgentFormFieldProps;

export function AgentNameField({ control }: AgentNameFieldProps) {
  return (
    <FormField
      control={control}
      name="agentName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome da Instância do Agente (Opcional)</FormLabel>
          <FormControl>
            <Input
              placeholder="Ex: MeuCoderQA, AgenteDeRefatoracao"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Um nome customizado para esta instância específica. Se vazio, um
            nome será gerado.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
