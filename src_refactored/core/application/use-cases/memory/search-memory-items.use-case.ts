// src_refactored/core/application/use-cases/memory/search-memory-items.use-case.ts
import { Executable } from '../../common/executable';
import { Result, ok, error as resultError, isSuccess } from '../../../../shared/result'; // Renamed 'error' to 'resultError' to avoid conflict
import { DomainError, ValueError } from '@/refactored/core/common/errors';
import { ApplicationError } from '@/refactored/core/application/common/errors';
import { ILoggerService, ILoggerServiceToken } from '../../../common/services/i-logger.service';
import { IMemoryRepository, IMemoryRepositoryToken } from '../../../domain/memory/ports/memory-repository.interface';
import { MemorySearchFilters, PaginationOptions, PaginatedMemoryItemsResult } from '../../../domain/memory/ports/memory-repository.types';
import { MemoryItem } from '../../../domain/memory/memory-item.entity';
import { Identity } from '../../../common/value-objects/identity.vo';
import {
  SearchMemoryItemsUseCaseInput,
  SearchMemoryItemsUseCaseInputSchema,
  SearchMemoryItemsUseCaseOutput,
  MemoryListItem,
} from './search-memory-items.schema';
import { inject, injectable } from 'inversify';

const CONTENT_EXCERPT_LENGTH = 200;

@injectable()
export class SearchMemoryItemsUseCase
  implements Executable<SearchMemoryItemsUseCaseInput, SearchMemoryItemsUseCaseOutput, ApplicationError>
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

    } catch (err) { // Changed variable name from error to err
      this.logger.error('SearchMemoryItemsUseCase: Unhandled error during execution.', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return resultError(new ApplicationError(`An unexpected error occurred: ${errorMessage}`));
    }
  }

  private validateInput(input: SearchMemoryItemsUseCaseInput): Result<SearchMemoryItemsUseCaseInput, ApplicationError> {
    const parseResult = SearchMemoryItemsUseCaseInputSchema.safeParse(input);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return resultError(new ApplicationError(`Invalid input: ${errorMessages}`));
    }
    return ok(parseResult.data); // parseResult.data contains input with defaults applied by Zod
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
    } catch (e) {
      if (e instanceof ValueError) {
        this.logger.warn(`SearchMemoryItemsUseCase: Error building search filters - ${e.message}`);
        return resultError(new ApplicationError(`Invalid filter parameter: ${e.message}`));
      }
      this.logger.error('SearchMemoryItemsUseCase: Unexpected error building search filters.', e);
      // Fallback for unexpected errors during filter building that are not ValueError
      return resultError(new ApplicationError(`Unexpected error building filters: ${e instanceof Error ? e.message : String(e)}`));
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
