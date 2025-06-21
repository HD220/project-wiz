// src/infrastructure/adapters/file-system/node-file-system.adapter.ts
import { Result, ok, error } from '@/shared/result';
import { IFileSystem } from '@/core/application/ports/adapter/file-system.interface'; // Corrected path
import { DomainError } from '@/core/common/errors';
import * as fs from 'fs/promises';
import * as path from 'path'; // Import path module

export class NodeFileSystemAdapter implements IFileSystem {
    constructor() {
        // Constructor can be used for base path configuration if needed.
        // For now, it's empty.
    }

    async mkdir(dirPath: string): Promise<Result<void>> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
            console.log(`NodeFileSystemAdapter: Directory created or already exists: ${dirPath}`);
            return ok(undefined);
        } catch (e) {
            console.error(`NodeFileSystemAdapter.mkdir failed for path "${dirPath}":`, e);
            return error(new DomainError(`Failed to create directory: ${dirPath}`, e instanceof Error ? e : undefined));
        }
    }

    async writeFile(filePath: string, content: string | Buffer): Promise<Result<void>> {
        try {
            const dirName = path.dirname(filePath);
            // Ensure directory exists. fs.mkdir with recursive:true handles this.
            // If it might throw an error that should be distinguished from writeFile error, call it separately.
            await fs.mkdir(dirName, { recursive: true });

            await fs.writeFile(filePath, content);
            console.log(`NodeFileSystemAdapter: File written: ${filePath}`);
            return ok(undefined);
        } catch (e) {
            console.error(`NodeFileSystemAdapter.writeFile failed for path "${filePath}":`, e);
            return error(new DomainError(`Failed to write file: ${filePath}`, e instanceof Error ? e : undefined));
        }
    }

    async readFile(filePath: string): Promise<Result<string>> {
        try {
            const content = await fs.readFile(filePath, { encoding: 'utf-8' });
            console.log(`NodeFileSystemAdapter: File read: ${filePath}`);
            return ok(content);
        } catch (e) {
            console.error(`NodeFileSystemAdapter.readFile failed for path "${filePath}":`, e);
            if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
                return error(new DomainError(`File not found: ${filePath}`, e as Error, true)); // isNotFoundError flag
            }
            return error(new DomainError(`Failed to read file: ${filePath}`, e instanceof Error ? e : undefined));
        }
    }

    async pathExists(checkPath: string): Promise<Result<boolean>> {
        try {
            await fs.access(checkPath, fs.constants.F_OK);
            console.log(`NodeFileSystemAdapter: Path exists: ${checkPath}`);
            return ok(true);
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
                console.log(`NodeFileSystemAdapter: Path does not exist: ${checkPath}`);
                return ok(false); // Valid case, path does not exist
            }
            console.error(`NodeFileSystemAdapter.pathExists failed for path "${checkPath}":`, e);
            return error(new DomainError(`Error checking path existence: ${checkPath}`, e instanceof Error ? e : undefined));
        }
    }

    // TODO: Implement other IFileSystem methods (e.g., readdir, rmdir, unlink)
    // and add them to the IFileSystem interface as needed.
}
