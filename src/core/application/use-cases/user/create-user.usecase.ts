import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/core/common/result";
import { AgentId } from "@/core/domain/entities/agent/value-objects";
import { LLMProviderConfigId } from "@/core/domain/entities/llm-provider-config/value-objects";
import {
  UserAvatar,
  UserEmail,
  UserNickname,
  UserUsername,
} from "@/core/domain/entities/user/value-objects";
import { IAgentRepository } from "@/core/ports/repositories/agent.repository";
import { IPersonaRepository } from "@/core/ports/repositories/persona.repository";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.repository";
import { ILLMProviderRepository } from "@/core/ports/repositories/llm-provider.repository";
import { IUserRepository } from "@/core/ports/repositories/user.repository";

export class CreateUserUseCase implements Executable<Input, Output> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly llmProviderRepository: ILLMProviderRepository,
    private readonly llmProviderConfigRepository: ILLMProviderConfigRepository,
    private readonly personaRepository: IPersonaRepository,
    private readonly agentRepository: IAgentRepository
  ) {}

  async execute(data: Input): Promise<Result<Output>> {
    try {
      const {
        user: { username, nickname, email, avatarUrl },
        llmProviderConfigId,
        assistantAgentId,
      } = data;

      const llmProviderConfig = await this.llmProviderConfigRepository.load(
        new LLMProviderConfigId(llmProviderConfigId)
      );

      const agent = await this.agentRepository.load(
        new AgentId(assistantAgentId)
      );

      const user = await this.userRepository.create({
        nickname: new UserNickname(nickname),
        username: new UserUsername(slugfy(username || nickname)),
        email: new UserEmail(email),
        avatar: new UserAvatar(avatarUrl),
        defaultLLMProviderConfigId: llmProviderConfig.id,
        assistantId: agent.id,
      });

      return OK({
        userId: user.id.value,
      });
    } catch (error) {
      return NOK(error as Error);
    }
  }
}

type Input = {
  user: {
    nickname: string;
    username?: string;
    email: string;
    avatarUrl: string;
  };
  llmProviderConfigId: string | number;
  assistantAgentId: string | number;
};

type Output = {
  userId: string | number;
};
