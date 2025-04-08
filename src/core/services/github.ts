import { Octokit } from "octokit";

class GithubService {
  private octokit: Octokit;

  constructor() {
    const auth = process.env.GITHUB_TOKEN;
    this.octokit = new Octokit({ auth });
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body: string
  ) {
    try {
      const response = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao criar pull request:", error);
      throw error;
    }
  }

  async getIssue(owner: string, repo: string, issue_number: number) {
    try {
      const response = await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao obter issue:", error);
      throw error;
    }
  }
}

export default GithubService;
