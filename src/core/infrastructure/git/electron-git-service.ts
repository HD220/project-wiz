import {
  RepositoryInfo,
  StatusInfo,
  CommitParams,
  PullPushParams,
  BranchParams,
  BranchInfo,
  CommitInfo,
} from "../../../shared/types/git";
import { IGitService } from "../../application/git/igit-service";

function handleIpcError(error: unknown): never {
  // Centralized error handling for Electron IPC
  if (error instanceof Error) {
    throw new Error(`[ElectronGitService] ${error.message}`);
  }
  throw new Error("[ElectronGitService] Unknown error");
}

declare global {
  interface Window {
    electron: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}

export class ElectronGitService implements IGitService {
  async addRepository(localPath: string, remoteUrl: string, credentialsId?: string): Promise<RepositoryInfo> {
    try {
      return await window.electron.invoke("git:addRepository", localPath, remoteUrl, credentialsId);
    } catch (error) {
      handleIpcError(error);
    }
  }

  async listRepositories(): Promise<RepositoryInfo[]> {
    try {
      return await window.electron.invoke("git:listRepositories");
    } catch (error) {
      handleIpcError(error);
    }
  }

  async getStatus(repositoryId: string): Promise<StatusInfo> {
    try {
      return await window.electron.invoke("git:getStatus", repositoryId);
    } catch (error) {
      handleIpcError(error);
    }
  }

  async commitChanges(params: CommitParams): Promise<void> {
    try {
      await window.electron.invoke("git:commitChanges", params);
    } catch (error) {
      handleIpcError(error);
    }
  }

  async pushChanges(params: PullPushParams): Promise<void> {
    try {
      await window.electron.invoke("git:pushChanges", params);
    } catch (error) {
      handleIpcError(error);
    }
  }

  async pullChanges(params: PullPushParams): Promise<void> {
    try {
      await window.electron.invoke("git:pullChanges", params);
    } catch (error) {
      handleIpcError(error);
    }
  }

  async createBranch(params: BranchParams): Promise<void> {
    try {
      await window.electron.invoke("git:createBranch", params);
    } catch (error) {
      handleIpcError(error);
    }
  }

  async switchBranch(params: BranchParams): Promise<void> {
    try {
      await window.electron.invoke("git:switchBranch", params);
    } catch (error) {
      handleIpcError(error);
    }
  }

  async deleteBranch(params: BranchParams): Promise<void> {
    try {
      await window.electron.invoke("git:deleteBranch", params);
    } catch (error) {
      handleIpcError(error);
    }
  }

  async listBranches(repositoryId: string): Promise<BranchInfo[]> {
    try {
      return await window.electron.invoke("git:listBranches", repositoryId);
    } catch (error) {
      handleIpcError(error);
    }
  }

  async getHistory(repositoryId: string, branchName?: string): Promise<CommitInfo[]> {
    try {
      return await window.electron.invoke("git:getHistory", repositoryId, branchName);
    } catch (error) {
      handleIpcError(error);
    }
  }

  async syncWithRemote(repositoryId: string, credentialsId?: string): Promise<void> {
    try {
      await window.electron.invoke("git:syncWithRemote", repositoryId, credentialsId);
    } catch (error) {
      handleIpcError(error);
    }
  }
}