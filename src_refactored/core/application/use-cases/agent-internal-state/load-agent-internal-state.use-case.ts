// src_refactored/core/application/use-cases/agent-internal-state/load-agent-internal-state.use-case.ts
import { ZodError } from 'zod';

import { ILogger } from '@/core/common/services/i-logger.service';

import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { successUseCaseResponse, IUseCaseResponse } from '@/shared/application/use-case-response.dto';

import {
  LoadAgentInternalStateUseCaseInput,
  LoadAgentInternalStateUseCaseInputSchema,
  LoadAgentInternalStateUseCaseOutput,
} from './load-agent-internal-state.schema';

export class LoadAgentInternalStateUseCase
  implements
    Executable<
      LoadAgentInternalStateUseCaseInput,
      LoadAgentInternalStateUseCaseOutput | null,
      DomainError | ZodError | ValueError | NotFoundError
    >
{
  constructor(
    private readonly stateRepository: IAgentInternalStateRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(
    input: LoadAgentInternalStateUseCaseInput,
  ): Promise<IUseCaseResponse<LoadAgentInternalStateUseCaseOutput | null>> {
    const validInput = LoadAgentInternalStateUseCaseInputSchema.parse(input);

    const agentIdVo = AgentId.fromString(validInput.agentId);

    const stateEntity = await this.stateRepository.findByAgentId(agentIdVo);

    if (!stateEntity) {
      return successUseCaseResponse(null);
    }

    const output: LoadAgentInternalStateUseCaseOutput = {
      agentId: stateEntity.id.value,
      currentProjectId: stateEntity.currentProjectId?.value || null,
      currentGoal: stateEntity.currentGoal?.value || null,
      generalNotes: [...stateEntity.generalNotes.list()],
    };

    return successUseCaseResponse(output);
  }
}