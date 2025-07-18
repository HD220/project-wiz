import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { CreateProjectFormData } from "../schemas/create-project.schema";

interface ProjectFormNameFieldProps {
  form: UseFormReturn<CreateProjectFormData>;
}

export function ProjectFormNameField({ form }: ProjectFormNameFieldProps) {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome do Projeto</FormLabel>
          <FormControl>
            <Input placeholder="Digite o nome do projeto" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
