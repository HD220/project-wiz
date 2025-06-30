// src_refactored/core/application/use-cases/memory/search-memory-items.use-case.ts
import { inject, injectable } from 'inversify';

import { ILoggerService, ILoggerServiceToken } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';

// DomainError is not used
import { ValueError } from '@/domain/common/errors';
import { MemoryItem } from '@/domain/memory/memory-item.entity';
import { IMemoryRepository, IMemoryRepositoryToken } from '@/domain/memory/ports/memory-repository.interface';
import { MemorySearchFilters, PaginationOptions, PaginatedMemoryItemsResult } from '@/domain/memory/ports/memory-repository.types';

import { ApplicationError } from '@/application/common/errors';
// Standardized to IUseCase
import { IUseCase } from '@/application/common/ports/use-case.interface';

// Renamed 'error' to 'resultError' to avoid conflict
import { Result, ok, error as resultError, isSuccess } from '@/shared/result';

import {
  SearchMemoryItemsUseCaseInput,
  SearchMemoryItemsUseCaseInputSchema,
  SearchMemoryItemsUseCaseOutput,
  MemoryListItem,
} from './search-memory-items.schema';

const CONTENT_EXCERPT_LENGTH = 200;

@injectable()
export class SearchMemoryItemsUseCase
  // Changed Executable to IUseCase
  implements IUseCase<SearchMemoryItemsUseCaseInput, SearchMemoryItemsUseCaseOutput, ApplicationError>
{
  constructor(
    @inject(IMemoryRepositoryToken) private readonly memoryRepository: IMemoryRepository,
    @inject(ILoggerServiceToken) private readonly logger: ILoggerService,
  ) {}

  public async execute(
    input: SearchMemoryItemsUseCaseInput,
  ): Promise<Result<SearchMemoryItemsUseCaseOutput, ApplicationError>> {
    this.logger.debug('SearchMemoryItemsUseCase: Starting execution with input:', input);

    const validationResult = this.validateInput(input);
    if (!isSuccess(validationResult)) {
      this.logger.warn('SearchMemoryItemsUseCase: Input validation failed.', validationResult.error);
      return resultError(validationResult.error);
    }
    const validatedInput = validationResult.value;

    const filtersResult = this.buildSearchFilters(validatedInput);
    if (!isSuccess(filtersResult)) {
        this.logger.warn('SearchMemoryItemsUseCase: Failed to build search filters.', filtersResult.error);
        return resultError(filtersResult.error);
    }
    const searchFilters = filtersResult.value;

    const paginationOptions: PaginationOptions = {
      page: validatedInput.page,
      pageSize: validatedInput.pageSize,
    };

    try {
      // Type assertion for repoResult.value needed if PaginatedMemoryItemsResult is not directly returned by IMemoryRepository.search
      const repoResult = await this.memoryRepository.search(searchFilters, paginationOptions);

      if (!isSuccess(repoResult)) {
        this.logger.error('SearchMemoryItemsUseCase: Repository search failed.', repoResult.error);
        const appError = repoResult.error instanceof ApplicationError
          ? repoResult.error
          : new ApplicationError(`Search operation failed: ${repoResult.error.message}`);
        return resultError(appError);
      }

      const paginatedMemoryItems = repoResult.value as PaginatedMemoryItemsResult;
      const output = this.mapToOutput(paginatedMemoryItems);

      this.logger.debug('SearchMemoryItemsUseCase: Execution successful.');
      return ok(output);

    } catch (errorValue) {
      this.logger.error('SearchMemoryItemsUseCase: Unhandled error during execution.', errorValue);
      const errorMessage = errorValue instanceof Error ? errorValue.message : String(errorValue);
      return resultError(new ApplicationError(`An unexpected error occurred: ${errorMessage}`));
    }
  }

  private validateInput(input: SearchMemoryItemsUseCaseInput): Result<SearchMemoryItemsUseCaseInput, ApplicationError> {
    const parseResult = SearchMemoryItemsUseCaseInputSchema.safeParse(input);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return resultError(new ApplicationError(`Invalid input: ${errorMessages}`));
    }
    // parseResult.data contains input with defaults applied by Zod
    return ok(parseResult.data);
  }

  private buildSearchFilters(validatedInput: SearchMemoryItemsUseCaseInput): Result<MemorySearchFilters, ApplicationError> {
    let agentIdVO: Identity | null | undefined = undefined;
    try {
      if (validatedInput.agentId !== undefined) {
          if (validatedInput.agentId === null) {
              agentIdVO = null;
          } else {
              agentIdVO = Identity.create(validatedInput.agentId);
          }
      }

      // Future: Wrap validatedInput.queryText and validatedInput.tags in VOs here if they have complex validation
      // For now, they are passed as primitives/simple arrays as per MemorySearchFilters interface.

      const filters: MemorySearchFilters = {
        agentId: agentIdVO,
        queryText: validatedInput.queryText,
        tags: validatedInput.tags,
      };
      return ok(filters);
    } catch (errorValue) {
      if (errorValue instanceof ValueError) {
        this.logger.warn(`SearchMemoryItemsUseCase: Error building search filters - ${errorValue.message}`);
        return resultError(new ApplicationError(`Invalid filter parameter: ${errorValue.message}`));
      }
      this.logger.error('SearchMemoryItemsUseCase: Unexpected error building search filters.', errorValue);
      // Fallback for unexpected errors during filter building that are not ValueError
      const message = errorValue instanceof Error ? errorValue.message : String(errorValue);
      return resultError(new ApplicationError(`Unexpected error building filters: ${message}`));
    }
  }

  private mapToOutput(
    paginatedResult: PaginatedMemoryItemsResult
  ): SearchMemoryItemsUseCaseOutput {
    const memoryListItems = paginatedResult.items.map(item => this.mapMemoryItemToListItem(item));

    return {
      items: memoryListItems,
      totalCount: paginatedResult.totalCount,
      page: paginatedResult.page,
      pageSize: paginatedResult.pageSize,
      totalPages: paginatedResult.totalPages,
    };
  }

  private mapMemoryItemToListItem(item: MemoryItem): MemoryListItem {
    const contentValue = item.content().value();
    const excerpt = contentValue.length > CONTENT_EXCERPT_LENGTH
      ? `${contentValue.substring(0, CONTENT_EXCERPT_LENGTH)}...`
      : contentValue;

    const agentIdValue = item.agentId() ? item.agentId()!.value : null;
    // Ensure tags and source are presented correctly if their VOs might return null/undefined for empty values
    const tagsValue = item.tags().value() ? item.tags().value() : [];
    const sourceValue = item.source().value() ? item.source().value() : null;

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
