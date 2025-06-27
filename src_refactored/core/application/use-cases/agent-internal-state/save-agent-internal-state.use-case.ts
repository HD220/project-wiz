// src_refactored/core/application/use-cases/agent-internal-state/save-agent-internal-state.use-case.ts
import { ZodError } from 'zod';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';
import { AgentInternalState } from '@/domain/agent/agent-internal-state.entity';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { CurrentGoal } from '@/domain/agent/value-objects/internal-state/current-goal.vo';
import { CurrentProjectId } from '@/domain/agent/value-objects/internal-state/current-project-id.vo';
import { GeneralNotesCollection } from '@/domain/agent/value-objects/internal-state/general-notes.collection';
import { DomainError, ValueError, NotFoundError } from '@/domain/common/errors';
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
    private stateRepository: IAgentInternalStateRepository,
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

      if (!stateEntity) { // Create new state if none exists
        const currentProjectIdVo = validInput.currentProjectId
          ? CurrentProjectId.fromString(validInput.currentProjectId)
          : undefined;
        const currentGoalVo = validInput.currentGoal !== null && validInput.currentGoal !== undefined
          ? CurrentGoal.create(validInput.currentGoal)
          : undefined; // Or CurrentGoal.create("") if an empty goal is distinct from no goal
        const generalNotesVo = GeneralNotesCollection.create(validInput.generalNotes || []);

        stateEntity = AgentInternalState.create({
          agentId: agentIdVo,
          currentProjectId: currentProjectIdVo,
          currentGoal: currentGoalVo,
          generalNotes: generalNotesVo,
        });
      } else { // Update existing state
        let updated = false;
        if (validInput.currentProjectId !== undefined) { // Check if field was provided in input
          const newProjectIdVo = validInput.currentProjectId
            ? CurrentProjectId.fromString(validInput.currentProjectId)
            : undefined; // Explicitly undefined for clearing via entity method
          if (!stateEntity.currentProjectId()?.equals(newProjectIdVo) && (stateEntity.currentProjectId() || newProjectIdVo)) {
            stateEntity = stateEntity.changeCurrentProject(newProjectIdVo);
            updated = true;
          }
        }

        if (validInput.currentGoal !== undefined) { // Check if field was provided
          const newGoalVo = validInput.currentGoal !== null && validInput.currentGoal !== undefined
            ? CurrentGoal.create(validInput.currentGoal)
            : undefined; // To clear or represent 'no goal'
          // Check for actual change, considering undefined as 'no goal'
          const currentGoalValue = stateEntity.currentGoal()?.value();
          const newGoalValue = newGoalVo?.value();
          if (currentGoalValue !== newGoalValue && (currentGoalValue !== undefined || newGoalValue !== undefined )) {
             stateEntity = stateEntity.changeCurrentGoal(newGoalVo);
             updated = true;
          }
        }

        if (validInput.generalNotes !== undefined) {
          // Replace all notes if provided. To be more granular, one might add methods to AgentInternalState
          // for adding/removing specific notes, or the use case could handle merging.
          // For now, full replacement if `generalNotes` is in input.
          const newNotesVo = GeneralNotesCollection.create(validInput.generalNotes || []);
          if (!stateEntity.generalNotes().equals(newNotesVo)) { // Requires GeneralNotesCollection to have a proper equals
             stateEntity = stateEntity.touchAndUpdate({ generalNotes: newNotesVo }); // Assuming touchAndUpdate sets updatedAt
             updated = true;
          }
        }
        // If only agentId is provided and no other fields, 'updated' might remain false.
        // The entity's save should still proceed if it's a create or if there's a lastModified type field.
        // AgentInternalState does not have AbstractEntity's timestamps yet.
      }

      const saveResult = await this.stateRepository.save(stateEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save agent internal state: ${saveResult.value.message}`, saveResult.value));
      }

      return ok({ success: true });

    } catch (err: any) {
      if (err instanceof ZodError || err instanceof NotFoundError || err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error(`[SaveAgentInternalStateUseCase] Unexpected error for agent ${input.agentId}:`, err);
      return error(new DomainError(`Unexpected error saving agent state: ${err.message || err}`));
    }
  }
}
