import { 
  listAllProjects,
  type ListAllProjectsOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("project.list-all.invoke");

export default async function(): Promise<ListAllProjectsOutput> {
  logger.debug("Listing all active projects");

  // Execute core business logic
  const result = await listAllProjects();
  
  logger.debug("Listed all active projects", { count: result.length });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Project {
      listAll: () => Promise<ListAllProjectsOutput>
    }
  }
}