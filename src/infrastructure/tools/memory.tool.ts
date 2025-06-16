// src/infrastructure/tools/memory.tool.ts
import { MemoryItem } from '../../core/domain/entities/memory/memory.entity';
import {
  ISaveMemoryItemUseCase,
  SaveMemoryItemDTO
} from '../../core/application/use-cases/memory/save-memory-item.usecase';
import {
  ISearchMemoryItemsUseCase,
  SearchMemoryItemsDTO
} from '../../core/application/use-cases/memory/search-memory-items.usecase';
import {
  IRemoveMemoryItemUseCase
} from '../../core/application/use-cases/memory/remove-memory-item.usecase';
import { z } from 'zod';
import { IAgentTool } from '../../core/tools/tool.interface';

// Zod Schemas for AI SDK tool parameters
export const saveMemoryParamsSchema = z.object({
  id: z.string().optional().describe("The ID of the memory item to update. Omit for new item."),
  content: z.string().describe("The textual content of the memory to save."),
  tags: z.array(z.string()).optional().describe("Optional tags to categorize the memory."),
  source: z.string().optional().describe("Optional source of this memory (e.g., 'user_interaction', 'file_analysis')."),
  // embedding: z.array(z.number()).optional().describe("Optional embedding vector (for future use).") // Not directly taken as param for now
}).describe("Parameters for saving a memory item. The agent's ID will be added automatically if available in context.");

export const searchMemoriesParamsSchema = z.object({
  query: z.string().describe("The search query string to find relevant memories."),
  tags: z.array(z.string()).optional().describe("Optional tags to filter memories."),
  limit: z.number().optional().describe("Maximum number of memory items to return."),
}).describe("Parameters for searching memory items.");

export const removeMemoryParamsSchema = z.object({
  memoryId: z.string().describe("The ID of the memory item to remove."),
}).describe("Parameters for removing a memory item.");

// Interface for MemoryTool (optional, as methods are directly used for IAgentTool definitions)
export interface IMemoryToolClass {
  saveMemory(params: z.infer<typeof saveMemoryParamsSchema>, agentId?: string): Promise<MemoryItem>;
  searchMemories(params: z.infer<typeof searchMemoriesParamsSchema>): Promise<MemoryItem[]>;
  removeMemory(params: z.infer<typeof removeMemoryParamsSchema>): Promise<void>;
}

export class MemoryTool implements IMemoryToolClass {
  constructor(
    private saveMemoryItemUseCase: ISaveMemoryItemUseCase,
    private searchMemoryItemsUseCase: ISearchMemoryItemsUseCase,
    private removeMemoryItemUseCase: IRemoveMemoryItemUseCase
  ) {}

  async saveMemory(params: z.infer<typeof saveMemoryParamsSchema>, agentId?: string): Promise<MemoryItem> {
    console.log(\`MemoryTool.saveMemory: Content starting with "\${params.content.substring(0, 50)}..." for agentId: \${agentId}\`);
    const dto: SaveMemoryItemDTO = {
      id: params.id,
      content: params.content,
      tags: params.tags,
      source: params.source,
      // agentId is not part of SaveMemoryItemDTO currently, but MemoryItem entity can hold it.
      // The use case or entity factory should handle associating agentId if passed via executionContext.
      // For now, let's assume if an agentId is passed, it's for context, and MemoryItem might need an agentId field.
      // The SaveMemoryItemDTO was defined as: Partial<Pick<MemoryItemProps, 'id' | 'tags' | 'source' | 'embedding'>> & { content: string };
      // MemoryItemProps has agentId?: string;
      // So we can add it to DTO.
      ...(agentId && { agentId: agentId }) // Add agentId to DTO if provided
    };
    return this.saveMemoryItemUseCase.execute(dto);
  }

  async searchMemories(params: z.infer<typeof searchMemoriesParamsSchema>): Promise<MemoryItem[]> {
    console.log(\`MemoryTool.searchMemories: Query "\${params.query}"\`);
    const dto: SearchMemoryItemsDTO = {
      query: params.query,
      tags: params.tags,
      limit: params.limit,
    };
    return this.searchMemoryItemsUseCase.execute(dto);
  }

  async removeMemory(params: z.infer<typeof removeMemoryParamsSchema>): Promise<void> {
    console.log(\`MemoryTool.removeMemory: ID \${params.memoryId}\`);
    await this.removeMemoryItemUseCase.execute(params.memoryId);
  }
}

// Function to generate IAgentTool definitions for MemoryTool
export function getMemoryToolDefinitions(memoryToolInstance: MemoryTool): IAgentTool[] {
  return [
    {
      name: 'memory.save',
      description: 'Saves a piece of information (text, observation, learning) to the agent\'s persistent memory. Allows tagging for better retrieval.',
      parameters: saveMemoryParamsSchema,
      execute: async (params: z.infer<typeof saveMemoryParamsSchema>, executionContext?: any) => {
        return memoryToolInstance.saveMemory(params, executionContext?.agentId);
      }
    },
    {
      name: 'memory.search',
      description: 'Searches the agent\'s persistent memory based on a query string and optional tags.',
      parameters: searchMemoriesParamsSchema,
      execute: async (params: z.infer<typeof searchMemoriesParamsSchema>, executionContext?: any) => {
        return memoryToolInstance.searchMemories(params);
      }
    },
    {
      name: 'memory.remove',
      description: 'Removes a specific memory item by its ID.',
      parameters: removeMemoryParamsSchema,
      execute: async (params: z.infer<typeof removeMemoryParamsSchema>, executionContext?: any) => {
        return memoryToolInstance.removeMemory(params);
      }
    }
  ];
}
