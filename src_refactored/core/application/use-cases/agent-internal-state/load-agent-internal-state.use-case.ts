// src_refactored/core/application/use-cases/agent-internal-state/load-agent-internal-state.use-case.ts
import { ZodError } from 'zod';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { Result, ok, error } from '@/shared/result';

import {
  LoadAgentInternalStateUseCaseInput,
  LoadAgentInternalStateUseCaseInputSchema,
  LoadAgentInternalStateUseCaseOutput,
} from './load-agent-internal-state.schema';

export class LoadAgentInternalStateUseCase
  implements
    Executable<
      LoadAgentInternalStateUseCaseInput,
      LoadAgentInternalStateUseCaseOutput | null, // Output can be null if state not found
      DomainError | ZodError | ValueError | NotFoundError
    >
{
  constructor(
    private stateRepository: IAgentInternalStateRepository,
  ) {}

  async execute(
    input: LoadAgentInternalStateUseCaseInput,
  ): Promise<Result<LoadAgentInternalStateUseCaseOutput | null, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = LoadAgentInternalStateUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const agentIdVo = AgentId.fromString(validInput.agentId);

      const stateResult = await this.stateRepository.findByAgentId(agentIdVo);

      if (stateResult.isError()) {
        return error(new DomainError(`Failed to load internal state for agent ${validInput.agentId}: ${stateResult.value.message}`, stateResult.value));
      }

      const stateEntity = stateResult.value;

      if (!stateEntity) {
        // It's a valid case for state to not exist, return ok with null.
        // If it should be an error, return error(new NotFoundError(...))
        return ok(null);
      }

      const output: LoadAgentInternalStateUseCaseOutput = {
        agentId: stateEntity.agentId().value(),
        currentProjectId: stateEntity.currentProjectId()?.value() || null,
        currentGoal: stateEntity.currentGoal()?.value() || null, // Handles empty string from VO correctly
        generalNotes: stateEntity.generalNotes().list(),
      };

      return ok(output);

    } catch (err: any) {
      if (err instanceof ZodError || err instanceof NotFoundError || err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error(`[LoadAgentInternalStateUseCase] Unexpected error for agent ${input.agentId}:`, err);
      return error(new DomainError(`Unexpected error loading agent state: ${err.message || err}`));
    }
  }
}
