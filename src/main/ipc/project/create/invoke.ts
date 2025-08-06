import { createProject } from "@/main/ipc/project/queries";
import { ProjectSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

const logger = getLogger("project.create.invoke");

const CreateProjectInputSchema = ProjectSchema.pick({
  name: true,
  description: true,
  avatarUrl: true,
  gitUrl: true,
  branch: true,
  localPath: true,
});

const CreateProjectOutputSchema = ProjectSchema;

const handler = createIPCHandler({
  inputSchema: CreateProjectInputSchema,
  outputSchema: CreateProjectOutputSchema,
  handler: async (input) => {
    logger.debug("Creating project");

    const currentUser = requireAuth();
    
    // Query recebe dados e gerencia campos técnicos internamente
    const dbProject = await createProject({
      ...input,
      ownerId: currentUser.id,
    });
    
    // Mapeamento: SelectProject → Project
    const apiProject = {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description,
      avatarUrl: dbProject.avatarUrl,
      gitUrl: dbProject.gitUrl,
      branch: dbProject.branch,
      localPath: dbProject.localPath,
      ownerId: dbProject.ownerId,
      isActive: dbProject.isActive,
      isArchived: dbProject.isArchived,
      createdAt: new Date(dbProject.createdAt),
      updatedAt: new Date(dbProject.updatedAt),
    };
    
    // Emit event
    eventBus.emit("project:created", { projectId: apiProject.id });
    
    logger.debug("Project created", { projectId: apiProject.id });
    
    return apiProject;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Project {
      create: InferHandler<typeof handler>
    }
  }
}