import { z } from "zod";
import { IGitService } from "../../domain/IGitService";
import { GitError, GitErrorCode } from "../../shared/types/errors";
import {
  RepositoryInfo,
  StatusInfo,
  CommitParams,
  PullPushParams,
  BranchParams,
  BranchInfo,
  CommitInfo,
} from "../../shared/types/git";
import {
  RepositoryParamsSchema,
  RepositoryIdSchema,
  CommitParamsSchema,
  PullPushParamsSchema,
  BranchParamsSchema,
} from "../../shared/types/ipc-git";

function validateParams<T>(schema: z.ZodSchema<T>, params: unknown): T {
  try {
    return schema.parse(params);
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new GitError(
        GitErrorCode.INVALID_PARAMS,
        'Invalid parameters provided',
        { errors: err.errors.map(e => e.message) }
      );
    }
    throw err;
  }
}

export class AddRepositoryUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(localPath: string, remoteUrl: string, credentialsId?: string): Promise<RepositoryInfo> {
    const params = validateParams(RepositoryParamsSchema, { localPath, remoteUrl, credentialsId });
    return this.gitService.addRepository(params.localPath, params.remoteUrl, params.credentialsId);
  }
}

export class ListRepositoriesUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(): Promise<RepositoryInfo[]> {
    return this.gitService.listRepositories();
  }
}

export class GetStatusUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(repositoryId: string): Promise<StatusInfo> {
    validateParams(RepositoryIdSchema, repositoryId);
    return this.gitService.getStatus(repositoryId);
  }
}

export class CommitChangesUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(params: CommitParams): Promise<void> {
    const validatedParams = validateParams(CommitParamsSchema, params);
    return this.gitService.commitChanges(validatedParams.repositoryId, validatedParams.message);
  }
}

export class PushChangesUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(params: PullPushParams): Promise<void> {
    const validatedParams = validateParams(PullPushParamsSchema, params);
    return this.gitService.pushChanges(validatedParams.repositoryId, validatedParams.branchName, validatedParams.credentialsId);
  }
}

export class PullChangesUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(params: PullPushParams): Promise<void> {
    const validatedParams = validateParams(PullPushParamsSchema, params);
    return this.gitService.pullChanges(validatedParams.repositoryId, validatedParams.branchName, validatedParams.credentialsId);
  }
}

export class CreateBranchUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(params: BranchParams): Promise<void> {
    const validatedParams = validateParams(BranchParamsSchema, params);
    return this.gitService.createBranch(validatedParams.repositoryId, validatedParams.branchName);
  }
}

export class SwitchBranchUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(params: BranchParams): Promise<void> {
    const validatedParams = validateParams(BranchParamsSchema, params);
    return this.gitService.switchBranch(validatedParams.repositoryId, validatedParams.branchName);
  }
}

export class DeleteBranchUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(params: BranchParams): Promise<void> {
    const validatedParams = validateParams(BranchParamsSchema, params);
    return this.gitService.deleteBranch(validatedParams.repositoryId, validatedParams.branchName);
  }
}

export class ListBranchesUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(repositoryId: string): Promise<BranchInfo[]> {
    validateParams(RepositoryIdSchema, repositoryId);
    return this.gitService.listBranches(repositoryId);
  }
}

export class GetHistoryUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(repositoryId: string, branchName?: string): Promise<CommitInfo[]> {
    validateParams(RepositoryIdSchema, repositoryId);
    if (branchName) {
      validateParams(z.string().min(1), branchName);
    }
    return this.gitService.getHistory(repositoryId, branchName);
  }
}

export class SyncWithRemoteUseCase {
  constructor(private readonly gitService: IGitService) {}

  async execute(repositoryId: string, credentialsId?: string): Promise<void> {
    validateParams(RepositoryIdSchema, repositoryId);
    if (credentialsId) {
      validateParams(z.string().min(1), credentialsId);
    }
    return this.gitService.syncWithRemote(repositoryId, credentialsId);
  }
}

export class GitUseCases {
  constructor(private readonly gitService: IGitService) {}

  get addRepository() {
    return new AddRepositoryUseCase(this.gitService);
  }

  get listRepositories() {
    return new ListRepositoriesUseCase(this.gitService);
  }

  get getStatus() {
    return new GetStatusUseCase(this.gitService);
  }

  get commitChanges() {
    return new CommitChangesUseCase(this.gitService);
  }

  get pushChanges() {
    return new PushChangesUseCase(this.gitService);
  }

  get pullChanges() {
    return new PullChangesUseCase(this.gitService);
  }

  get createBranch() {
    return new CreateBranchUseCase(this.gitService);
  }

  get switchBranch() {
    return new SwitchBranchUseCase(this.gitService);
  }

  get deleteBranch() {
    return new DeleteBranchUseCase(this.gitService);
  }

  get listBranches() {
    return new ListBranchesUseCase(this.gitService);
  }

  get getHistory() {
    return new GetHistoryUseCase(this.gitService);
  }

  get syncWithRemote() {
    return new SyncWithRemoteUseCase(this.gitService);
  }
}