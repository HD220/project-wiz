import { IProjectRepository } from "@/core/domain/repositories/project.repository";

import { InMemoryProjectRepository } from "@/infrastructure/persistence/repositories/in-memory-project.repository";

export function makeProjectRepository(): IProjectRepository {
  return new InMemoryProjectRepository();
}
