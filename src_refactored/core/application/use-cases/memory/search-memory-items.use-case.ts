import { inject, injectable } from "inversify";

import { MEMORY_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { Identity } from "@/core/common/value-objects/identity.vo";
import { MemoryItem } from "@/core/domain/memory/memory-item.entity";
import { IMemoryRepository } from "@/core/domain/memory/ports/memory-repository.interface";
import {
  MemorySearchFilters,
  PaginatedMemoryItemsResult,
  PaginationOptions,
} from "@/core/domain/memory/ports/memory-repository.types";



import {
  IUseCaseResponse,
  successUseCaseResponse,
} from "@/shared/application/use-case-response.dto";

import {
  SearchMemoryItemsUseCaseInput,
  SearchMemoryItemsUseCaseInputSchema,
  SearchMemoryItemsUseCaseOutput,
  MemoryListItem,
} from "./search-memory-items.schema";

const CONTENT_EXCERPT_LENGTH = 200;

@injectable()
export class SearchMemoryItemsUseCase
  implements IUseCase<SearchMemoryItemsUseCaseInput, IUseCaseResponse<SearchMemoryItemsUseCaseOutput>>
{
  constructor(
    @inject(MEMORY_REPOSITORY_INTERFACE_TYPE) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  public async execute(
    input: SearchMemoryItemsUseCaseInput
  ): Promise<IUseCaseResponse<SearchMemoryItemsUseCaseOutput>> {
    this.logger.debug("SearchMemoryItemsUseCase: Starting execution with input:", { input });

    const validatedInput = SearchMemoryItemsUseCaseInputSchema.parse(input);

    const searchFilters = this._buildSearchFilters(validatedInput);

    const paginationOptions: PaginationOptions = {
      page: validatedInput.page,
      limit: validatedInput.pageSize,
    };

    const paginatedMemoryItems = await this.memoryRepository.search(searchFilters, paginationOptions);

    const output = this._mapToOutput(paginatedMemoryItems);

    this.logger.debug("SearchMemoryItemsUseCase: Execution successful.");
    return successUseCaseResponse(output);
  }

  private _buildSearchFilters(validatedInput: SearchMemoryItemsUseCaseInput): MemorySearchFilters {
    let agentIdVO: Identity | undefined = undefined;
    if (validatedInput.agentId !== undefined && validatedInput.agentId !== null) {
        agentIdVO = Identity.fromString(validatedInput.agentId);
    }

    const filters: MemorySearchFilters = {
      agentId: agentIdVO,
      queryText: validatedInput.queryText,
      tags: validatedInput.tags,
    };
    return filters;
  }

  private _mapToOutput(
    paginatedResult: PaginatedMemoryItemsResult
  ): SearchMemoryItemsUseCaseOutput {
    const memoryListItems = paginatedResult.data.map(item => this._mapMemoryItemToListItem(item));

    return {
      items: memoryListItems,
      totalCount: paginatedResult.totalItems,
      page: paginatedResult.currentPage,
      pageSize: paginatedResult.itemsPerPage,
      totalPages: paginatedResult.totalPages,
    };
  }

  private _mapMemoryItemToListItem(item: MemoryItem): MemoryListItem {
    const contentValue = item.content.value;
    const excerpt = contentValue.length > CONTENT_EXCERPT_LENGTH
      ? `${contentValue.substring(0, CONTENT_EXCERPT_LENGTH)}...`
      : contentValue;

    const agentIdValue = item.agentId?.value ?? null;
    const tagsValue = item.tags.value ?? [];
    const sourceValue = item.source.value ?? null;

    return {
      id: item.id.value,
      contentExcerpt: excerpt,
      agentId: agentIdValue,
      tags: tagsValue,
      source: sourceValue,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}