import { eq, and, desc, like, or } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/config/database";
import { 
  projectsTable, 
  type SelectProject,
  type UpdateProject,
  type InsertProject,
  type ProjectStatus
} from "@/main/schemas/project.schema";
import { usersTable } from "@/main/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Find project by id and owner (with ownership validation)
 */
export async function findProject(projectId: string, ownerId: string): Promise<SelectProject | null> {
  const db = getDatabase();
  
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(
      eq(projectsTable.id, projectId),
      eq(projectsTable.ownerId, ownerId),
      eq(projectsTable.isActive, true)
    ))
    .limit(1);

  return project || null;
}

/**
 * Find project by id without ownership validation (for admin operations)
 */
export async function findProjectById(projectId: string): Promise<SelectProject | null> {
  const db = getDatabase();
  
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(
      eq(projectsTable.id, projectId),
      eq(projectsTable.isActive, true)
    ))
    .limit(1);

  return project || null;
}

/**
 * Generic update project - WHERE by PKs
 */
export async function updateProject(data: UpdateProject): Promise<SelectProject | null> {
  const db = getDatabase();
  
  if (!data.id || !data.ownerId) {
    throw new Error("Project id and ownerId are required for update");
  }
  
  const [updated] = await db
    .update(projectsTable)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(and(
      eq(projectsTable.id, data.id),
      eq(projectsTable.ownerId, data.ownerId),
      eq(projectsTable.isActive, true)
    ))
    .returning();

  return updated || null;
}

/**
 * Create project
 */
export async function createProject(data: InsertProject & { ownerId: string }): Promise<SelectProject> {
  const db = getDatabase();
  
  const [newProject] = await db
    .insert(projectsTable)
    .values({
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();

  if (!newProject) {
    throw new Error(`Failed to create project "${data.name}"`);
  }

  return newProject;
}

/**
 * List projects with filters
 */
export async function listProjects(filters: { 
  ownerId: string; 
  search?: string; 
  showInactive?: boolean;
  status?: ProjectStatus;
}): Promise<SelectProject[]> {
  const db = getDatabase();
  
  const conditions = [
    eq(projectsTable.ownerId, filters.ownerId)
  ];

  // Filter by active status unless explicitly showing inactive
  if (!filters.showInactive) {
    conditions.push(eq(projectsTable.isActive, true));
  }

  // Filter by status if specified
  if (filters.status) {
    conditions.push(eq(projectsTable.status, filters.status));
  }

  // Search filter
  if (filters.search) {
    const searchCondition = or(
      like(projectsTable.name, `%${filters.search}%`),
      like(projectsTable.description, `%${filters.search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const projects = await db
    .select()
    .from(projectsTable)
    .where(and(...conditions))
    .orderBy(desc(projectsTable.updatedAt));

  return projects;
}

/**
 * Archive project (soft delete pattern)
 */
export async function archiveProject(
  projectId: string,
  ownerId: string,
  archivedBy: string
): Promise<SelectProject> {
  const db = getDatabase();

  // First check if project exists and user owns it
  const existingProject = await findProject(projectId, ownerId);
  if (!existingProject) {
    throw new Error("Project not found or access denied");
  }

  const [archivedProject] = await db
    .update(projectsTable)
    .set({ 
      status: "archived",
      updatedAt: new Date(),
      deactivatedAt: new Date(),
      deactivatedBy: archivedBy
    })
    .where(and(
      eq(projectsTable.id, projectId),
      eq(projectsTable.ownerId, ownerId)
    ))
    .returning();

  if (!archivedProject) {
    throw new Error("Failed to archive project");
  }

  return archivedProject;
}

/**
 * Soft delete project
 */
export async function deleteProject(
  projectId: string,
  ownerId: string,
  deletedBy: string
): Promise<void> {
  const db = getDatabase();

  // First check if project exists and user owns it
  const existingProject = await findProject(projectId, ownerId);
  if (!existingProject) {
    throw new Error("Project not found or access denied");
  }

  await db
    .update(projectsTable)
    .set({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy: deletedBy,
      updatedAt: new Date()
    })
    .where(and(
      eq(projectsTable.id, projectId),
      eq(projectsTable.ownerId, ownerId)
    ));
}

/**
 * Find user avatar for project display
 */
export async function findUserAvatar(userId: string): Promise<{ avatar: string | null } | null> {
  const db = getDatabase();
  
  const [user] = await db
    .select({ avatar: usersTable.avatar })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  return user || null;
}

/**
 * Count active projects for user
 */
export async function getActiveProjectsCount(ownerId: string): Promise<number> {
  const db = getDatabase();
  
  const result = await db
    .select({ count: projectsTable.id })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.ownerId, ownerId),
        eq(projectsTable.isActive, true),
        eq(projectsTable.status, "active")
      )
    );

  return result.length;
}