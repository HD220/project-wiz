/**
 * Error codes and messages for Git operations
 * Follows ADR-0030 for error handling
 */
export enum GitErrorCode {
  // Validation errors (100-199)
  INVALID_PARAMS = 'GIT_100',
  MISSING_REQUIRED_FIELD = 'GIT_101',
  INVALID_REPOSITORY_ID = 'GIT_102',
  INVALID_BRANCH_NAME = 'GIT_103',
  INVALID_CREDENTIALS = 'GIT_104',

  // Repository operations (200-299)
  REPOSITORY_ALREADY_EXISTS = 'GIT_200',
  REPOSITORY_NOT_FOUND = 'GIT_201',
  REPOSITORY_INIT_FAILED = 'GIT_202',

  // Branch operations (300-399)
  BRANCH_ALREADY_EXISTS = 'GIT_300',
  BRANCH_NOT_FOUND = 'GIT_301',
  BRANCH_DELETE_FAILED = 'GIT_302',

  // Remote operations (400-499)
  REMOTE_CONNECTION_FAILED = 'GIT_400',
  REMOTE_AUTH_FAILED = 'GIT_401',
  REMOTE_OPERATION_FAILED = 'GIT_402',
}

export const GitErrorMessages: Record<GitErrorCode, string> = {
  [GitErrorCode.INVALID_PARAMS]: 'Invalid parameters provided',
  [GitErrorCode.MISSING_REQUIRED_FIELD]: 'Missing required field',
  [GitErrorCode.INVALID_REPOSITORY_ID]: 'Invalid repository identifier',
  [GitErrorCode.INVALID_BRANCH_NAME]: 'Invalid branch name',
  [GitErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials provided',

  [GitErrorCode.REPOSITORY_ALREADY_EXISTS]: 'Repository already exists at specified path',
  [GitErrorCode.REPOSITORY_NOT_FOUND]: 'Repository not found',
  [GitErrorCode.REPOSITORY_INIT_FAILED]: 'Failed to initialize repository',

  [GitErrorCode.BRANCH_ALREADY_EXISTS]: 'Branch already exists',
  [GitErrorCode.BRANCH_NOT_FOUND]: 'Branch not found',
  [GitErrorCode.BRANCH_DELETE_FAILED]: 'Failed to delete branch',

  [GitErrorCode.REMOTE_CONNECTION_FAILED]: 'Failed to connect to remote repository',
  [GitErrorCode.REMOTE_AUTH_FAILED]: 'Authentication failed for remote repository',
  [GitErrorCode.REMOTE_OPERATION_FAILED]: 'Remote operation failed',
};

export class GitError extends Error {
  constructor(
    public readonly code: GitErrorCode,
    message?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message || GitErrorMessages[code]);
    this.name = 'GitError';
  }
}