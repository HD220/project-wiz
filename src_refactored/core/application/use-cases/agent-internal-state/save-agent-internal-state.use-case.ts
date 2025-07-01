// src_refactored/core/application/use-cases/agent-internal-state/save-agent-internal-state.use-case.ts
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service'; // Corrected import

import { AgentInternalState } from '@/domain/agent/agent-internal-state.entity';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { CurrentGoal } from '@/domain/agent/value-objects/internal-state/current-goal.vo';
import { CurrentProjectId } from '@/domain/agent/value-objects/internal-state/current-project-id.vo';
import { GeneralNotesCollection } from '@/domain/agent/value-objects/internal-state/general-notes.collection';
import { DomainError, ValueError, NotFoundError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';
// Removed duplicate import of DomainError, ValueError, NotFoundError

import { Result, ok, error } from '@/shared/result';


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
    // Added logger dependency
    private readonly logger: ILogger, // Corrected type
  ) {}

  async execute(
    input: SaveAgentInternalStateUseCaseInput,
  ): Promise<Result<SaveAgentInternalStateUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = SaveAgentInternalStateUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const agentIdVo = AgentId.fromString(validInput.agentId);
      const existingStateResult = await this.stateRepository.findByAgentId(agentIdVo);

      if (existingStateResult.isError()) {
        return this._handleRepositoryError(validInput.agentId, 'check existing state', existingStateResult.value);
      }

      const stateEntity = existingStateResult.value
        ? this._updateExistingState(existingStateResult.value, validInput)
        : this._createNewState(agentIdVo, validInput);

      const isNewState = !existingStateResult.value;
      const saveResult = await this.stateRepository.save(stateEntity);

      if (saveResult.isError()) {
        return this._handleRepositoryError(validInput.agentId, `save agent internal state (new: ${isNewState})`, saveResult.value);
      }

      return ok({ success: true });
    } catch (errValue: unknown) {
      return this._handleUnexpectedError(input.agentId, errValue);
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
      updatedEntity = updatedEntity.updateGeneralNotes(newNotesVo);
    }
    return updatedEntity;
  }

  private _handleRepositoryError(agentId: string, action: string, repoError: Error): Result<never, DomainError> {
    const errorMessage = `Failed to ${action} for agent ${agentId}: ${repoError.message}`;
    this.logger.error(`[SaveAgentInternalStateUseCase] ${errorMessage}`, { error: repoError });
    return error(new DomainError(errorMessage, repoError));
  }

  private _handleUnexpectedError(agentId: string, errorValue: unknown): Result<never, DomainError | ZodError | ValueError | NotFoundError> {
    if (errorValue instanceof ZodError || errorValue instanceof NotFoundError || errorValue instanceof DomainError || errorValue instanceof ValueError) {
      return error(errorValue);
    }
    const message = errorValue instanceof Error ? errorValue.message : String(errorValue);
    this.logger.error(`[SaveAgentInternalStateUseCase] Unexpected error for agent ${agentId}: ${message}`, { error: errorValue });
    return error(new DomainError(`Unexpected error saving agent state: ${message}`));
  }
}
