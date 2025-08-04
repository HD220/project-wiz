import { z } from "zod";
import { listAllProjects } from "./queries";
import { ProjectSchema } from "@/shared/types";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("project.list-all.invoke");

// Output validation schema
const OutputSchema = z.array(ProjectSchema);
type Output = z.infer<typeof OutputSchema>;

export default async function(): Promise<Output> {
  logger.debug("Listing all active projects");

  // Execute core business logic
  const projects = await listAllProjects();
  
  // Map to clean domain type (remove technical fields)
  const result = projects.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description,
    avatarUrl: project.avatarUrl,
    gitUrl: project.gitUrl,
    branch: project.branch,
    localPath: project.localPath,
    ownerId: project.ownerId,
    status: project.status,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  }));
  
  logger.debug("Listed all active projects", { count: result.length });
  
  return OutputSchema.parse(result);
}

declare global {
  namespace WindowAPI {
    interface Project {
      listAll: () => Promise<Output>
    }
  }
}