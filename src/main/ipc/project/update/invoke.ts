import { 
  updateProject,
  type UpdateProjectInput,
  type UpdateProjectOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/main/core/event-bus";

const logger = getLogger("project.update.invoke");

export default async function(params: UpdateProjectInput): Promise<UpdateProjectOutput> {
  logger.debug("Updating project", { projectId: params.id });

  // Execute core business logic
  const result = await updateProject(params);
  
  // Emit specific event for project update
  eventBus.emit("project:updated", { projectId: result.id });
  
  logger.debug("Project updated", { projectId: result.id, name: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Project {
      update: (params: UpdateProjectInput) => Promise<UpdateProjectOutput>
    }
  }
}