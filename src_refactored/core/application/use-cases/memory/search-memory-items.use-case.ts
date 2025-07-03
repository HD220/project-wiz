// src_refactored/core/application/use-cases/memory/search-memory-items.use-case.ts
import { inject, injectable } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';

import { ValueError, DomainError } from '@/domain/common/errors';
import { MemoryItem } from '@/domain/memory/memory-item.entity';
import { IMemoryRepository } from '@/domain/memory/ports/memory-repository.interface';
// Import supporting types directly from memory-repository.types.ts
import {
  MemorySearchFilters,
  PaginatedMemoryItemsResult,
  PaginationOptions // Now correctly sourced
} from '@/domain/memory/ports/memory-repository.types';

import { ApplicationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isSuccess, isError } from '@/shared/result';

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
  ): Promise<IUseCaseResponse<SearchMemoryItemsUseCaseOutput>> {
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
        const cause = repoResult.error;
        this.logger.error(
          'SearchMemoryItemsUseCase: Repository search failed.',
          { meta: { error: cause, useCase: 'SearchMemoryItemsUseCase', input: validatedInput } },
        );
        const appError = cause instanceof ApplicationError
          ? cause
          : new ApplicationError(`Search operation failed: ${cause.message}`, cause instanceof Error ? cause : undefined);
        return resultError(appError);
      }

      const paginatedMemoryItems = repoResult.value;
      const output = this._mapToOutput(paginatedMemoryItems);

      this.logger.debug('SearchMemoryItemsUseCase: Execution successful.');
      return ok(output);

    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const logError = e instanceof Error ? e : new Error(message);
      this.logger.error(
        'SearchMemoryItemsUseCase: Unhandled error during execution.',
        { meta: { error: logError, useCase: 'SearchMemoryItemsUseCase', input } },
      );
      if (e instanceof ZodError || e instanceof ValueError) return resultError(e);
      return resultError(new ApplicationError(`An unexpected error occurred: ${message}`, logError));
    }
  }

  private _validateInput(input: SearchMemoryItemsUseCaseInput): Result<SearchMemoryItemsUseCaseInput, ZodError | ApplicationError> {
    const parseResult = SearchMemoryItemsUseCaseInputSchema.safeParse(input);
    if (!parseResult.success) {
      // ZodError is suitable for returning directly as per use case error types
      return resultError(parseResult.error);
    }
    return ok(parseResult.data);
  }

  private _buildSearchFilters(validatedInput: SearchMemoryItemsUseCaseInput): Result<MemorySearchFilters, ValueError> {
    try {
      let agentIdVO: Identity | undefined = undefined;
      if (validatedInput.agentId !== undefined && validatedInput.agentId !== null) {
          agentIdVO = Identity.fromString(validatedInput.agentId);
      }

      const filters: MemorySearchFilters = {
        agentId: agentIdVO, // Pass null if agentId is null, undefined if not provided
        queryText: validatedInput.queryText,
        tags: validatedInput.tags,
      };
      return filters;
    } catch (e: unknown) {
      const errorToLog = e instanceof Error ? e : new Error(String(e));
      if (e instanceof ValueError) {
        this.logger.warn(
          `SearchMemoryItemsUseCase: Error building search filters - ${e.message}`,
          { meta: { error: errorToLog, useCase: 'SearchMemoryItemsUseCase', method: '_buildSearchFilters', input: validatedInput } },
        );
        throw e;
      }
      this.logger.error(
        'SearchMemoryItemsUseCase: Unexpected error building search filters.',
        { meta: { error: errorToLog, useCase: 'SearchMemoryItemsUseCase', method: '_buildSearchFilters', input: validatedInput } },
      );
      throw new ValueError(`Unexpected error building filters: ${errorToLog.message}`);
    }
  }

  private _mapToOutput(
    paginatedResult: PaginatedMemoryItemsResult
  ): SearchMemoryItemsUseCaseOutput {
    // Changed paginatedResult.items to paginatedResult.data
    const memoryListItems = paginatedResult.data.map(item => this._mapMemoryItemToListItem(item));

    return {
      items: memoryListItems,
      totalCount: paginatedResult.totalCount,
      page: paginatedResult.page,
      pageSize: paginatedResult.pageSize,
      totalPages: paginatedResult.totalPages,
    };
  }

  private _mapMemoryItemToListItem(item: MemoryItem): MemoryListItem {
    const contentValue = item.content.value;
    const excerpt = contentValue.length > CONTENT_EXCERPT_LENGTH
      ? `${contentValue.substring(0, CONTENT_EXCERPT_LENGTH)}...`
      : contentValue;

    const agentIdValue = item.agentId ? item.agentId.value : null;
    const tagsValue = item.tags.value || [];
    const sourceValue = item.source.value || null;

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
