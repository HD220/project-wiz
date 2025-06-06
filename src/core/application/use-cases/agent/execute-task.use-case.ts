import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/core/common/result";
import { AgentTemperature } from "@/core/domain/entities/agent/value-objects";
import { LLMProviderConfigId } from "@/core/domain/entities/llm-provider-config/value-objects";
import { PersonaId } from "@/core/domain/entities/agent/value-objects/persona/value-objects";
import { IAgentRepository } from "@/core/ports/repositories/agent.interface";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";
import { IPersonaRepository } from "@/core/ports/repositories/persona.interface";

export class ExecuteTaskUseCase implements Executable<Input, Output> {
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

      return OK({
        response: "",
      });
    } catch (error) {
      return NOK(error as Error);
    }
  }
}

type Input = {
  agentId: string;
  taskId: string;
};

type Output = {
  response: string;
};
