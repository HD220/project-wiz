import GithubService from "../services/github";
import { Octokit } from "octokit";

jest.mock("octokit");

describe("GithubService", () => {
  let githubService: GithubService;
  let octokitMock: jest.Mocked<Octokit>;

  beforeEach(() => {
    octokitMock = {
      rest: {
        pulls: {
          create: jest.fn(),
        },
        issues: {
          get: jest.fn(),
        },
      },
    } as unknown as jest.Mocked<Octokit>;

    (Octokit as jest.Mock).mockImplementation(() => octokitMock);

    githubService = new GithubService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPullRequest", () => {
    it("should create a pull request successfully", async () => {
      const owner = "owner";
      const repo = "repo";
      const title = "title";
      const head = "head";
      const base = "base";
      const body = "body";

      const mockResponse = {
        data: {
          html_url: "https://github.com/owner/repo/pull/123",
        },
      };

      octokitMock.rest.pulls.create.mockResolvedValue(mockResponse as any);

      const result = await githubService.createPullRequest(owner, repo, title, head, base, body);

      expect(octokitMock.rest.pulls.create).toHaveBeenCalledWith({
        owner,
        repo,
        title,
        head,
        base,
        body,
      });

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if pull request creation fails", async () => {
      const owner = "owner";
      const repo = "repo";
      const title = "title";
      const head = "head";
      const base = "base";
      const body = "body";

      octokitMock.rest.pulls.create.mockRejectedValue(new Error("Pull request creation failed"));

      await expect(
        githubService.createPullRequest(owner, repo, title, head, base, body)
      ).rejects.toThrow("Pull request creation failed");
    });
  });

  describe("getIssue", () => {
    it("should get an issue successfully", async () => {
      const owner = "owner";
      const repo = "repo";
      const issue_number = 123;

      const mockResponse = {
        data: {
          title: "Issue title",
        },
      };

      octokitMock.rest.issues.get.mockResolvedValue(mockResponse as any);

      const result = await githubService.getIssue(owner, repo, issue_number);

      expect(octokitMock.rest.issues.get).toHaveBeenCalledWith({
        owner,
        repo,
        issue_number,
      });

      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if getting the issue fails", async () => {
      const owner = "owner";
      const repo = "repo";
      const issue_number = 123;

      octokitMock.rest.issues.get.mockRejectedValue(new Error("Getting issue failed"));

      await expect(githubService.getIssue(owner, repo, issue_number)).rejects.toThrow(
        "Getting issue failed"
      );
    });
  });
});