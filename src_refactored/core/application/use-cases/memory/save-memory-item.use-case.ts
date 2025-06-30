// src_refactored/core/application/use-cases/memory/save-memory-item.use-case.ts
import { ZodError } from 'zod';

// For AgentId
import { Identity } from '@/core/common/value-objects/identity.vo';

import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { MemoryItem } from '@/domain/memory/memory-item.entity';
import { IMemoryRepository } from '@/domain/memory/ports/memory-repository.interface';
import { MemoryItemContent } from '@/domain/memory/value-objects/memory-item-content.vo';
import { MemoryItemEmbedding } from '@/domain/memory/value-objects/memory-item-embedding.vo';
import { MemoryItemId } from '@/domain/memory/value-objects/memory-item-id.vo';
import { MemoryItemSource } from '@/domain/memory/value-objects/memory-item-source.vo';
import { MemoryItemTags } from '@/domain/memory/value-objects/memory-item-tags.vo';

// Corrected import
import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { Result, ok, error } from '@/shared/result';

import {
  SaveMemoryItemUseCaseInput,
  SaveMemoryItemUseCaseInputSchema,
  SaveMemoryItemUseCaseOutput,
} from './save-memory-item.schema';

// Optional: Define IEmbeddingService if embedding generation is part of this use case
// export interface IEmbeddingService {
//   generateEmbedding(text: string): Promise<Result<number[], Error>>;
// }
// export const IEmbeddingServiceToken = Symbol('IEmbeddingService');

export class SaveMemoryItemUseCase
  implements
    // Changed IUseCase back to Executable to match import alias
    Executable<
      SaveMemoryItemUseCaseInput,
      SaveMemoryItemUseCaseOutput,
      DomainError | ZodError | ValueError | NotFoundError
    >
{
  constructor(
    private memoryRepository: IMemoryRepository,
    // private embeddingService?: IEmbeddingService, // Optional: if generating embeddings
  ) {}

  async execute(
    input: SaveMemoryItemUseCaseInput,
  ): Promise<Result<SaveMemoryItemUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = SaveMemoryItemUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const memoryItemEntity = validInput.id
        ? await this._updateMemoryItem(validInput)
        : this._createMemoryItem(validInput);

      if (memoryItemEntity instanceof DomainError || memoryItemEntity instanceof NotFoundError) {
        return error(memoryItemEntity);
      }

      const saveResult = await this.memoryRepository.save(memoryItemEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save memory item: ${saveResult.value.message}`, saveResult.value));
      }

      const finalEntity = saveResult.isOk() && saveResult.value instanceof MemoryItem ? saveResult.value : memoryItemEntity;

      return ok({
        memoryItemId: finalEntity.id().value(),
        createdAt: finalEntity.createdAt().toISOString(),
        updatedAt: finalEntity.updatedAt().toISOString(),
      });

    } catch (errValue: unknown) {
      return this._handleUseCaseError(errValue);
    }
  }

  private _createMemoryItem(validInput: SaveMemoryItemUseCaseInput): MemoryItem {
    const contentVo = MemoryItemContent.create(validInput.content);
    const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : null;
    const tagsVo = MemoryItemTags.create(validInput.tags || []);
    const sourceVo = MemoryItemSource.create(validInput.source);
    const embeddingVo = MemoryItemEmbedding.create(validInput.embedding);
    const newItemId = MemoryItemId.generate();

    return MemoryItem.create({
      id: newItemId,
      content: contentVo,
      agentId: agentIdVo,
      tags: tagsVo,
      source: sourceVo,
      embedding: embeddingVo,
    });
  }

  private async _updateMemoryItem(validInput: SaveMemoryItemUseCaseInput): Promise<MemoryItem | DomainError | NotFoundError> {
    const itemIdVo = MemoryItemId.fromString(validInput.id!);
    const existingResult = await this.memoryRepository.findById(itemIdVo);

    if (existingResult.isError()) {
      return new DomainError(`Failed to fetch memory item for update: ${existingResult.value.message}`, existingResult.value);
    }
    const existingItem = existingResult.value;
    if (!existingItem) {
      return new NotFoundError(`MemoryItem with ID ${validInput.id} not found for update.`);
    }

    let memoryItemEntity = existingItem;

    memoryItemEntity = this._updateContentIfChanged(memoryItemEntity, validInput.content);
    memoryItemEntity = this._updateAgentIdIfChanged(memoryItemEntity, validInput);
    memoryItemEntity = this._updateTagsIfChanged(memoryItemEntity, validInput);
    memoryItemEntity = this._updateSourceIfChanged(memoryItemEntity, validInput);
    memoryItemEntity = this._updateEmbeddingIfChanged(memoryItemEntity, validInput);

    return memoryItemEntity;
  }

  private _updateContentIfChanged(entity: MemoryItem, newContent: string): MemoryItem {
    const contentVo = MemoryItemContent.create(newContent);
    if (!entity.content().equals(contentVo)) {
      return entity.updateContent(contentVo);
    }
    return entity;
  }

  private _updateAgentIdIfChanged(entity: MemoryItem, validInput: SaveMemoryItemUseCaseInput): MemoryItem {
    if (Object.prototype.hasOwnProperty.call(validInput, 'agentId')) {
      const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : null;
      if (!entity.agentId()?.equals(agentIdVo) && (entity.agentId() || agentIdVo)) {
        return entity.assignAgent(agentIdVo);
      }
    }
    return entity;
  }

  private _updateTagsIfChanged(entity: MemoryItem, validInput: SaveMemoryItemUseCaseInput): MemoryItem {
    if (Object.prototype.hasOwnProperty.call(validInput, 'tags')) {
      const tagsVo = MemoryItemTags.create(validInput.tags || []);
      if (!entity.tags().equals(tagsVo)) {
        return entity.updateTags(tagsVo);
      }
    }
    return entity;
  }

  private _updateSourceIfChanged(entity: MemoryItem, validInput: SaveMemoryItemUseCaseInput): MemoryItem {
    if (Object.prototype.hasOwnProperty.call(validInput, 'source')) {
      const sourceVo = MemoryItemSource.create(validInput.source);
      if (!entity.source().equals(sourceVo)) {
        return entity.updateSource(sourceVo);
      }
    }
    return entity;
  }

  private _updateEmbeddingIfChanged(entity: MemoryItem, validInput: SaveMemoryItemUseCaseInput): MemoryItem {
    if (Object.prototype.hasOwnProperty.call(validInput, 'embedding')) {
      const embeddingVo = MemoryItemEmbedding.create(validInput.embedding);
      if (!entity.embedding().equals(embeddingVo)) {
        return entity.setEmbedding(embeddingVo);
      }
    }
    return entity;
  }

  private _handleUseCaseError(errorValue: unknown): Result<never, DomainError | ZodError | ValueError | NotFoundError> {
    if (errorValue instanceof ZodError || errorValue instanceof NotFoundError || errorValue instanceof DomainError || errorValue instanceof ValueError) {
      return error(errorValue);
    }
    const message = errorValue instanceof Error ? errorValue.message : String(errorValue);
    return error(new DomainError(`Unexpected error saving memory item: ${message}`));
  }
}
