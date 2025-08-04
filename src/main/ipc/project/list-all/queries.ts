import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectsTable, 
  type SelectProject 
} from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

export async function listAllProjects(): Promise<SelectProject[]> {
  const db = getDatabase();
  
  // Replicando a lógica do ProjectService.listAll (apenas projetos ativos)
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.status, "active"));

  return projects;
}