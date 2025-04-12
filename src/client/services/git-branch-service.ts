/* 
 * GitBranchService: Pure application service for branch operations.
 * All code, comments, and identifiers in English as per project standards.
 * 
 * Contracts:
 * - All methods throw errors with descriptive messages on failure.
 * - All parameters are validated before execution.
 * - All methods are pure and side-effect free except for calling gitService.
 */

import { BranchInfo, BranchParams, RepositoryInfo, gitService } from "./git-service";

/**
 * Validates the repository info or id.
 * Throws an error if invalid.
 */
function validateRepository(repository: RepositoryInfo | string | null): string {
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
function validateBranchParams(params: BranchParams): BranchParams {
  if (!params || typeof params !== "object") throw new Error("Branch parameters are required.");
  if (!params.repositoryId || !params.repositoryId.trim()) throw new Error("repositoryId is required.");
  if (!params.branchName || !params.branchName.trim()) throw new Error("branchName is required.");
  return params;
}

/**
 * Lists all branches for a given repository.
 * @param repository RepositoryInfo or repository id
 * @returns Promise<BranchInfo[]>
 */
export async function listBranches(repository: RepositoryInfo | string | null): Promise<BranchInfo[]> {
  const repoId = validateRepository(repository);
  try {
    return await gitService.listBranches(repoId);
  } catch (error: any) {
    throw new Error(`Failed to list branches: ${error?.message || error}`);
  }
}

/**
 * Creates a new branch.
 * @param params BranchParams
 */
export async function createBranch(params: BranchParams): Promise<void> {
  validateBranchParams(params);
  try {
    await gitService.createBranch(params);
  } catch (error: any) {
    throw new Error(`Failed to create branch: ${error?.message || error}`);
  }
}

/**
 * Switches to a branch.
 * @param params BranchParams
 */
export async function switchBranch(params: BranchParams): Promise<void> {
  validateBranchParams(params);
  try {
    await gitService.switchBranch(params);
  } catch (error: any) {
    throw new Error(`Failed to switch branch: ${error?.message || error}`);
  }
}

/**
 * Deletes a branch.
 * @param params BranchParams
 */
export async function deleteBranch(params: BranchParams): Promise<void> {
  validateBranchParams(params);
  try {
    await gitService.deleteBranch(params);
  } catch (error: any) {
    throw new Error(`Failed to delete branch: ${error?.message || error}`);
  }
}