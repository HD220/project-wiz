import { z } from "zod";
import {
  RepositoryInfo,
  StatusInfo,
  CommitInfo,
  BranchInfo
} from "../shared/types/git";
import {
  RepositoryParamsSchema,
  RepositoryIdSchema,
  CommitParamsSchema,
  PullPushParamsSchema,
  BranchParamsSchema
} from "../shared/types/ipc-git";

export interface IGitService {
  addRepository(localPath: string, remoteUrl: string, credentialsId?: string): Promise<RepositoryInfo>;
  listRepositories(): Promise<RepositoryInfo[]>;
  getStatus(repositoryId: string): Promise<StatusInfo>;
  commitChanges(repositoryId: string, message: string): Promise<void>;
  pushChanges(repositoryId: string, branchName: string, credentialsId?: string): Promise<void>;
  pullChanges(repositoryId: string, branchName: string, credentialsId?: string): Promise<void>;
  createBranch(repositoryId: string, branchName: string): Promise<void>;
  switchBranch(repositoryId: string, branchName: string): Promise<void>;
  deleteBranch(repositoryId: string, branchName: string): Promise<void>;
  listBranches(repositoryId: string): Promise<BranchInfo[]>;
  getHistory(repositoryId: string, branchName?: string): Promise<CommitInfo[]>;
  syncWithRemote(repositoryId: string, credentialsId?: string): Promise<void>;
}