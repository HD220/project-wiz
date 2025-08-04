import { z } from "zod";
import { updateProject } from "./queries";
import { ProjectSchema } from "@/shared/types";
import { getLogger } from "@/shared/logger/config";
import { eventBus } from "@/shared/events/event-bus";

const logger = getLogger("project.update.invoke");

// Input schema - campos para update + id obrigatório
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

// Output schema
const UpdateProjectOutputSchema = ProjectSchema;

type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
type UpdateProjectOutput = z.infer<typeof UpdateProjectOutputSchema>;

export default async function(input: UpdateProjectInput): Promise<UpdateProjectOutput> {
  logger.debug("Updating project", { projectId: input.id });

  // 1. Validate input
  const validatedInput = UpdateProjectInputSchema.parse(input);
  
  // 2. Separate id from update data
  const { id, ...updateData } = validatedInput;
  
  // 3. Query executa update e retorna SelectProject
  const dbProject = await updateProject(id, updateData);
  
  if (!dbProject) {
    throw new Error("Project not found");
  }
  
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
  const result = UpdateProjectOutputSchema.parse(apiProject);
  
  // 6. Emit event
  eventBus.emit("project:updated", { projectId: result.id });
  
  logger.debug("Project updated", { projectId: result.id, name: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Project {
      update: (input: UpdateProjectInput) => Promise<UpdateProjectOutput>
    }
  }
}