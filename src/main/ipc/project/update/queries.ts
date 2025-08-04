import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectsTable, 
  type SelectProject, 
  type UpdateProject 
} from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema baseado em UpdateProject
export const UpdateProjectInputSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  gitUrl: z.string().optional(), 
  branch: z.string().optional(),
  localPath: z.string().min(1, "Local path is required").optional(),
  ownerId: z.string().min(1, "Owner ID is required").optional(),
  status: z.enum(["active", "archived"]).optional(),
});

// Output validation schema baseado em SelectProject
export const UpdateProjectOutputSchema = z.object({
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

export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
export type UpdateProjectOutput = z.infer<typeof UpdateProjectOutputSchema>;

export async function updateProject(input: UpdateProjectInput): Promise<UpdateProjectOutput> {
  const db = getDatabase();
  
  const validatedInput = UpdateProjectInputSchema.parse(input);
  
  // Check if project exists (replicando a lógica do ProjectService.update)
  const [existingProject] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, validatedInput.id))
    .limit(1);

  if (!existingProject) {
    throw new Error("Project not found");
  }

  const [updatedProject] = await db
    .update(projectsTable)
    .set(validatedInput)
    .where(eq(projectsTable.id, validatedInput.id))
    .returning();

  if (!updatedProject) {
    throw new Error("Failed to update project");
  }

  return UpdateProjectOutputSchema.parse(updatedProject);
}