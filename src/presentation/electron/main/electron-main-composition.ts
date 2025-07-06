import { InMemoryProjectRepository } from "@/infrastructure/persistence/repositories/in-memory-project.repository";

import { registerProjectHandlers } from "@/presentation/electron/main/handlers/project.handlers";

export function composeMainProcessHandlers() {
  const projectRepository = new InMemoryProjectRepository();
  registerProjectHandlers(projectRepository);
}
