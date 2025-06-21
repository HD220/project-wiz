// src/core/application/use-cases/memory/search-similar-memory-items.usecase.ts
import { MemoryItem } from '../../../domain/entities/memory/memory.entity';
import { IMemoryRepository } from '../../../../core/ports/repositories/memory.repository';
// TODO: Refactor to use IEmbeddingService (port) instead of concrete EmbeddingService (infra) for Clean Architecture.
import { EmbeddingService } from '../../../infrastructure/services/ai/embedding.service';

export interface SearchSimilarMemoryItemsDTO {
  queryText: string;
  agentId?: string; // To filter memories by agent if needed
  limit?: number;
}

export interface ISearchSimilarMemoryItemsUseCase {
  execute(dto: SearchSimilarMemoryItemsDTO): Promise<MemoryItem[]>;
}

export class SearchSimilarMemoryItemsUseCase implements ISearchSimilarMemoryItemsUseCase {
  constructor(
    private memoryRepository: IMemoryRepository,
    private embeddingService: EmbeddingService // Injected
  ) {}

  async execute(dto: SearchSimilarMemoryItemsDTO): Promise<MemoryItem[]> {
    const { queryText, agentId, limit = 10 } = dto; // Default limit if not provided

    if (!queryText || queryText.trim() === "") {
      console.warn("SearchSimilarMemoryItemsUseCase: queryText is empty. Returning empty array.");
      return [];
    }

    console.log(\`SearchSimilarMemoryItemsUseCase: Searching for memories similar to "\${queryText.substring(0,50)}..." for agentId: \${agentId}\`);

    try {
      const { embedding: queryEmbedding } = await this.embeddingService.generateEmbedding(queryText);

      if (!queryEmbedding || queryEmbedding.length === 0) {
        console.warn(\`SearchSimilarMemoryItemsUseCase: Failed to generate embedding for query "\${queryText}". Returning empty array.\`);
        return [];
      }

      const similarItems = await this.memoryRepository.searchSimilar(queryEmbedding, agentId, limit);
      console.log(\`SearchSimilarMemoryItemsUseCase: Found \${similarItems.length} similar items.\`);
      return similarItems;

    } catch (error: any) {
      console.error(\`SearchSimilarMemoryItemsUseCase: Error during semantic search for query "\${queryText}": \${error.message}\`);
      // Depending on desired behavior, could rethrow or return empty
      return []; // For now, return empty on error to avoid breaking agent flow
    }
  }
}
