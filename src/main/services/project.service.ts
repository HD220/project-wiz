import { eq, and, ne } from 'drizzle-orm';
import { getDatabase } from '../database/connection';
import { projects, channels } from '../database/schema';
import { 
  CreateProjectSchema, 
  UpdateProjectSchema,
  type CreateProjectInput, 
  type UpdateProjectInput 
} from '../../shared/schemas/validation.schemas';
import { 
  ValidationError, 
  NotFoundError,
  AuthorizationError,
  type Project,
  type EntityStatus
} from '../../shared/types/common';
import { generateProjectId, generateChannelId } from '../../shared/utils/id-generator';

export class ProjectService {
  /**
   * Create new project
   */
  static async create(input: CreateProjectInput, ownerId: string): Promise<Project> {
    // Validate input
    const validated = CreateProjectSchema.parse(input);
    const db = getDatabase();
    
    // Check project limits for user
    await this.validateProjectLimits(ownerId);
    
    // Check unique name for user
    await this.validateUniqueName(validated.name, ownerId);
    
    // Create project
    const projectId = generateProjectId();
    const now = new Date();
    
    const newProject = {
      id: projectId,
      name: validated.name,
      description: validated.description,
      gitUrl: validated.gitUrl,
      iconEmoji: validated.iconEmoji,
      visibility: 'private' as const,
      status: 'active' as const,
      settings: JSON.stringify({}),
      ownerId,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.insert(projects).values(newProject);
    
    // Create default channels
    await this.createDefaultChannels(projectId, ownerId);
    
    // TODO: Initialize Git repository if needed
    
    return {
      ...newProject,
      settings: JSON.parse(newProject.settings),
    };
  }
  
  /**
   * Update project
   */
  static async update(
    projectId: string, 
    input: UpdateProjectInput, 
    userId: string
  ): Promise<Project> {
    // Validate input
    const validated = UpdateProjectSchema.parse(input);
    const db = getDatabase();
    
    // Check permissions
    await this.validateProjectPermissions(projectId, userId, 'admin');
    
    // Check unique name if changed
    if (validated.name) {
      await this.validateUniqueName(validated.name, userId, projectId);
    }
    
    // Prepare update data
    const updateData: any = {
      ...validated,
      updatedAt: new Date(),
    };
    
    if (validated.settings) {
      updateData.settings = JSON.stringify(validated.settings);
    }
    
    // Update project
    await db.update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId));
    
    // Return updated project
    return await this.findById(projectId) as Project;
  }
  
  /**
   * Archive project
   */
  static async archive(projectId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Check permissions (only owner can archive)
    await this.validateProjectPermissions(projectId, userId, 'owner');
    
    await db.update(projects)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
    
    // TODO: Stop all agent workers for this project
  }
  
  /**
   * Delete project (soft delete)
   */
  static async delete(projectId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Check permissions (only owner can delete)
    await this.validateProjectPermissions(projectId, userId, 'owner');
    
    await db.update(projects)
      .set({
        status: 'deleted',
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
  }
  
  /**
   * Find project by ID
   */
  static async findById(projectId: string): Promise<Project | null> {
    const db = getDatabase();
    
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
    
    if (!project) return null;
    
    return {
      ...project,
      settings: project.settings ? JSON.parse(project.settings) : {},
    };
  }
  
  /**
   * Find projects by user (owner)
   */
  static async findByUser(userId: string): Promise<Project[]> {
    const db = getDatabase();
    
    const userProjects = await db.query.projects.findMany({
      where: and(
        eq(projects.ownerId, userId),
        eq(projects.status, 'active')
      ),
      orderBy: [projects.updatedAt],
    });
    
    return userProjects.map(project => ({
      ...project,
      settings: project.settings ? JSON.parse(project.settings) : {},
    }));
  }
  
  /**
   * Initialize Git repository for project
   */
  static async initializeGit(projectId: string, gitUrl?: string): Promise<void> {
    // TODO: Implement Git operations
    const project = await this.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }
    
    if (gitUrl) {
      // Clone repository
      console.log(`Cloning repository ${gitUrl} for project ${projectId}`);
    } else {
      // Initialize empty repository
      console.log(`Initializing empty Git repository for project ${projectId}`);
    }
  }
  
  /**
   * Clone repository for project
   */
  static async cloneRepository(projectId: string, gitUrl: string): Promise<void> {
    const db = getDatabase();
    
    // Update project with Git URL
    await db.update(projects)
      .set({
        gitUrl,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
    
    // TODO: Implement actual Git cloning
    console.log(`Cloning repository ${gitUrl} for project ${projectId}`);
  }
  
  // Private methods
  private static async validateProjectLimits(userId: string): Promise<void> {
    const userProjects = await this.findByUser(userId);
    const MAX_PROJECTS_PER_USER = 50;
    
    if (userProjects.length >= MAX_PROJECTS_PER_USER) {
      throw new ValidationError(`Maximum of ${MAX_PROJECTS_PER_USER} projects per user`);
    }
  }
  
  private static async validateUniqueName(
    name: string, 
    userId: string, 
    excludeProjectId?: string
  ): Promise<void> {
    const db = getDatabase();
    
    const whereConditions = [
      eq(projects.ownerId, userId),
      eq(projects.name, name),
    ];
    
    if (excludeProjectId) {
      whereConditions.push(ne(projects.id, excludeProjectId));
    }
    
    const existing = await db.query.projects.findFirst({
      where: and(...whereConditions),
    });
    
    if (existing) {
      throw new ValidationError('Project name already exists');
    }
  }
  
  private static async validateProjectPermissions(
    projectId: string,
    userId: string,
    requiredLevel: 'owner' | 'admin' | 'member' | 'viewer'
  ): Promise<void> {
    const project = await this.findById(projectId);
    
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }
    
    // Owner always has permission
    if (project.ownerId === userId) {
      return;
    }
    
    // TODO: Implement more granular permission system
    // For now, only owner can perform admin actions
    if (requiredLevel === 'owner' || requiredLevel === 'admin') {
      throw new AuthorizationError('Only project owner can perform this action');
    }
  }
  
  private static async createDefaultChannels(
    projectId: string, 
    createdBy: string
  ): Promise<void> {
    const db = getDatabase();
    const now = new Date();
    
    const defaultChannels = [
      { name: 'general', description: 'General discussion', position: 0 },
      { name: 'development', description: 'Development discussion', position: 1 },
      { name: 'random', description: 'Random conversations', position: 2 },
    ];
    
    const channelValues = defaultChannels.map(channel => ({
      id: generateChannelId(),
      projectId,
      name: channel.name,
      description: channel.description,
      type: 'text' as const,
      position: channel.position,
      isPrivate: false,
      createdBy,
      createdAt: now,
      updatedAt: now,
    }));
    
    await db.insert(channels).values(channelValues);
  }
}