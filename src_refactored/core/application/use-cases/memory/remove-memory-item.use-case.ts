// src_refactored/core/application/use-cases/memory/remove-memory-item.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';


import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service'; // Corrected import

import { IMemoryRepository, IMemoryRepositoryToken } from '@/domain/memory/ports/memory-repository.interface';
import { MemoryItemId } from '@/domain/memory/value-objects/memory-item-id.vo';

// Or @/domain/common/errors
import { ApplicationError, ValueError } from '@/application/common/errors';
// Standardized to IUseCase
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error as resultError, isSuccess } from '@/shared/result';

import {
  RemoveMemoryItemUseCaseInput,
  RemoveMemoryItemUseCaseInputSchema,
  RemoveMemoryItemUseCaseOutput,
} from './remove-memory-item.schema';

@injectable()
export class RemoveMemoryItemUseCase
  implements
    // Changed Executable to IUseCase
    IUseCase<
      RemoveMemoryItemUseCaseInput,
      RemoveMemoryItemUseCaseOutput,
      ApplicationError | ZodError
    >
{
  constructor(
    @inject(IMemoryRepositoryToken) private readonly memoryRepository: IMemoryRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger, // Corrected token and type
  ) {}

  public async execute(
    input: RemoveMemoryItemUseCaseInput,
  ): Promise<Result<RemoveMemoryItemUseCaseOutput, ApplicationError | ZodError>> {
    this.logger.debug('RemoveMemoryItemUseCase: Starting execution with input:', input);

    const validationResult = RemoveMemoryItemUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      this.logger.warn('RemoveMemoryItemUseCase: Input validation failed.', validationResult.error);
      // ZodError
      return resultError(validationResult.error);
    }
    const validatedInput = validationResult.data;

    let itemIdVo: MemoryItemId;
    try {
      itemIdVo = MemoryItemId.fromString(validatedInput.memoryItemId);
    } catch (errorValue) {
      if (errorValue instanceof ValueError) {
        this.logger.warn(`RemoveMemoryItemUseCase: Invalid MemoryItemId format - ${errorValue.message}`, errorValue);
        return resultError(new ApplicationError(`Invalid memory item ID format: ${errorValue.message}`, errorValue));
      }
      this.logger.error('RemoveMemoryItemUseCase: Unexpected error creating MemoryItemId VO.', errorValue);
      const errorMessage = errorValue instanceof Error ? errorValue.message : String(errorValue);
      return resultError(new ApplicationError(`Unexpected error with memory item ID: ${errorMessage}`, errorValue as Error));
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
            // Original error as cause
            deleteResult.error,
          );
      return resultError(appError);
    }

    this.logger.info(`RemoveMemoryItemUseCase: Memory item ${validatedInput.memoryItemId} processed for deletion.`);
    return ok({
      memoryItemId: validatedInput.memoryItemId,
      // True if repository.delete() did not return an error
      success: true,
    });
  }
}
