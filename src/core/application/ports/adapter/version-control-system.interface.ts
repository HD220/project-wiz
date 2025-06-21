// src/core/application/ports/adapter/version-control-system.interface.ts
import { Result } from '@/shared/result';

export interface IVersionControlSystem {
    init(path: string): Promise<Result<void>>;
    // changeWorkingDirectory removed as init and other operations can be path-specific
    // or the adapter can manage its current working directory context internally.
    add(pathspec: string | string[]): Promise<Result<void>>;
    commit(message: string): Promise<Result<{ commitId: string }>>; // Returns the commit ID
    // TODO: Add other common git operations like push, pull, status, clone, etc. as needed.
}
