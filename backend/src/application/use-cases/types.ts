import { z } from "zod";

export const baseAPIInputSchema = z.object({
  page: z.coerce.number(),
  pageSize: z.coerce.number().optional(),
  query: z.coerce.string().optional(),
});

export type BaseAPIInput = z.infer<typeof baseAPIInputSchema>;
