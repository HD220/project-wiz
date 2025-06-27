// src_refactored/core/application/use-cases/annotation/remove-annotation.use-case.ts
import { ZodError } from 'zod';

import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '@/domain/annotation/value-objects/annotation-id.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { Result, ok, error } from '@/shared/result';

import {
  RemoveAnnotationUseCaseInput,
  RemoveAnnotationUseCaseInputSchema,
  RemoveAnnotationUseCaseOutput, // Output type from schema
} from './remove-annotation.schema';

export class RemoveAnnotationUseCase
  implements
    Executable<
      RemoveAnnotationUseCaseInput,
      RemoveAnnotationUseCaseOutput,
      DomainError | ZodError | ValueError | NotFoundError // Removed NotFoundError from success type
    >
{
  constructor(private annotationRepository: IAnnotationRepository) {}

  async execute(
    input: RemoveAnnotationUseCaseInput,
  ): Promise<Result<RemoveAnnotationUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = RemoveAnnotationUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const annotationIdVo = AnnotationId.fromString(validInput.annotationId);

      const deleteResult = await this.annotationRepository.delete(annotationIdVo);

      if (deleteResult.isError()) {
        return error(new DomainError(`Failed to delete annotation: ${deleteResult.value.message}`, deleteResult.value));
      }
      return ok({ success: true, annotationId: validInput.annotationId });
    } catch (e: unknown) {
      if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
        return error(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[RemoveAnnotationUseCase] Unexpected error for annotation ID ${input.annotationId}: ${message}`, { error: e });
      return error(new DomainError(`Unexpected error removing annotation: ${message}`));
    }
  }
}
