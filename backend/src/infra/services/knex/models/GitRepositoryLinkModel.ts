import { z } from "zod";

export const gitRepositoryLinkModelSchema = z.object({
  id: z.string().uuid(),
  name: z.coerce.string(),
  description: z.coerce.string().optional(),
  provider: z.enum(["github"]),
  owner: z.coerce.string(),
  is_private: z.coerce.boolean(),
  url: z.coerce.string(),
  ssh_url: z.coerce.string(),
  clone_url: z.coerce.string(),
  default_branch: z.coerce.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type GitRepositoryLinkModel = z.infer<
  typeof gitRepositoryLinkModelSchema
>;
