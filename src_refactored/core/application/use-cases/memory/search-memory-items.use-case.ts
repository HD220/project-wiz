// src_refactored/core/application/use-cases/memory/search-memory-items.use-case.ts
import { z } from 'zod';
import { Executable } from '../../../common/executable';
import { Result } from '../../../../shared/result'; // Corrected path
import { DomainError, RepositoryError } from '../../../../core/common/errors';
import {
  IMemoryRepository,
  IMemoryRepositoryToken,
} from '../../../../core/domain/memory/ports/memory-repository.interface';
import {
  SearchMemoryItemsUseCaseInput,
  SearchMemoryItemsUseCaseInputSchema,
  SearchMemoryItemsUseCaseOutput,
  MemoryListItemSchema,
} from './search-memory-items.schema'; // This one is local, should be fine
import { MemoryItem } from '../../../../core/domain/memory/memory-item.entity';
import { Identity } from '../../../../core/common/value-objects/identity.vo';
import { inject, injectable } from 'inversify';

// Placeholder for the enhanced repository interface method.
// This would ideally be part of IMemoryRepository.
interface SearchCriteria {
  agentId?: Identity;
  queryText?: string;
  tags?: string[];
}

interface PaginatedMemoryItems {
  items: MemoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// This is an ideal method that should exist on IMemoryRepository
// For now, we'll assume the concrete implementation of IMemoryRepository
// will have a way to handle this, or this use case will need adaptation.
// search(criteria: SearchCriteria, page: number, pageSize: number): Promise<Result<PaginatedMemoryItems, DomainError | RepositoryError>>;


@injectable()
export class SearchMemoryItemsUseCase implements Executable<SearchMemoryItemsUseCaseInput, SearchMemoryItemsUseCaseOutput, DomainError | RepositoryError | z.ZodError> {
  private readonly memoryRepository: IMemoryRepository;

  constructor(
    @inject(IMemoryRepositoryToken) memoryRepository: IMemoryRepository,
  ) {
    this.memoryRepository = memoryRepository;
  }

  public async execute(
    input: SearchMemoryItemsUseCaseInput,
  ): Promise<
    Result<
      SearchMemoryItemsUseCaseOutput,
      DomainError | RepositoryError | z.ZodError
    >
  > {
    const validationResult = SearchMemoryItemsUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return Result.failure(validationResult.error);
    }
    const validInput = validationResult.data;

    const searchCriteria: SearchCriteria = this.mapInputToCriteria(validInput);

    // ASSUMPTION: The repository has an enhanced search method.
    // If not, this part needs significant change (in-memory filtering).
    // For example:
    // const repoResult = await this.memoryRepository.search(
    //   searchCriteria,
    //   validInput.page,
    //   validInput.pageSize,
    // );

    // Fallback for current IMemoryRepository:
    // This is NOT efficient and won't correctly implement all features (queryText, tags filtering, totalCount for arbitrary queries).
    // This is a placeholder to make the code runnable with the current interface.
    // A proper implementation requires repository changes.
    const repoResult = await this.performFallbackSearch(validInput, searchCriteria);


    if (repoResult.isFailure()) {
      return Result.failure(repoResult.error);
    }

    const paginatedMemoryItems = repoResult.value;
    const outputItems = paginatedMemoryItems.items.map((item) =>
      this.mapMemoryItemToListItem(item),
    );

    return Result.ok({
      items: outputItems,
      totalCount: paginatedMemoryItems.totalCount,
      page: paginatedMemoryItems.page,
      pageSize: paginatedMemoryItems.pageSize,
      totalPages: paginatedMemoryItems.totalPages,
    });
  }

  private mapInputToCriteria(
    input: SearchMemoryItemsUseCaseInput,
  ): SearchCriteria {
    const criteria: SearchCriteria = {};
    if (input.agentId) {
      criteria.agentId = Identity.fromString(input.agentId);
    }
    if (input.queryText) {
      criteria.queryText = input.queryText;
    }
    if (input.tags && input.tags.length > 0) {
      criteria.tags = input.tags;
    }
    return criteria;
  }

  private mapMemoryItemToListItem(
    item: MemoryItem,
  ): z.infer<typeof MemoryListItemSchema> {
    // Content excerpt: for now, take first 100 chars. A more sophisticated method might be needed.
    const fullContent = item.content().value();
    const excerpt = fullContent.length > 100 ? fullContent.substring(0, 100) + '...' : fullContent;

    return {
      id: item.id.value(),
      contentExcerpt: excerpt,
      agentId: item.agentId()?.value() || null,
      tags: item.tags().value(),
      source: item.source().value(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  // FALLBACK IMPLEMENTATION - to be replaced by proper repository method
  private async performFallbackSearch(
    input: SearchMemoryItemsUseCaseInput,
    criteria: SearchCriteria,
  ): Promise<Result<PaginatedMemoryItems, DomainError | RepositoryError>> {
    // This is a very simplified and inefficient fallback.
    // It primarily uses listAll or findByAgentId and then filters in memory.
    let allItemsResult: Result<MemoryItem[], DomainError | RepositoryError>;

    if (criteria.agentId) {
      // Note: Current findByAgentId doesn't support further filtering by text/tags or robust pagination for the *total filtered set*.
      allItemsResult = await this.memoryRepository.findByAgentId(criteria.agentId);
    } else {
      allItemsResult = await this.memoryRepository.listAll();
    }

    if (allItemsResult.isFailure()) {
      return Result.failure(allItemsResult.error);
    }

    let filteredItems = allItemsResult.value;

    // In-memory filtering (inefficient)
    if (criteria.queryText) {
      const queryLower = criteria.queryText.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.content().value().toLowerCase().includes(queryLower)
      );
    }
    if (criteria.tags && criteria.tags.length > 0) {
      filteredItems = filteredItems.filter(item => {
        const itemTags = item.tags().value();
        return criteria.tags!.every(filterTag => itemTags.includes(filterTag)); // Assuming AND logic for tags
      });
    }

    const totalCount = filteredItems.length;
    const page = input.page;
    const pageSize = input.pageSize;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return Result.ok({
      items: paginatedItems,
      totalCount,
      page,
      pageSize,
      totalPages,
    });
  }
}
