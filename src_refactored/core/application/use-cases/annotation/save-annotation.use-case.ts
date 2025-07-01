// src_refactored/core/application/use-cases/annotation/save-annotation.use-case.ts
import { ZodError } from 'zod';
import { injectable, inject } from 'inversify';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';
import { Annotation } from '@/domain/annotation/annotation.entity';
import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '@/domain/annotation/value-objects/annotation-id.vo';
import { AnnotationText } from '@/domain/annotation/value-objects/annotation-text.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';
import { Result, ok, error as resultError, isError, isSuccess } from '@/shared/result';
import { TYPES } from '@/infrastructure/ioc/types';

import {
  SaveAnnotationUseCaseInput,
  SaveAnnotationUseCaseInputSchema,
  SaveAnnotationUseCaseOutput,
} from './save-annotation.schema';

@injectable()
export class SaveAnnotationUseCase
  implements
    Executable<
      SaveAnnotationUseCaseInput,
      SaveAnnotationUseCaseOutput,
      DomainError | ZodError | ValueError | NotFoundError
    >
{
  constructor(
    @inject(TYPES.IAnnotationRepository) private readonly annotationRepository: IAnnotationRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(
    input: SaveAnnotationUseCaseInput,
  ): Promise<Result<SaveAnnotationUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = SaveAnnotationUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return resultError(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      // _createAnnotation and _updateAnnotation now return Result types
      let annotationEntityResult: Result<Annotation, DomainError | NotFoundError | ValueError>;
      if (validInput.id) {
        annotationEntityResult = await this._updateAnnotation(validInput);
      } else {
        annotationEntityResult = this._createAnnotation(validInput);
      }

      if (isError(annotationEntityResult)) {
        // Log the specific error before returning it
        this.logger.warn(`[SaveAnnotationUseCase] Error creating/updating annotation entity: ${annotationEntityResult.error.message}`, { error: annotationEntityResult.error });
        return resultError(annotationEntityResult.error);
      }
      const annotationEntity = annotationEntityResult.value;

      const saveRepoResult = await this.annotationRepository.save(annotationEntity);

      if (isError(saveRepoResult)) {
        const err = saveRepoResult.error instanceof DomainError ? saveRepoResult.error : new DomainError(`Failed to save annotation: ${saveRepoResult.error.message}`, saveRepoResult.error);
        this.logger.error(`[SaveAnnotationUseCase] Repository error: ${err.message}`, { originalError: saveRepoResult.error });
        return resultError(err);
      }

      const finalEntity = (isSuccess(saveRepoResult) && saveRepoResult.value instanceof Annotation)
                          ? saveRepoResult.value
                          : annotationEntity;

      return ok({
        annotationId: finalEntity.id().value(),
        createdAt: finalEntity.createdAt().toISOString(),
        updatedAt: finalEntity.updatedAt().toISOString(),
      });
    } catch (e: unknown) {
      // This catch block is now primarily for truly unexpected errors,
      // as VO/Entity creation errors should be wrapped in Results by helper methods.
      return this._handleUseCaseError(e, validInput.id);
    }
  }

  private _createAnnotation(validInput: SaveAnnotationUseCaseInput): Result<Annotation, ValueError> {
    try {
      const textVo = AnnotationText.create(validInput.text);
      const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : undefined;
      const jobIdVo = validInput.jobId ? Identity.fromString(validInput.jobId) : undefined;
      const newAnnotationId = AnnotationId.generate();

      const annotation = Annotation.create({
        id: newAnnotationId,
        text: textVo,
        agentId: agentIdVo,
        jobId: jobIdVo,
      });
      return ok(annotation);
    } catch (e) {
      if (e instanceof ValueError) return resultError(e);
      const message = e instanceof Error ? e.message : String(e);
      this.logger.warn(`[SaveAnnotationUseCase/_createAnnotation] Error: ${message}`, { error: e });
      return resultError(new ValueError(`Error creating annotation value objects: ${message}`));
    }
  }

  private async _updateAnnotation(validInput: SaveAnnotationUseCaseInput): Promise<Result<Annotation, DomainError | NotFoundError | ValueError>> {
    try {
      const annotationIdVo = AnnotationId.fromString(validInput.id!);
      const existingResult = await this.annotationRepository.findById(annotationIdVo);

      if (isError(existingResult)) {
        // Ensure the error passed to DomainError is an Error instance
        const cause = existingResult.error instanceof Error ? existingResult.error : new Error(String(existingResult.error));
        return resultError(new DomainError(`Failed to fetch annotation for update: ${cause.message}`, cause));
      }
      const existingAnnotation = existingResult.value;
      if (!existingAnnotation) {
        return resultError(new NotFoundError(`Annotation with ID ${validInput.id} not found for update.`));
      }

      let annotationEntity = existingAnnotation;

      const textVo = AnnotationText.create(validInput.text); // Can throw ValueError
      if (!annotationEntity.text().equals(textVo)) {
        annotationEntity = annotationEntity.updateText(textVo);
      }

      if (Object.prototype.hasOwnProperty.call(validInput, 'agentId')) {
        const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : undefined; // Can throw ValueError
        const currentAgentId = annotationEntity.agentId();
        if ((currentAgentId && !currentAgentId.equals(agentIdVo)) || (!currentAgentId && agentIdVo) || (currentAgentId && agentIdVo && !currentAgentId.equals(agentIdVo))) {
          annotationEntity = annotationEntity.assignAgent(agentIdVo);
        }
      }

      if (Object.prototype.hasOwnProperty.call(validInput, 'jobId')) {
        const jobIdVo = validInput.jobId ? Identity.fromString(validInput.jobId) : undefined; // Can throw ValueError
        const currentJobId = annotationEntity.jobId();
         if ((currentJobId && !currentJobId.equals(jobIdVo)) || (!currentJobId && jobIdVo) || (currentJobId && jobIdVo && !currentJobId.equals(jobIdVo))) {
          annotationEntity = annotationEntity.assignJob(jobIdVo);
        }
      }
      return ok(annotationEntity);
    } catch (e) {
      if (e instanceof ValueError) return resultError(e);
      // DomainError from findById is already a Result, so this catch is for VOs mainly
      const message = e instanceof Error ? e.message : String(e);
      this.logger.warn(`[SaveAnnotationUseCase/_updateAnnotation] Error: ${message}`, { error: e }); // Consider e as originalError
      return resultError(new DomainError(`Error updating annotation: ${message}`, e instanceof Error ? e : undefined));
    }
  }

  private _handleUseCaseError(e: unknown, idBeingProcessed?: string): Result<never, DomainError | ZodError | ValueError | NotFoundError> {
    if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
      return resultError(e);
    }
    const message = e instanceof Error ? e.message : String(e);
    const logError = e instanceof Error ? e : new Error(message);
    this.logger.error(`[SaveAnnotationUseCase] Unexpected error for annotation ID ${idBeingProcessed || 'new'}: ${message}`, { originalError: logError });
    return resultError(new DomainError(`Unexpected error saving annotation: ${message}`, logError));
  }
}
