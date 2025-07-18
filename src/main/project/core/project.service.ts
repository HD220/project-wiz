import { eq, and, desc } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { projects } from '../../database/schema/projects.schema';
import { channels } from '../../database/schema/channels.schema';
import { projectAgents, projectUsers } from '../../database/schema/relationships.schema';
import { generateId } from '../../utils/id-generator';

export interface CreateProjectInput {
  name: string;
  description?: string;
  gitUrl?: string;
  localPath?: string;
  iconUrl?: string;
  iconEmoji?: string;
  ownerId: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  gitUrl?: string;
  localPath?: string;
  iconUrl?: string;
  iconEmoji?: string;
  settings?: any;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  gitUrl?: string;
  localPath?: string;
  iconUrl?: string;
  iconEmoji?: string;
  visibility: string;
  status: string;
  settings?: any;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectService {
  static async create(input: CreateProjectInput): Promise<ProjectResponse> {
    const db = getDatabase();
    
    const projectId = generateId();
    const now = new Date();
    
    // Create project
    await db.insert(projects).values({
      id: projectId,
      name: input.name,
      description: input.description,
      gitUrl: input.gitUrl,
      localPath: input.localPath,
      iconUrl: input.iconUrl,
      iconEmoji: input.iconEmoji,
      visibility: 'private',
      status: 'active',
      ownerId: input.ownerId,
      createdAt: now,
      updatedAt: now,
    });
    
    // Add owner as admin member
    await db.insert(projectUsers).values({
      projectId,
      userId: input.ownerId,
      role: 'owner',
      permissions: JSON.stringify(['read', 'write', 'admin']),
      joinedAt: now,
    });
    
    // Create default general channel
    const generalChannelId = generateId();
    await db.insert(channels).values({
      id: generalChannelId,
      projectId,
      name: 'general',
      description: 'General project discussion',
      type: 'text',
      position: 0,
      isPrivate: false,
      createdBy: input.ownerId,
      createdAt: now,
      updatedAt: now,
    });
    
    // Get created project
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    
    if (!project) {
      throw new Error('Failed to create project');
    }
    
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      gitUrl: project.gitUrl,
      localPath: project.localPath,
      iconUrl: project.iconUrl,
      iconEmoji: project.iconEmoji,
      visibility: project.visibility,
      status: project.status,
      settings: project.settings ? JSON.parse(project.settings) : {},
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
  
  static async findById(projectId: string): Promise<ProjectResponse | null> {
    const db = getDatabase();
    
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    
    if (!project) {
      return null;
    }
    
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      gitUrl: project.gitUrl,
      localPath: project.localPath,
      iconUrl: project.iconUrl,
      iconEmoji: project.iconEmoji,
      visibility: project.visibility,
      status: project.status,
      settings: project.settings ? JSON.parse(project.settings) : {},
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
  
  static async findByOwnerId(ownerId: string): Promise<ProjectResponse[]> {
    const db = getDatabase();
    
    const userProjects = await db.query.projects.findMany({
      where: and(
        eq(projects.ownerId, ownerId),
        eq(projects.status, 'active')
      ),
      orderBy: [desc(projects.updatedAt)],
    });
    
    return userProjects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      gitUrl: project.gitUrl,
      localPath: project.localPath,
      iconUrl: project.iconUrl,
      iconEmoji: project.iconEmoji,
      visibility: project.visibility,
      status: project.status,
      settings: project.settings ? JSON.parse(project.settings) : {},
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  }
  
  static async findUserProjects(userId: string): Promise<ProjectResponse[]> {
    const db = getDatabase();
    
    // Find projects where user is a member or owner
    const userProjectRelations = await db.query.projectUsers.findMany({
      where: eq(projectUsers.userId, userId),
      with: {
        project: true,
      },
    });
    
    const validProjects = userProjectRelations
      .filter(relation => relation.project?.status === 'active')
      .map(relation => {
        const project = relation.project!;
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          gitUrl: project.gitUrl,
          localPath: project.localPath,
          iconUrl: project.iconUrl,
          iconEmoji: project.iconEmoji,
          visibility: project.visibility,
          status: project.status,
          settings: project.settings ? JSON.parse(project.settings) : {},
          ownerId: project.ownerId,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };
      });
    
    return validProjects;
  }
  
  static async update(projectId: string, input: UpdateProjectInput, userId: string): Promise<ProjectResponse> {
    const db = getDatabase();
    
    // Check if user can edit this project
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    if (project.ownerId !== userId) {
      throw new Error('Permission denied');
    }
    
    // Update project
    await db.update(projects)
      .set({
        ...input,
        settings: input.settings ? JSON.stringify(input.settings) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
    
    // Get updated project
    const updatedProject = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    
    if (!updatedProject) {
      throw new Error('Failed to update project');
    }
    
    return {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description,
      gitUrl: updatedProject.gitUrl,
      localPath: updatedProject.localPath,
      iconUrl: updatedProject.iconUrl,
      iconEmoji: updatedProject.iconEmoji,
      visibility: updatedProject.visibility,
      status: updatedProject.status,
      settings: updatedProject.settings ? JSON.parse(updatedProject.settings) : {},
      ownerId: updatedProject.ownerId,
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
    };
  }
  
  static async archive(projectId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Check if user can archive this project
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    if (project.ownerId !== userId) {
      throw new Error('Permission denied');
    }
    
    // Archive project
    await db.update(projects)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
  }
  
  static async delete(projectId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Check if user can delete this project
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    if (project.ownerId !== userId) {
      throw new Error('Permission denied');
    }
    
    // Soft delete project
    await db.update(projects)
      .set({
        status: 'deleted',
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
  }
  
  static async addAgent(projectId: string, agentId: string, role: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Check if user can add agents to this project
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    if (project.ownerId !== userId) {
      throw new Error('Permission denied');
    }
    
    // Add agent to project
    await db.insert(projectAgents).values({
      projectId,
      agentId,
      role,
      permissions: JSON.stringify(['read', 'write']),
      isActive: true,
      addedBy: userId,
      addedAt: new Date(),
    });
  }
  
  static async removeAgent(projectId: string, agentId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Check if user can remove agents from this project
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    if (project.ownerId !== userId) {
      throw new Error('Permission denied');
    }
    
    // Remove agent from project
    await db.update(projectAgents)
      .set({
        isActive: false,
        removedAt: new Date(),
      })
      .where(
        and(
          eq(projectAgents.projectId, projectId),
          eq(projectAgents.agentId, agentId)
        )
      );
  }
}