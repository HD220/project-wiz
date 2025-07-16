import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CreateProjectFormData } from "../schemas/create-project.schema";

interface ProjectFormGitFieldProps {
  form: UseFormReturn<CreateProjectFormData>;
}

export function ProjectFormGitField({ form }: ProjectFormGitFieldProps) {
  return (
    <FormField
      control={form.control}
      name="gitUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>URL do Git</FormLabel>
          <FormControl>
            <Input
              placeholder="https://github.com/usuario/projeto"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}