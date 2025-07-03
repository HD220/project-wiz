// src_refactored/core/application/use-cases/annotation/remove-annotation.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';

import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '@/domain/annotation/value-objects/annotation-id.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isError } from '@/shared/result';

import {
  RemoveAnnotationUseCaseInput,
  RemoveAnnotationUseCaseInputSchema,
  RemoveAnnotationUseCaseOutput,
} from './remove-annotation.schema';

@injectable()
export class RemoveAnnotationUseCase
  implements
    Executable<
      RemoveAnnotationUseCaseInput,
      RemoveAnnotationUseCaseOutput,
      DomainError | ZodError | ValueError | NotFoundError
    >
{
  constructor(
    @inject(TYPES.IAnnotationRepository) private readonly annotationRepository: IAnnotationRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(
    input: RemoveAnnotationUseCaseInput,
  ): Promise<IUseCaseResponse<RemoveAnnotationUseCaseOutput>> {
    const validInput = RemoveAnnotationUseCaseInputSchema.parse(input);

    try {
      const annotationIdVo = AnnotationId.fromString(validInput.annotationId);

      await this.annotationRepository.delete(annotationIdVo);

      return successUseCaseResponse({ success: true, annotationId: validInput.annotationId });

    } catch (e: unknown) {
      if (e instanceof ValueError) {
        this.logger.warn(
          `[RemoveAnnotationUseCase] Invalid annotation ID: ${e.message}`,
          { errorName: e.name, errorMessage: e.message, useCase: 'RemoveAnnotationUseCase', input: validInput },
        );
        return errorUseCaseResponse(e.toUseCaseErrorDetails());
      }
      if (e instanceof ZodError || e instanceof NotFoundError || (e instanceof Error && e.constructor.name === 'DomainError')) {
        return errorUseCaseResponse((e as ZodError | NotFoundError | DomainError).toUseCaseErrorDetails());
      }
      const message = e instanceof Error ? e.message : String(e);
      const logError = e instanceof Error ? e : new Error(message);
      this.logger.error(
        `[RemoveAnnotationUseCase] Unexpected error for annotation ID ${input.annotationId}: ${message}`,
        logError,
        { useCase: 'RemoveAnnotationUseCase', input },
      );
      return errorUseCaseResponse(new DomainError(`Unexpected error removing annotation: ${message}`, logError).toUseCaseErrorDetails());
    }
  }
}
