import { injectable, inject } from 'inversify';

import { ILoggerService, LoggerServiceToken } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';

import { IUserRepository, UserRepositoryToken } from '@/domain/user/ports/user-repository.interface';
import { UserEntity, UserProps } from '@/domain/user/user.entity';
import { UserAvatar } from '@/domain/user/value-objects/user-avatar.vo';
import { UserEmail } from '@/domain/user/value-objects/user-email.vo';
import { UserId } from '@/domain/user/value-objects/user-id.vo';
import { UserNickname } from '@/domain/user/value-objects/user-nickname.vo';
import { UserUsername } from '@/domain/user/value-objects/user-username.vo';

import { ApplicationError, DomainError, ValidationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result } from '@/shared/result';

import { CreateUserInput, CreateUserOutput, CreateUserInputSchema } from './create-user.schema';
// TODO: Import or define a HashingService if password hashing is to be done in the use case.
// For now, password is not explicitly handled by UserEntity for hashing.

@injectable()
export class CreateUserUseCase implements IUseCase<CreateUserInput, Promise<Result<CreateUserOutput, DomainError>>> {
  constructor(
    @inject(UserRepositoryToken) private readonly userRepository: IUserRepository,
    @inject(LoggerServiceToken) private readonly logger: ILoggerService,
  ) {}

  async execute(input: CreateUserInput): Promise<Result<CreateUserOutput, DomainError>> {
    this.logger.info(`[CreateUserUseCase] Attempting to create user with username: ${input.username}`);

    const validationResult = this._validateInput(input);
    if (validationResult.isFailure()) return Result.fail(validationResult.error);
    const validatedInput = validationResult.value;

    try {
      const existingUserCheck = await this._checkExistingUser(validatedInput);
      if (existingUserCheck.isFailure()) return Result.fail(existingUserCheck.error);

      const voCreation = this._createValueObjects(validatedInput);
      if (voCreation.isFailure()) return Result.fail(voCreation.error);
      const { username, email, nickname, avatar, defaultLLMProviderConfigId, assistantId } = voCreation.value;

      const entityCreation = this._createUserEntity(username, email, nickname, avatar, defaultLLMProviderConfigId, assistantId);
      if (entityCreation.isFailure()) return Result.fail(entityCreation.error);
      const userEntity = entityCreation.value;

      const saveResult = await this.userRepository.add(userEntity);
      if (saveResult.isFailure()) {
        this.logger.error('[CreateUserUseCase] Failed to save user to repository', saveResult.error);
        return Result.fail(saveResult.error);
      }

      this.logger.info(`[CreateUserUseCase] User created successfully: ${userEntity.id.value}`);
      return Result.ok(this._mapToOutput(userEntity));

    } catch (error: unknown) {
      this.logger.error('[CreateUserUseCase] Unexpected error while creating user', error);
      if (error instanceof DomainError) return Result.fail(error);
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new ApplicationError(`An unexpected error occurred: ${message}`));
    }
  }

  private _validateInput(input: CreateUserInput): Result<CreateUserInput, ValidationError> {
    const validationResult = CreateUserInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for CreateUserUseCase';
      this.logger.error(`[CreateUserUseCase] Validation Error: ${errorMessage}`, validationResult.error.flatten());
      return Result.fail(new ValidationError(errorMessage, validationResult.error.flatten().fieldErrors));
    }
    return Result.ok(validationResult.data);
  }

  private async _checkExistingUser(validatedInput: CreateUserInput): Promise<Result<void, ApplicationError>> {
    const existingByUsername = await this.userRepository.findByUsername(UserUsername.create(validatedInput.username).getOrThrow());
    if (existingByUsername.isSuccess() && existingByUsername.value) {
      return Result.fail(new ApplicationError('Username already exists.'));
    }
    const existingByEmail = await this.userRepository.findByEmail(UserEmail.create(validatedInput.email).getOrThrow());
    if (existingByEmail.isSuccess() && existingByEmail.value) {
      return Result.fail(new ApplicationError('Email already exists.'));
    }
    return Result.ok(undefined);
  }

  private _createValueObjects(validatedInput: CreateUserInput): Result<{
    username: UserUsername;
    email: UserEmail;
    nickname: UserNickname;
    avatar: UserAvatar;
    defaultLLMProviderConfigId: Identity;
    assistantId: Identity | null;
  }, DomainError> {
    const usernameResult = UserUsername.create(validatedInput.username);
    const emailResult = UserEmail.create(validatedInput.email);
    const nicknameResult = UserNickname.create(validatedInput.nickname);
    const avatarResult = UserAvatar.create(validatedInput.avatarUrl || null);
    const llmConfigIdResult = Identity.create(validatedInput.defaultLLMProviderConfigId);
    let assistantIdResult: Result<Identity | null, DomainError> = Result.ok(null);
    if (validatedInput.assistantId) {
      assistantIdResult = Identity.create(validatedInput.assistantId);
    }

    const combinedResult = Result.combine([
      usernameResult, emailResult, nicknameResult, avatarResult, llmConfigIdResult, assistantIdResult
    ]);

    if (combinedResult.isFailure()) {
      this.logger.warn('[CreateUserUseCase] Error creating user value objects', combinedResult.error);
      return Result.fail(combinedResult.error);
    }
    return Result.ok({
      username: usernameResult.value,
      email: emailResult.value,
      nickname: nicknameResult.value,
      avatar: avatarResult.value,
      defaultLLMProviderConfigId: llmConfigIdResult.value,
      assistantId: assistantIdResult.value,
    });
  }

  private _createUserEntity(
    username: UserUsername,
    email: UserEmail,
    nickname: UserNickname,
    avatar: UserAvatar,
    defaultLLMProviderConfigId: Identity,
    assistantId: Identity | null
  ): Result<UserEntity, DomainError> {
    const userProps: UserProps = {
      id: UserId.create(),
      username,
      email,
      nickname,
      avatar,
      defaultLLMProviderConfigId,
      assistantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userEntityResult = UserEntity.create(userProps);
    if (userEntityResult.isFailure()) {
      this.logger.error('[CreateUserUseCase] Failed to create user entity', userEntityResult.error);
      return Result.fail(userEntityResult.error);
    }
    return Result.ok(userEntityResult.value);
  }

  private _mapToOutput(userEntity: UserEntity): CreateUserOutput {
    return {
      id: userEntity.id.value,
      username: userEntity.username().value,
      email: userEntity.email().value,
      nickname: userEntity.nickname().value,
      avatarUrl: userEntity.avatar().value,
      defaultLLMProviderConfigId: userEntity.defaultLLMProviderConfigId().value,
      assistantId: userEntity.assistantId()?.value ?? null,
      createdAt: userEntity.createdAt.toISOString(),
      updatedAt: userEntity.updatedAt.toISOString(),
    };
  }
}
