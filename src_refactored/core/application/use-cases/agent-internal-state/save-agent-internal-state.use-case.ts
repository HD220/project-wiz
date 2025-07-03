// src_refactored/core/application/use-cases/agent-internal-state/save-agent-internal-state.use-case.ts
import { ZodError } from 'zod';

import { ILogger } from '@/core/common/services/i-logger.service';

import { AgentInternalState } from '@/domain/agent/agent-internal-state.entity';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { CurrentGoal } from '@/domain/agent/value-objects/internal-state/current-goal.vo';
import { CurrentProjectId } from '@/domain/agent/value-objects/internal-state/current-project-id.vo';
import { GeneralNotesCollection } from '@/domain/agent/value-objects/internal-state/general-notes.collection';
import { DomainError, ValueError, NotFoundError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { successUseCaseResponse, errorUseCaseResponse, IUseCaseResponse } from '@/shared/application/use-case-response.dto';





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
  ): Promise<IUseCaseResponse<SaveAgentInternalStateUseCaseOutput>> {
    const validInput = SaveAgentInternalStateUseCaseInputSchema.parse(input);
    const agentIdVo = AgentId.fromString(validInput.agentId);

    const existingState = await this.stateRepository.findByAgentId(agentIdVo);

    const stateEntity = existingState
      ? this._updateExistingState(existingState, validInput)
      : this._createNewState(agentIdVo, validInput);

    const _isNewState = !existingState;
    await this.stateRepository.save(stateEntity);

    return successUseCaseResponse({ success: true });
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

  private _handleRepositoryError(agentId: string, action: string, repoError: Error): IUseCaseResponse<never> {
    const errorMessage = `Failed to ${action} for agent ${agentId}: ${repoError.message}`;
    this.logger.error(`[SaveAgentInternalStateUseCase] ${errorMessage}`, repoError, {
      agentId,
      action,
      useCase: 'SaveAgentInternalStateUseCase',
    });
    return errorUseCaseResponse(new DomainError(errorMessage, repoError).toUseCaseErrorDetails());
  }

  private _handleUnexpectedError(agentId: string, errorValue: unknown): IUseCaseResponse<never> {
    if (errorValue instanceof ZodError || errorValue instanceof NotFoundError || errorValue instanceof DomainError || errorValue instanceof ValueError) {
      this.logger.warn(`[SaveAgentInternalStateUseCase] Known error type occurred for agent ${agentId}: ${errorValue.message}`, {
        agentId,
        useCase: 'SaveAgentInternalStateUseCase',
        // Optionally, serialize parts of errorValue if needed and not too verbose:
        // errorName: (errorValue as Error).name,
      });
      return errorUseCaseResponse(errorValue.toUseCaseErrorDetails());
    }
    const message = errorValue instanceof Error ? errorValue.message : String(errorValue);
    const logError = errorValue instanceof Error ? errorValue : new Error(message);
    this.logger.error(`[SaveAgentInternalStateUseCase] Unexpected error for agent ${agentId}: ${message}`, logError, {
      agentId,
      useCase: 'SaveAgentInternalStateUseCase',
    });
    return errorUseCaseResponse(new DomainError(`Unexpected error saving agent state: ${message}`, logError).toUseCaseErrorDetails());
  }
}
