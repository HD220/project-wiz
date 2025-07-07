import { injectable, inject } from "inversify";

import { USER_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/logger.port";
import { NotFoundError } from "@/core/domain/common/common-domain.errors";
import { IUserRepository } from "@/core/domain/user/ports/user-repository.interface";
import { User } from "@/core/domain/user/user.entity";
import { UserEmail } from "@/core/domain/user/value-objects/user-email.vo";
import { UserId } from "@/core/domain/user/value-objects/user-id.vo";






import { GetUserInput, GetUserOutput, GetUserInputSchema } from "./get-user.schema";

@injectable()
export class GetUserUseCase implements IUseCase<GetUserInput, GetUserOutput> {
  constructor(
    @inject(USER_REPOSITORY_INTERFACE_TYPE) private readonly userRepository: IUserRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(input: GetUserInput): Promise<GetUserOutput> {
    this.logger.info(`[GetUserUseCase] Attempting to get user with input: ${JSON.stringify(input)}`);

    const validatedInput = GetUserInputSchema.parse(input);

    const userEntity = await this._fetchUser(validatedInput);

    if (!userEntity) {
      this.logger.info(`[GetUserUseCase] User not found with input: ${JSON.stringify(validatedInput)}`);
      throw new NotFoundError('User', validatedInput.userId || validatedInput.email || 'unknown');
    }

    this.logger.info(`[GetUserUseCase] User found: ${userEntity.id.value}`);
    return this._mapToOutput(userEntity);
  }

  private async _fetchUser(validatedInput: GetUserInput): Promise<User | null> {
    const { userId, email } = validatedInput;

    if (userId) {
      const userIdVo = UserId.fromString(userId);
      return this.userRepository.findById(userIdVo);
    } else if (email) {
      const emailVo = UserEmail.create(email);
      return this.userRepository.findByEmail(emailVo);
    }
    return null;
  }

  private _mapToOutput(userEntity: User): GetUserOutput {
    return {
      id: userEntity.id.value,
      username: userEntity.username.value,
      email: userEntity.email.value,
      nickname: userEntity.nickname.value,
      avatarUrl: userEntity.avatar.value,
      defaultLLMProviderConfigId: userEntity.defaultLLMProviderConfigId.value,
      assistantId: userEntity.assistantId?.value ?? null,
      createdAt: userEntity.createdAt.toISOString(),
      updatedAt: userEntity.updatedAt.toISOString(),
    };
  }
}