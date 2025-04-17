import { describe, it, expect, vi, Mocked, beforeAll } from "vitest";
import { GitUseCases } from "@/application/useCases/GitUseCases";
import { IGitService } from "@/core/domain/IGitService";
import { GitErrorCode } from "@/shared/types/errors";

describe("GitUseCases Integration", () => {
  let gitUseCases: GitUseCases;
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

  beforeAll(() => {
    // Configura mocks para lançar erros de validação
    mockGitService.addRepository.mockImplementation(() => {
      throw new Error('Invalid parameters provided');
    });
    mockGitService.createBranch.mockImplementation(() => {
      throw new Error('Invalid branch name');
    });
    mockGitService.syncWithRemote.mockImplementation(() => {
      throw new Error('Invalid credentials provided');
    });
    
    gitUseCases = new GitUseCases(mockGitService);
  });

  describe("Repository Operations", () => {
    it("should throw validation error for invalid repository path", async () => {
      await expect(
        gitUseCases.addRepository.execute("", "http://invalid.com")
      ).rejects.toThrowError(GitErrorCode.INVALID_PARAMS);
    });
  });

  describe("Branch Operations", () => {
    it("should throw validation error for invalid branch name", async () => {
      await expect(
        gitUseCases.createBranch.execute({ repositoryId: "repo1", branchName: "" })
      ).rejects.toThrowError(GitErrorCode.INVALID_BRANCH_NAME);
    });
  });

  describe("Remote Operations", () => {
    it("should throw validation error for invalid credentials", async () => {
      await expect(
        gitUseCases.syncWithRemote.execute("repo1", "")
      ).rejects.toThrowError(GitErrorCode.INVALID_CREDENTIALS);
    });
  });
});