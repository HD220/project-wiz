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

interface ProjectFormAvatarFieldProps {
  form: UseFormReturn<CreateProjectFormData>;
}

export function ProjectFormAvatarField({ form }: ProjectFormAvatarFieldProps) {
  return (
    <FormField
      control={form.control}
      name="avatar"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Avatar</FormLabel>
          <FormControl>
            <Input placeholder="URL do avatar (opcional)" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
