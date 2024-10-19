import { z } from "zod";

export const installationSchema = z.object({
  id: z.number(),
  repository_id: z.number(),
  name: z.string(),
  owner: z.string(),
  full_name: z.string(),
});

export type Installation = z.infer<typeof installationSchema>;
