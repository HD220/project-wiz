# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-01-worker-git-worktrees/spec.md

## Architecture Overview

### Git Worktree Fundamentals

**Git Worktree Concept:**
- Single `.git` repository with multiple working directories
- Each worktree can have different branch checked out
- Shared object database and configuration
- Independent working directory file states

**Advantages for Concurrent Tasks:**
- Complete file system isolation between tasks
- Shared git history and object storage
- Independent branch operations
- Automatic cleanup capabilities

### Current Worker Architecture Analysis

**Existing Worker System:**
- Worker threads execute in `src/worker/` directory
- Tasks receive job data via messaging
- Currently no file system workspace management
- Limited to in-memory or temporary file operations

**Integration Requirements:**
- Extend existing worker task execution with git workspace setup
- Maintain current messaging patterns and job lifecycle
- Add workspace cleanup to existing task completion flow

## Technical Requirements

### 1. Repository Storage Management

**Storage Structure:**
```
~/.project-wiz/repositories/
├── {repository-hash}/
│   ├── .git/                    # Main repository
│   ├── main/                    # Default worktree
│   └── worktrees/
│       ├── task-{uuid-1}/       # Agent task worktree 1
│       ├── task-{uuid-2}/       # Agent task worktree 2
│       └── ...
```

**Repository Identification:**
- Generate consistent hash from git remote URL
- Handle URL normalization (https vs ssh, trailing slashes)
- Support subdirectory specifications for monorepos

### 2. Git Repository Service

**Core Repository Management:**
```typescript
interface GitRepository {
  id: string;           // Hash of repository URL
  url: string;          // Original git URL
  localPath: string;    // Path to main repository
  lastUpdated: Date;    // Last fetch/pull timestamp
  activeWorktrees: Set<string>; // Active worktree IDs
}

class GitRepositoryService {
  async cloneOrUpdate(url: string): Promise<GitRepository>
  async createWorktree(repoId: string, branch: string, taskId: string): Promise<string>
  async removeWorktree(repoId: string, taskId: string): Promise<void>
  async listWorktrees(repoId: string): Promise<WorktreeInfo[]>
  async cleanup(): Promise<void>
}
```

**Repository Operations:**
- Initial clone with `--bare` flag for efficient worktree creation
- Periodic `git fetch` to keep repository updated
- Branch validation and creation as needed
- Remote tracking branch management

### 3. Worktree Orchestration

**Worktree Lifecycle Management:**
```typescript
interface WorktreeContext {
  taskId: string;
  repoId: string;
  branch: string;
  workingDirectory: string;
  createdAt: Date;
  lastAccessed: Date;
}

class WorktreeManager {
  async setupTaskWorkspace(repoUrl: string, branch: string, taskId: string): Promise<WorktreeContext>
  async cleanupTaskWorkspace(taskId: string): Promise<void>
  async getActiveWorktrees(): Promise<WorktreeContext[]>
  async performMaintenance(): Promise<void>
}
```

**Worktree Creation Process:**
1. Ensure repository is cloned and updated
2. Validate or create target branch
3. Create worktree with unique directory name
4. Set up worktree environment variables
5. Return working directory path to task

### 4. Branch Management Strategy

**Branch Naming Convention:**
- Feature branches: `feature/task-{uuid}`
- Bug fix branches: `fix/task-{uuid}`
- Agent-specific branches: `agent/{agent-name}/task-{uuid}`

**Branch Synchronization:**
- Fetch latest changes before worktree creation
- Handle remote branch tracking
- Support both existing and new branch creation
- Automatic branch cleanup for completed tasks

### 5. Task Integration Patterns

