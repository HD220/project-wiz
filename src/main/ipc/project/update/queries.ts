import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectsTable, 
  type SelectProject, 
  type InsertProject 
} from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function updateProject(id: string, data: Partial<InsertProject>): Promise<SelectProject | null> {
  const db = getDatabase();
  
  // Check if project exists
  const [existingProject] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id))
    .limit(1);

  if (!existingProject) {
    return null;
  }

  const [updatedProject] = await db
    .update(projectsTable)
    .set(data)
    .where(eq(projectsTable.id, id))
    .returning();

  return updatedProject || null;
}