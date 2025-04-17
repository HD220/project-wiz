import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ElectronGitService } from '../../../src/infrastructure/ElectronGitService';
import { ipcRenderer } from 'electron';

vi.mock('electron', () => ({
  ipcRenderer: {
    invoke: vi.fn()
  }
}));

describe('ElectronGitService', () => {
  let service: ElectronGitService;

  beforeEach(() => {
    service = new ElectronGitService();
    vi.clearAllMocks();
  });

  describe('commitChanges', () => {
    it('should invoke git:commitChanges IPC with correct params', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ success: true });
      
      await service.commitChanges('repo1', 'test commit');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:commitChanges', {
        repositoryId: 'repo1',
        message: 'test commit',
        files: ['*']
      });
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ 
        success: false, 
        error: 'Commit failed' 
      });

      await expect(service.commitChanges('repo1', 'test commit'))
        .rejects.toThrow('Commit failed');
    });
  });

  describe('pushChanges', () => {
    it('should invoke git:pushChanges IPC with correct params', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ success: true });
      
      await service.pushChanges('repo1', 'main', 'cred123');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:pushChanges', {
        repositoryId: 'repo1',
        branchName: 'main',
        credentialsId: 'cred123'
      });
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ 
        success: false, 
        error: 'Push failed' 
      });

      await expect(service.pushChanges('repo1', 'main'))
        .rejects.toThrow('Push failed');
    });
  });

  describe('pullChanges', () => {
    it('should invoke git:pullChanges IPC with correct params', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ success: true });
      
      await service.pullChanges('repo1', 'main');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:pullChanges', {
        repositoryId: 'repo1',
        branchName: 'main',
        credentialsId: undefined
      });
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ 
        success: false, 
        error: 'Pull failed' 
      });

      await expect(service.pullChanges('repo1', 'main'))
        .rejects.toThrow('Pull failed');
    });
  });

  describe('syncWithRemote', () => {
    it('should call pull and push with main branch', async () => {
      const pullSpy = vi.spyOn(service, 'pullChanges').mockResolvedValue();
      const pushSpy = vi.spyOn(service, 'pushChanges').mockResolvedValue();
      
      await service.syncWithRemote('repo1');
      
      expect(pullSpy).toHaveBeenCalledWith('repo1', 'main', undefined);
      expect(pushSpy).toHaveBeenCalledWith('repo1', 'main', undefined);
    });

    it('should throw combined error when sync fails', async () => {
      vi.spyOn(service, 'pullChanges').mockRejectedValue(new Error('Pull error'));
      
      await expect(service.syncWithRemote('repo1'))
        .rejects.toThrow('Sync failed: Pull error');
    });
  });

  describe('createBranch', () => {
    it('should invoke git:createBranch IPC with correct params', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ success: true });
      
      await service.createBranch('repo1', 'feature-x');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:createBranch', {
        repositoryId: 'repo1',
        branchName: 'feature-x'
      });
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: false,
        error: 'Create branch failed'
      });

      await expect(service.createBranch('repo1', 'feature-x'))
        .rejects.toThrow('Create branch failed');
    });
  });

  describe('switchBranch', () => {
    it('should invoke git:switchBranch IPC with correct params', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ success: true });
      
      await service.switchBranch('repo1', 'main');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:switchBranch', {
        repositoryId: 'repo1',
        branchName: 'main'
      });
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: false,
        error: 'Switch branch failed'
      });

      await expect(service.switchBranch('repo1', 'main'))
        .rejects.toThrow('Switch branch failed');
    });
  });

  describe('deleteBranch', () => {
    it('should invoke git:deleteBranch IPC with correct params', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ success: true });
      
      await service.deleteBranch('repo1', 'old-branch');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:deleteBranch', {
        repositoryId: 'repo1',
        branchName: 'old-branch'
      });
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: false,
        error: 'Delete branch failed'
      });

      await expect(service.deleteBranch('repo1', 'old-branch'))
        .rejects.toThrow('Delete branch failed');
    });
  });

  describe('listBranches', () => {
    it('should return branches from IPC response', async () => {
      const mockBranches = [
        { name: 'main', isCurrent: true },
        { name: 'dev', isCurrent: false }
      ];
      
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: true,
        branches: mockBranches
      });
      
      const result = await service.listBranches('repo1');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:listBranches', {
        repositoryId: 'repo1'
      });
      expect(result).toEqual(mockBranches);
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: false,
        error: 'List branches failed'
      });

      await expect(service.listBranches('repo1'))
        .rejects.toThrow('List branches failed');
    });
  });

  describe('getHistory', () => {
    it('should return commits from IPC response', async () => {
      const mockCommits = [
        { id: 'abc123', message: 'Initial commit', author: 'dev@test.com', date: '2025-01-01' },
        { id: 'def456', message: 'Update readme', author: 'dev@test.com', date: '2025-01-02' }
      ];
      
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: true,
        commits: mockCommits
      });
      
      const result = await service.getHistory('repo1', 'main');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:getHistory', {
        repositoryId: 'repo1',
        branchName: 'main'
      });
      expect(result).toEqual(mockCommits);
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: false,
        error: 'Get history failed'
      });

      await expect(service.getHistory('repo1'))
        .rejects.toThrow('Get history failed');
    });
  });

  describe('addRepository', () => {
    it('should return repository info from IPC response', async () => {
      const mockRepo = {
        id: 'repo1',
        name: 'test-repo',
        localPath: '/path/to/repo',
        remoteUrl: 'http://github.com/test/repo'
      };
      
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: true,
        repository: mockRepo
      });
      
      const result = await service.addRepository('/path/to/repo', 'http://github.com/test/repo');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:addRepository', {
        localPath: '/path/to/repo',
        remoteUrl: 'http://github.com/test/repo',
        credentialsId: undefined
      });
      expect(result).toEqual(mockRepo);
    });

    it('should include credentialsId when provided', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ success: true, repository: {} });
      
      await service.addRepository('/path', 'http://repo.com', 'cred123');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith(expect.objectContaining({
        credentialsId: 'cred123'
      }));
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: false,
        error: 'Add repository failed'
      });

      await expect(service.addRepository('/path', 'http://repo.com'))
        .rejects.toThrow('Add repository failed');
    });
  });

  describe('listRepositories', () => {
    it('should return repositories from IPC response', async () => {
      const mockRepos = [
        { id: 'repo1', name: 'test-repo', localPath: '/path/to/repo1' },
        { id: 'repo2', name: 'another-repo', localPath: '/path/to/repo2' }
      ];
      
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: true,
        repositories: mockRepos
      });
      
      const result = await service.listRepositories();
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:listRepositories');
      expect(result).toEqual(mockRepos);
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: false,
        error: 'List repositories failed'
      });

      await expect(service.listRepositories())
        .rejects.toThrow('List repositories failed');
    });
  });

  describe('getStatus', () => {
    it('should return status info from IPC response', async () => {
      const mockStatus = {
        currentBranch: 'main',
        files: [
          { path: 'file1.ts', status: 'modified' },
          { path: 'file2.ts', status: 'untracked' }
        ]
      };
      
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: true,
        status: mockStatus
      });
      
      const result = await service.getStatus('repo1');
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:getStatus', {
        repositoryId: 'repo1'
      });
      expect(result).toEqual(mockStatus);
    });

    it('should throw error when IPC fails', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({
        success: false,
        error: 'Get status failed'
      });

      await expect(service.getStatus('repo1'))
        .rejects.toThrow('Get status failed');
    });
  });

  describe('commitChanges with files', () => {
    it('should allow specifying specific files to commit', async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ success: true });
      
      await service.commitChanges('repo1', 'test commit', ['file1.ts', 'file2.ts']);
      
      expect(ipcRenderer.invoke).toHaveBeenCalledWith('git:commitChanges', {
        repositoryId: 'repo1',
        message: 'test commit',
        files: ['file1.ts', 'file2.ts']
      });
    });
  });
});