import { eq } from "drizzle-orm";

import {
  projectsTable,
  type SelectProject,
} from "@/main/database/schemas/project.schema";

import { createDatabaseConnection } from "@/shared/database/config";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function archiveProject(
  id: string,
  _archivedBy: string,
): Promise<SelectProject> {
  const db = getDatabase();

  // Check if project exists
  const [existingProject] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id))
    .limit(1);

  if (!existingProject) {
    throw new Error("Project not found");
  }

  const [archivedProject] = await db
    .update(projectsTable)
    .set({ status: "archived" })
    .where(eq(projectsTable.id, id))
    .returning();

  if (!archivedProject) {
    throw new Error("Failed to archive project");
  }

  return archivedProject;
}
