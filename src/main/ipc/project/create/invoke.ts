import { 
  createProject,
  type CreateProjectInput,
  type CreateProjectOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/main/core/event-bus";

const logger = getLogger("project.create.invoke");

export default async function(params: CreateProjectInput): Promise<CreateProjectOutput> {
  logger.debug("Creating project", { name: params.name });

  // 1. Check authentication (replicando a lógica do handler original)
  const currentUser = requireAuth();
  
  // 2. Ensure ownerId is set to current user
  const projectData = {
    ...params,
    ownerId: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await createProject(projectData);
  
  // 4. Emit specific event for project creation
  eventBus.emit("project:created", { projectId: result.id });
  
  logger.debug("Project created", { projectId: result.id, name: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Project {
      create: (params: CreateProjectInput) => Promise<CreateProjectOutput>
    }
  }
}