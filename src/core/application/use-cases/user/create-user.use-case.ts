import { injectable, inject } from "inversify";


import { USER_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { Identity } from "@/core/common/value-objects/identity.vo";
import { DomainError } from "@/core/domain/common/errors";
import { IUserRepository } from "@/core/domain/user/ports/user-repository.interface";
import { User, UserProps } from "@/core/domain/user/user.entity";
import { UserAvatar } from "@/core/domain/user/value-objects/user-avatar.vo";
import { UserEmail } from "@/core/domain/user/value-objects/user-email.vo";
import { UserId } from "@/core/domain/user/value-objects/user-id.vo";
import { UserNickname } from "@/core/domain/user/value-objects/user-nickname.vo";
import { UserUsername } from "@/core/domain/user/value-objects/user-username.vo";






import { CreateUserInput, CreateUserOutput, CreateUserInputSchema } from "./create-user.schema";

@injectable()
export class CreateUserUseCase implements IUseCase<CreateUserInput, CreateUserOutput> {
  constructor(
    @inject(USER_REPOSITORY_INTERFACE_TYPE) private readonly userRepository: IUserRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    this.logger.info(`[CreateUserUseCase] Attempting to create user with username: ${input.username}`);

    const validatedInput = CreateUserInputSchema.parse(input);

    await this._checkExistingUser(validatedInput);

    const { username, email, nickname, avatar, defaultLLMProviderConfigId, assistantId } = this._createValueObjects(validatedInput);

    const userEntity = this._createUserEntity(username, email, nickname, avatar, defaultLLMProviderConfigId, assistantId);

    const savedUser = await this.userRepository.save(userEntity);

    this.logger.info(`[CreateUserUseCase] User created successfully: ${savedUser.id.value}`);
    return this._mapToOutput(savedUser);
  }

  private async _checkExistingUser(validatedInput: CreateUserInput): Promise<void> {
    const usernameVo = UserUsername.create(validatedInput.username);
    const existingByUsername = await this.userRepository.findByUsername(usernameVo);
    if (existingByUsername) {
      throw new DomainError('Username already exists.');
    }

    const emailVo = UserEmail.create(validatedInput.email);
    const existingByEmail = await this.userRepository.findByEmail(emailVo);
    if (existingByEmail) {
      throw new DomainError('Email already exists.');
    }
  }

  private _createValueObjects(validatedInput: CreateUserInput): {
    username: UserUsername;
    email: UserEmail;
    nickname: UserNickname;
    avatar: UserAvatar;
    defaultLLMProviderConfigId: Identity;
    assistantId: Identity | null;
  } {
    const username = UserUsername.create(validatedInput.username);
    const email = UserEmail.create(validatedInput.email);
    const nickname = UserNickname.create(validatedInput.nickname);
    const avatar = UserAvatar.create(validatedInput.avatarUrl || null);

    const defaultLLMProviderConfigId = Identity.fromString(validatedInput.defaultLLMProviderConfigId);

    let assistantId: Identity | null = null;
    if (validatedInput.assistantId) {
      assistantId = Identity.fromString(validatedInput.assistantId);
    }

    return { username, email, nickname, avatar, defaultLLMProviderConfigId, assistantId };
  }

  private _createUserEntity(
    username: UserUsername,
    email: UserEmail,
    nickname: UserNickname,
    avatar: UserAvatar,
    defaultLLMProviderConfigId: Identity,
    assistantId: Identity | null
  ): User {
    const userProps: UserProps = {
      id: UserId.generate(),
      username,
      email,
      nickname,
      avatar,
      defaultLLMProviderConfigId,
      assistantId,
    };

    const userEntity = User.create(userProps);
    return userEntity;
  }

  private _mapToOutput(userEntity: User): CreateUserOutput {
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