import { z } from "zod";
import { createProject } from "@/main/ipc/project/queries";
import { ProjectSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("project.create.invoke");

// Input schema - apenas campos de negócio (sem ownerId que é adicionado automaticamente)
const CreateProjectInputSchema = ProjectSchema.pick({
  name: true,
  description: true,
  avatarUrl: true,
  gitUrl: true,
  branch: true,
  localPath: true,
  status: true,
});

// Output schema
const CreateProjectOutputSchema = ProjectSchema;

type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;
type CreateProjectOutput = z.infer<typeof CreateProjectOutputSchema>;

export default async function(input: CreateProjectInput): Promise<CreateProjectOutput> {
  logger.debug("Creating project");

  // 1. Validate input
  const validatedInput = CreateProjectInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbProject = await createProject({
    ...validatedInput,
    ownerId: currentUser.id,
  });
  
  // 4. Mapeamento: SelectProject → Project (sem campos técnicos)
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
  
  // 5. Validate output
  const result = CreateProjectOutputSchema.parse(apiProject);
  
  // 6. Emit event
  eventBus.emit("project:created", { projectId: result.id });
  
  logger.debug("Project created", { projectId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Project {
      create: (input: CreateProjectInput) => Promise<CreateProjectOutput>
    }
  }
}