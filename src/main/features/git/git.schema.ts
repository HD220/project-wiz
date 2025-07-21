import { z } from "zod";

// Git initialization options
export const GitInitOptionsSchema = z.object({
  localPath: z.string().min(1, "Local path is required"),
  initialBranch: z.string().optional()
});

// Git clone options
export const GitCloneOptionsSchema = z.object({
  gitUrl: z.string().url("Invalid Git URL"),
  localPath: z.string().min(1, "Local path is required"),
  branch: z.string().optional(),
  depth: z.number().positive().optional()
});

// Git commit options
export const GitCommitOptionsSchema = z.object({
  message: z.string().min(1, "Commit message is required"),
  all: z.boolean().optional().default(false)
});

// Git branch operations
export const GitBranchSchema = z.object({
  branchName: z.string().min(1, "Branch name is required"),
  fromBranch: z.string().optional()
});

// Git merge options
export const GitMergeSchema = z.object({
  sourceBranch: z.string().min(1, "Source branch is required"),
  targetBranch: z.string().min(1, "Target branch is required"),
  strategy: z.enum(["merge", "rebase", "squash"]).optional().default("merge")
});

// Git remote operations
export const GitRemoteSchema = z.object({
  name: z.string().min(1, "Remote name is required"),
  url: z.string().url("Invalid remote URL")
});

// Git status response
export const GitStatusSchema = z.object({
  isRepo: z.boolean(),
  branch: z.string().optional(),
  ahead: z.number().optional(),
  behind: z.number().optional(),
  staged: z.array(z.string()),
  unstaged: z.array(z.string()),
  untracked: z.array(z.string())
});

// Git log entry
export const GitLogEntrySchema = z.object({
  hash: z.string(),
  message: z.string(),
  author: z.string(),
  date: z.string(),
  refs: z.string().optional()
});

// Export types
export type GitInitOptions = z.infer<typeof GitInitOptionsSchema>;
export type GitCloneOptions = z.infer<typeof GitCloneOptionsSchema>;
export type GitCommitOptions = z.infer<typeof GitCommitOptionsSchema>;
export type GitBranchOptions = z.infer<typeof GitBranchSchema>;
export type GitMergeOptions = z.infer<typeof GitMergeSchema>;
export type GitRemoteOptions = z.infer<typeof GitRemoteSchema>;
export type GitStatus = z.infer<typeof GitStatusSchema>;
export type GitLogEntry = z.infer<typeof GitLogEntrySchema>;