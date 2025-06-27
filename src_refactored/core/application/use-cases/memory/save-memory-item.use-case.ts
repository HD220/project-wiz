// src_refactored/core/application/use-cases/memory/save-memory-item.use-case.ts
import { ZodError } from 'zod';

import { Identity } from '@/core/common/value-objects/identity.vo'; // For AgentId

import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { MemoryItem } from '@/domain/memory/memory-item.entity';
import { IMemoryRepository } from '@/domain/memory/ports/memory-repository.interface';
import { MemoryItemContent } from '@/domain/memory/value-objects/memory-item-content.vo';
import { MemoryItemEmbedding } from '@/domain/memory/value-objects/memory-item-embedding.vo';
import { MemoryItemId } from '@/domain/memory/value-objects/memory-item-id.vo';
import { MemoryItemSource } from '@/domain/memory/value-objects/memory-item-source.vo';
import { MemoryItemTags } from '@/domain/memory/value-objects/memory-item-tags.vo';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface'; // Corrected import

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
    Executable< // Changed IUseCase back to Executable to match import alias
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
      const contentVo = MemoryItemContent.create(validInput.content);
      const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : null;
      const tagsVo = MemoryItemTags.create(validInput.tags || []); // Default to empty array if undefined
      const sourceVo = MemoryItemSource.create(validInput.source); // VO handles null/undefined

      // Handle embedding: if provided, use it. If not, and an embedding service exists, generate it.
      // For this iteration, we assume embedding is provided or is null.
      let embeddingVo = MemoryItemEmbedding.create(validInput.embedding);
      // if (!validInput.embedding && this.embeddingService) {
      //   const embeddingResult = await this.embeddingService.generateEmbedding(validInput.content);
      //   if (embeddingResult.isError()) {
      //     return error(new DomainError(`Failed to generate embedding: ${embeddingResult.value.message}`, embeddingResult.value));
      //   }
      //   embeddingVo = MemoryItemEmbedding.create(embeddingResult.value);
      // } else {
      //   embeddingVo = MemoryItemEmbedding.create(validInput.embedding);
      // }


      let memoryItemEntity: MemoryItem;

      if (validInput.id) { // Update existing
        const itemIdVo = MemoryItemId.fromString(validInput.id);
        const existingResult = await this.memoryRepository.findById(itemIdVo);
        if (existingResult.isError()) {
          return error(new DomainError(`Failed to fetch memory item for update: ${existingResult.value.message}`, existingResult.value));
        }
        const existingItem = existingResult.value;
        if (!existingItem) {
          return error(new NotFoundError(`MemoryItem with ID ${validInput.id} not found for update.`));
        }
        memoryItemEntity = existingItem;
        let updated = false;

        if (!memoryItemEntity.content().equals(contentVo)) {
          memoryItemEntity = memoryItemEntity.updateContent(contentVo);
          updated = true;
          // If content changes, embedding might need recalculation if not provided
          // if (!validInput.embedding && this.embeddingService) { /* ... regenerate ... */ }
        }
        if (validInput.hasOwnProperty('agentId')) {
          if (!memoryItemEntity.agentId()?.equals(agentIdVo) && (memoryItemEntity.agentId() || agentIdVo)) {
            memoryItemEntity = memoryItemEntity.assignAgent(agentIdVo);
            updated = true;
          }
        }
        if (validInput.hasOwnProperty('tags')) {
           if (!memoryItemEntity.tags().equals(tagsVo)){
            memoryItemEntity = memoryItemEntity.updateTags(tagsVo);
            updated = true;
           }
        }
        if (validInput.hasOwnProperty('source')) {
          if (!memoryItemEntity.source().equals(sourceVo)){
            memoryItemEntity = memoryItemEntity.updateSource(sourceVo);
            updated = true;
          }
        }
        if (validInput.hasOwnProperty('embedding')) { // Check if embedding was part of input
            if(!memoryItemEntity.embedding().equals(embeddingVo)){
                memoryItemEntity = memoryItemEntity.setEmbedding(embeddingVo);
                updated = true;
            }
        }
        // if (!updated) return ok({ // No actual change, return existing data
        //   memoryItemId: memoryItemEntity.id().value(),
        //   createdAt: memoryItemEntity.createdAt().toISOString(),
        //   updatedAt: memoryItemEntity.updatedAt().toISOString(),
        // });

      } else { // Create new
        const newItemId = MemoryItemId.generate();
        memoryItemEntity = MemoryItem.create({
          id: newItemId,
          content: contentVo,
          agentId: agentIdVo,
          tags: tagsVo,
          source: sourceVo,
          embedding: embeddingVo,
        });
      }

      const saveResult = await this.memoryRepository.save(memoryItemEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save memory item: ${saveResult.value.message}`, saveResult.value));
      }

      // Assuming save might return the persisted entity or void. We use entity from memory for response.
      const finalEntity = saveResult.isOk() && saveResult.value instanceof MemoryItem ? saveResult.value : memoryItemEntity;

      return ok({
        memoryItemId: finalEntity.id().value(),
        createdAt: finalEntity.createdAt().toISOString(),
        updatedAt: finalEntity.updatedAt().toISOString(),
      });

    } catch (err: any) {
      if (err instanceof ZodError || err instanceof NotFoundError || err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error(`[SaveMemoryItemUseCase] Unexpected error:`, err);
      return error(new DomainError(`Unexpected error saving memory item: ${err.message || err}`));
    }
  }
}
