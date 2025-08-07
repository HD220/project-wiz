import { z } from "zod";

import { archiveProject } from "@/main/ipc/project/queries";
import { requireAuth } from "@/main/services/session-registry";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("project.archive.invoke");

const ArchiveProjectInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
});

const ArchiveProjectOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: ArchiveProjectInputSchema,
  outputSchema: ArchiveProjectOutputSchema,
  handler: async (input) => {
    logger.debug("Archiving project", { projectId: input.projectId });

    const currentUser = requireAuth();

    // Archive project with ownership validation
    const dbProject = await archiveProject(input.projectId, currentUser.id);

    logger.debug("Project archived", {
      projectId: dbProject.id,
      name: dbProject.name,
    });

    // Emit specific event for project archive
    eventBus.emit("project:archived", { projectId: dbProject.id });

    return undefined;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Project {
      archive: InferHandler<typeof handler>;
    }
  }
}
