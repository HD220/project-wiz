// src_refactored/core/application/use-cases/agent-internal-state/save-agent-internal-state.use-case.ts
import { ZodError } from 'zod';

import { DomainError, ValueError, NotFoundError } from '@/domain/common/errors';
import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';
import { AgentInternalState } from '@/domain/agent/agent-internal-state.entity';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { CurrentGoal } from '@/domain/agent/value-objects/internal-state/current-goal.vo';
import { CurrentProjectId } from '@/domain/agent/value-objects/internal-state/current-project-id.vo';
import { GeneralNotesCollection } from '@/domain/agent/value-objects/internal-state/general-notes.collection';
// Removed duplicate import of DomainError, ValueError, NotFoundError

import { Result, ok, error } from '@/shared/result';
import { ILoggerService } from '@/core/common/services/i-logger.service';

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
    private readonly logger: ILoggerService, // Added logger dependency
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

      let stateEntity: AgentInternalState | null;
      const existingStateResult = await this.stateRepository.findByAgentId(agentIdVo);

      if (existingStateResult.isError()) {
        return error(new DomainError(`Failed to check existing state for agent ${validInput.agentId}: ${existingStateResult.value.message}`, existingStateResult.value));
      }
      stateEntity = existingStateResult.value;

      let isNewState = false;
      if (!stateEntity) {
        isNewState = true;
        const currentProjectIdVo = validInput.currentProjectId ? CurrentProjectId.fromString(validInput.currentProjectId) : undefined;
        const currentGoalVo = validInput.currentGoal !== null && validInput.currentGoal !== undefined ? CurrentGoal.create(validInput.currentGoal) : undefined;
        const generalNotesVo = GeneralNotesCollection.create(validInput.generalNotes || []);
        stateEntity = AgentInternalState.create({ agentId: agentIdVo, currentProjectId: currentProjectIdVo, currentGoal: currentGoalVo, generalNotes: generalNotesVo });
      } else {
        // Update existing state
        // let updated = false; // This variable is not used, can be removed or used if logging specific changes
        if (Object.prototype.hasOwnProperty.call(validInput, 'currentProjectId')) {
          const newProjectIdVo = validInput.currentProjectId ? CurrentProjectId.fromString(validInput.currentProjectId) : undefined;
          stateEntity = stateEntity.changeCurrentProject(newProjectIdVo);
          // updated = true;
        }
        if (Object.prototype.hasOwnProperty.call(validInput, 'currentGoal')) {
          const newGoalVo = validInput.currentGoal !== null && validInput.currentGoal !== undefined ? CurrentGoal.create(validInput.currentGoal) : undefined;
          stateEntity = stateEntity.changeCurrentGoal(newGoalVo);
          // updated = true;
        }
        if (Object.prototype.hasOwnProperty.call(validInput, 'generalNotes')) {
          const newNotesVo = GeneralNotesCollection.create(validInput.generalNotes || []);
          stateEntity = stateEntity.updateGeneralNotes(newNotesVo); // Assuming a method like updateGeneralNotes
          // updated = true;
        }
      }

      const saveResult = await this.stateRepository.save(stateEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save agent internal state (new: ${isNewState}): ${saveResult.value.message}`, saveResult.value));
      }

      return ok({ success: true });
    } catch (e: unknown) {
      if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
        return error(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[SaveAgentInternalStateUseCase] Unexpected error for agent ${input.agentId}: ${message}`, { error: e });
      return error(new DomainError(`Unexpected error saving agent state: ${message}`));
    }
  }
}
