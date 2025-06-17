import { Executable } from "@/core/common/executable";
import { Result, ok, error } from "@/core/common/result";
import { IUserRepository } from "@/core/ports/repositories/user.interface";

export class UserQuery implements Executable<UserQueryInput, UserQueryOutput> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<Result<UserQueryOutput>> {
    try {
      const users = await this.userRepository.list();

      return ok(
        users.map((user) => ({
          id: user.id.value,
          username: user.username.value,
          nickname: user.nickname.value,
          email: user.email.value,
          avatar: user.avatar.value,
          defaultLLMProviderConfigId: user.defaultLLMProviderConfigId.value,
          assistantId: user?.assistantId?.value,
        }))
      );
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  }
}

export type UserQueryInput = undefined;
export type UserQueryOutput = {
  id: string | number;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  defaultLLMProviderConfigId: string | number;
  assistantId?: string | number;
}[];
