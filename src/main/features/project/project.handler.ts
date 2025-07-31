import { AuthService } from "@/main/features/auth/auth.service";
import type {
  InsertProject,
  UpdateProject,
} from "@/main/features/project/project.model";
import { ProjectService } from "@/main/features/project/project.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

/**
 * Setup project IPC handlers
 * Exposes ProjectService methods to the frontend via IPC
 */
export function setupProjectHandlers(): void {
  // Create project (with session-based auth)
  createIpcHandler("projects:create", async (input: InsertProject) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return ProjectService.create(input);
  });

  // Find project by ID
  createIpcHandler("projects:findById", (id: string) =>
    ProjectService.findById(id),
  );

  // List all projects
  createIpcHandler("projects:listAll", () => ProjectService.listAll());

  // Update project
  createIpcHandler("projects:update", (input: UpdateProject) =>
    ProjectService.update(input),
  );

  // Archive project
  createIpcHandler("projects:archive", (id: string) =>
    ProjectService.archive(id),
  );
}
