// src_refactored/core/application/use-cases/agent-internal-state/load-agent-internal-state.use-case.ts


import { IUseCase } from '@/core/application/common/ports/use-case.interface';
import { ILogger } from '@/core/common/services/i-logger.service';
import { IAgentInternalStateRepository } from '@/core/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/core/domain/agent/value-objects/agent-id.vo';
import { NotFoundError } from '@/core/domain/common/errors';

import {
  LoadAgentInternalStateUseCaseInput,
  LoadAgentInternalStateUseCaseInputSchema,
  LoadAgentInternalStateUseCaseOutput,
} from './load-agent-internal-state.schema';

export class LoadAgentInternalStateUseCase
  implements
    IUseCase<
      LoadAgentInternalStateUseCaseInput,
      LoadAgentInternalStateUseCaseOutput
    >
{
  constructor(
    private readonly stateRepository: IAgentInternalStateRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(
    input: LoadAgentInternalStateUseCaseInput,
  ): Promise<LoadAgentInternalStateUseCaseOutput> {
    const validInput = LoadAgentInternalStateUseCaseInputSchema.parse(input);

    const agentIdVo = AgentId.fromString(validInput.agentId);

    const stateEntity = await this.stateRepository.findByAgentId(agentIdVo);

    if (!stateEntity) {
      throw new NotFoundError("AgentInternalState", validInput.agentId);
    }

    const output: LoadAgentInternalStateUseCaseOutput = {
      agentId: stateEntity.agentId.value,
      currentProjectId: stateEntity.currentProjectId ? stateEntity.currentProjectId.value : null,
      currentGoal: stateEntity.currentGoal ? stateEntity.currentGoal.value : null,
      generalNotes: [...stateEntity.generalNotes.list()],
    };
    return output;
  }
}