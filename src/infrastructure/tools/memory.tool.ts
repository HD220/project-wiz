// src/infrastructure/tools/memory.tool.ts
import { MemoryItem } from '../../core/domain/entities/memory/memory.entity';
import {
  ISaveMemoryItemUseCase,
  SaveMemoryItemDTO
} from '../../core/application/use-cases/memory/save-memory-item.usecase';
import {
  ISearchSimilarMemoryItemsUseCase, // Changed
  SearchSimilarMemoryItemsDTO   // Changed
} from '../../core/application/use-cases/memory/search-similar-memory-items.usecase';
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
  query: z.string().describe("The natural language search query string to find semantically relevant memories."),
  tags: z.array(z.string()).optional().describe("Optional tags. Note: May have limited or no effect with the current semantic search implementation. Primarily uses query text for similarity."),
  limit: z.number().optional().describe("Maximum number of memory items to return."),
}).describe("Parameters for performing a semantic search on memory items based on query text similarity.");

export const removeMemoryParamsSchema = z.object({
  memoryId: z.string().describe("The ID of the memory item to remove."),
}).describe("Parameters for removing a memory item.");

// Interface for MemoryTool (optional, as methods are directly used for IAgentTool definitions)
export interface IMemoryToolClass {
  saveMemory(params: z.infer<typeof saveMemoryParamsSchema>, agentId?: string): Promise<MemoryItem>;
  searchMemories(params: z.infer<typeof searchMemoriesParamsSchema>, agentId?: string): Promise<MemoryItem[]>; // Added agentId here
  removeMemory(params: z.infer<typeof removeMemoryParamsSchema>): Promise<void>;
}

export class MemoryTool implements IMemoryToolClass {
  constructor(
    private saveMemoryItemUseCase: ISaveMemoryItemUseCase,
    private searchSimilarMemoryItemsUseCase: ISearchSimilarMemoryItemsUseCase, // Changed
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

  async searchMemories(params: z.infer<typeof searchMemoriesParamsSchema>, agentId?: string): Promise<MemoryItem[]> {
    console.log(\`MemoryTool.searchMemories (semantic): Query "\${params.query}" for agentId: \${agentId}\`);
    if (!params.query || params.query.trim() === "") {
        console.warn("MemoryTool.searchMemories: query is empty. Semantic search requires a query string. Returning empty array.");
        return [];
    }
    const dto: SearchSimilarMemoryItemsDTO = {
      queryText: params.query,
      agentId: agentId, // Passed from executionContext via getMemoryToolDefinitions
      limit: params.limit,
    };
    // Tags from params.tags are not used in this semantic search DTO.
    // If tag filtering is desired with semantic search, it would need to be added to SearchSimilarMemoryItemsUseCase
    // and potentially as a post-filtering step or more complex combined query logic.
    if (params.tags && params.tags.length > 0) {
        console.warn(\`MemoryTool.searchMemories: 'tags' parameter provided but currently ignored by semantic search. Query: "\${params.query}", Tags: \${params.tags}\`);
    }
    return this.searchSimilarMemoryItemsUseCase.execute(dto);
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
      description: 'Performs a semantic search of the agent\\'s persistent memory based on the meaning of a query string. Returns most relevant items. Tags may have limited effect.',
      parameters: searchMemoriesParamsSchema, // Uses the updated schema
      execute: async (params: z.infer<typeof searchMemoriesParamsSchema>, executionContext?: any) => {
        return memoryToolInstance.searchMemories(params, executionContext?.agentId); // Pass agentId
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
