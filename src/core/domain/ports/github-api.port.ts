export interface PullRequestInfo {
  id: number;
  number: number;
  title: string;
  description: string;
  author: string;
  state: 'open' | 'closed' | 'merged';
  isDraft: boolean;
  sourceBranch: string;
  targetBranch: string;
  url: string;
}

export interface CreatePullRequestParams {
  repositoryId: string;
  sourceBranch: string;
  targetBranch: string;
  title: string;
  description?: string;
  reviewers?: string[];
  isDraft?: boolean;
  credentialsId?: string;
}

export interface CommentParams {
  repositoryId: string;
  pullRequestNumber: number;
  comment: string;
  credentialsId?: string;
}

export interface MergePullRequestParams {
  repositoryId: string;
  pullRequestNumber: number;
  commitMessage?: string;
  credentialsId?: string;
}

export interface IGitHubApiPort {
  createPullRequest(params: CreatePullRequestParams): Promise<PullRequestInfo>;

  listPullRequests(repositoryId: string, credentialsId?: string): Promise<PullRequestInfo[]>;

  getPullRequestDetails(repositoryId: string, pullRequestNumber: number, credentialsId?: string): Promise<PullRequestInfo>;

  commentOnPullRequest(params: CommentParams): Promise<void>;

  mergePullRequest(params: MergePullRequestParams): Promise<void>;

  closePullRequest(repositoryId: string, pullRequestNumber: number, credentialsId?: string): Promise<void>;

  listCommits(repositoryId: string, branchName?: string, credentialsId?: string): Promise<import('./git-service.port').CommitInfo[]>;

  getDiff(repositoryId: string, baseRef: string, compareRef: string, credentialsId?: string): Promise<string>;
}