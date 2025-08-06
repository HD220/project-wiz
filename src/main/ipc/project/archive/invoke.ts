import { z } from "zod";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";
import { archiveProject } from "@/main/ipc/project/queries";
import { eventBus } from "@/shared/services/events/event-bus";

const logger = getLogger("project.archive.invoke");

// Input schema - object wrapper para consistência
const ArchiveProjectInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
});

// Output schema
const ArchiveProjectOutputSchema = z.void();

type ArchiveProjectInput = z.infer<typeof ArchiveProjectInputSchema>;
type ArchiveProjectOutput = z.infer<typeof ArchiveProjectOutputSchema>;

export default async function (
  input: ArchiveProjectInput,
): Promise<ArchiveProjectOutput> {
  logger.debug("Archiving project", { projectId: input.projectId });

  // 1. Validate input
  const validatedInput = ArchiveProjectInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();

  // 3. Archive project with ownership validation
  const dbProject = await archiveProject(validatedInput.projectId, currentUser.id, currentUser.id);

  logger.debug("Project archived", {
    projectId: dbProject.id,
    name: dbProject.name,
  });

  // 4. Emit specific event for project archive
  eventBus.emit("project:archived", { projectId: dbProject.id });

  return undefined;
}

declare global {
  namespace WindowAPI {
    interface Project {
      archive: (input: ArchiveProjectInput) => Promise<ArchiveProjectOutput>;
    }
  }
}
