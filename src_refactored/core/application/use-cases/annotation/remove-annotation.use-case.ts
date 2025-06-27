// src_refactored/core/application/use-cases/annotation/remove-annotation.use-case.ts
import { ZodError } from 'zod';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';
import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '@/domain/annotation/value-objects/annotation-id.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
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

      // Optional: Check if annotation exists before attempting delete if repo doesn't indicate success/failure clearly.
      // const existingResult = await this.annotationRepository.findById(annotationIdVo);
      // if (existingResult.isError()) {
      //   return error(new DomainError(`Failed to check annotation existence: ${existingResult.value.message}`, existingResult.value));
      // }
      // if (!existingResult.value) {
      //   // Consider this not an error for delete, or a specific type of success:false
      //   return ok({ success: false, annotationId: validInput.annotationId, message: "Annotation not found, no action taken." });
      // }

      const deleteResult = await this.annotationRepository.delete(annotationIdVo);

      if (deleteResult.isError()) {
        // This could be a general DB error, or if the repo's delete itself returns NotFoundError
        // if it tried to delete a non-existent ID and treats that as an error.
        // For now, assume delete() returns void on success or DomainError on failure.
        // If delete() indicates "not found" by a specific error type, handle that.
        return error(new DomainError(`Failed to delete annotation: ${deleteResult.value.message}`, deleteResult.value));
      }

      // Assuming deleteResult is Result<void, DomainError>.
      // If the repository's delete method doesn't throw an error for a non-existent ID
      // (i.e., it's idempotent for non-existence), then success is true.
      // If we wanted to confirm something was *actually* deleted, the repo method would need to indicate that.
      // For now, if no error, assume success.
      return ok({ success: true, annotationId: validInput.annotationId });

    } catch (err: any) {
      if (err instanceof ZodError || err instanceof NotFoundError || err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error(`[RemoveAnnotationUseCase] Unexpected error for annotation ID ${input.annotationId}:`, err);
      return error(new DomainError(`Unexpected error removing annotation: ${err.message || err}`));
    }
  }
}
