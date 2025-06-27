// src_refactored/core/application/use-cases/memory/remove-memory-item.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';


import { ILoggerService, ILoggerServiceToken } from '@/core/common/services/i-logger.service';

import { IMemoryRepository, IMemoryRepositoryToken } from '@/domain/memory/ports/memory-repository.interface';
import { MemoryItemId } from '@/domain/memory/value-objects/memory-item-id.vo';

import { ApplicationError, DomainError, NotFoundError, ValueError } from '@/application/common/errors'; // Or @/domain/common/errors
import { IUseCase } from '@/application/common/ports/use-case.interface'; // Standardized to IUseCase

import { Result, ok, error as resultError, isSuccess } from '@/shared/result';

import {
  RemoveMemoryItemUseCaseInput,
  RemoveMemoryItemUseCaseInputSchema,
  RemoveMemoryItemUseCaseOutput,
} from './remove-memory-item.schema';

@injectable()
export class RemoveMemoryItemUseCase
  implements
    IUseCase< // Changed Executable to IUseCase
      RemoveMemoryItemUseCaseInput,
      RemoveMemoryItemUseCaseOutput,
      ApplicationError | ZodError
    >
{
  constructor(
    @inject(IMemoryRepositoryToken) private readonly memoryRepository: IMemoryRepository,
    @inject(ILoggerServiceToken) private readonly logger: ILoggerService,
  ) {}

  public async execute(
    input: RemoveMemoryItemUseCaseInput,
  ): Promise<Result<RemoveMemoryItemUseCaseOutput, ApplicationError | ZodError>> {
    this.logger.debug('RemoveMemoryItemUseCase: Starting execution with input:', input);

    const validationResult = RemoveMemoryItemUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      this.logger.warn('RemoveMemoryItemUseCase: Input validation failed.', validationResult.error);
      return resultError(validationResult.error); // ZodError
    }
    const validatedInput = validationResult.data;

    let itemIdVo: MemoryItemId;
    try {
      itemIdVo = MemoryItemId.fromString(validatedInput.memoryItemId);
    } catch (e) {
      if (e instanceof ValueError) {
        this.logger.warn(`RemoveMemoryItemUseCase: Invalid MemoryItemId format - ${e.message}`, e);
        return resultError(new ApplicationError(`Invalid memory item ID format: ${e.message}`, e));
      }
      this.logger.error('RemoveMemoryItemUseCase: Unexpected error creating MemoryItemId VO.', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      return resultError(new ApplicationError(`Unexpected error with memory item ID: ${errorMessage}`, e as Error));
    }

    // Optional: Check if item exists first if specific "Not Found" behavior is critical for the output's 'success' field
    // For now, we'll assume delete is idempotent and success means the operation was attempted without repository failure.
    // const findResult = await this.memoryRepository.findById(itemIdVo);
    // if (isSuccess(findResult) && findResult.value === null) {
    //   this.logger.info(`RemoveMemoryItemUseCase: Memory item ${validatedInput.memoryItemId} not found. No action needed.`);
    //   return ok({ memoryItemId: validatedInput.memoryItemId, success: true }); // Or false if "not found" should mean not successful
    // }
    // if (isError(findResult)) {
    //    this.logger.error(`RemoveMemoryItemUseCase: Error finding item ${validatedInput.memoryItemId} before delete.`, findResult.error);
    //    // Proceed to delete anyway, or return error based on policy
    // }


    const deleteResult = await this.memoryRepository.delete(itemIdVo);

    if (!isSuccess(deleteResult)) {
      this.logger.error(
        `RemoveMemoryItemUseCase: Repository failed to delete memory item ${validatedInput.memoryItemId}.`,
        deleteResult.error,
      );
      // Ensure we return an ApplicationError wrapping the DomainError
      const appError = deleteResult.error instanceof ApplicationError
        ? deleteResult.error
        : new ApplicationError(
            `Failed to delete memory item: ${deleteResult.error.message}`,
            deleteResult.error, // Original error as cause
          );
      return resultError(appError);
    }

    this.logger.info(`RemoveMemoryItemUseCase: Memory item ${validatedInput.memoryItemId} processed for deletion.`);
    return ok({
      memoryItemId: validatedInput.memoryItemId,
      success: true, // True if repository.delete() did not return an error
    });
  }
}
