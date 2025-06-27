// src_refactored/core/application/use-cases/annotation/save-annotation.use-case.ts
import { ZodError } from 'zod';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { Identity } from '@/core/common/value-objects/identity.vo'; // For AgentId, JobId

import { Annotation } from '@/domain/annotation/annotation.entity';
import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '@/domain/annotation/value-objects/annotation-id.vo';
import { AnnotationText } from '@/domain/annotation/value-objects/annotation-text.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';

import { Result, ok, error } from '@/shared/result';

import {
  SaveAnnotationUseCaseInput,
  SaveAnnotationUseCaseInputSchema,
  SaveAnnotationUseCaseOutput,
} from './save-annotation.schema';

export class SaveAnnotationUseCase
  implements
    Executable<
      SaveAnnotationUseCaseInput,
      SaveAnnotationUseCaseOutput,
      DomainError | ZodError | ValueError | NotFoundError
    >
{
  constructor(private annotationRepository: IAnnotationRepository) {}

  async execute(
    input: SaveAnnotationUseCaseInput,
  ): Promise<Result<SaveAnnotationUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = SaveAnnotationUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const textVo = AnnotationText.create(validInput.text);
      const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : null;
      const jobIdVo = validInput.jobId ? Identity.fromString(validInput.jobId) : null;

      let annotationEntity: Annotation;

      if (validInput.id) { // Update existing annotation
        const annotationIdVo = AnnotationId.fromString(validInput.id);
        const existingResult = await this.annotationRepository.findById(annotationIdVo);
        if (existingResult.isError()) {
          return error(new DomainError(`Failed to fetch annotation for update: ${existingResult.value.message}`, existingResult.value));
        }
        const existingAnnotation = existingResult.value;
        if (!existingAnnotation) {
          return error(new NotFoundError(`Annotation with ID ${validInput.id} not found for update.`));
        }
        annotationEntity = existingAnnotation;
        let updated = false;

        if (!annotationEntity.text().equals(textVo)) {
          annotationEntity = annotationEntity.updateText(textVo);
          updated = true;
        }
        if (validInput.hasOwnProperty('agentId')) { // Check if agentId was explicitly passed
          if (!annotationEntity.agentId()?.equals(agentIdVo) && (annotationEntity.agentId() || agentIdVo)) {
            annotationEntity = annotationEntity.assignAgent(agentIdVo);
            updated = true;
          }
        }
        if (validInput.hasOwnProperty('jobId')) { // Check if jobId was explicitly passed
           if (!annotationEntity.jobId()?.equals(jobIdVo) && (annotationEntity.jobId() || jobIdVo)) {
            annotationEntity = annotationEntity.assignJob(jobIdVo);
            updated = true;
          }
        }
        // If !updated, we might skip save, but entity's updatedAt won't be touched unless changed.
        // For simplicity, we save if an ID was provided, assuming an intent to "touch" or ensure state.
        // The entity methods already handle not creating new instances if values are identical,
        // but the final `updatedAt` in the new instance from the last change would be the one persisted.

      } else { // Create new annotation
        const newAnnotationId = AnnotationId.generate();
        annotationEntity = Annotation.create({
          id: newAnnotationId,
          text: textVo,
          agentId: agentIdVo,
          jobId: jobIdVo,
        });
      }

      const saveResult = await this.annotationRepository.save(annotationEntity);
      if (saveResult.isError()) {
        // The repository's save should ideally return the saved entity or void.
        // If it returns void, we use annotationEntity from memory.
        // If it returns entity, use that. Assuming it returns the entity or error.
        // For now, let's assume it's `Result<Annotation, DomainError>` or `Result<void, DomainError>`
        // If void, then the entity in memory (annotationEntity) is what we return details from.
        // Let's assume the interface is `save(annotation: Annotation): Promise<Result<Annotation, DomainError>>`
        // For now, let's assume `save` returns `Result<void, DomainError>` as per `IUserRepository` example
        return error(new DomainError(`Failed to save annotation: ${saveResult.value.message}`, saveResult.value));
      }

      // If saveResult is Result<void, DomainError>, then annotationEntity is the source of truth for response
      // If saveResult is Result<Annotation, DomainError>, then use saveResult.value for response

      return ok({
        annotationId: annotationEntity.id().value(),
        createdAt: annotationEntity.createdAt().toISOString(), // From AbstractEntity
        updatedAt: annotationEntity.updatedAt().toISOString(), // From AbstractEntity
      });

    } catch (err: any) {
      if (err instanceof ZodError || err instanceof NotFoundError || err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error(`[SaveAnnotationUseCase] Unexpected error:`, err);
      return error(new DomainError(`Unexpected error saving annotation: ${err.message || err}`));
    }
  }
}
