import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/core/common/result";
import { LLMProviderConfigId } from "@/core/domain/entities/llm-provider-config/value-objects";
import {
  UserAvatar,
  UserEmail,
  UserNickname,
  UserUsername,
} from "@/core/domain/entities/user/value-objects";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";
import { IUserRepository } from "@/core/ports/repositories/user.interface";
import { slugfy } from "@/shared/slugfy";

export class CreateUserUseCase
  implements Executable<CreateUserUseCaseInput, CreateUserUseCaseOutput>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly llmProviderConfigRepository: ILLMProviderConfigRepository
  ) {}

  async execute(
    data: CreateUserUseCaseInput
  ): Promise<Result<CreateUserUseCaseOutput>> {
    try {
      const {
        user: { username, nickname, email, avatarUrl },
        llmProviderConfigId,
      } = data;

      const llmProviderConfig = await this.llmProviderConfigRepository.load(
        new LLMProviderConfigId(llmProviderConfigId)
      );

      const user = await this.userRepository.create({
        nickname: new UserNickname(nickname),
        username: new UserUsername(slugfy(username || nickname)),
        email: new UserEmail(email),
        avatar: new UserAvatar(avatarUrl),
        defaultLLMProviderConfigId: llmProviderConfig.id,
      });

      return OK({
        userId: user.id.value,
      });
    } catch (error) {
      return NOK(error as Error);
    }
  }
}

export type CreateUserUseCaseInput = {
  user: {
    nickname: string;
    username?: string;
    email: string;
    avatarUrl: string;
  };
  llmProviderConfigId: string | number;
};

export type CreateUserUseCaseOutput = {
  userId: string | number;
};
