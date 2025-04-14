/* 
 * GitBranchService: Application service for branch operations with dependency injection.
 * All code, comments, and identifiers in English as per project standards.
 * 
 * Contracts:
 * - All methods throw errors with descriptive messages on failure.
 * - All parameters are validated before execution.
 * - All methods are pure and side-effect free except for calling gitService.
 * - Follows Clean Architecture (see ADR-0012).
 */

import type { BranchInfo, BranchParams, RepositoryInfo } from "../../shared/types/git";

/**
 * Interface for Git service dependency.
 * Only the methods required by GitBranchService are included.
 */
export interface IGitService {
  listBranches(repositoryId: string): Promise<BranchInfo[]>;
  createBranch(params: BranchParams): Promise<void>;
  switchBranch(params: BranchParams): Promise<void>;
  deleteBranch(params: BranchParams): Promise<void>;
}

/**
 * Service for branch operations, decoupled from infrastructure.
 * Accepts an IGitService implementation via dependency injection.
 */
export class GitBranchService {
  private readonly gitService: IGitService;

  constructor(gitService: IGitService) {
    this.gitService = gitService;
  }

  /**
   * Lists all branches for a given repository.
   * @param repository RepositoryInfo or repository id
   * @returns Promise<BranchInfo[]>
   */
  async listBranches(repository: RepositoryInfo | string | null): Promise<BranchInfo[]> {
    const repoId = GitBranchService.validateRepository(repository);
    try {
      return await this.gitService.listBranches(repoId);
    } catch (error: any) {
      throw new Error(`Failed to list branches: ${error?.message || error}`);
    }
  }

  /**
   * Creates a new branch.
   * @param params BranchParams
   */
  async createBranch(params: BranchParams): Promise<void> {
    GitBranchService.validateBranchParams(params);
    try {
      await this.gitService.createBranch(params);
    } catch (error: any) {
      throw new Error(`Failed to create branch: ${error?.message || error}`);
    }
  }

  /**
   * Switches to a branch.
   * @param params BranchParams
   */
  async switchBranch(params: BranchParams): Promise<void> {
    GitBranchService.validateBranchParams(params);
    try {
      await this.gitService.switchBranch(params);
    } catch (error: any) {
      throw new Error(`Failed to switch branch: ${error?.message || error}`);
    }
  }

  /**
   * Deletes a branch.
   * @param params BranchParams
   */
  async deleteBranch(params: BranchParams): Promise<void> {
    GitBranchService.validateBranchParams(params);
    try {
      await this.gitService.deleteBranch(params);
    } catch (error: any) {
      throw new Error(`Failed to delete branch: ${error?.message || error}`);
    }
  }

  /**
   * Validates the repository info or id.
   * Throws an error if invalid.
   */
  private static validateRepository(repository: RepositoryInfo | string | null): string {
    if (!repository) throw new Error("Repository is required.");
    if (typeof repository === "string") {
      if (!repository.trim()) throw new Error("Repository id must be a non-empty string.");
      return repository;
    }
    if (!repository.id || !repository.id.trim()) throw new Error("Repository id is missing.");
    return repository.id;
  }

  /**
   * Validates branch parameters.
   * Throws an error if invalid.
   */
  private static validateBranchParams(params: BranchParams): BranchParams {
    if (!params || typeof params !== "object") throw new Error("Branch parameters are required.");
    if (!params.repositoryId || !params.repositoryId.trim()) throw new Error("repositoryId is required.");
    if (!params.branchName || !params.branchName.trim()) throw new Error("branchName is required.");
    return params;
  }
}