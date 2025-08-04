import { 
  findProjectById,
  type FindProjectByIdInput,
  type FindProjectByIdOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("project.find-by-id.invoke");

export default async function(id: FindProjectByIdInput): Promise<FindProjectByIdOutput> {
  logger.debug("Finding project by ID", { projectId: id });

  // Execute core business logic
  const result = await findProjectById(id);
  
  logger.debug("Project found", { found: !!result, projectId: id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Project {
      findById: (id: FindProjectByIdInput) => Promise<FindProjectByIdOutput>
    }
  }
}