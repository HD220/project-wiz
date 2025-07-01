// src_refactored/core/application/use-cases/memory/search-memory-items.use-case.ts
import { inject, injectable } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';
import { ValueError, DomainError } from '@/domain/common/errors'; // Corrected import for ValueError
import { MemoryItem } from '@/domain/memory/memory-item.entity';
import { IMemoryRepository, MemorySearchFilters, PaginatedMemoryItemsResult } from '@/domain/memory/ports/memory-repository.interface'; // Removed IMemoryRepositoryToken
import { PaginationOptions } from '@/core/common/ports/repository.types'; // Corrected path for PaginationOptions
import { ApplicationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';
import { Result, ok, error as resultError, isSuccess, isError } from '@/shared/result';
import { TYPES } from '@/infrastructure/ioc/types';

import {
  SearchMemoryItemsUseCaseInput,
  SearchMemoryItemsUseCaseInputSchema,
  SearchMemoryItemsUseCaseOutput,
  MemoryListItem,
} from './search-memory-items.schema';

const CONTENT_EXCERPT_LENGTH = 200;

@injectable()
export class SearchMemoryItemsUseCase
  implements IUseCase<SearchMemoryItemsUseCaseInput, SearchMemoryItemsUseCaseOutput, ApplicationError | ZodError | ValueError>
{
  constructor(
    @inject(TYPES.IMemoryRepository) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  public async execute(
    input: SearchMemoryItemsUseCaseInput,
  ): Promise<Result<SearchMemoryItemsUseCaseOutput, ApplicationError | ZodError | ValueError>> {
    this.logger.debug('SearchMemoryItemsUseCase: Starting execution with input:', { input });

    const validationResult = this._validateInput(input);
    if (isError(validationResult)) {
      this.logger.warn('SearchMemoryItemsUseCase: Input validation failed.', { error: validationResult.error });
      // Assuming validationResult.error is ZodError or compatible with ApplicationError's cause
      const appError = validationResult.error instanceof ApplicationError
        ? validationResult.error
        : new ApplicationError("Input validation failed", validationResult.error instanceof Error ? validationResult.error : undefined);
      return resultError(appError);
    }
    const validatedInput = validationResult.value;

    try {
      const filtersResult = this._buildSearchFilters(validatedInput);
      if (isError(filtersResult)) {
          this.logger.warn('SearchMemoryItemsUseCase: Failed to build search filters.', { error: filtersResult.error });
          const appError = filtersResult.error instanceof ApplicationError ? filtersResult.error : new ApplicationError("Filter building failed", filtersResult.error);
          return resultError(appError);
      }
      const searchFilters = filtersResult.value;

      const paginationOptions: PaginationOptions = {
        page: validatedInput.page,
        pageSize: validatedInput.pageSize,
      };

      const repoResult = await this.memoryRepository.search(searchFilters, paginationOptions);

      if (isError(repoResult)) {
        this.logger.error('SearchMemoryItemsUseCase: Repository search failed.', { originalError: repoResult.error });
        const cause = repoResult.error;
        const appError = cause instanceof ApplicationError
          ? cause
          : new ApplicationError(`Search operation failed: ${cause.message}`, cause instanceof Error ? cause : undefined);
        return resultError(appError);
      }

      // repoResult.value is PaginatedMemoryItemsResult
      const paginatedMemoryItems = repoResult.value;
      const output = this._mapToOutput(paginatedMemoryItems);

      this.logger.debug('SearchMemoryItemsUseCase: Execution successful.');
      return ok(output);

    } catch (e: unknown) { // Catch errors from _buildSearchFilters if Identity.fromString throws (now wrapped)
      // Or other truly unexpected errors
      const message = e instanceof Error ? e.message : String(e);
      const logError = e instanceof Error ? e : new Error(message);
      this.logger.error('SearchMemoryItemsUseCase: Unhandled error during execution.', { originalError: logError });
      // Ensure the error type matches the use case's declared error types
      if (e instanceof ZodError || e instanceof ValueError) return resultError(e);
      return resultError(new ApplicationError(`An unexpected error occurred: ${message}`, logError));
    }
  }

  private _validateInput(input: SearchMemoryItemsUseCaseInput): Result<SearchMemoryItemsUseCaseInput, ZodError | ApplicationError> {
    const parseResult = SearchMemoryItemsUseCaseInputSchema.safeParse(input);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      // Return ZodError directly, or wrap if ApplicationError is preferred for all validation issues
      return resultError(parseResult.error);
    }
    return ok(parseResult.data);
  }

  private _buildSearchFilters(validatedInput: SearchMemoryItemsUseCaseInput): Result<MemorySearchFilters, ValueError> {
    try {
      let agentIdVO: Identity | undefined = undefined; // Use undefined for optional VOs
      if (validatedInput.agentId !== undefined && validatedInput.agentId !== null) { // Check for null explicitly if schema allows
          agentIdVO = Identity.fromString(validatedInput.agentId);
      }

      const filters: MemorySearchFilters = {
        agentId: agentIdVO,
        queryText: validatedInput.queryText,
        tags: validatedInput.tags,
      };
      return ok(filters);
    } catch (e: unknown) {
      if (e instanceof ValueError) {
        this.logger.warn(`SearchMemoryItemsUseCase: Error building search filters - ${e.message}`, {error: e});
        return resultError(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error('SearchMemoryItemsUseCase: Unexpected error building search filters.', { error: e });
      return resultError(new ValueError(`Unexpected error building filters: ${message}`));
    }
  }

  private _mapToOutput(
    paginatedResult: PaginatedMemoryItemsResult
  ): SearchMemoryItemsUseCaseOutput {
    const memoryListItems = paginatedResult.items.map(item => this._mapMemoryItemToListItem(item));

    return {
      items: memoryListItems,
      totalCount: paginatedResult.totalCount,
      page: paginatedResult.page,
      pageSize: paginatedResult.pageSize,
      totalPages: paginatedResult.totalPages,
    };
  }

  private _mapMemoryItemToListItem(item: MemoryItem): MemoryListItem {
    const contentValue = item.content().value();
    const excerpt = contentValue.length > CONTENT_EXCERPT_LENGTH
      ? `${contentValue.substring(0, CONTENT_EXCERPT_LENGTH)}...`
      : contentValue;

    const agentIdValue = item.agentId() ? item.agentId()!.value() : null;
    const tagsValue = item.tags().value() || [];
    const sourceValue = item.source().value() || null; // Assuming source() returns a VO with value()

    return {
      id: item.id().value(), // Assuming id is Identity or similar VO with value()
      contentExcerpt: excerpt,
      agentId: agentIdValue,
      tags: tagsValue,
      source: sourceValue,
      createdAt: item.createdAt().toISOString(), // Assuming createdAt is a VO or Date
      updatedAt: item.updatedAt().toISOString(), // Assuming updatedAt is a VO or Date
    };
  }
}
