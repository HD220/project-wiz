// src_refactored/core/application/use-cases/agent-internal-state/load-agent-internal-state.use-case.ts
import { ZodError } from 'zod';

import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';
import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { Result, ok, error } from '@/shared/result';
import { ILogger } from '@/core/common/services/i-logger.service'; // Added import for ILogger
import { Inject } from '@/application/common/ioc/dependency-injection.decorators'; // Assuming IoC

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
    // @Inject(IAgentInternalStateRepositorySymbol) // Example for IoC
    private readonly stateRepository: IAgentInternalStateRepository,
    // @Inject(ILoggerSymbol) // Example for IoC
    private readonly logger: ILogger,
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
        return ok(null);
      }

      const output: LoadAgentInternalStateUseCaseOutput = {
        agentId: stateEntity.agentId().value(),
        currentProjectId: stateEntity.currentProjectId()?.value() || null,
        currentGoal: stateEntity.currentGoal()?.value() || null,
        generalNotes: stateEntity.generalNotes().list(),
      };

      return ok(output);
    } catch (e: unknown) {
      if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
        return error(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[LoadAgentInternalStateUseCase] Unexpected error for agent ${input.agentId}: ${message}`, { error: e });
      return error(new DomainError(`Unexpected error loading agent state: ${message}`));
    }
  }
}
