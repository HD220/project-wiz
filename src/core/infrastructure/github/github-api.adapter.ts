import { Octokit } from 'octokit';
import { IGitHubApiPort, CreatePullRequestParams, PullRequestInfo, CommentParams, MergePullRequestParams } from '../../../core/domain/ports/github-api.port';
import { CommitInfo } from '../../../core/domain/ports/git-service.port';

export class GitHubApiAdapter implements IGitHubApiPort {
  constructor(private getTokenById: (id?: string) => Promise<string | null>) {}

  private async getOctokit(credentialsId?: string): Promise<Octokit> {
    const token = await this.getTokenById(credentialsId);
    if (!token) throw new Error('Token GitHub não encontrado');
    return new Octokit({ auth: token });
  }

  async createPullRequest(params: CreatePullRequestParams): Promise<PullRequestInfo> {
    const octokit = await this.getOctokit(params.credentialsId);
    const [owner, repo] = this.extractOwnerRepo(params.repositoryId);

    const response = await octokit.rest.pulls.create({
      owner,
      repo,
      head: params.sourceBranch,
      base: params.targetBranch,
      title: params.title,
      body: params.description,
      draft: params.isDraft,
    });

    if (params.reviewers && params.reviewers.length > 0) {
      await octokit.rest.pulls.requestReviewers({
        owner,
        repo,
        pull_number: response.data.number,
        reviewers: params.reviewers,
      });
    }

    return this.mapPullRequest(response.data);
  }

  async listPullRequests(repositoryId: string, credentialsId?: string): Promise<PullRequestInfo[]> {
    const octokit = await this.getOctokit(credentialsId);
    const [owner, repo] = this.extractOwnerRepo(repositoryId);

    const { data } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
    });

    return data.map(this.mapPullRequest);
  }

  async getPullRequestDetails(repositoryId: string, pullRequestNumber: number, credentialsId?: string): Promise<PullRequestInfo> {
    const octokit = await this.getOctokit(credentialsId);
    const [owner, repo] = this.extractOwnerRepo(repositoryId);

    const { data } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pullRequestNumber,
    });

    return this.mapPullRequest(data);
  }

  async commentOnPullRequest(params: CommentParams): Promise<void> {
    const octokit = await this.getOctokit(params.credentialsId);
    const [owner, repo] = this.extractOwnerRepo(params.repositoryId);

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: params.pullRequestNumber,
      body: params.comment,
    });
  }

  async mergePullRequest(params: MergePullRequestParams): Promise<void> {
    const octokit = await this.getOctokit(params.credentialsId);
    const [owner, repo] = this.extractOwnerRepo(params.repositoryId);

    await octokit.rest.pulls.merge({
      owner,
      repo,
      pull_number: params.pullRequestNumber,
      commit_message: params.commitMessage,
    });
  }

  async closePullRequest(repositoryId: string, pullRequestNumber: number, credentialsId?: string): Promise<void> {
    const octokit = await this.getOctokit(credentialsId);
    const [owner, repo] = this.extractOwnerRepo(repositoryId);

    await octokit.rest.pulls.update({
      owner,
      repo,
      pull_number: pullRequestNumber,
      state: 'closed',
    });
  }

  async listCommits(repositoryId: string, branchName?: string, credentialsId?: string): Promise<CommitInfo[]> {
    const octokit = await this.getOctokit(credentialsId);
    const [owner, repo] = this.extractOwnerRepo(repositoryId);

    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: branchName,
    });

    return data.map(commit => ({
      hash: commit.sha,
      author: commit.commit.author?.name || '',
      date: commit.commit.author?.date || '',
      message: commit.commit.message,
    }));
  }

  async getDiff(repositoryId: string, baseRef: string, compareRef: string, credentialsId?: string): Promise<string> {
    const octokit = await this.getOctokit(credentialsId);
    const [owner, repo] = this.extractOwnerRepo(repositoryId);

    const response = await octokit.rest.repos.compareCommitsWithBasehead({
      owner,
      repo,
      basehead: `${baseRef}...${compareRef}`,
      mediaType: { format: 'diff' },
    });

    return response.data as unknown as string;
  }

  private extractOwnerRepo(repositoryId: string): [string, string] {
    const parts = repositoryId.split('/');
    if (parts.length < 2) throw new Error('ID de repositório inválido');
    return [parts[0], parts[1]];
  }

  private mapPullRequest = (pr: any): PullRequestInfo => ({
    id: pr.id,
    number: pr.number,
    title: pr.title,
    description: pr.body,
    author: pr.user?.login || '',
    state: pr.merged_at ? 'merged' : pr.state,
    isDraft: pr.draft,
    sourceBranch: pr.head.ref,
    targetBranch: pr.base.ref,
    url: pr.html_url,
  });
}