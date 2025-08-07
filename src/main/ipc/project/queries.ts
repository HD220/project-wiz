import { eq, and, desc, like, or, isNull, sql } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/config/database";
import { 
  projectsTable, 
  type SelectProject,
  type UpdateProject,
  type InsertProject
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
      isNull(projectsTable.deactivatedAt)
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
      isNull(projectsTable.deactivatedAt)
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
      isNull(projectsTable.deactivatedAt)
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
  isActive?: boolean;
  isArchived?: boolean;
}): Promise<SelectProject[]> {
  const db = getDatabase();
  
  const conditions = [
    eq(projectsTable.ownerId, filters.ownerId)
  ];

  // Filter by isActive if specified
  if (filters.isActive !== undefined) {
    if (filters.isActive) {
      conditions.push(isNull(projectsTable.deactivatedAt));
    } else {
      conditions.push(eq(projectsTable.isActive, false));
    }
  }

  // Filter by isArchived if specified
  if (filters.isArchived !== undefined) {
    if (filters.isArchived) {
      // Show only archived projects (archivedAt is not null)
      conditions.push(sql`${projectsTable.archivedAt} IS NOT NULL`);
    } else {
      // Show only non-archived projects (archivedAt is null)
      conditions.push(isNull(projectsTable.archivedAt));
    }
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
 * Archive project
 */
export async function archiveProject(
  projectId: string,
  ownerId: string
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
      archivedAt: new Date(),
      updatedAt: new Date()
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
 * Unarchive project
 */
export async function unarchiveProject(
  projectId: string,
  ownerId: string
): Promise<SelectProject> {
  const db = getDatabase();

  // First check if project exists and user owns it
  const existingProject = await findProject(projectId, ownerId);
  if (!existingProject) {
    throw new Error("Project not found or access denied");
  }

  const [unarchivedProject] = await db
    .update(projectsTable)
    .set({ 
      archivedAt: null,
      updatedAt: new Date()
    })
    .where(and(
      eq(projectsTable.id, projectId),
      eq(projectsTable.ownerId, ownerId)
    ))
    .returning();

  if (!unarchivedProject) {
    throw new Error("Failed to unarchive project");
  }

  return unarchivedProject;
}

/**
 * Soft delete project
 */
export async function deleteProject(
  projectId: string,
  ownerId: string
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
      deactivatedAt: new Date(),
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

