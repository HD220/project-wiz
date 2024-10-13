import { z } from "zod";

export const userConfigSchema = z.object({
  api_token: z.string().min(1, {
    message: "O token da API é obrigatório.",
  }),
  is_batch_api: z.boolean(),
  budget: z.coerce.number().refine((val) => Number(val) > 0, {
    message: "O orçamento deve ser um número positivo.",
  }),
});

export type UserConfig = z.infer<typeof userConfigSchema>;
