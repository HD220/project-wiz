import { z } from "zod";

export const repositoryConfigSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.string(),
  api_token: z.string().min(1, {
    message: "O token da API é obrigatório.",
  }),
  is_batch_api: z.boolean(),
});

export type RepositoryConfig = z.infer<typeof repositoryConfigSchema>;
