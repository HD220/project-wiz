// src_refactored/core/application/use-cases/memory/save-memory-item.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';

import { DomainError, ValueError, NotFoundError } from '@/domain/common/errors';
import { MemoryItem } from '@/domain/memory/memory-item.entity';
import { IMemoryRepository } from '@/domain/memory/ports/memory-repository.interface';
import { MemoryItemContent } from '@/domain/memory/value-objects/memory-item-content.vo';
import { MemoryItemEmbedding } from '@/domain/memory/value-objects/memory-item-embedding.vo';
import { MemoryItemId } from '@/domain/memory/value-objects/memory-item-id.vo';
import { MemoryItemSource } from '@/domain/memory/value-objects/memory-item-source.vo';
import { MemoryItemTags } from '@/domain/memory/value-objects/memory-item-tags.vo';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isError, isSuccess } from '@/shared/result';

import {
  SaveMemoryItemUseCaseInput,
  SaveMemoryItemUseCaseInputSchema,
  SaveMemoryItemUseCaseOutput,
} from './save-memory-item.schema';

@injectable()
export class SaveMemoryItemUseCase
  implements
    Executable<
      SaveMemoryItemUseCaseInput,
      SaveMemoryItemUseCaseOutput,
      DomainError | ZodError | ValueError | NotFoundError
    >
{
  constructor(
    @inject(TYPES.IMemoryRepository) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(
    input: SaveMemoryItemUseCaseInput,
  ): Promise<Result<SaveMemoryItemUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = SaveMemoryItemUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return resultError(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      let memoryItemEntityResult: Result<MemoryItem, DomainError | NotFoundError | ValueError>;
      if (validInput.id) {
        memoryItemEntityResult = await this._updateMemoryItem(validInput);
      } else {
        memoryItemEntityResult = this._createMemoryItem(validInput);
      }

      if (isError(memoryItemEntityResult)) {
        // Log the specific error before returning it
        this.logger.warn(`[SaveMemoryItemUseCase] Error creating/updating memory item entity: ${memoryItemEntityResult.error.message}`, { error: memoryItemEntityResult.error });
        return resultError(memoryItemEntityResult.error);
      }
      const memoryItemEntity = memoryItemEntityResult.value;

      const saveRepoResult = await this.memoryRepository.save(memoryItemEntity);

      if (isError(saveRepoResult)) {
        const cause = saveRepoResult.error;
        const errorCause = cause instanceof Error ? cause : new Error(String(cause));
        const err = cause instanceof DomainError ? cause : new DomainError(`Failed to save memory item: ${errorCause.message}`, errorCause);
        this.logger.error(
          `[SaveMemoryItemUseCase] Repository error: ${err.message}`,
          { error: cause, useCase: 'SaveMemoryItemUseCase', input: validInput },
        );
        return resultError(err);
      }

      const finalMemoryItem = (isSuccess(saveRepoResult) && saveRepoResult.value instanceof MemoryItem)
                              ? saveRepoResult.value
                              : memoryItemEntity;

      // Match SaveMemoryItemUseCaseOutput
      return ok({
        memoryItemId: finalMemoryItem.id().value(),
        createdAt: finalMemoryItem.createdAt().toISOString(),
        updatedAt: finalMemoryItem.updatedAt().toISOString(),
      });
    } catch (e: unknown) {
      return this._handleUseCaseError(e, validInput, validInput.id);
    }
  }

  private _createMemoryItem(validInput: SaveMemoryItemUseCaseInput): Result<MemoryItem, ValueError> {
    try {
      const contentVo = MemoryItemContent.create(validInput.content);
      const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : undefined;
      const tagsVo = MemoryItemTags.create(validInput.tags || []);
      const sourceVo = MemoryItemSource.create(validInput.source || '');
      const embeddingVo = validInput.embedding ? MemoryItemEmbedding.create(validInput.embedding) : undefined;
      const newId = MemoryItemId.generate();

      const memoryItem = MemoryItem.create({
        id: newId,
        content: contentVo,
        agentId: agentIdVo === undefined ? null : agentIdVo, // undefined -> null
        tags: tagsVo,
        source: sourceVo,
        embedding: embeddingVo, // This is now fine as entity prop is optional
      });
      return ok(memoryItem);
    } catch (e) {
      if (e instanceof ValueError) return resultError(e);
      const message = e instanceof Error ? e.message : String(e);
      const errorToLog = e instanceof Error ? e : new Error(message);
      this.logger.warn(
        `[SaveMemoryItemUseCase/_createMemoryItem] Error: ${message}`,
        { error: errorToLog, useCase: 'SaveMemoryItemUseCase', method: '_createMemoryItem', input: validInput },
      );
      return resultError(new ValueError(`Error creating memory item value objects: ${message}`));
    }
  }

  private async _updateMemoryItem(validInput: SaveMemoryItemUseCaseInput): Promise<Result<MemoryItem, DomainError | NotFoundError | ValueError>> {
    try {
      const itemIdVo = MemoryItemId.fromString(validInput.id!);
      const existingResult = await this.memoryRepository.findById(itemIdVo);

      if (isError(existingResult)) {
        // Ensure the error passed to DomainError is an Error instance
        const cause = existingResult.error instanceof Error ? existingResult.error : new Error(String(existingResult.error));
        return resultError(new DomainError(`Failed to fetch memory item for update: ${cause.message}`, cause));
      }
      const existingItem = existingResult.value;
      if (!existingItem) {
        return resultError(new NotFoundError(`MemoryItem with ID ${validInput.id} not found for update.`));
      }

      let updatedItem = existingItem;

      if (validInput.content) {
        updatedItem = updatedItem.updateContent(MemoryItemContent.create(validInput.content));
      }
      if (Object.prototype.hasOwnProperty.call(validInput, 'agentId')) {
        const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : undefined;
        updatedItem = updatedItem.assignAgent(agentIdVo === undefined ? null : agentIdVo); // undefined -> null
      }
      if (validInput.tags) {
        updatedItem = updatedItem.updateTags(MemoryItemTags.create(validInput.tags));
      }
      if (Object.prototype.hasOwnProperty.call(validInput, 'source')) {
        updatedItem = updatedItem.updateSource(MemoryItemSource.create(validInput.source || ''));
      }
      if (validInput.embedding) {
        updatedItem = updatedItem.setEmbedding(MemoryItemEmbedding.create(validInput.embedding)); // Changed to setEmbedding
      }

      return ok(updatedItem);
    } catch (e) {
      if (e instanceof ValueError) return resultError(e);
      const message = e instanceof Error ? e.message : String(e);
      const errorToLog = e instanceof Error ? e : new Error(message);
      this.logger.warn(
        `[SaveMemoryItemUseCase/_updateMemoryItem] Error: ${message}`,
        { error: errorToLog, useCase: 'SaveMemoryItemUseCase', method: '_updateMemoryItem', input: validInput },
      );
      return resultError(new DomainError(`Error updating memory item: ${message}`, errorToLog));
    }
  }

  private _handleUseCaseError(e: unknown, input: SaveMemoryItemUseCaseInput, idBeingProcessed?: string): Result<never, DomainError | ZodError | ValueError | NotFoundError> {
    if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
       this.logger.warn(
        `[SaveMemoryItemUseCase] Known error: ${e.message}`,
        { error: e, useCase: 'SaveMemoryItemUseCase', input, idBeingProcessed },
      );
      return resultError(e);
    }
    const message = e instanceof Error ? e.message : String(e);
    const logError = e instanceof Error ? e : new Error(message);
    this.logger.error(
      `[SaveMemoryItemUseCase] Unexpected error for memory item ID ${idBeingProcessed || 'new'}: ${message}`,
      { error: logError, useCase: 'SaveMemoryItemUseCase', input, idBeingProcessed },
    );
    return resultError(new DomainError(`Unexpected error saving memory item: ${message}`, logError));
  }
}
