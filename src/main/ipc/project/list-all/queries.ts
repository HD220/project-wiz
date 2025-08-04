import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectsTable, 
  type SelectProject 
} from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema (sem parâmetros)
export const ListAllProjectsInputSchema = z.void();

// Output validation schema baseado em SelectProject[]
export const ListAllProjectsOutputSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  gitUrl: z.string().nullable(),
  branch: z.string().nullable(),
  localPath: z.string(),
  ownerId: z.string(),
  status: z.enum(["active", "archived"]),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
}));

export type ListAllProjectsInput = z.infer<typeof ListAllProjectsInputSchema>;
export type ListAllProjectsOutput = z.infer<typeof ListAllProjectsOutputSchema>;

export async function listAllProjects(): Promise<ListAllProjectsOutput> {
  const db = getDatabase();
  
  // Replicando a lógica do ProjectService.listAll (apenas projetos ativos)
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.status, "active"));

  return ListAllProjectsOutputSchema.parse(projects);
}