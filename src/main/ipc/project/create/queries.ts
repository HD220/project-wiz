import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  projectsTable, 
  type SelectProject, 
  type InsertProject 
} from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema baseado em InsertProject
export const CreateProjectInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  gitUrl: z.string().optional(), 
  branch: z.string().optional(),
  localPath: z.string().min(1, "Local path is required"),
  ownerId: z.string().min(1, "Owner ID is required"),
  status: z.enum(["active", "archived"]).optional().default("active"),
});

// Output validation schema baseado em SelectProject
export const CreateProjectOutputSchema = z.object({
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

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;
export type CreateProjectOutput = z.infer<typeof CreateProjectOutputSchema>;

export async function createProject(input: CreateProjectInput): Promise<CreateProjectOutput> {
  const db = getDatabase();
  
  const validatedInput = CreateProjectInputSchema.parse(input);
  
  const [newProject] = await db
    .insert(projectsTable)
    .values(validatedInput)
    .returning();

  if (!newProject) {
    throw new Error("Failed to create project");
  }

  return CreateProjectOutputSchema.parse(newProject);
}