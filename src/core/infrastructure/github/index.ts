import { Octokit } from "octokit";

/**
 * Service for integration with the GitHub API.
 * 
 * Supports authenticated mode (with token) and anonymous mode (without token).
 * The token can be dynamically configured at runtime.
 */
class GithubService {
  private octokit: Octokit;
  private token: string | null = null;

  constructor() {
    // Initializes in anonymous mode by default
    this.octokit = new Octokit();
  }

  /**
   * Sets or removes the GitHub access token.
   * 
   * - If `token` is a string, enables authenticated mode.
   * - If `token` is `null`, uses anonymous mode (public operations only).
   * 
   * @param token Personal Access Token or null for anonymous mode
   */
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      this.octokit = new Octokit({ auth: token });
    } else {
      this.octokit = new Octokit();
    }
  }

  /**
   * Creates an authenticated Pull Request in the specified repository.
   * 
   * @param owner Repository owner
   * @param repo Repository name
   * @param title Pull Request title
   * @param head Source branch (e.g., feature-branch)
   * @param base Target branch (e.g., main)
   * @param body (optional) Pull Request description
   * @returns Created PR data or detailed error
   */
  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ) {
    try {
      const response = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body,
        // Future: add support for draft (draft: true)
        // Future: add reviewers via API after creation
      });
      return response.data;
    } catch (error: any) {
      // Detailed handling of common errors
      if (error.status === 422) {
        // Example: non-existent branch or PR already exists
        return {
          error: true,
          message: "Failed to create Pull Request: check if the branches exist and if there is already an open PR between them.",
          details: error.response?.data || error.message,
        };
      } else if (error.status === 403) {
        return {
          error: true,
          message: "Permission denied to create Pull Request. Check the token and permissions.",
          details: error.response?.data || error.message,
        };
      } else {
        return {
          error: true,
          message: "Unexpected error while creating Pull Request.",
          details: error.response?.data || error.message,
        };
      }
    }
  }

  /**
   * Gets an issue from the specified repository.
   */
  async getIssue(owner: string, repo: string, issue_number: number) {
    try {
      const response = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number,
      });
      return response.data;
    } catch (error) {
      console.error("Error getting issue:", error);
      throw error;
    }
  }
}

export default GithubService;
