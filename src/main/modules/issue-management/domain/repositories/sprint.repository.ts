import { Sprint } from "../entities/sprint.entity";

export interface SprintRepository {
  save(sprint: Sprint): Promise<void>;
  findById(id: string): Promise<Sprint | null>;
  findByProjectId(projectId: string): Promise<Sprint[]>;
  delete(id: string): Promise<void>;
}
