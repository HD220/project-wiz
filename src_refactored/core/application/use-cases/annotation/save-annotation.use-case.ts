// src_refactored/core/application/use-cases/annotation/save-annotation.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ANNOTATION_REPOSITORY_INTERFACE_TYPE } from '@/core/application/common/constants';
import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';

import { Annotation } from '@/domain/annotation/annotation.entity';
import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '@/domain/annotation/value-objects/annotation-id.vo';
import { AnnotationText } from '@/domain/annotation/value-objects/annotation-text.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

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
    @inject(ANNOTATION_REPOSITORY_INTERFACE_TYPE) private readonly annotationRepository: IAnnotationRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  private _createInputVOs(
    validInput: SaveAnnotationUseCaseInput,
  ): Result<{ textVo: AnnotationText; agentIdVo: Identity | null; jobIdVo: Identity | null }, ValueError> {
    try {
      const textVo = AnnotationText.create(validInput.text);
      const agentIdVo = validInput.agentId ? Identity.fromString(validInput.agentId) : null;
      const jobIdVo = validInput.jobId ? Identity.fromString(validInput.jobId) : null;
      return ok({ textVo, agentIdVo, jobIdVo });
    } catch (errorValue) {
      if (errorValue instanceof ValueError) {
        this.logger.warn('[SaveAnnotationUseCase] Error creating input VOs.', { error: errorValue, input: validInput });
        return resultError(errorValue);
      }
      // Re-throw if it's not a ValueError, to be caught by the main try-catch
      throw errorValue;
    }
  }

  private _createNewAnnotationEntity(
    textVo: AnnotationText,
    agentIdVo: Identity | null,
    jobIdVo: Identity | null,
  ): Annotation {
    const newAnnotationId = AnnotationId.generate();
    return Annotation.create({
      id: newAnnotationId,
      text: textVo,
      agentId: agentIdVo,
      jobId: jobIdVo,
    });
  }

  private _updateFetchedAnnotationEntity(
    annotationEntity: Annotation,
    textVo: AnnotationText,
    agentIdVo: Identity | null,
    jobIdVo: Identity | null,
    validInput: SaveAnnotationUseCaseInput,
  ): Annotation {
    let updatedEntity = annotationEntity;

    if (!updatedEntity.text().equals(textVo)) {
      updatedEntity = updatedEntity.updateText(textVo);
    }

    if (Object.prototype.hasOwnProperty.call(validInput, 'agentId')) {
      const currentAgentId = updatedEntity.agentId();
      if ((currentAgentId && !currentAgentId.equals(agentIdVo)) ||
          (!currentAgentId && agentIdVo !== null) ||
          (currentAgentId && agentIdVo === null)) {
        updatedEntity = updatedEntity.assignAgent(agentIdVo);
      }
    }

    if (Object.prototype.hasOwnProperty.call(validInput, 'jobId')) {
      const currentJobId = updatedEntity.jobId();
      if ((currentJobId && !currentJobId.equals(jobIdVo)) ||
          (!currentJobId && jobIdVo !== null) ||
          (currentJobId && jobIdVo === null)) {
        updatedEntity = updatedEntity.assignJob(jobIdVo);
      }
    }
    return updatedEntity;
  }

  private async _resolveAnnotationToSave(
    validInput: SaveAnnotationUseCaseInput,
    textVo: AnnotationText,
    agentIdVo: Identity | null,
    jobIdVo: Identity | null,
  ): Promise<Result<Annotation, NotFoundError | DomainError | ValueError>> {
    if (validInput.id) {
      const idVo = AnnotationId.fromString(validInput.id); // Can throw ValueError
      const existingAnnotationResult = await this.annotationRepository.findById(idVo);

      if (isError(existingAnnotationResult)) {
        this.logger.error(
          `[SaveAnnotationUseCase] Failed to fetch annotation for update: ${validInput.id}`,
          existingAnnotationResult.error, // This is DomainError
          { useCase: 'SaveAnnotationUseCase', input: validInput },
        );
        return resultError(existingAnnotationResult.error);
      }
      if (!existingAnnotationResult.value) {
        const notFoundError = new NotFoundError('Annotation', validInput.id);
        this.logger.warn(`[SaveAnnotationUseCase] ${notFoundError.message}`, {
          error: notFoundError,
          useCase: 'SaveAnnotationUseCase',
          input: validInput,
        });
        return resultError(notFoundError);
      }
      // ValueError from VOs inside _updateFetchedAnnotationEntity will be caught by the main try-catch
      return ok(this._updateFetchedAnnotationEntity(existingAnnotationResult.value, textVo, agentIdVo, jobIdVo, validInput));
    }
    // ValueError from VOs inside _createNewAnnotationEntity will be caught by the main try-catch
    return ok(this._createNewAnnotationEntity(textVo, agentIdVo, jobIdVo));
  }

  async execute(
    input: SaveAnnotationUseCaseInput,
  ): Promise<Result<SaveAnnotationUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = SaveAnnotationUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      this.logger.warn('[SaveAnnotationUseCase] Input validation failed.', {
        error: validationResult.error.flatten(),
        useCase: 'SaveAnnotationUseCase',
        input,
      });
      return resultError(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const vosResult = this._createInputVOs(validInput);
      if (isError(vosResult)) {
        return resultError(vosResult.error); // ValueError is already logged in _createInputVOs
      }
      const { textVo, agentIdVo, jobIdVo } = vosResult.value;

      const annotationEntityResult = await this._resolveAnnotationToSave(validInput, textVo, agentIdVo, jobIdVo);

      if (isError(annotationEntityResult)) {
        // Errors (NotFoundError, DomainError from findById) are already logged in _resolveAnnotationToSave
        // ValueErrors from fromString or create in _resolveAnnotationToSave will be caught by the outer try-catch
        return resultError(annotationEntityResult.error);
      }
      const annotationEntity = annotationEntityResult.value;

      const saveRepoResult = await this.annotationRepository.save(annotationEntity);

      if (isError(saveRepoResult)) {
        const cause = saveRepoResult.error;
        const causeMessage = (typeof cause === 'object' && cause !== null && 'message' in cause) ? String(cause.message) : String(cause);
        const errorForCause = (typeof cause === 'object' && cause !== null && cause instanceof Error) ? cause : new Error(causeMessage);
        const domainErrorInstance = cause instanceof DomainError ? cause : new DomainError(`Failed to save annotation: ${causeMessage}`, errorForCause);

        this.logger.error(
          `[SaveAnnotationUseCase] Repository error: ${domainErrorInstance.message}`,
          domainErrorInstance,
          { useCase: 'SaveAnnotationUseCase', input: validInput },
        );
        return resultError(domainErrorInstance);
      }

      const finalEntity = (isSuccess(saveRepoResult) && saveRepoResult.value instanceof Annotation)
                          ? saveRepoResult.value
                          : annotationEntity;

      return ok({
        annotationId: finalEntity.id().value(),
        createdAt: finalEntity.createdAt().toISOString(),
        updatedAt: finalEntity.updatedAt().toISOString(),
      });

    } catch (caughtException: unknown) {
      let message = 'An unknown error occurred while saving annotation.';
      let errorToLog: Error;

      // Catch ValueErrors that might bubble up from VO creation within _resolveAnnotationToSave
      if (caughtException instanceof ValueError || caughtException instanceof DomainError) {
        message = caughtException.message;
        errorToLog = caughtException;
        this.logger.warn(`[SaveAnnotationUseCase] Caught domain/value error: ${message}`, { error: errorToLog, input: validInput });
        return resultError(caughtException);
      }

      if (caughtException instanceof Error) {
        message = caughtException.message;
        errorToLog = caughtException;
      } else {
        message = String(caughtException);
        errorToLog = new Error(message);
      }
      this.logger.error(`[SaveAnnotationUseCase] Unexpected error: ${message}`, errorToLog, { input: validInput });
      return resultError(new DomainError(message, errorToLog));
    }
  }
}
