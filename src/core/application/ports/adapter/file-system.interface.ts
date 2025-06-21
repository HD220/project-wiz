// src/core/application/ports/adapter/file-system.interface.ts
import { Result } from '@/shared/result';

export interface IFileSystem {
    mkdir(path: string): Promise<Result<void>>;
    writeFile(filePath: string, content: string | Buffer): Promise<Result<void>>;
    readFile(filePath: string): Promise<Result<string>>;
    pathExists(path: string): Promise<Result<boolean>>;
    // TODO: Consider adding readdir, rmdir, unlink, etc. as needed
}