**Worker Task Enhancement:**
```typescript
interface TaskExecutionContext {
  // Existing context
  taskId: string;
  jobData: any;
  
  // New git context
  workspace?: {
    workingDirectory: string;
    repoUrl: string;
    branch: string;
    commitSha: string;
  };
}

// Enhanced task execution flow
async function executeTaskWithGitWorkspace(context: TaskExecutionContext) {
  let workspace: WorktreeContext | null = null;
  
  try {
    // 1. Setup git workspace if repository specified
    if (context.jobData.repositoryUrl) {
      workspace = await WorktreeManager.setupTaskWorkspace(
        context.jobData.repositoryUrl,
        context.jobData.branch || 'main',
        context.taskId
      );
      
      // Update task context with workspace info
      context.workspace = {
        workingDirectory: workspace.workingDirectory,
        repoUrl: context.jobData.repositoryUrl,
        branch: workspace.branch,
        commitSha: await getLatestCommitSha(workspace.workingDirectory)
      };
    }
    
    // 2. Execute existing task logic with workspace context
    const result = await executeTask(context);
    
    // 3. Handle git operations if needed (commit, push, etc.)
    if (workspace && result.gitOperations) {
      await performGitOperations(workspace, result.gitOperations);
    }
    
    return result;
    
  } finally {
    // 4. Cleanup workspace
    if (workspace) {
      await WorktreeManager.cleanupTaskWorkspace(context.taskId);
    }
  }
}
```

### 6. Resource Management and Cleanup

**Automatic Cleanup Strategies:**
- Remove worktrees after task completion (success or failure)
- Periodic cleanup of abandoned worktrees (age-based)
- Repository maintenance (gc, prune) on schedule
- Disk space monitoring and alerts

**Cleanup Implementation:**
```typescript
class WorktreeCleanupService {
  async cleanupCompletedTasks(): Promise<void>
  async cleanupAbandonedWorktrees(maxAge: Duration): Promise<void>
  async performRepositoryMaintenance(): Promise<void>
  async getDiskUsageStats(): Promise<DiskUsageInfo>
}
```

### 7. Error Handling and Recovery

**Error Scenarios:**
- Repository clone failures (network, permissions)
- Worktree creation conflicts (branch issues, disk space)
- Git command failures during task execution
- Cleanup failures leaving orphaned worktrees

**Recovery Mechanisms:**
- Retry logic for transient failures
- Graceful degradation when git operations fail
- Manual cleanup utilities for maintenance
- Detailed logging for troubleshooting

### 8. Performance Optimization

**Optimization Strategies:**
- Shallow clones for repositories with large history
- Parallel worktree creation for multiple tasks
- Efficient branch tracking without full checkouts
- Background repository updates during low usage

**Resource Limits:**
- Maximum number of concurrent worktrees per repository
- Disk space limits with automatic cleanup
- Memory usage monitoring for git operations
- CPU throttling for intensive git commands

### 9. Security Considerations

**File System Security:**
- Proper file permissions on worktree directories
- Isolation between task workspaces
- Secure cleanup of sensitive file contents
- Path traversal prevention

**Git Security:**
- Repository URL validation and sanitization
- Safe handling of git credentials
- Prevention of malicious git hook execution
- Secure temporary file handling

## Integration Points

### 1. Project Configuration

**Repository Association:**
- Add repository URL field to project metadata
- Support multiple repositories per project
- Branch preference configuration per project
- Optional subdirectory specifications

**Database Schema:**
```sql
-- Add to existing projects table
ALTER TABLE projects ADD repository_url TEXT;
ALTER TABLE projects ADD default_branch TEXT DEFAULT 'main';
ALTER TABLE projects ADD repository_subdirectory TEXT;
```

### 2. Task Job Data Enhancement

**Extended Job Data Structure:**
```typescript
interface EnhancedJobData {
  // Existing fields
  agent: AgentConfig;
  messages: Message[];
  provider: string;
  model: string;
  apiKey: string;
  
  // New git workspace fields
  repositoryUrl?: string;
  branch?: string;
  subdirectory?: string;
  gitOperations?: {
    commitChanges?: boolean;
    pushChanges?: boolean;
    createPullRequest?: boolean;
  };
}
```

### 3. Tool Integration

**Git-aware Tools:**
- File system operations within workspace context
- Git command execution tools
- Repository analysis and navigation tools
- Branch and commit management tools

## External Dependencies

**New Dependencies Required:**
- **simple-git**: Node.js git command wrapper for complex operations
  - Justification: Provides safe, promise-based git command execution
  - Version: ^3.19.0 (latest stable)

**System Requirements:**
- Git binary available in system PATH
- Sufficient disk space for repository storage
- File system support for symbolic links (worktree requirements)