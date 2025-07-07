// src/core/application/use-cases/agent-internal-state/save-agent-internal-state.use-case.ts

import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger } from "@/core/common/services/logger.port";

import { AgentInternalState } from "@/domain/agent/agent-internal-state.entity";
import { IAgentInternalStateRepository } from "@/domain/agent/ports/agent-internal-state-repository.interface";
import { AgentId } from "@/domain/agent/value-objects/agent-id.vo";
import { CurrentGoal } from "@/domain/agent/value-objects/internal-state/current-goal.vo";
import { CurrentProjectId } from "@/domain/agent/value-objects/internal-state/current-project-id.vo";
import { GeneralNotesCollection } from "@/domain/agent/value-objects/internal-state/general-notes.collection.vo";

import {
  SaveAgentInternalStateUseCaseInput,
  SaveAgentInternalStateUseCaseInputSchema,
  SaveAgentInternalStateUseCaseOutput,
} from "./save-agent-internal-state.schema";

export class SaveAgentInternalStateUseCase
  implements
    IUseCase<
      SaveAgentInternalStateUseCaseInput,
      SaveAgentInternalStateUseCaseOutput
    >
{
  constructor(
    private readonly stateRepository: IAgentInternalStateRepository,
    private readonly logger: ILogger
  ) {}

  async execute(
    input: SaveAgentInternalStateUseCaseInput
  ): Promise<SaveAgentInternalStateUseCaseOutput> {
    const validInput = SaveAgentInternalStateUseCaseInputSchema.parse(input);
    const agentIdVo = AgentId.fromString(validInput.agentId);

    const existingState = await this.stateRepository.findByAgentId(agentIdVo);

    const stateEntity = existingState
      ? this._updateExistingState(existingState, validInput)
      : this._createNewState(agentIdVo, validInput);

    const _isNewState = !existingState;
    await this.stateRepository.save(stateEntity);

    return { success: true };
  }

  private _createNewState(
    agentIdVo: AgentId,
    validInput: SaveAgentInternalStateUseCaseInput
  ): AgentInternalState {
    const currentProjectIdVo = validInput.currentProjectId
      ? CurrentProjectId.fromString(validInput.currentProjectId)
      : undefined;
    const currentGoalVo =
      validInput.currentGoal !== null && validInput.currentGoal !== undefined
        ? CurrentGoal.create(validInput.currentGoal)
        : undefined;
    const generalNotesVo = GeneralNotesCollection.create(
      validInput.generalNotes || []
    );
    return AgentInternalState.create({
      id: agentIdVo,
      currentProjectId: currentProjectIdVo,
      currentGoal: currentGoalVo,
      generalNotes: generalNotesVo,
    });
  }

  private _updateExistingState(
    stateEntity: AgentInternalState,
    validInput: SaveAgentInternalStateUseCaseInput
  ): AgentInternalState {
    let updatedEntity = stateEntity;
    if (Object.prototype.hasOwnProperty.call(validInput, "currentProjectId")) {
      const newProjectIdVo = validInput.currentProjectId
        ? CurrentProjectId.fromString(validInput.currentProjectId)
        : undefined;
      updatedEntity = updatedEntity.changeCurrentProject(newProjectIdVo);
    }
    if (Object.prototype.hasOwnProperty.call(validInput, "currentGoal")) {
      const newGoalVo =
        validInput.currentGoal !== null && validInput.currentGoal !== undefined
          ? CurrentGoal.create(validInput.currentGoal)
          : undefined;
      updatedEntity = updatedEntity.changeCurrentGoal(newGoalVo);
    }
    if (Object.prototype.hasOwnProperty.call(validInput, "generalNotes")) {
      const newNotesVo = GeneralNotesCollection.create(
        validInput.generalNotes || []
      );
      updatedEntity = updatedEntity.setGeneralNotes(newNotesVo);
    }
    return updatedEntity;
  }
}
