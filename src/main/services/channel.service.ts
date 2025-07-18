import { eq, and } from 'drizzle-orm';
import { getDatabase } from '../database/connection';
import { channels } from '../database/schema';
import { 
  CreateChannelSchema, 
  UpdateChannelSchema,
  type CreateChannelInput, 
  type UpdateChannelInput 
} from '../../shared/schemas/validation.schemas';
import { 
  ValidationError, 
  NotFoundError,
  AuthorizationError,
  type Channel
} from '../../shared/types/common';
import { generateChannelId } from '../../shared/utils/id-generator';
import { ProjectService } from './project.service';

interface ChannelOrder {
  id: string;
  position: number;
}

export class ChannelService {
  /**
   * Create new channel
   */
  static async create(input: CreateChannelInput, createdBy: string): Promise<Channel> {
    // Validate input
    const validated = CreateChannelSchema.parse(input);
    const db = getDatabase();
    
    // Verify project exists and user has access
    const project = await ProjectService.findById(validated.projectId);
    if (!project) {
      throw new NotFoundError('Project', validated.projectId);
    }
    
    // TODO: Check if user has permission to create channels
    // For now, only project owner can create channels
    if (project.ownerId !== createdBy) {
      throw new AuthorizationError('Only project owner can create channels');
    }
    
    // Check if channel name is unique within project
    await this.validateUniqueChannelName(validated.projectId, validated.name);
    
    // Get next position if not provided
    const position = validated.position ?? await this.getNextPosition(validated.projectId);
    
    // Create channel
    const channelId = generateChannelId();
    const now = new Date();
    
    const newChannel = {
      id: channelId,
      projectId: validated.projectId,
      name: validated.name,
      description: validated.description,
      type: validated.type,
      position,
      isPrivate: false, // Default to public
      permissions: JSON.stringify({}), // Default permissions
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.insert(channels).values(newChannel);
    
    return {
      ...newChannel,
      permissions: JSON.parse(newChannel.permissions),
    };
  }
  
  /**
   * Update channel
   */
  static async update(
    channelId: string, 
    input: UpdateChannelInput, 
    userId: string
  ): Promise<Channel> {
    // Validate input
    const validated = UpdateChannelSchema.parse(input);
    const db = getDatabase();
    
    // Get existing channel
    const existingChannel = await this.findById(channelId);
    if (!existingChannel) {
      throw new NotFoundError('Channel', channelId);
    }
    
    // Check permissions
    const project = await ProjectService.findById(existingChannel.projectId);
    if (!project) {
      throw new NotFoundError('Project', existingChannel.projectId);
    }
    
    if (project.ownerId !== userId) {
      throw new AuthorizationError('Only project owner can update channels');
    }
    
    // Check unique name if changed
    if (validated.name && validated.name !== existingChannel.name) {
      await this.validateUniqueChannelName(existingChannel.projectId, validated.name);
    }
    
    // Update channel
    const updateData = {
      ...validated,
      updatedAt: new Date(),
    };
    
    await db.update(channels)
      .set(updateData)
      .where(eq(channels.id, channelId));
    
    // Return updated channel
    return await this.findById(channelId) as Channel;
  }
  
  /**
   * Delete channel
   */
  static async delete(channelId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Get existing channel
    const existingChannel = await this.findById(channelId);
    if (!existingChannel) {
      throw new NotFoundError('Channel', channelId);
    }
    
    // Check permissions
    const project = await ProjectService.findById(existingChannel.projectId);
    if (!project) {
      throw new NotFoundError('Project', existingChannel.projectId);
    }
    
    if (project.ownerId !== userId) {
      throw new AuthorizationError('Only project owner can delete channels');
    }
    
    // Prevent deletion of general channel
    if (existingChannel.name === 'general') {
      throw new ValidationError('Cannot delete the general channel');
    }
    
    // Delete channel (this will cascade delete messages)
    await db.delete(channels)
      .where(eq(channels.id, channelId));
  }
  
  /**
   * Find channel by ID
   */
  static async findById(channelId: string): Promise<Channel | null> {
    const db = getDatabase();
    
    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
    });
    
    if (!channel) return null;
    
    return {
      ...channel,
      permissions: channel.permissions ? JSON.parse(channel.permissions) : {},
    };
  }
  
  /**
   * List channels by project
   */
  static async listByProject(projectId: string): Promise<Channel[]> {
    const db = getDatabase();
    
    const projectChannels = await db.query.channels.findMany({
      where: eq(channels.projectId, projectId),
      orderBy: [channels.position, channels.createdAt],
    });
    
    return projectChannels.map(channel => ({
      ...channel,
      permissions: channel.permissions ? JSON.parse(channel.permissions) : {},
    }));
  }
  
  /**
   * Reorder channels within a project
   */
  static async reorder(
    projectId: string, 
    channelOrders: ChannelOrder[], 
    userId: string
  ): Promise<void> {
    const db = getDatabase();
    
    // Check permissions
    const project = await ProjectService.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }
    
    if (project.ownerId !== userId) {
      throw new AuthorizationError('Only project owner can reorder channels');
    }
    
    // Validate that all channels belong to the project
    const projectChannels = await this.listByProject(projectId);
    const projectChannelIds = new Set(projectChannels.map(c => c.id));
    
    for (const { id } of channelOrders) {
      if (!projectChannelIds.has(id)) {
        throw new ValidationError(`Channel ${id} does not belong to project ${projectId}`);
      }
    }
    
    // Update positions
    const updatePromises = channelOrders.map(({ id, position }) =>
      db.update(channels)
        .set({
          position,
          updatedAt: new Date(),
        })
        .where(eq(channels.id, id))
    );
    
    await Promise.all(updatePromises);
  }
  
  // Private methods
  private static async validateUniqueChannelName(
    projectId: string, 
    name: string
  ): Promise<void> {
    const db = getDatabase();
    
    const existing = await db.query.channels.findFirst({
      where: and(
        eq(channels.projectId, projectId),
        eq(channels.name, name)
      ),
    });
    
    if (existing) {
      throw new ValidationError('Channel name already exists in this project');
    }
  }
  
  private static async getNextPosition(projectId: string): Promise<number> {
    const db = getDatabase();
    
    const projectChannels = await db.query.channels.findMany({
      where: eq(channels.projectId, projectId),
      orderBy: [channels.position],
    });
    
    if (projectChannels.length === 0) {
      return 0;
    }
    
    const maxPosition = Math.max(...projectChannels.map(c => c.position));
    return maxPosition + 1;
  }
}