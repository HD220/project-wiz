import { inject, injectable } from "inversify";

import { MEMORY_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { PageOptions } from "@/core/common/ports/repository.types";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/logger.port";
import { AgentId } from "@/core/domain/agent/value-objects/agent-id.vo";
import { IMemoryRepository } from "@/core/domain/memory/ports/memory-repository.interface";
import { MemorySearchFilters } from "@/core/domain/memory/ports/memory-repository.types";
import { MemoryItemTags } from "@/core/domain/memory/value-objects/memory-item-tags.vo";

import {
  SearchMemoryItemsUseCaseInput,
  SearchMemoryItemsUseCaseOutput,
} from "./search-memory-items.schema";

@injectable()
export class SearchMemoryItemsUseCase
  implements IUseCase<SearchMemoryItemsUseCaseInput, SearchMemoryItemsUseCaseOutput>
{
  constructor(
    @inject(MEMORY_REPOSITORY_INTERFACE_TYPE) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  public async execute(input: SearchMemoryItemsUseCaseInput): Promise<SearchMemoryItemsUseCaseOutput> {
    const { page, pageSize, agentId, tags, queryText } = input;

    const searchFilters: MemorySearchFilters = {
      agentId: agentId ? AgentId.fromString(agentId) : undefined,
      tags: tags ? MemoryItemTags.create(tags).value : undefined,
      queryText: queryText || undefined,
    };

    const pagination: PageOptions = { page, limit: pageSize };

    const result = await this.memoryRepository.search(searchFilters, pagination);

    return {
      page: result.currentPage,
      pageSize: result.itemsPerPage,
      totalCount: result.totalItems,
      totalPages: result.totalPages,
      items: result.data.map((item) => ({
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