import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useProjects } from "../hooks/use-projects.hook";
import { CreateProjectDto } from "../../../../shared/types/project.types";

const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Nome do projeto é obrigatório")
    .max(100, "Nome muito longo"),
  description: z.string().optional(),
  gitUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  avatar: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectFormProps {
  onSuccess?: () => void;
}

export function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const { createProject, isLoading } = useProjects();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      gitUrl: "",
      avatar: "",
    },
  });

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      const createData: CreateProjectDto = {
        name: data.name,
        description: data.description || undefined,
        gitUrl: data.gitUrl || undefined,
        avatar: data.avatar || undefined,
      };

      await createProject(createData);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Criando..." : "Criar Projeto"}
        </Button>
      </form>
    </Form>
  );
}
