import { Executable } from "@/core/common/executable";
import { NOK, OK, Result } from "@/core/common/result";
import { IUserRepository } from "@/core/ports/repositories/user.repository";

export class UserQuery implements Executable<Input, Output> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: Input): Promise<Result<Output>> {
    try {
      const users = await this.userRepository.list();

      return OK({
        data: users.map((user) => ({
          id: user.id.value,
          username: user.username.value,
          nickname: user.nickname.value,
          email: user.email.value,
          avatar: user.avatar.value,
          defaultLLMProviderConfigId: user.defaultLLMProviderConfigId.value,
          assistantId: user.assistantId.value,
        })),
      });
    } catch (error) {
      return NOK(error as Error);
    }
  }
}

type Input = undefined;
type Output = {
  data: {
    id: string | number;
    username: string;
    nickname: string;
    email: string;
    avatar: string;
    defaultLLMProviderConfigId: string | number;
    assistantId: string | number;
  }[];
};
