// src_refactored/core/application/use-cases/memory/search-similar-memory-items.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ILoggerService, ILoggerServiceToken } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';

import { MemoryItem } from '@/domain/memory/memory-item.entity';
import { IMemoryRepository, IMemoryRepositoryToken } from '@/domain/memory/ports/memory-repository.interface';
import { MemoryItemEmbedding } from '@/domain/memory/value-objects/memory-item-embedding.vo';

import { ApplicationError, ValueError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error as resultError, isSuccess } from '@/shared/result';

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
      ApplicationError | ZodError
    >
{
  constructor(
    @inject(IMemoryRepositoryToken) private readonly memoryRepository: IMemoryRepository,
    @inject(ILoggerServiceToken) private readonly logger: ILoggerService,
  ) {}

  private mapEntityToSimilarListItem(entity: MemoryItem, score?: number): SimilarMemoryListItem {
    const fullContent = entity.content().value();
    const excerptLength = 200;
    const excerpt = fullContent.length > excerptLength ? fullContent.substring(0, excerptLength - 3) + '...' : fullContent;

    return {
      id: entity.id().value(),
      contentExcerpt: excerpt,
      agentId: entity.agentId() ? entity.agentId()!.value() : null,
      tags: entity.tags().value() || [],
      source: entity.source().value(),
      createdAt: entity.createdAt().toISOString(),
      updatedAt: entity.updatedAt().toISOString(),
      relevanceScore: score,
    };
  }

  public async execute(
    input: SearchSimilarMemoryItemsUseCaseInput,
  ): Promise<Result<SearchSimilarMemoryItemsUseCaseOutput, ApplicationError | ZodError>> {
    this.logger.debug('SearchSimilarMemoryItemsUseCase: Starting execution with input:', input);

    const validationResult = this._validateInput(input);
    if (validationResult.isError()) {
      return resultError(validationResult.error);
    }
    const validInput = validationResult.value;

    const voCreationResult = this._createValueObjects(validInput);
    if (voCreationResult.isError()) {
      return resultError(voCreationResult.error);
    }
    const { embeddingVo, agentIdVo } = voCreationResult.value;

    const repoResult = await this.memoryRepository.searchSimilar(
      embeddingVo,
      agentIdVo,
      validInput.limit,
    );

    if (!isSuccess(repoResult)) {
      this.logger.error(
        `SearchSimilarMemoryItemsUseCase: Repository failed to search similar memory items.`,
        repoResult.error,
      );
      const appError = repoResult.error instanceof ApplicationError
        ? repoResult.error
        : new ApplicationError(
            `Failed to search similar memory items: ${repoResult.error.message}`,
            repoResult.error,
          );
      return resultError(appError);
    }

    const similarItems = repoResult.value.map(entity => this.mapEntityToSimilarListItem(entity));

    this.logger.debug('SearchSimilarMemoryItemsUseCase: Execution successful.');
    return ok({
      items: similarItems,
    });
  }

  private _validateInput(input: SearchSimilarMemoryItemsUseCaseInput): Result<SearchSimilarMemoryItemsUseCaseInput, ZodError> {
    const validationResult = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      this.logger.warn('SearchSimilarMemoryItemsUseCase: Input validation failed.', validationResult.error);
      return resultError(validationResult.error);
    }
    return ok(validationResult.data);
  }

  private _createValueObjects(validInput: SearchSimilarMemoryItemsUseCaseInput): Result<{ embeddingVo: MemoryItemEmbedding; agentIdVo?: Identity }, ApplicationError> {
    try {
      const embeddingVo = MemoryItemEmbedding.create(validInput.queryEmbedding);
      let agentIdVo: Identity | undefined;
      if (validInput.agentId) {
        agentIdVo = Identity.fromString(validInput.agentId);
      }
      return ok({ embeddingVo, agentIdVo });
    } catch (exception) {
      if (exception instanceof ValueError) {
        this.logger.warn(`SearchSimilarMemoryItemsUseCase: Invalid VO creation - ${exception.message}`, exception);
        return resultError(new ApplicationError(`Invalid input parameter: ${exception.message}`, exception));
      }
      this.logger.error('SearchSimilarMemoryItemsUseCase: Unexpected error creating VOs.', exception);
      const errorMessage = exception instanceof Error ? exception.message : String(exception);
      return resultError(new ApplicationError(`Unexpected error processing input: ${errorMessage}`, exception as Error));
    }
  }
}
