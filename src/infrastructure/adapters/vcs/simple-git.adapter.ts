// src/infrastructure/adapters/vcs/simple-git.adapter.ts
import { Result, ok, error } from '@/shared/result';
import { IVersionControlSystem } from '@/core/application/ports/adapter/version-control-system.interface';
import { DomainError } from '@/core/common/errors';
import simpleGit, { SimpleGit, SimpleGitOptions, CommitResult } from 'simple-git';
import * as fs from 'fs/promises'; // For checking if directory exists for init

export class SimpleGitAdapter implements IVersionControlSystem {
    private git: SimpleGit;
    private currentRepoPath: string | null = null;

    constructor(basePath?: string) {
        const effectiveBasePath = basePath || process.cwd();
        const options: Partial<SimpleGitOptions> = {
            baseDir: effectiveBasePath,
            binary: 'git',
            maxConcurrentProcesses: 6,
        };
        this.git = simpleGit(options);
        // If a basePath is provided, assume it might be a repo path already
        // However, init() is the explicit way to define a repo path
        this.currentRepoPath = basePath || null;
        console.log(`SimpleGitAdapter initialized. Base path for operations: ${effectiveBasePath}`);
    }

    private getGitContext(operationSpecificPath?: string): SimpleGit {
        const targetPath = operationSpecificPath || this.currentRepoPath;
        if (!targetPath) {
            // This case should ideally be prevented by checks in each method
            // or by ensuring currentRepoPath is set after a successful init.
            throw new DomainError("Repository path not set for Git operation. Call init() or ensure constructor's basePath is a git repo.");
        }
        // Return a new instance configured for the target path if needed,
        // or use this.git if its baseDir is already correctly set.
        // For simple-git v3+, operations are generally relative to the baseDir set in options.
        // If targetPath is different from this.git's baseDir, a new instance might be safer.
        if (targetPath !== this.git._options?.baseDir) { // Accessing private _options for comparison, might need adjustment
             return simpleGit(targetPath);
        }
        return this.git;
    }

    async init(path: string): Promise<Result<void>> {
        try {
            // Ensure the directory exists
            try {
                await fs.access(path);
            } catch (e) {
                // If directory does not exist, attempt to create it for git init
                // This might be too aggressive; init usually expects an existing dir.
                // For now, let's assume fs.mkdir is handled by a FileSystem adapter if needed prior to init.
                // The prompt's CreateProjectUseCase calls mkdir first.
                return error(new DomainError(`Directory does not exist for git init: ${path}`, e instanceof Error ? e : undefined));
            }

            const gitOnPath = simpleGit(path); // Create a specific instance for this path for init
            await gitOnPath.init();
            this.currentRepoPath = path; // Set as current repo after successful init
            console.log(`Git repository initialized at ${path}`);
            return ok(undefined);
        } catch (e) {
            console.error(`SimpleGitAdapter.init failed for path "${path}":`, e);
            return error(new DomainError(`Failed to initialize git repository at: ${path}`, e instanceof Error ? e : undefined));
        }
    }

    async add(pathspec: string | string[]): Promise<Result<void>> {
        if (!this.currentRepoPath) {
            return error(new DomainError("No repository context set. Call init() on a path first."));
        }
        try {
            // Use the main git instance configured with currentRepoPath (or its baseDir)
            const gitContext = this.getGitContext(); // Will use this.currentRepoPath
            await gitContext.add(pathspec);
            console.log(`Added to git (${this.currentRepoPath}): ${pathspec}`);
            return ok(undefined);
        } catch (e) {
            console.error(`SimpleGitAdapter.add failed for "${pathspec}" in ${this.currentRepoPath}:`, e);
            return error(new DomainError(`Failed to add files to git: ${pathspec}`, e instanceof Error ? e : undefined));
        }
    }

    async commit(message: string): Promise<Result<{ commitId: string }>> {
        if (!this.currentRepoPath) {
            return error(new DomainError("No repository context set. Call init() on a path first."));
        }
        try {
            const gitContext = this.getGitContext(); // Will use this.currentRepoPath
            const commitSummary: CommitResult = await gitContext.commit(message);

            // commitSummary.commit is usually the commit hash for successful non-merge commits.
            const commitId = commitSummary.commit;

            if (!commitId) {
                // Fallback: try to get the hash of the last commit if commitSummary.commit is empty
                console.warn(`Commit successful with message "${message}", but commit ID not directly in summary. Attempting fallback.`, commitSummary);
                const log = await gitContext.log(['-1', '--pretty=%H']);
                const lastCommitId = log.latest?.hash;
                if (lastCommitId) {
                     console.log(`Committed (fallback ID): ${lastCommitId}`);
                     return ok({ commitId: lastCommitId });
                }
                // If still no ID, it's problematic but the commit might have happened.
                return error(new DomainError("Commit successful, but failed to retrieve commit ID."));
            }
            console.log(`Committed (ID: ${commitId}): ${message}`);
            return ok({ commitId });
        } catch (e) {
            console.error(`SimpleGitAdapter.commit failed for message "${message}" in ${this.currentRepoPath}:`, e);
            return error(new DomainError(`Failed to commit to git: ${message}`, e instanceof Error ? e : undefined));
        }
    }
}
