// src_refactored/core/application/use-cases/memory/remove-memory-item.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';

import { ValueError, DomainError } from '@/domain/common/errors';
import { IMemoryRepository } from '@/domain/memory/ports/memory-repository.interface';
import { MemoryItemId } from '@/domain/memory/value-objects/memory-item-id.vo';

import { ApplicationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isSuccess, isError } from '@/shared/result';

import {
  RemoveMemoryItemUseCaseInput,
  RemoveMemoryItemUseCaseInputSchema,
  RemoveMemoryItemUseCaseOutput,
} from './remove-memory-item.schema';

@injectable()
export class RemoveMemoryItemUseCase
  implements
    IUseCase<
      RemoveMemoryItemUseCaseInput,
      RemoveMemoryItemUseCaseOutput,
      ApplicationError | ZodError | ValueError
    >
{
  constructor(
    @inject(TYPES.IMemoryRepository) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  public async execute(
    input: RemoveMemoryItemUseCaseInput,
  ): Promise<Result<RemoveMemoryItemUseCaseOutput, ApplicationError | ZodError | ValueError>> {
    this.logger.debug('RemoveMemoryItemUseCase: Starting execution with input:', { input });

    const validationResult = RemoveMemoryItemUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      this.logger.warn('RemoveMemoryItemUseCase: Input validation failed.', { error: validationResult.error.flatten() });
      return resultError(validationResult.error);
    }
    const validatedInput = validationResult.data;

    try {
      const itemIdVo = MemoryItemId.fromString(validatedInput.memoryItemId);

      const deleteResult = await this.memoryRepository.delete(itemIdVo);

      if (isError(deleteResult)) {
        const cause = deleteResult.error;
        this.logger.error(
          `RemoveMemoryItemUseCase: Repository failed to delete memory item ${validatedInput.memoryItemId}.`,
          { originalError: cause },
        );
        const appError = cause instanceof ApplicationError
          ? cause
          : new ApplicationError(`Failed to delete memory item: ${cause.message}`, cause instanceof Error ? cause : undefined);
        return resultError(appError);
      }

      this.logger.info(`RemoveMemoryItemUseCase: Memory item ${validatedInput.memoryItemId} processed for deletion.`);
      return ok({
        memoryItemId: validatedInput.memoryItemId,
        success: true,
      });

    } catch (e: unknown) {
      if (e instanceof ValueError) {
        this.logger.warn(`RemoveMemoryItemUseCase: Invalid MemoryItemId format - ${e.message}`, { error: e });
        return resultError(new ApplicationError(`Invalid memory item ID format: ${e.message}`, e));
      }

      const message = e instanceof Error ? e.message : String(e);
      const logError = e instanceof Error ? e : new Error(message);
      this.logger.error(`RemoveMemoryItemUseCase: Unexpected error for memory item ID ${input.memoryItemId}: ${message}`, { originalError: logError });

      if (e instanceof ZodError) return resultError(e); // Should be caught by safeParse earlier
      // For other errors, wrap in ApplicationError
      return resultError(new ApplicationError(`Unexpected error removing memory item: ${message}`, logError));
    }
  }
}
