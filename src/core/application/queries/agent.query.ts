import { Executable } from "@/core/common/executable";
import { error, ok, Result } from "@/core/common/result";
import { IAgentRepository } from "@/core/ports/repositories/agent.interface";

export class AgentQuery implements Executable<Input, Output> {
  constructor(private readonly agentRepository: IAgentRepository) {}

  async execute(_: Input): Promise<Result<Output>> {
    try {
      const agents = await this.agentRepository.list();

      return ok({
        data: agents.map((agent) => ({
          id: agent.id.value,
          llmProviderConfigId: agent.llmProviderConfig.id.value,
          personaId: agent.persona.id.value,
          temperature: agent.temperature.value,
        })),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return error(errorMessage);
    }
  }
}

type Input = undefined;
type Output = {
  data: {
    id: string | number;
    llmProviderConfigId: string | number;
    personaId: string | number;
    temperature: number;
  }[];
};
