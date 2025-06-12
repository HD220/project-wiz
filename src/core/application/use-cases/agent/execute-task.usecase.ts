import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/shared/result";
import { AgentTemperature } from "@/core/domain/entities/agent/value-objects";
import { LLMProviderConfigId } from "@/core/domain/entities/llm-provider-config/value-objects";
import { PersonaId } from "@/core/domain/entities/agent/value-objects/persona/value-objects";
import { IAgentRepository } from "@/core/ports/repositories/agent.interface";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";
import { IPersonaRepository } from "@/core/ports/repositories/persona.interface";

export class ExecuteTaskUseCase implements Executable<Input, Output> {
  constructor() {}

  async execute(data: Input): Promise<Result<Output>> {
    try {
      //

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
};

type Output = {
  response: string;
};
