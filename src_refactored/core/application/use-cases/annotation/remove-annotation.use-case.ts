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
  ): Promise<Result<RemoveAnnotationUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = RemoveAnnotationUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return resultError(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const annotationIdVo = AnnotationId.fromString(validInput.annotationId);

      const deleteResult = await this.annotationRepository.delete(annotationIdVo);

      if (isError(deleteResult)) {
        const err = deleteResult.error instanceof DomainError || deleteResult.error instanceof NotFoundError
            ? deleteResult.error
            : new DomainError(`Failed to delete annotation: ${deleteResult.error.message}`, deleteResult.error);
        this.logger.error(
          `[RemoveAnnotationUseCase] Repository error: ${err.message}`,
          { error: deleteResult.error, useCase: 'RemoveAnnotationUseCase', input: validInput },
        );
        return resultError(err);
      }

      return ok({ success: true, annotationId: validInput.annotationId });

    } catch (e: unknown) {
      if (e instanceof ValueError) {
        this.logger.warn(
          `[RemoveAnnotationUseCase] Invalid annotation ID: ${e.message}`,
          { error: e, useCase: 'RemoveAnnotationUseCase', input: validInput },
        );
        return resultError(e)
      }
      if (e instanceof ZodError || e instanceof NotFoundError || (e instanceof Error && e.constructor.name === 'DomainError')) {
        return resultError(e as ZodError | NotFoundError | DomainError);
      }
      const message = e instanceof Error ? e.message : String(e);
      const logError = e instanceof Error ? e : new Error(message);
      this.logger.error(
        `[RemoveAnnotationUseCase] Unexpected error for annotation ID ${input.annotationId}: ${message}`,
        { error: logError, useCase: 'RemoveAnnotationUseCase', input },
      );
      return resultError(new DomainError(`Unexpected error removing annotation: ${message}`, logError));
    }
  }
}
