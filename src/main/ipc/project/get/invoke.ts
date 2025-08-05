import { z } from "zod";
import { findProject } from "@/main/ipc/project/queries";
import { ProjectSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("project.find-by-id.invoke");

// Input/Output schemas
const InputSchema = z.string().min(1);
const OutputSchema = ProjectSchema.nullable();

export default async function(input: unknown): Promise<z.infer<typeof OutputSchema>> {
  const id = InputSchema.parse(input);
  
  logger.debug("Finding project by ID", { projectId: id });

  // Require authentication and validate ownership
  const currentUser = requireAuth();
  const result = await findProject(id, currentUser.id);
  
  if (!result) {
    logger.debug("Project not found or access denied", { projectId: id });
    return null;
  }

  // Map database result to public schema (remove technical fields)
  const publicProject = {
    id: result.id,
    name: result.name,
    description: result.description,
    avatarUrl: result.avatarUrl,
    gitUrl: result.gitUrl,
    branch: result.branch,
    localPath: result.localPath,
    ownerId: result.ownerId,
    status: result.status,
    createdAt: new Date(result.createdAt),
    updatedAt: new Date(result.updatedAt),
  };
  
  logger.debug("Project found", { projectId: id });
  
  return OutputSchema.parse(publicProject);
}

declare global {
  namespace WindowAPI {
    interface Project {
      findById: (id: string) => Promise<z.infer<typeof ProjectSchema> | null>
    }
  }
}