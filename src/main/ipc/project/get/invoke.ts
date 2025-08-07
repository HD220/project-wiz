import { z } from "zod";

import { findProject } from "@/main/ipc/project/queries";
import { requireAuth } from "@/main/services/session-registry";

import { getLogger } from "@/shared/services/logger/config";
import { ProjectSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("project.find-by-id.invoke");

const GetProjectInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
});

const GetProjectOutputSchema = ProjectSchema.nullable();

const handler = createIPCHandler({
  inputSchema: GetProjectInputSchema,
  outputSchema: GetProjectOutputSchema,
  handler: async (input) => {
    logger.debug("Finding project by ID", { projectId: input.projectId });

    // Require authentication and validate ownership
    const currentUser = requireAuth();
    const result = await findProject(input.projectId, currentUser.id);

    if (!result) {
      logger.debug("Project not found or access denied", {
        projectId: input.projectId,
      });
      return null;
    }

    // Map database result to public schema
    const publicProject = {
      id: result.id,
      name: result.name,
      description: result.description,
      avatarUrl: result.avatarUrl,
      gitUrl: result.gitUrl,
      branch: result.branch,
      localPath: result.localPath,
      ownerId: result.ownerId,
      deactivatedAt: result.deactivatedAt
        ? new Date(result.deactivatedAt)
        : null,
      archivedAt: result.archivedAt ? new Date(result.archivedAt) : null,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };

    logger.debug("Project found", { projectId: input.projectId });

    return publicProject;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Project {
      get: InferHandler<typeof handler>;
    }
  }
}
