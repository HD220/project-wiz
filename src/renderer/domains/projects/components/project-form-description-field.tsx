import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CreateProjectFormData } from "../schemas/create-project.schema";

interface ProjectFormDescriptionFieldProps {
  form: UseFormReturn<CreateProjectFormData>;
}

export function ProjectFormDescriptionField({ 
  form 
}: ProjectFormDescriptionFieldProps) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrição</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Descreva o projeto (opcional)"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}