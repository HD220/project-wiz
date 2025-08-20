import { z } from "zod";

import { unarchiveProject } from "@/main/ipc/project/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { ProjectSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("project.unarchive.invoke");

const UnarchiveProjectInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
});

const UnarchiveProjectOutputSchema = ProjectSchema;

const handler = createIPCHandler({
  inputSchema: UnarchiveProjectInputSchema,
  outputSchema: UnarchiveProjectOutputSchema,
  handler: async (input) => {
    logger.debug("Unarchiving project", {
      projectId: input.projectId,
    });

    const currentUser = requireAuth();

    // Unarchive the project
    const project = await unarchiveProject(input.projectId, currentUser.id);

    logger.debug("Project unarchived", {
      projectId: project.id,
      name: project.name,
    });

    // Emit reactive event
    emit("event:projects", {
      action: "unarchived",
      key: project.id,
      projectId: project.id,
      userId: currentUser.id,
    });

    return project;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Project {
      unarchive: InferHandler<typeof handler>;
    }
  }
}
