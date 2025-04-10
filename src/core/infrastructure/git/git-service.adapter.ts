import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import path from 'path';
import fs from 'fs/promises';
import { IGitServicePort, RepositoryInfo, CloneRepositoryParams, CommitParams, PullPushParams, BranchParams, StatusInfo, BranchInfo, CommitInfo } from '../../../core/domain/ports/git-service.port';

export class GitServiceAdapter implements IGitServicePort {
  private repositories: Map<string, RepositoryInfo> = new Map();

  async addRepository(localPath: string, remoteUrl: string, credentialsId?: string): Promise<RepositoryInfo> {
    const repoId = localPath;
    const name = path.basename(localPath);
    const git: SimpleGit = simpleGit({ baseDir: localPath });
    const currentBranch = (await git.branch()).current;

    const repoInfo: RepositoryInfo = {
      id: repoId,
      name,
      localPath,
      remoteUrl,
      currentBranch,
    };
    this.repositories.set(repoId, repoInfo);
    return repoInfo;
  }

  async removeRepository(repositoryId: string): Promise<void> {
    this.repositories.delete(repositoryId);
  }

  async listRepositories(): Promise<RepositoryInfo[]> {
    return Array.from(this.repositories.values());
  }

  async cloneRepository(params: CloneRepositoryParams): Promise<RepositoryInfo> {
    const { remoteUrl, localPath } = params;
    await fs.mkdir(localPath, { recursive: true });
    const git: SimpleGit = simpleGit();
    await git.clone(remoteUrl, localPath);
    return this.addRepository(localPath, remoteUrl, params.credentialsId);
  }

  async getStatus(repositoryId: string): Promise<StatusInfo> {
    const repo = this.repositories.get(repositoryId);
    if (!repo) throw new Error('Repositório não encontrado');
    const git = simpleGit({ baseDir: repo.localPath });
    const status = await git.status();
    return {
      modified: status.modified,
      staged: status.staged,
      untracked: status.not_added,
      conflicted: status.conflicted,
    };
  }

  async commitChanges(params: CommitParams): Promise<void> {
    const repo = this.repositories.get(params.repositoryId);
    if (!repo) throw new Error('Repositório não encontrado');
    const git = simpleGit({ baseDir: repo.localPath });
    if (params.files && params.files.length > 0) {
      await git.add(params.files);
    } else {
      await git.add('.');
    }
    await git.commit(params.message);
  }

  async pushChanges(params: PullPushParams): Promise<void> {
    const repo = this.repositories.get(params.repositoryId);
    if (!repo) throw new Error('Repositório não encontrado');
    const git = simpleGit({ baseDir: repo.localPath });
    await git.push(params.remoteName || 'origin', params.branchName || repo.currentBranch);
  }

  async pullChanges(params: PullPushParams): Promise<void> {
    const repo = this.repositories.get(params.repositoryId);
    if (!repo) throw new Error('Repositório não encontrado');
    const git = simpleGit({ baseDir: repo.localPath });
    await git.pull(params.remoteName || 'origin', params.branchName || repo.currentBranch);
  }

  async createBranch(params: BranchParams): Promise<void> {
    const repo = this.repositories.get(params.repositoryId);
    if (!repo) throw new Error('Repositório não encontrado');
    const git = simpleGit({ baseDir: repo.localPath });
    await git.checkoutBranch(params.branchName, params.sourceBranch || repo.currentBranch);
  }

  async switchBranch(params: BranchParams): Promise<void> {
    const repo = this.repositories.get(params.repositoryId);
    if (!repo) throw new Error('Repositório não encontrado');
    const git = simpleGit({ baseDir: repo.localPath });
    await git.checkout(params.branchName);
  }

  async deleteBranch(params: BranchParams): Promise<void> {
    const repo = this.repositories.get(params.repositoryId);
    if (!repo) throw new Error('Repositório não encontrado');
    const git = simpleGit({ baseDir: repo.localPath });
    await git.deleteLocalBranch(params.branchName);
  }

  async listBranches(repositoryId: string): Promise<BranchInfo[]> {
    const repo = this.repositories.get(repositoryId);
    if (!repo) throw new Error('Repositório não encontrado');
    const git = simpleGit({ baseDir: repo.localPath });
    const branches = await git.branch(['-a']);
    return Object.keys(branches.branches).map((name) => ({
      name,
      isCurrent: branches.current === name,
      isRemote: name.startsWith('remotes/'),
    }));
  }

  async getHistory(repositoryId: string, branchName?: string): Promise<CommitInfo[]> {
    const repo = this.repositories.get(repositoryId);
    if (!repo) throw new Error('Repositório não encontrado');
    const git = simpleGit({ baseDir: repo.localPath });
    const log = await git.log({ ...(branchName ? { from: branchName } : {}) });
    return log.all.map((commit) => ({
      hash: commit.hash,
      author: commit.author_name,
      date: commit.date,
      message: commit.message,
    }));
  }

  async syncWithRemote(repositoryId: string, credentialsId?: string): Promise<void> {
    const repo = this.repositories.get(repositoryId);
    if (!repo) throw new Error('Repositório não encontrado');
    const git = simpleGit({ baseDir: repo.localPath });
    await git.fetch();
    await git.pull();
    await git.push();
  }
}