import { IGitService } from '../domain/IGitService';
import {
  RepositoryInfo,
  StatusInfo,
  CommitInfo,
  BranchInfo
} from '../shared/types/git';
import { IpcGitChannel } from '../shared/types/ipc-git';
import { ipcRenderer } from 'electron';

export class ElectronGitService implements IGitService {
  async addRepository(localPath: string, remoteUrl: string, credentialsId?: string): Promise<RepositoryInfo> {
    const response = await ipcRenderer.invoke('git:addRepository', {
      localPath,
      remoteUrl,
      credentialsId
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to add repository');
    }
    
    return response.repository;
  }

  async listRepositories(): Promise<RepositoryInfo[]> {
    const response = await ipcRenderer.invoke('git:listRepositories');
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to list repositories');
    }
    
    return response.repositories;
  }

  async getStatus(repositoryId: string): Promise<StatusInfo> {
    const response = await ipcRenderer.invoke('git:getStatus', {
      repositoryId
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get repository status');
    }
    
    return response.status;
  }

  async commitChanges(repositoryId: string, message: string, files?: string[]): Promise<void> {
    const response = await ipcRenderer.invoke('git:commitChanges', {
      repositoryId,
      message,
      files: files || ['*']
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to commit changes');
    }
  }

  async pushChanges(repositoryId: string, branchName: string, credentialsId?: string): Promise<void> {
    const response = await ipcRenderer.invoke('git:pushChanges', {
      repositoryId,
      branchName,
      credentialsId
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to push changes');
    }
  }

  async pullChanges(repositoryId: string, branchName: string, credentialsId?: string): Promise<void> {
    const response = await ipcRenderer.invoke('git:pullChanges', {
      repositoryId,
      branchName,
      credentialsId
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to pull changes');
    }
  }

  async createBranch(repositoryId: string, branchName: string): Promise<void> {
    const response = await ipcRenderer.invoke('git:createBranch', {
      repositoryId,
      branchName
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create branch');
    }
  }

  async switchBranch(repositoryId: string, branchName: string): Promise<void> {
    const response = await ipcRenderer.invoke('git:switchBranch', {
      repositoryId,
      branchName
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to switch branch');
    }
  }

  async deleteBranch(repositoryId: string, branchName: string): Promise<void> {
    const response = await ipcRenderer.invoke('git:deleteBranch', {
      repositoryId,
      branchName
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete branch');
    }
  }

  async listBranches(repositoryId: string): Promise<BranchInfo[]> {
    const response = await ipcRenderer.invoke('git:listBranches', {
      repositoryId
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to list branches');
    }
    
    return response.branches;
  }

  async getHistory(repositoryId: string, branchName?: string): Promise<CommitInfo[]> {
    const response = await ipcRenderer.invoke('git:getHistory', {
      repositoryId,
      branchName
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get history');
    }
    
    return response.commits;
  }

  async syncWithRemote(repositoryId: string, credentialsId?: string): Promise<void> {
    try {
      await this.pullChanges(repositoryId, 'main', credentialsId);
      await this.pushChanges(repositoryId, 'main', credentialsId);
    } catch (err) {
      throw new Error(`Sync failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}