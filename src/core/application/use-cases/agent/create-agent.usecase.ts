import { Executable } from "@/core/common/executable";
import { error, ok, Result } from "@/shared/result";
import {
  CreateAgentUseCaseInput,
  CreateAgentUseCaseOutput,
  CreateAgentInputSchema,
} from "./create-agent.schema"; // Import from new schema file
import { Agent } from "@/core/domain/entities/agent"; // Import Agent entity
import { AgentId, AgentTemperature } from "@/core/domain/entities/agent/value-objects";
import { Persona } from "@/core/domain/entities/agent/value-objects/persona"; // Import Persona entity
import { PersonaId } from "@/core/domain/entities/agent/value-objects/persona/value-objects";
import { LLMProviderConfig } from "@/core/domain/entities/llm-provider-config"; // Import LLMProviderConfig entity
import { LLMProviderConfigId } from "@/core/domain/entities/llm-provider-config/value-objects";
import { IAgentRepository } from "@/core/ports/repositories/agent.interface";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";
import { IPersonaRepository } from "@/core/ports/repositories/persona.interface";
import { DomainError } from "@/core/common/errors";

export class CreateAgentUseCase
  implements Executable<CreateAgentUseCaseInput, Result<CreateAgentUseCaseOutput>> {
  constructor(
    private readonly agentRepository: IAgentRepository,
    private readonly personaRepository: IPersonaRepository,
    private readonly llmProviderConfigRepository: ILLMProviderConfigRepository
  ) {}

  async execute(data: CreateAgentUseCaseInput): Promise<Result<CreateAgentUseCaseOutput>> {
    try {
      const validationResult = CreateAgentInputSchema.safeParse(data);
      if (!validationResult.success) {
        return error(validationResult.error.flatten().fieldErrors as any); // Cast for simplicity
      }
      const validInput = validationResult.data;

      const personaIdVo = PersonaId.create(validInput.personaId);
      const llmConfigIdVo = LLMProviderConfigId.create(validInput.llmProviderConfigId);

      const personaResult = await this.personaRepository.load(personaIdVo);
      if (personaResult.isError()) {
        return error(new DomainError(`Failed to load Persona: ${personaResult.message}`));
      }
      const persona = personaResult.value;
      if (!persona) {
        return error(new DomainError(`Persona not found: ${personaIdVo.getValue()}`));
      }

      const llmConfigResult = await this.llmProviderConfigRepository.load(llmConfigIdVo);
      if (llmConfigResult.isError()) {
        return error(new DomainError(`Failed to load LLMProviderConfig: ${llmConfigResult.message}`));
      }
      const llmProviderConfig = llmConfigResult.value;
      if (!llmProviderConfig) {
        return error(new DomainError(`LLMProviderConfig not found: ${llmConfigIdVo.getValue()}`));
      }

      const temperatureVo = AgentTemperature.create(validInput.temperature);
      const agentId = AgentId.create(); // Generate new AgentId

      const agent = Agent.create({
        id: agentId,
        persona: persona,
        llmProviderConfig: llmProviderConfig,
        temperature: temperatureVo,
      });

      await this.agentRepository.save(agent); // Use save method

      return ok({
        agentId: agent.id().getValue(), // Use id() and getValue()
      });
    } catch (err) {
      console.error("Error in CreateAgentUseCase:", err); // Log the actual error
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(new DomainError(errorMessage));
    }
  }
}

// Removed local type Input and Output
