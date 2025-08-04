import { 
  archiveProject,
  type ArchiveProjectInput,
  type ArchiveProjectOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/main/core/event-bus";

const logger = getLogger("project.archive.invoke");

export default async function(id: ArchiveProjectInput): Promise<ArchiveProjectOutput> {
  logger.debug("Archiving project", { projectId: id });

  // Execute core business logic
  const result = await archiveProject(id);
  
  // Emit specific event for project archival
  eventBus.emit("project:archived", { projectId: result.id });
  
  logger.debug("Project archived", { projectId: result.id, name: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Project {
      archive: (id: ArchiveProjectInput) => Promise<ArchiveProjectOutput>
    }
  }
}