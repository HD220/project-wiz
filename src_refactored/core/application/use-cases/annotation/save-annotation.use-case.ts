// src_refactored/core/application/use-cases/annotation/save-annotation.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';

import { Annotation } from '@/domain/annotation/annotation.entity';
import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '@/domain/annotation/value-objects/annotation-id.vo';
import { AnnotationText } from '@/domain/annotation/value-objects/annotation-text.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isError, isSuccess } from '@/shared/result';

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
        this.logger.error(
          `[SaveAnnotationUseCase] Repository error: ${err.message}`,
          { error: saveRepoResult.error, useCase: 'SaveAnnotationUseCase', input: validInput },
        );
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
      return this._handleUseCaseError(e, validInput, validInput.id);
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
        agentId: agentIdVo === undefined ? null : agentIdVo, // Handle undefined for entity
        jobId: jobIdVo === undefined ? null : jobIdVo,       // Handle undefined for entity
      });
      return ok(annotation);
    } catch (e) {
      if (e instanceof ValueError) return resultError(e);
      const message = e instanceof Error ? e.message : String(e);
      const errorToLog = e instanceof Error ? e : new Error(message);
      this.logger.warn(
        `[SaveAnnotationUseCase/_createAnnotation] Error: ${message}`,
        { error: errorToLog, useCase: 'SaveAnnotationUseCase', method: '_createAnnotation', input: validInput },
      );
      return resultError(new ValueError(`Error creating annotation value objects: ${message}`));
    }
  }

  private async _updateAnnotation(validInput: SaveAnnotationUseCaseInput): Promise<Result<Annotation, DomainError | NotFoundError | ValueError>> {
    try {
      const annotationIdVo = AnnotationId.fromString(validInput.id!);
      const existingResult = await this.annotationRepository.findById(annotationIdVo);

      if (isError(existingResult)) {
        const cause = existingResult.error instanceof Error ? existingResult.error : new Error(String(existingResult.error));
        return resultError(new DomainError(`Failed to fetch annotation for update: ${cause.message}`, cause));
      }
      const existingAnnotation = existingResult.value;
      if (!existingAnnotation) {
        return resultError(new NotFoundError(`Annotation with ID ${validInput.id} not found for update.`));
      }

      let annotationEntity = existingAnnotation;

      const textVo = AnnotationText.create(validInput.text);
      if (!annotationEntity.text().equals(textVo)) {
        annotationEntity = annotationEntity.updateText(textVo);
      }

      if (Object.prototype.hasOwnProperty.call(validInput, 'agentId')) {
        const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : undefined;
        const currentAgentId = annotationEntity.agentId();
        const newAgentIdForEntity = agentIdVo === undefined ? null : agentIdVo;
        if ((currentAgentId && !currentAgentId.equals(newAgentIdForEntity)) ||
            (!currentAgentId && newAgentIdForEntity !== null) ||
            (currentAgentId && newAgentIdForEntity === null) ||
            (currentAgentId && newAgentIdForEntity && !currentAgentId.equals(newAgentIdForEntity))) {
          annotationEntity = annotationEntity.assignAgent(newAgentIdForEntity);
        }
      }

      if (Object.prototype.hasOwnProperty.call(validInput, 'jobId')) {
        const jobIdVo = validInput.jobId ? Identity.fromString(validInput.jobId) : undefined;
        const currentJobId = annotationEntity.jobId();
        const newJobIdForEntity = jobIdVo === undefined ? null : jobIdVo;
         if ((currentJobId && !currentJobId.equals(newJobIdForEntity)) ||
             (!currentJobId && newJobIdForEntity !== null) ||
             (currentJobId && newJobIdForEntity === null) ||
             (currentJobId && newJobIdForEntity && !currentJobId.equals(newJobIdForEntity))) {
          annotationEntity = annotationEntity.assignJob(newJobIdForEntity);
        }
      }
      return ok(annotationEntity);
    } catch (e) {
      if (e instanceof ValueError) return resultError(e);
      const message = e instanceof Error ? e.message : String(e);
      const errorToLog = e instanceof Error ? e : new Error(message);
      this.logger.warn(
        `[SaveAnnotationUseCase/_updateAnnotation] Error: ${message}`,
        { error: errorToLog, useCase: 'SaveAnnotationUseCase', method: '_updateAnnotation', input: validInput },
      );
      return resultError(new DomainError(`Error updating annotation: ${message}`, errorToLog));
    }
  }

  private _handleUseCaseError(e: unknown, input: SaveAnnotationUseCaseInput, idBeingProcessed?: string): Result<never, DomainError | ZodError | ValueError | NotFoundError> {
    // Reverted the workaround for DomainError to use instanceof directly
    if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
      // Log known error types before returning for better traceability if needed
      this.logger.warn(`[SaveAnnotationUseCase] Known error type occurred for annotation ID ${idBeingProcessed || 'new'}: ${e.message}`, {
        error: e,
        useCase: 'SaveAnnotationUseCase',
        input,
      });
      return resultError(e);
    }
    const message = e instanceof Error ? e.message : String(e);
    const logError = e instanceof Error ? e : new Error(message);
    this.logger.error(
      `[SaveAnnotationUseCase] Unexpected error for annotation ID ${idBeingProcessed || 'new'}: ${message}`,
      { error: logError, useCase: 'SaveAnnotationUseCase', input },
    );
    return resultError(new DomainError(`Unexpected error saving annotation: ${message}`, logError));
  }
}
