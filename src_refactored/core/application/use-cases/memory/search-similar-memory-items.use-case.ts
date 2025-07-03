import { injectable, inject } from "inversify";

import { MEMORY_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { Identity } from "@/core/common/value-objects/identity.vo";
import { MemoryItem } from "@/core/domain/memory/memory-item.entity";
import { IMemoryRepository } from "@/core/domain/memory/ports/memory-repository.interface";
import { MemoryItemEmbedding } from "@/core/domain/memory/value-objects/memory-item-embedding.vo";

import {
  IUseCaseResponse,
  successUseCaseResponse,
} from "@/shared/application/use-case-response.dto";




import {
  SearchSimilarMemoryItemsUseCaseInput,
  SearchSimilarMemoryItemsUseCaseInputSchema,
  SearchSimilarMemoryItemsUseCaseOutput,
  SimilarMemoryListItem,
} from "./search-similar-memory-items.schema";

@injectable()
export class SearchSimilarMemoryItemsUseCase
  implements
    IUseCase<
      SearchSimilarMemoryItemsUseCaseInput,
      SearchSimilarMemoryItemsUseCaseOutput
    >
{
  constructor(
    @inject(MEMORY_REPOSITORY_INTERFACE_TYPE) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  private mapEntityToSimilarListItem(entity: MemoryItem, score?: number): SimilarMemoryListItem {
    const fullContent = entity.content.value();
    const excerptLength = 200;
    const excerpt = fullContent.length > excerptLength ? fullContent.substring(0, excerptLength - 3) + "..." : fullContent;

    return {
      id: entity.id.value(),
      contentExcerpt: excerpt,
      agentId: entity.agentId?.value() || null,
      tags: entity.tags.value() || [],
      source: entity.source.value(),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      relevanceScore: score,
    };
  }

  public async execute(
    input: SearchSimilarMemoryItemsUseCaseInput
  ): Promise<IUseCaseResponse<SearchSimilarMemoryItemsUseCaseOutput>> {
    this.logger.debug("SearchSimilarMemoryItemsUseCase: Starting execution with input:", { input });

    const validInput = SearchSimilarMemoryItemsUseCaseInputSchema.parse(input);

    const { embeddingVo, agentIdVo } = this._createValueObjects(validInput);

    const similarItems = await this.memoryRepository.searchSimilar(
      embeddingVo,
      agentIdVo,
      validInput.limit
    );

    const outputItems = similarItems.map((item) => this.mapEntityToSimilarListItem(item));

    this.logger.debug("SearchSimilarMemoryItemsUseCase: Execution successful.");
    return successUseCaseResponse({
      items: outputItems,
    });
  }

  private _createValueObjects(validInput: SearchSimilarMemoryItemsUseCaseInput): {
    embeddingVo: MemoryItemEmbedding;
    agentIdVo?: Identity;
  } {
    const embeddingVo = MemoryItemEmbedding.create(validInput.queryEmbedding);
    let agentIdVo: Identity | undefined;
    if (validInput.agentId) {
      agentIdVo = Identity.fromString(validInput.agentId);
    }
    return { embeddingVo, agentIdVo };
  }
}