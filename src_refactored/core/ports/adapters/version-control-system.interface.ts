// src_refactored/core/ports/adapters/version-control-system.interface.ts
import { Result } from '../../../shared/result';

export interface IVersionControlSystem {
  init(path: string): Promise<Result<void>>;
  changeWorkingDirectory(path: string): Promise<Result<void>>; // May not be needed if path is passed to each command
  // Add other methods as needed: commit, branch, push, pull, status, etc.
}

export const IVersionControlSystemToken = Symbol.for('IVersionControlSystem');
