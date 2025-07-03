import { injectable, inject } from "inversify";

import { MEMORY_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { Identity } from "@/core/common/value-objects/identity.vo";
import { NotFoundError } from "@/core/domain/common/errors";
import { MemoryItem } from "@/core/domain/memory/memory-item.entity";
import { IMemoryRepository } from "@/core/domain/memory/ports/memory-repository.interface";
import { MemoryItemContent } from "@/core/domain/memory/value-objects/memory-item-content.vo";
import { MemoryItemEmbedding } from "@/core/domain/memory/value-objects/memory-item-embedding.vo";
import { MemoryItemId } from "@/core/domain/memory/value-objects/memory-item-id.vo";
import { MemoryItemSource } from "@/core/domain/memory/value-objects/memory-item-source.vo";
import { MemoryItemTags } from "@/core/domain/memory/value-objects/memory-item-tags.vo";

import {
  IUseCaseResponse,
  successUseCaseResponse,
} from "@/shared/application/use-case-response.dto";

import {
  SaveMemoryItemUseCaseInput,
  SaveMemoryItemUseCaseInputSchema,
  SaveMemoryItemUseCaseOutput,
} from "./save-memory-item.schema";

@injectable()
export class SaveMemoryItemUseCase
  implements
    IUseCase<
      SaveMemoryItemUseCaseInput,
      SaveMemoryItemUseCaseOutput
    >
{
  constructor(
    @inject(MEMORY_REPOSITORY_INTERFACE_TYPE) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  async execute(
    input: SaveMemoryItemUseCaseInput
  ): Promise<IUseCaseResponse<SaveMemoryItemUseCaseOutput>> {
    const validInput = SaveMemoryItemUseCaseInputSchema.parse(input);

    let memoryItemEntity: MemoryItem;
    if (validInput.id) {
      memoryItemEntity = await this._updateMemoryItem(validInput);
    } else {
      memoryItemEntity = this._createMemoryItem(validInput);
    }

    const finalMemoryItem = await this.memoryRepository.save(memoryItemEntity);

    return successUseCaseResponse({
      memoryItemId: finalMemoryItem.id.value(),
      createdAt: finalMemoryItem.createdAt.toISOString(),
      updatedAt: finalMemoryItem.updatedAt.toISOString(),
    });
  }

  private _createMemoryItem(validInput: SaveMemoryItemUseCaseInput): MemoryItem {
    const contentVo = MemoryItemContent.create(validInput.content);
    const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : undefined;
    const tagsVo = MemoryItemTags.create(validInput.tags || []);
    const sourceVo = MemoryItemSource.create(validInput.source || '');
    const embeddingVo = validInput.embedding ? MemoryItemEmbedding.create(validInput.embedding) : undefined;
    const newId = MemoryItemId.generate();

    const memoryItem = MemoryItem.create({
      id: newId,
      content: contentVo,
      agentId: agentIdVo === undefined ? null : agentIdVo,
      tags: tagsVo,
      source: sourceVo,
      embedding: embeddingVo,
    });
    return memoryItem;
  }

  private async _updateMemoryItem(validInput: SaveMemoryItemUseCaseInput): Promise<MemoryItem> {
    const itemIdVo = MemoryItemId.fromString(validInput.id!);
    const existingItem = await this.memoryRepository.findById(itemIdVo);

    if (!existingItem) {
      throw new NotFoundError(`MemoryItem with ID ${validInput.id} not found for update.`);
    }

    let updatedItem = existingItem;

    if (validInput.content) {
      updatedItem = updatedItem.updateContent(MemoryItemContent.create(validInput.content));
    }
    if (Object.prototype.hasOwnProperty.call(validInput, 'agentId')) {
      const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : undefined;
      updatedItem = updatedItem.assignAgent(agentIdVo === undefined ? null : agentIdVo);
    }
    if (validInput.tags) {
      updatedItem = updatedItem.updateTags(MemoryItemTags.create(validInput.tags));
    }
    if (Object.prototype.hasOwnProperty.call(validInput, 'source')) {
      updatedItem = updatedItem.updateSource(MemoryItemSource.create(validInput.source || ''));
    }
    if (validInput.embedding) {
      updatedItem = updatedItem.setEmbedding(MemoryItemEmbedding.create(validInput.embedding));
    }

    return updatedItem;
  }
}