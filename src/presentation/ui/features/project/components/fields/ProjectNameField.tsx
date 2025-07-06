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

import type { ProjectFormData } from "../ProjectForm";

interface FormFieldProps {
  control: Control<ProjectFormData>;
}

export function ProjectNameField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome do Projeto</FormLabel>
          <FormControl>
            <Input placeholder="Ex: Minha Nova Aplicação Web" {...field} />
          </FormControl>
          <FormDescription>
            O nome principal do seu projeto. Seja claro e conciso.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
