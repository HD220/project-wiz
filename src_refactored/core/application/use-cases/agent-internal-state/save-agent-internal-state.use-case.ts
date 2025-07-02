// src_refactored/core/application/use-cases/agent-internal-state/save-agent-internal-state.use-case.ts
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';

import { AgentInternalState } from '@/domain/agent/agent-internal-state.entity';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { CurrentGoal } from '@/domain/agent/value-objects/internal-state/current-goal.vo';
import { CurrentProjectId } from '@/domain/agent/value-objects/internal-state/current-project-id.vo';
import { GeneralNotesCollection } from '@/domain/agent/value-objects/internal-state/general-notes.collection';
import { DomainError, ValueError, NotFoundError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { Result, ok, error as resultError, isError, isSuccess } from '@/shared/result';


import {
  SaveAgentInternalStateUseCaseInput,
  SaveAgentInternalStateUseCaseInputSchema,
  SaveAgentInternalStateUseCaseOutput,
} from './save-agent-internal-state.schema';

export class SaveAgentInternalStateUseCase
  implements
    Executable<
      SaveAgentInternalStateUseCaseInput,
      SaveAgentInternalStateUseCaseOutput,
      DomainError | ZodError | ValueError | NotFoundError
    >
{
  constructor(
    private readonly stateRepository: IAgentInternalStateRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(
    input: SaveAgentInternalStateUseCaseInput,
  ): Promise<Result<SaveAgentInternalStateUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = SaveAgentInternalStateUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return resultError(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const agentIdVo = AgentId.fromString(validInput.agentId);
      const existingStateResult = await this.stateRepository.findByAgentId(agentIdVo);

      if (isError(existingStateResult)) {
        return this._handleRepositoryError(validInput.agentId, 'check existing state', existingStateResult.error);
      }

      const stateEntity = existingStateResult.value
        ? this._updateExistingState(existingStateResult.value, validInput)
        : this._createNewState(agentIdVo, validInput);

      const isNewState = !existingStateResult.value;
      const saveResult = await this.stateRepository.save(stateEntity);

      if (isError(saveResult)) {
        return this._handleRepositoryError(validInput.agentId, `save agent internal state (new: ${isNewState})`, saveResult.error);
      }

      return ok({ success: true });
    } catch (e: unknown) {
      return this._handleUnexpectedError(input.agentId, e);
    }
  }

  private _createNewState(agentIdVo: AgentId, validInput: SaveAgentInternalStateUseCaseInput): AgentInternalState {
    const currentProjectIdVo = validInput.currentProjectId ? CurrentProjectId.fromString(validInput.currentProjectId) : undefined;
    const currentGoalVo = validInput.currentGoal !== null && validInput.currentGoal !== undefined ? CurrentGoal.create(validInput.currentGoal) : undefined;
    const generalNotesVo = GeneralNotesCollection.create(validInput.generalNotes || []);
    return AgentInternalState.create({ agentId: agentIdVo, currentProjectId: currentProjectIdVo, currentGoal: currentGoalVo, generalNotes: generalNotesVo });
  }

  private _updateExistingState(stateEntity: AgentInternalState, validInput: SaveAgentInternalStateUseCaseInput): AgentInternalState {
    let updatedEntity = stateEntity;
    if (Object.prototype.hasOwnProperty.call(validInput, 'currentProjectId')) {
      const newProjectIdVo = validInput.currentProjectId ? CurrentProjectId.fromString(validInput.currentProjectId) : undefined;
      updatedEntity = updatedEntity.changeCurrentProject(newProjectIdVo);
    }
    if (Object.prototype.hasOwnProperty.call(validInput, 'currentGoal')) {
      const newGoalVo = validInput.currentGoal !== null && validInput.currentGoal !== undefined ? CurrentGoal.create(validInput.currentGoal) : undefined;
      updatedEntity = updatedEntity.changeCurrentGoal(newGoalVo);
    }
    if (Object.prototype.hasOwnProperty.call(validInput, 'generalNotes')) {
      const newNotesVo = GeneralNotesCollection.create(validInput.generalNotes || []);
      updatedEntity = updatedEntity.setGeneralNotes(newNotesVo);
    }
    return updatedEntity;
  }

  private _handleRepositoryError(agentId: string, action: string, repoError: Error): Result<never, DomainError> {
    const errorMessage = `Failed to ${action} for agent ${agentId}: ${repoError.message}`;
    this.logger.error(`[SaveAgentInternalStateUseCase] ${errorMessage}`, repoError, {
      agentId,
      action,
      useCase: 'SaveAgentInternalStateUseCase',
    });
    return resultError(new DomainError(errorMessage, repoError));
  }

  private _handleUnexpectedError(agentId: string, errorValue: unknown): Result<never, DomainError | ZodError | ValueError | NotFoundError> {
    if (errorValue instanceof ZodError || errorValue instanceof NotFoundError || errorValue instanceof DomainError || errorValue instanceof ValueError) {
      this.logger.warn(`[SaveAgentInternalStateUseCase] Known error type occurred for agent ${agentId}: ${errorValue.message}`, { // Metadata for warn doesn't take Error as 2nd param
        agentId,
        useCase: 'SaveAgentInternalStateUseCase',
        // Optionally, serialize parts of errorValue if needed and not too verbose:
        // errorName: (errorValue as Error).name,
      });
      return resultError(errorValue);
    }
    const message = errorValue instanceof Error ? errorValue.message : String(errorValue);
    const logError = errorValue instanceof Error ? errorValue : new Error(message);
    this.logger.error(`[SaveAgentInternalStateUseCase] Unexpected error for agent ${agentId}: ${message}`, logError, {
      agentId,
      useCase: 'SaveAgentInternalStateUseCase',
    });
    return resultError(new DomainError(`Unexpected error saving agent state: ${message}`, logError));
  }
}
