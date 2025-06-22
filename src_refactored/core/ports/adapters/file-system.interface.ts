// src_refactored/core/ports/adapters/file-system.interface.ts
import { Result } from '../../../shared/result';

export interface IFileSystem {
  mkdir(path: string, options?: { recursive?: boolean }): Promise<Result<void>>;
  writeFile(path: string, content: string): Promise<Result<void>>;
  readFile(path: string): Promise<Result<string>>;
  exists(path: string): Promise<Result<boolean>>;
  // Add other methods as needed: rmdir, unlink, readdir, etc.
}

export const IFileSystemToken = Symbol.for('IFileSystem');
