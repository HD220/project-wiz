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
export async function createProject(data: InsertProject): Promise<SelectProject> {
  const db = getDatabase();
  
  const [newProject] = await db
    .insert(projectsTable)
    .values(data)
    .returning();

  if (!newProject) {
    throw new Error(`Failed to create project "${data.name}"`);
  }

  return newProject;
}