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
  ): Promise<IUseCaseResponse<RemoveMemoryItemUseCaseOutput>> {
    this.logger.debug('RemoveMemoryItemUseCase: Starting execution with input:', { input });

    const validatedInput = RemoveMemoryItemUseCaseInputSchema.parse(input);

    const itemIdVo = MemoryItemId.fromString(validatedInput.memoryItemId);

    await this.memoryRepository.delete(itemIdVo);

    this.logger.info(`RemoveMemoryItemUseCase: Memory item ${validatedInput.memoryItemId} processed for deletion.`);
    return successUseCaseResponse({
      memoryItemId: validatedInput.memoryItemId,
      success: true,
    });
  }
}
