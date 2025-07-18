import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Nome do projeto é obrigatório")
    .max(100, "Nome muito longo"),
  description: z.string().optional(),
  gitUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  avatar: z.string().optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
