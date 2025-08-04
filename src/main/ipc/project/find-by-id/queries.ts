import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectsTable, 
  type SelectProject 
} from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

export async function findProjectById(id: string): Promise<SelectProject | null> {
  const db = getDatabase();
  
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id))
    .limit(1);

  if (!project) {
    return null;
  }

  return project;
}