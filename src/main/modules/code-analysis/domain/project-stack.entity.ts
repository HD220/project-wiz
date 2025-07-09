import { z } from "zod";

export const ProjectStackSchema = z.object({
  languages: z.record(z.number()),
  frameworks: z.array(z.string()),
  libraries: z.array(z.string()),
});

export type ProjectStack = z.infer<typeof ProjectStackSchema>;
