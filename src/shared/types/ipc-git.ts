import { z } from "zod";
import {
  RepositoryInfo,
  StatusInfo,
  CommitParams,
  PullPushParams,
  BranchParams,
  BranchInfo,
  CommitInfo,
} from "./git";

// Tipos específicos para operações IPC
export type IpcGitChannel =
  | "git:addRepository"
  | "git:listRepositories"
  | "git:getStatus"
  | "git:commitChanges"
  | "git:pushChanges"
  | "git:pullChanges"
  | "git:createBranch"
  | "git:switchBranch"
  | "git:deleteBranch"
  | "git:listBranches"
  | "git:getHistory"
  | "git:syncWithRemote";

// Esquemas de validação
export const RepositoryParamsSchema = z.object({
  localPath: z.string().min(1, "Local path is required"),
  remoteUrl: z.string().url("Invalid remote URL"),
  credentialsId: z.string().optional(),
});

export const RepositoryIdSchema = z.string().min(1, "Repository ID is required");

export const CommitParamsSchema = z.object({
  repositoryId: z.string().min(1),
  message: z.string().min(1, "Commit message is required"),
  files: z.array(z.string()).min(1, "At least one file must be specified"),
});

export const PullPushParamsSchema = z.object({
  repositoryId: z.string().min(1),
  branchName: z.string().min(1),
  credentialsId: z.string().optional(),
});

export const BranchParamsSchema = z.object({
  repositoryId: z.string().min(1),
  branchName: z.string().min(1),
});

// Tipos para respostas IPC
export interface IpcGitResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}