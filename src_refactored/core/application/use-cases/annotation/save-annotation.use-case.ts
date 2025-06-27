// src_refactored/core/application/use-cases/annotation/save-annotation.use-case.ts
import { ZodError } from 'zod';

import { ILoggerService } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo'; // For AgentId, JobId

// import { IUseCase as Executable } from '@/application/common/ports/use-case.interface'; // Duplicate
import { Annotation } from '@/domain/annotation/annotation.entity';
import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '@/domain/annotation/value-objects/annotation-id.vo';
import { AnnotationText } from '@/domain/annotation/value-objects/annotation-text.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';
// Removed duplicate import of DomainError, NotFoundError, ValueError

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
  constructor(
    private readonly annotationRepository: IAnnotationRepository,
    private readonly logger: ILoggerService, // Added logger
  ) {}

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
      // let updated = false; // This variable is unused

      if (validInput.id) {
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

        if (!annotationEntity.text().equals(textVo)) {
          annotationEntity = annotationEntity.updateText(textVo);
          // updated = true;
        }
        if (Object.prototype.hasOwnProperty.call(validInput, 'agentId')) {
          if (!annotationEntity.agentId()?.equals(agentIdVo) && (annotationEntity.agentId() || agentIdVo)) {
            annotationEntity = annotationEntity.assignAgent(agentIdVo);
            // updated = true;
          }
        }
        if (Object.prototype.hasOwnProperty.call(validInput, 'jobId')) {
          if (!annotationEntity.jobId()?.equals(jobIdVo) && (annotationEntity.jobId() || jobIdVo)) {
            annotationEntity = annotationEntity.assignJob(jobIdVo);
            // updated = true;
          }
        }
      } else {
        const newAnnotationId = AnnotationId.generate();
        annotationEntity = Annotation.create({
          id: newAnnotationId,
          text: textVo,
          agentId: agentIdVo,
          jobId: jobIdVo,
        });
        // updated = true; // It's a new entity, so it's "updated" from non-existence
      }

      const saveResult = await this.annotationRepository.save(annotationEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save annotation: ${saveResult.value.message}`, saveResult.value));
      }

      return ok({
        annotationId: annotationEntity.id().value(),
        createdAt: annotationEntity.createdAt().toISOString(),
        updatedAt: annotationEntity.updatedAt().toISOString(),
      });
    } catch (e: unknown) {
      if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
        return error(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[SaveAnnotationUseCase] Unexpected error: ${message}`, { error: e });
      return error(new DomainError(`Unexpected error saving annotation: ${message}`));
    }
  }
}
