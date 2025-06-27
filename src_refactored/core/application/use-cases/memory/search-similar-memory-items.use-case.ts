// src_refactored/core/application/use-cases/memory/search-similar-memory-items.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ApplicationError, DomainError, ValueError } from '@/application/common/errors';
import { Executable } from '@/core/common/executable';
import { ILoggerService, ILoggerServiceToken } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';
import { MemoryItem } from '@/domain/memory/memory-item.entity';
import { IMemoryRepository, IMemoryRepositoryToken } from '@/domain/memory/ports/memory-repository.interface';
import { MemoryItemEmbedding } from '@/domain/memory/value-objects/memory-item-embedding.vo';
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
    Executable<
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
    // Consistent excerpt logic with SearchMemoryItemsUseCase (e.g., 200 chars)
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
      relevanceScore: score, // Score might come from repository or be calculated
    };
  }

  public async execute(
    input: SearchSimilarMemoryItemsUseCaseInput,
  ): Promise<Result<SearchSimilarMemoryItemsUseCaseOutput, ApplicationError | ZodError>> {
    this.logger.debug('SearchSimilarMemoryItemsUseCase: Starting execution with input:', input);

    const validationResult = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      this.logger.warn('SearchSimilarMemoryItemsUseCase: Input validation failed.', validationResult.error);
      return resultError(validationResult.error); // ZodError
    }
    const validInput = validationResult.data;

    let embeddingVo: MemoryItemEmbedding;
    let agentIdVo: Identity | undefined; // Undefined if not provided or null

    try {
      embeddingVo = MemoryItemEmbedding.create(validInput.queryEmbedding);
      if (validInput.agentId) { // Only create if agentId is a non-empty string
        agentIdVo = Identity.fromString(validInput.agentId);
      }
      // If validInput.agentId is null or undefined, agentIdVo remains undefined, which is fine for the repository call.
    } catch (e) {
      if (e instanceof ValueError) {
        this.logger.warn(`SearchSimilarMemoryItemsUseCase: Invalid VO creation - ${e.message}`, e);
        return resultError(new ApplicationError(`Invalid input parameter: ${e.message}`, e));
      }
      this.logger.error('SearchSimilarMemoryItemsUseCase: Unexpected error creating VOs.', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      return resultError(new ApplicationError(`Unexpected error processing input: ${errorMessage}`, e as Error));
    }

    const repoResult = await this.memoryRepository.searchSimilar(
      embeddingVo,
      agentIdVo, // Will be undefined if agentId was null or not provided in input
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

    // The repository's searchSimilar currently returns MemoryItem[].
    // If it were to return items with scores, the mapping would need to handle that.
    // For now, relevanceScore will be undefined in the output items.
    const similarItems = repoResult.value.map(entity => this.mapEntityToSimilarListItem(entity));

    this.logger.debug('SearchSimilarMemoryItemsUseCase: Execution successful.');
    return ok({
      items: similarItems,
    });
  }
}
