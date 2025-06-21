import { Executable } from "@/core/common/executable";
import { Result, ok, error } from "@/shared/result"; // Assuming ok, error are the Result constructors
import {
  ExecuteTaskUseCaseInput,
  ExecuteTaskUseCaseOutput,
  ExecuteTaskInputSchema,
} from "./execute-task.schema";
import { IAgentService, AgentStepOutput } from "../../ports/agent-service.interface"; // Corrected path
import { IAgentRepository } from "../../ports/repositories/agent.interface";
import { IJobRepository } from "../../ports/repositories/job.repository.interface";
import { IAgentRuntimeStateRepository } from "../../ports/repositories/agent-runtime-state.repository.interface";
import { DomainError } from "@/core/common/errors";
import { Agent } from "@/core/domain/entities/agent";
import { AgentId } from "@/core/domain/entities/agent/value-objects";
import { Job } from "@/core/domain/entities/job/job.entity";
import { JobId } from "@/core/domain/entities/job/value-objects/job-id.vo";
import { AgentRuntimeState } from "@/core/domain/entities/agent/agent-runtime-state.entity";

export class ExecuteTaskUseCase
  implements Executable<ExecuteTaskUseCaseInput, Result<ExecuteTaskUseCaseOutput>> {
  constructor(
    private readonly agentRepository: IAgentRepository,
    private readonly jobRepository: IJobRepository,
    private readonly agentRuntimeStateRepository: IAgentRuntimeStateRepository,
    private readonly agentService: IAgentService
  ) {}

  async execute(data: ExecuteTaskUseCaseInput): Promise<Result<ExecuteTaskUseCaseOutput>> {
    const validationResult = ExecuteTaskInputSchema.safeParse(data);
    if (!validationResult.success) {
      return error(validationResult.error.flatten().fieldErrors as any); // Cast for simplicity
    }
    const validInput = validationResult.data;

    try {
      const agentIdVo = AgentId.create(validInput.agentId);
      const jobIdVo = JobId.create(validInput.jobId);

      // Etapa 1: Carregar Entidades
      const agentConfigResult = await this.agentRepository.load(agentIdVo);
      if (agentConfigResult.isError()) {
        return error(new DomainError(`Failed to load Agent config: ${agentConfigResult.message}`));
      }
      const agentConfig = agentConfigResult.value;
      if (!agentConfig) {
        return error(new DomainError(`Agent config not found: ${agentIdVo.getValue()}`));
      }

      const jobResult = await this.jobRepository.load(jobIdVo);
      if (jobResult.isError()) {
        return error(new DomainError(`Failed to load Job: ${jobResult.message}`));
      }
      const job = jobResult.value;
      if (!job) {
        return error(new DomainError(`Job not found: ${jobIdVo.getValue()}`));
      }

      // Assume AgentId is the key for RuntimeState
      const runtimeStateResult = await this.agentRuntimeStateRepository.load(agentIdVo);
      if (runtimeStateResult.isError()) {
        return error(new DomainError(`Failed to load Agent runtime state: ${runtimeStateResult.message}`));
      }
      const runtimeState = runtimeStateResult.value;
      if (!runtimeState) {
        return error(new DomainError(`Agent runtime state not found: ${agentIdVo.getValue()}`));
      }

      // Etapa 2: Executar Lógica do Agente via IAgentService
      const executionResult = await this.agentService.executeNextStep(agentConfig, runtimeState, job);
      if (executionResult.isError()) {
        // Potentially save job and runtime state even if agent service failed, if they were modified
        // For now, just returning the error from agentService
        return error(executionResult.message); // executionResult.message should be DomainError or similar
      }
      const { updatedJob, updatedRuntimeState, outputPayload } = executionResult.value;

      // Etapa 3: Salvar Estado Atualizado
      // TODO: Considerar uma unidade de trabalho transacional aqui se ambos os saves precisarem ser atômicos.
      const saveJobResult = await this.jobRepository.save(updatedJob);
      if (saveJobResult.isError()) {
        return error(new DomainError(`Failed to save updated job: ${saveJobResult.message}`));
      }

      const saveStateResult = await this.agentRuntimeStateRepository.save(updatedRuntimeState);
      if (saveStateResult.isError()) {
        return error(new DomainError(`Failed to save updated agent runtime state: ${saveStateResult.message}`));
      }

      // Etapa 4: Retornar Resultado
      const finalJobProps = updatedJob.getProps();
      return ok({
        jobId: updatedJob.id().getValue(),
        jobStatus: finalJobProps.status.getValue(),
        taskOutput: outputPayload,
      });

    } catch (err) {
      console.error("Unexpected error in ExecuteTaskUseCase:", err);
      return error(new DomainError(err instanceof Error ? err.message : "Failed to execute task due to unexpected error"));
    }
  }
}

// Removed local type Input and Output
