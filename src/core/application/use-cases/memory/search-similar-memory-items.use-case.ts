import { injectable, inject } from "inversify";

import { MEMORY_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { AgentId } from "@/core/domain/agent/value-objects/agent-id.vo";
import { MemoryItem } from "@/core/domain/memory/memory-item.entity";
import { IMemoryRepository } from "@/core/domain/memory/ports/memory-repository.interface";
import { MemoryItemEmbedding } from "@/core/domain/memory/value-objects/memory-item-embedding.vo";

import {
  SearchSimilarMemoryItemsUseCaseInput,
  SearchSimilarMemoryItemsUseCaseOutput,
  SimilarMemoryListItem,
} from "./search-similar-memory-items.schema";

@injectable()
export class SearchSimilarMemoryItemsUseCase
  implements
    IUseCase<
      SearchSimilarMemoryItemsUseCaseInput,
      SearchSimilarMemoryItemsUseCaseOutput
    >
{
  constructor(
    @inject(MEMORY_REPOSITORY_INTERFACE_TYPE) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  private mapEntityToSimilarListItem(entity: MemoryItem, score?: number): SimilarMemoryListItem {
    const fullContent = entity.content.value;
    const excerptLength = 200;
    const excerpt = fullContent.length > excerptLength ? fullContent.substring(0, excerptLength - 3) + "..." : fullContent;

    return {
      id: entity.id.value,
      contentExcerpt: excerpt,
      agentId: entity.agentId?.value ?? null,
      tags: entity.tags.value ?? [],
      source: entity.source.value ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      relevanceScore: score,
    };
  }

  public async execute(input: SearchSimilarMemoryItemsUseCaseInput): Promise<SearchSimilarMemoryItemsUseCaseOutput> {
    const { queryEmbedding, limit, agentId } = input;

    const embedding = MemoryItemEmbedding.create(queryEmbedding);
    const agent = agentId ? AgentId.fromString(agentId) : undefined;

    const result = await this.memoryRepository.searchSimilar(embedding, agent, limit);

    return {
      items: result.map((item) => ({
        id: item.id.value,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        agentId: item.agentId?.value || null,
        tags: item.tags.value,
        source: item.source?.value || null,
        contentExcerpt: item.content.value.substring(0, 200),
      })),
    };
  }
}