// src_refactored/core/application/use-cases/annotation/save-annotation.use-case.ts
import { ZodError } from 'zod';

import { ILoggerService } from '@/core/common/services/i-logger.service';
// For AgentId, JobId
import { Identity } from '@/core/common/value-objects/identity.vo';

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
    // Added logger
    private readonly logger: ILoggerService,
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
      const annotationEntity = validInput.id
        ? await this._updateAnnotation(validInput)
        : this._createAnnotation(validInput);

      if (annotationEntity instanceof DomainError || annotationEntity instanceof NotFoundError) {
        return error(annotationEntity);
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
    } catch (errValue: unknown) {
      return this._handleUseCaseError(errValue);
    }
  }

  private _createAnnotation(validInput: SaveAnnotationUseCaseInput): Annotation {
    const textVo = AnnotationText.create(validInput.text);
    const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : null;
    const jobIdVo = validInput.jobId ? Identity.fromString(validInput.jobId) : null;
    const newAnnotationId = AnnotationId.generate();

    return Annotation.create({
      id: newAnnotationId,
      text: textVo,
      agentId: agentIdVo,
      jobId: jobIdVo,
    });
  }

  private async _updateAnnotation(validInput: SaveAnnotationUseCaseInput): Promise<Annotation | DomainError | NotFoundError> {
    const annotationIdVo = AnnotationId.fromString(validInput.id!);
    const existingResult = await this.annotationRepository.findById(annotationIdVo);

    if (existingResult.isError()) {
      return new DomainError(`Failed to fetch annotation for update: ${existingResult.value.message}`, existingResult.value);
    }
    const existingAnnotation = existingResult.value;
    if (!existingAnnotation) {
      return new NotFoundError(`Annotation with ID ${validInput.id} not found for update.`);
    }

    let annotationEntity = existingAnnotation;
    const textVo = AnnotationText.create(validInput.text);
    if (!annotationEntity.text().equals(textVo)) {
      annotationEntity = annotationEntity.updateText(textVo);
    }

    if (Object.prototype.hasOwnProperty.call(validInput, 'agentId')) {
      const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : null;
      if (!annotationEntity.agentId()?.equals(agentIdVo) && (annotationEntity.agentId() || agentIdVo)) {
        annotationEntity = annotationEntity.assignAgent(agentIdVo);
      }
    }

    if (Object.prototype.hasOwnProperty.call(validInput, 'jobId')) {
      const jobIdVo = validInput.jobId ? Identity.fromString(validInput.jobId) : null;
      if (!annotationEntity.jobId()?.equals(jobIdVo) && (annotationEntity.jobId() || jobIdVo)) {
        annotationEntity = annotationEntity.assignJob(jobIdVo);
      }
    }
    return annotationEntity;
  }

  private _handleUseCaseError(errorValue: unknown): Result<never, DomainError | ZodError | ValueError | NotFoundError> {
    if (errorValue instanceof ZodError || errorValue instanceof NotFoundError || errorValue instanceof DomainError || errorValue instanceof ValueError) {
      return error(errorValue);
    }
    const message = errorValue instanceof Error ? errorValue.message : String(errorValue);
    this.logger.error(`[SaveAnnotationUseCase] Unexpected error: ${message}`, { error: errorValue });
    return error(new DomainError(`Unexpected error saving annotation: ${message}`));
  }
}
