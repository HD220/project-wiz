import { z } from "zod";

export const linkRepositorySchema = z.object({
  provider: z.enum(["github"]),
  git_url: z.string().min(20),
});

export type LinkRepositoryInput = z.infer<typeof linkRepositorySchema>;
