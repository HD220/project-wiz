// src_refactored/core/application/use-cases/memory/search-similar-memory-items.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';

import { ValueError, DomainError } from '@/domain/common/errors';
import { MemoryItem } from '@/domain/memory/memory-item.entity';
import { IMemoryRepository } from '@/domain/memory/ports/memory-repository.interface';
import { MemoryItemEmbedding } from '@/domain/memory/value-objects/memory-item-embedding.vo';

import { ApplicationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isSuccess, isError } from '@/shared/result';

import {
  SearchSimilarMemoryItemsUseCaseInput,
  SearchSimilarMemoryItemsUseCaseInputSchema,
  SearchSimilarMemoryItemsUseCaseOutput,
  SimilarMemoryListItem,
} from './search-similar-memory-items.schema';

@injectable()
export class SearchSimilarMemoryItemsUseCase
  implements
    IUseCase<
      SearchSimilarMemoryItemsUseCaseInput,
      SearchSimilarMemoryItemsUseCaseOutput,
      ApplicationError | ZodError | ValueError // Added ValueError
    >
{
  constructor(
    @inject(TYPES.IMemoryRepository) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  private mapEntityToSimilarListItem(entity: MemoryItem, score?: number): SimilarMemoryListItem {
    const fullContent = entity.content.value;
    const excerptLength = 200;
    const excerpt = fullContent.length > excerptLength ? fullContent.substring(0, excerptLength - 3) + '...' : fullContent;

    return {
      id: entity.id.value,
      contentExcerpt: excerpt,
      agentId: entity.agentId?.value || null,
      tags: entity.tags.value || [],
      source: entity.source.value,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      relevanceScore: score,
    };
  }

  public async execute(
    input: SearchSimilarMemoryItemsUseCaseInput,
  ): Promise<IUseCaseResponse<SearchSimilarMemoryItemsUseCaseOutput>> {
    this.logger.debug('SearchSimilarMemoryItemsUseCase: Starting execution with input:', { input });

    const validationResult = this._validateInput(input);
    if (isError(validationResult)) {
      return resultError(validationResult.error);
    }
    const validInput = validationResult.value;

    try {
      const voCreationResult = this._createValueObjects(validInput);
      if (isError(voCreationResult)) {
        // Error from _createValueObjects is ApplicationError (wrapping ValueError) or ValueError directly
        return resultError(voCreationResult.error);
      }
      const { embeddingVo, agentIdVo } = voCreationResult.value;

      const repoResult = await this.memoryRepository.searchSimilar(
        embeddingVo,
        agentIdVo,
        validInput.limit,
      );

      if (isError(repoResult)) {
        const cause = repoResult.error;
        this.logger.error(
          `SearchSimilarMemoryItemsUseCase: Repository failed to search similar memory items.`,
          { meta: { error: cause, useCase: 'SearchSimilarMemoryItemsUseCase', input: validInput } },
        );
        const appError = cause instanceof ApplicationError
          ? cause
          : new ApplicationError(`Failed to search similar memory items: ${cause.message}`, cause instanceof Error ? cause : undefined);
        return resultError(appError);
      }

      // Assuming repoResult.value is MemoryItem[] as per IMemoryRepository.searchSimilar
      // If scores are intended, the repository interface and implementation must change.
      const similarItems = repoResult.value.map(item => this.mapEntityToSimilarListItem(item));

      this.logger.debug('SearchSimilarMemoryItemsUseCase: Execution successful.');
      return ok({
        items: similarItems,
      });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        const logError = e instanceof Error ? e : new Error(message);
        this.logger.error(
            `[SearchSimilarMemoryItemsUseCase] Unexpected error: ${message}`,
            { meta: { error: logError, useCase: 'SearchSimilarMemoryItemsUseCase', input } }
        );
        if (e instanceof ZodError || e instanceof ValueError) return resultError(e);
        return resultError(new ApplicationError(`Unexpected error searching similar memory items: ${message}`, logError));
    }
  }

  private _validateInput(input: SearchSimilarMemoryItemsUseCaseInput): Result<SearchSimilarMemoryItemsUseCaseInput, ZodError> {
    const parseResult = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
    if (!parseResult.success) {
      this.logger.warn(
        'SearchSimilarMemoryItemsUseCase: Input validation failed.',
        { meta: { error: parseResult.error.flatten(), useCase: 'SearchSimilarMemoryItemsUseCase', input } }
      );
      return resultError(parseResult.error);
    }
    return ok(parseResult.data);
  }

  private _createValueObjects(validInput: SearchSimilarMemoryItemsUseCaseInput): Result<{ embeddingVo: MemoryItemEmbedding; agentIdVo?: Identity }, ApplicationError | ValueError> {
    try {
      const embeddingVo = MemoryItemEmbedding.create(validInput.queryEmbedding);
      let agentIdVo: Identity | undefined;
      if (validInput.agentId) {
        agentIdVo = Identity.fromString(validInput.agentId);
      }
      return { embeddingVo, agentIdVo };
    } catch (e) {
      const errorToLog = e instanceof Error ? e : new Error(String(e));
      if (e instanceof ValueError) {
         this.logger.warn(
            `SearchSimilarMemoryItemsUseCase: Invalid VO creation - ${e.message}`,
            { meta: { error: errorToLog, useCase: 'SearchSimilarMemoryItemsUseCase', method: '_createValueObjects', input: validInput } }
        );
        throw e;
      }
      this.logger.error(
        'SearchSimilarMemoryItemsUseCase: Unexpected error creating VOs.',
        { meta: { error: errorToLog, useCase: 'SearchSimilarMemoryItemsUseCase', method: '_createValueObjects', input: validInput } }
      );
      throw new ApplicationError(`Unexpected error processing input: ${errorToLog.message}`, errorToLog);
    }
  }
}
