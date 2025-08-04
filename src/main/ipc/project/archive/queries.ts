import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectsTable, 
  type SelectProject 
} from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const ArchiveProjectInputSchema = z.string().min(1, "Project ID is required");

// Output validation schema baseado em SelectProject
export const ArchiveProjectOutputSchema = z.object({
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
});

export type ArchiveProjectInput = z.infer<typeof ArchiveProjectInputSchema>;
export type ArchiveProjectOutput = z.infer<typeof ArchiveProjectOutputSchema>;

export async function archiveProject(id: ArchiveProjectInput): Promise<ArchiveProjectOutput> {
  const db = getDatabase();
  
  const validatedId = ArchiveProjectInputSchema.parse(id);
  
  // Check if project exists (replicando a lógica do ProjectService.archive)
  const [existingProject] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, validatedId))
    .limit(1);

  if (!existingProject) {
    throw new Error("Project not found");
  }

  const [archivedProject] = await db
    .update(projectsTable)
    .set({ status: "archived" })
    .where(eq(projectsTable.id, validatedId))
    .returning();

  if (!archivedProject) {
    throw new Error("Failed to archive project");
  }

  return ArchiveProjectOutputSchema.parse(archivedProject);
}