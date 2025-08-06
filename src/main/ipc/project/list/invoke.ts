import { z } from "zod";
import { listProjects } from "@/main/ipc/project/queries";
import { ProjectSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("project.list-all.invoke");

const ListProjectsInputSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});
const ListProjectsOutputSchema = z.array(ProjectSchema);

const handler = createIPCHandler({
  inputSchema: ListProjectsInputSchema,
  outputSchema: ListProjectsOutputSchema,
  handler: async (input) => {
    logger.debug("Listing projects", input);

    // Require authentication and filter by ownership
    const currentUser = requireAuth();
    const projects = await listProjects({ 
      ownerId: currentUser.id,
      search: input.search,
      isActive: input.isActive,
      isArchived: input.isArchived
    });
    
    // Map database SelectProject to domain Project type
    const result = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      avatarUrl: project.avatarUrl,
      gitUrl: project.gitUrl,
      branch: project.branch,
      localPath: project.localPath,
      ownerId: project.ownerId,
      isActive: project.isActive,
      isArchived: project.isArchived,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    }));
    
    logger.debug("Listed all active projects", { count: result.length });
    
    return result;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Project {
      list: InferHandler<typeof handler>
    }
  }
}