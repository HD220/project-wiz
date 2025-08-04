import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectsTable, 
  type SelectProject 
} from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const FindProjectByIdInputSchema = z.string().min(1, "Project ID is required");

// Output validation schema baseado em SelectProject
export const FindProjectByIdOutputSchema = z.object({
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
}).nullable();

export type FindProjectByIdInput = z.infer<typeof FindProjectByIdInputSchema>;
export type FindProjectByIdOutput = z.infer<typeof FindProjectByIdOutputSchema>;

export async function findProjectById(id: FindProjectByIdInput): Promise<FindProjectByIdOutput> {
  const db = getDatabase();
  
  const validatedId = FindProjectByIdInputSchema.parse(id);
  
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, validatedId))
    .limit(1);

  if (!project) {
    return null;
  }

  return FindProjectByIdOutputSchema.parse(project);
}