import { Executable } from "@/core/common/executable";
import { error, ok, Result } from "@/shared/result";
import { AgentTemperature } from "@/core/domain/entities/agent/value-objects";
import { LLMProviderConfigId } from "@/core/domain/entities/llm-provider-config/value-objects";
import { PersonaId } from "@/core/domain/entities/agent/value-objects/persona/value-objects";
import { IAgentRepository } from "@/core/ports/repositories/agent.interface";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";
import { IPersonaRepository } from "@/core/ports/repositories/persona.interface";

export class CreateAgentUseCase implements Executable<Input, Output> {
  constructor(
    private readonly agentRepository: IAgentRepository,
    private readonly personaRepository: IPersonaRepository,
    private readonly llmProviderConfigRepository: ILLMProviderConfigRepository
  ) {}

  async execute(data: Input): Promise<Result<Output>> {
    try {
      const { personaId, llmProviderConfigId, temperature } = data;

      const persona = await this.personaRepository.load(
        new PersonaId(personaId)
      );

      const llmProviderConfig = await this.llmProviderConfigRepository.load(
        new LLMProviderConfigId(llmProviderConfigId)
      );

      const agent = await this.agentRepository.create({
        persona,
        llmProviderConfig,
        temperature: new AgentTemperature(temperature),
      });

      return ok({
        agentId: agent.id.value,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(errorMessage);
    }
  }
}

type Input = {
  personaId: string;
  llmProviderConfigId: string;
  temperature: number;
};

type Output = {
  agentId: string | number;
};
