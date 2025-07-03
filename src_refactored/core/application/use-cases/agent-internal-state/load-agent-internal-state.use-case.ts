// src_refactored/core/application/use-cases/agent-internal-state/load-agent-internal-state.use-case.ts
import { ZodError } from 'zod';

import { ILogger } from '@/core/common/services/i-logger.service';

import { IAgentInternalStateRepository } from '@/domain/agent/ports/agent-internal-state-repository.interface';
import { AgentId } from '@/domain/agent/value-objects/agent-id.vo';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { Result, ok, error, isError } from '@/shared/result';

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
  ): Promise<Result<LoadAgentInternalStateUseCaseOutput | null, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = LoadAgentInternalStateUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const agentIdVo = AgentId.fromString(validInput.agentId);

      const stateResult = await this.stateRepository.findByAgentId(agentIdVo);

      if (isError(stateResult)) {
        const errorMessage = `Failed to load internal state for agent ${validInput.agentId}: ${stateResult.error.message}`;
        this.logger.error(
          errorMessage,
          stateResult.error,
          {
            agentId: validInput.agentId,
            useCase: 'LoadAgentInternalStateUseCase',
          }
        );
        return error(new DomainError(errorMessage, stateResult.error));
      }

      const stateEntity = stateResult.value;

      if (!stateEntity) {
        return ok(null);
      }

      const output: LoadAgentInternalStateUseCaseOutput = {
        agentId: stateEntity.id.value,
        currentProjectId: stateEntity.currentProjectId?.value || null,
        currentGoal: stateEntity.currentGoal?.value || null,
        generalNotes: [...stateEntity.generalNotes.list()],
      };

      return ok(output);
    } catch (e: unknown) {
      const agentIdForLog = input?.agentId ?? 'unknown';
      if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
        this.logger.warn(
          `[LoadAgentInternalStateUseCase] Known error for agent ${agentIdForLog}: ${e.message}`,
          { agentId: agentIdForLog, error: e },
        );
        return error(e);
      }

      const message = e instanceof Error ? e.message : String(e);
      const errorToLog = e instanceof Error ? e : new Error(message);
      this.logger.error(
        `[LoadAgentInternalStateUseCase] Unexpected error for agent ${agentIdForLog}: ${message}`,
        errorToLog,
        {
          agentId: agentIdForLog,
          useCase: 'LoadAgentInternalStateUseCase',
        }
      );
      return error(new DomainError(`Unexpected error loading agent state: ${message}`, errorToLog));
    }
  }
}
