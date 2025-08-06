import { z } from "zod";
import { updateProject } from "@/main/ipc/project/queries";
import { ProjectSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("project.update.invoke");

const UpdateProjectInputSchema = ProjectSchema.pick({
  name: true,
  description: true,
  avatarUrl: true,
  gitUrl: true,
  branch: true,
  localPath: true,
  status: true,
}).partial().extend({
  id: z.string(),
});

const UpdateProjectOutputSchema = ProjectSchema;

const handler = createIPCHandler({
  inputSchema: UpdateProjectInputSchema,
  outputSchema: UpdateProjectOutputSchema,
  handler: async (input) => {
    logger.debug("Updating project", { projectId: input.id });
  
    const currentUser = requireAuth();
    
    // Separate id from update data
    const { id, ...updateData } = input;
    
    // Query executa update e retorna SelectProject with ownership validation
    const dbProject = await updateProject({
      id,
      ownerId: currentUser.id,
      ...updateData
    });
    
    if (!dbProject) {
      throw new Error("Project not found or access denied");
    }
    
    // Mapeamento: SelectProject → Project (sem campos técnicos)
    const apiProject = {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description,
      avatarUrl: dbProject.avatarUrl,
      gitUrl: dbProject.gitUrl,
      branch: dbProject.branch,
      localPath: dbProject.localPath,
      status: dbProject.status,
      ownerId: dbProject.ownerId,
      createdAt: new Date(dbProject.createdAt),
      updatedAt: new Date(dbProject.updatedAt),
    };
    
    // Emit event
    eventBus.emit("project:updated", { projectId: apiProject.id });
    
    logger.debug("Project updated", { projectId: apiProject.id, name: apiProject.name });
    
    return apiProject;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Project {
      update: InferHandler<typeof handler>
    }
  }
}