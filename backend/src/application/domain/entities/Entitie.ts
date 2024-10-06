import { z } from "zod";

export const entitieSchema = z.object({
  id: z.union([z.coerce.string().uuid(), z.number()]),
});

export type Entitie = z.infer<typeof entitieSchema>;
