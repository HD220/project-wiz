import { describe, it, expect, vi, Mocked } from "vitest";
import { GitUseCases } from "@/application/useCases/GitUseCases";
import { IGitService } from "@/core/domain/IGitService";
import {
  RepositoryInfo,
  StatusInfo,
} from "@/shared/types/git";

describe("GitUseCases", () => {
  const mockGitService = {
    addRepository: vi.fn(),
    listRepositories: vi.fn(),
    getStatus: vi.fn(),
    commitChanges: vi.fn(),
    pushChanges: vi.fn(),
    pullChanges: vi.fn(),
    createBranch: vi.fn(),
    switchBranch: vi.fn(),
    deleteBranch: vi.fn(),
    listBranches: vi.fn(),
    getHistory: vi.fn(),
    syncWithRemote: vi.fn(),
  } as Mocked<IGitService>;

  const gitUseCases = new GitUseCases(mockGitService);

  describe("addRepository", () => {
    it("should call gitService.addRepository with validated params", async () => {
      const params = { localPath: "/path", remoteUrl: "http://repo.com" };
      await gitUseCases.addRepository.execute(params.localPath, params.remoteUrl);
      expect(mockGitService.addRepository).toHaveBeenCalledWith(
        params.localPath,
        params.remoteUrl,
        undefined
      );
    
      describe("commitChanges", () => {
        it("should call gitService.commitChanges with validated params", async () => {
          const params = { repositoryId: "repo1", message: "commit message" };
          await gitUseCases.commitChanges.execute(params);
          expect(mockGitService.commitChanges).toHaveBeenCalledWith(params);
        });
      });
    
      describe("pushChanges", () => {
        it("should call gitService.pushChanges with validated params", async () => {
          const params = { repositoryId: "repo1", credentialsId: "cred1" };
          await gitUseCases.pushChanges.execute(params);
          expect(mockGitService.pushChanges).toHaveBeenCalledWith(params);
        });
      });
    
      describe("pullChanges", () => {
        it("should call gitService.pullChanges with validated params", async () => {
          const params = { repositoryId: "repo1", credentialsId: "cred1" };
          await gitUseCases.pullChanges.execute(params);
          expect(mockGitService.pullChanges).toHaveBeenCalledWith(params);
        });
      });
    
      describe("createBranch", () => {
        it("should call gitService.createBranch with validated params", async () => {
          const params = { repositoryId: "repo1", branchName: "feature" };
          await gitUseCases.createBranch.execute(params);
          expect(mockGitService.createBranch).toHaveBeenCalledWith(params);
        });
      });
    
      describe("switchBranch", () => {
        it("should call gitService.switchBranch with validated params", async () => {
          const params = { repositoryId: "repo1", branchName: "feature" };
          await gitUseCases.switchBranch.execute(params);
          expect(mockGitService.switchBranch).toHaveBeenCalledWith(params);
        });
      });
    
      describe("deleteBranch", () => {
        it("should call gitService.deleteBranch with validated params", async () => {
          const params = { repositoryId: "repo1", branchName: "feature" };
          await gitUseCases.deleteBranch.execute(params);
          expect(mockGitService.deleteBranch).toHaveBeenCalledWith(params);
        });
      });
    
      describe("listBranches", () => {
        it("should call gitService.listBranches with validated repositoryId", async () => {
          const mockBranches = [{ name: "main" }, { name: "feature" }];
          mockGitService.listBranches.mockResolvedValue([
            { name: "main", isCurrent: true, isRemote: false },
            { name: "feature", isCurrent: false, isRemote: false }
          ]);
          const result = await gitUseCases.listBranches.execute("repo1");
          expect(result).toEqual([
            { name: "main", isCurrent: true, isRemote: false },
            { name: "feature", isCurrent: false, isRemote: false }
          ]);
        });
      });

      describe("getHistory", () => {
        it("should call gitService.getHistory with validated params", async () => {
          const mockCommits = [{
            id: "1",
            message: "commit",
            hash: "abc123",
            author: "dev",
            date: new Date().toISOString()
          }];
          mockGitService.getHistory.mockResolvedValue(mockCommits);
          const result = await gitUseCases.getHistory.execute("repo1", "main");
          expect(result).toEqual(mockCommits);
        });
      });
    
      describe("syncWithRemote", () => {
        it("should call gitService.syncWithRemote with validated params", async () => {
          await gitUseCases.syncWithRemote.execute("repo1", "cred1");
          expect(mockGitService.syncWithRemote).toHaveBeenCalledWith("repo1", "cred1");
        });
      });
    });
  });

  describe("listRepositories", () => {
    it("should call gitService.listRepositories", async () => {
      const mockRepos: RepositoryInfo[] = [{
        id: "repo1",
        name: "Test Repo",
        localPath: "/path",
        remoteUrl: "http://repo.com",
        currentBranch: "main"
      }];
      
      mockGitService.listRepositories.mockResolvedValue(mockRepos);
      const result = await gitUseCases.listRepositories.execute();
      expect(result).toEqual(mockRepos);
    });
  });

  describe("getStatus", () => {
    it("should call gitService.getStatus with validated repositoryId", async () => {
      const mockStatus: StatusInfo = {
        modified: ["file1.txt"],
        staged: ["file2.txt"],
        untracked: [],
        conflicted: []
      };
      
      mockGitService.getStatus.mockResolvedValue(mockStatus);
      const result = await gitUseCases.getStatus.execute("repo1");
      expect(result).toEqual(mockStatus);
    });
  });

  // Additional tests for other use cases would follow the same pattern
});