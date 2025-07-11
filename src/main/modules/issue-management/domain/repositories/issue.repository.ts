import { Issue } from "../entities/issue.entity";

export interface IssueRepository {
  save(issue: Issue): Promise<void>;
  findById(id: string): Promise<Issue | null>;
  findByProjectId(projectId: string): Promise<Issue[]>;
  delete(id: string): Promise<void>;
}
