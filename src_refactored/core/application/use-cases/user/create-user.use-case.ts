import { injectable, inject } from 'inversify';
import { ZodError } from 'zod'; // For ZodError type

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';
// DomainError, ValueError, EntityError are from domain/common/errors
import { DomainError, ValueError, EntityError } from '@/core/domain/common/errors';

import { IUserRepository } from '@/domain/user/ports/user-repository.interface'; // Removed UserRepositoryToken
// Use User (entity) and UserProps (interface) from user.entity
import { User, UserProps } from '@/domain/user/user.entity';
import { UserAvatar } from '@/domain/user/value-objects/user-avatar.vo';
import { UserEmail } from '@/domain/user/value-objects/user-email.vo';
import { UserId } from '@/domain/user/value-objects/user-id.vo';
import { UserNickname } from '@/domain/user/value-objects/user-nickname.vo';
import { UserUsername } from '@/domain/user/value-objects/user-username.vo';

// ApplicationError and ApplicationValidationError from application/common/errors
import { ApplicationError, ApplicationValidationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types'; // For IoC token

// Use ok, error, isError, isSuccess from shared/result
import { Result, ok, error as resultError, isError, isSuccess } from '@/shared/result';

// Use schema types directly
import { CreateUserUseCaseInput, CreateUserUseCaseOutput, CreateUserInputSchema } from './create-user.schema';


@injectable()
// Corrected IUseCase signature
export class CreateUserUseCase implements IUseCase<CreateUserUseCaseInput, CreateUserUseCaseOutput, DomainError | ApplicationError | ApplicationValidationError> {
  constructor(
    @inject(TYPES.IUserRepository) private readonly userRepository: IUserRepository, // Use IoC Token
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(input: CreateUserUseCaseInput): Promise<Result<CreateUserUseCaseOutput, DomainError | ApplicationError | ApplicationValidationError>> {
    this.logger.info(`[CreateUserUseCase] Attempting to create user with username: ${input.username}`);

    const validationResult = this._validateInput(input);
    if (isError(validationResult)) { // Use isError type guard
        return resultError(validationResult.error);
    }
    const validatedInput = validationResult.value;

    try {
      const existingUserCheckResult = await this._checkExistingUser(validatedInput);
      if (isError(existingUserCheckResult)) { // Use isError type guard
          return resultError(existingUserCheckResult.error);
      }

      // Refactor _createValueObjects to return Result and handle errors properly
      const voCreationResult = this._createValueObjects(validatedInput);
      if (isError(voCreationResult)) { // Use isError type guard
          return resultError(voCreationResult.error);
      }
      const { username, email, nickname, avatar, defaultLLMProviderConfigId, assistantId } = voCreationResult.value;

      // Refactor _createUserEntity to return Result and handle errors properly
      const entityCreationResult = this._createUserEntity(username, email, nickname, avatar, defaultLLMProviderConfigId, assistantId);
      if (isError(entityCreationResult)) { // Use isError type guard
          return resultError(entityCreationResult.error);
      }
      const userEntity = entityCreationResult.value;

      const saveResult = await this.userRepository.save(userEntity); // Changed add to save
      if (isError(saveResult)) { // Use isError type guard
        this.logger.error(
            '[CreateUserUseCase] Failed to save user to repository',
            { error: saveResult.error, useCase: 'CreateUserUseCase', username: input.username }
        );
        return resultError(saveResult.error); // Error from repo should be DomainError
      }

      this.logger.info(`[CreateUserUseCase] User created successfully: ${userEntity.id().value()}`);
      return ok(this._mapToOutput(userEntity)); // Use ok factory

    } catch (e: unknown) { // Catch any unexpected errors not caught by VO creation try-catch
      const errorToLog = e instanceof Error ? e : new Error(String(e));
      this.logger.error(
        '[CreateUserUseCase] Unexpected error while creating user',
        { error: errorToLog, useCase: 'CreateUserUseCase', username: input.username }
      );
      // Ensure returned error is one of the declared types
      if (e instanceof DomainError || e instanceof ApplicationError || e instanceof ApplicationValidationError) {
        return resultError(e);
      }
      return resultError(new ApplicationError(`An unexpected error occurred: ${errorToLog.message}`, errorToLog));
    }
  }

  private _validateInput(input: CreateUserUseCaseInput): Result<CreateUserUseCaseInput, ApplicationValidationError> {
    const validationParseResult = CreateUserInputSchema.safeParse(input);
    if (!validationParseResult.success) {
      const errorMessage = 'Invalid input for CreateUserUseCase';
      this.logger.error(
        `[CreateUserUseCase] Validation Error: ${errorMessage}`,
        { error: validationParseResult.error, details: validationParseResult.error.flatten().fieldErrors, useCase: 'CreateUserUseCase', input }
      );
      return resultError(new ApplicationValidationError(errorMessage, validationParseResult.error.flatten().fieldErrors));
    }
    return ok(validationParseResult.data);
  }

  private async _checkExistingUser(validatedInput: CreateUserUseCaseInput): Promise<Result<void, ApplicationError>> {
    try {
      const usernameVo = UserUsername.create(validatedInput.username);
      const existingByUsernameResult = await this.userRepository.findByUsername(usernameVo);
      if (isError(existingByUsernameResult)) {
        // Log and return as ApplicationError or pass DomainError up if appropriate
        this.logger.warn(`[CreateUserUseCase] Error checking username ${validatedInput.username}`, {error: existingByUsernameResult.error});
        return resultError(new ApplicationError(`Error checking username: ${existingByUsernameResult.error.message}`, existingByUsernameResult.error));
      }
      if (existingByUsernameResult.value) {
        return resultError(new ApplicationError('Username already exists.'));
      }

      const emailVo = UserEmail.create(validatedInput.email);
      const existingByEmailResult = await this.userRepository.findByEmail(emailVo);
      if (isError(existingByEmailResult)) {
        this.logger.warn(`[CreateUserUseCase] Error checking email ${validatedInput.email}`, {error: existingByEmailResult.error});
        return resultError(new ApplicationError(`Error checking email: ${existingByEmailResult.error.message}`, existingByEmailResult.error));
      }
      if (existingByEmailResult.value) {
        return resultError(new ApplicationError('Email already exists.'));
      }
      return ok(undefined);
    } catch (voError: unknown) { // Catch errors from UserUsername.create or UserEmail.create
        const errorToLog = voError instanceof Error ? voError : new Error(String(voError));
        this.logger.warn(`[CreateUserUseCase] Error creating VOs for user check: ${errorToLog.message}`, {error: errorToLog});
        return resultError(new ApplicationError(`Invalid username or email format: ${errorToLog.message}`, errorToLog));
    }
  }

  // This method needs careful Result handling for each VO creation
  private _createValueObjects(validatedInput: CreateUserUseCaseInput): Result<{
    username: UserUsername;
    email: UserEmail;
    nickname: UserNickname;
    avatar: UserAvatar;
    defaultLLMProviderConfigId: Identity;
    assistantId: Identity | null;
  }, DomainError | ValueError> { // Can return ValueError from VOs or DomainError
    try {
      const username = UserUsername.create(validatedInput.username); // Throws ValueError
      const email = UserEmail.create(validatedInput.email); // Throws ValueError
      const nickname = UserNickname.create(validatedInput.nickname); // Throws ValueError
      const avatar = UserAvatar.create(validatedInput.avatarUrl || null); // Throws ValueError

      // Identity.fromString for existing IDs, Identity.generate for new ones
      const defaultLLMProviderConfigId = Identity.fromString(validatedInput.defaultLLMProviderConfigId); // Throws Error if invalid UUID

      let assistantId: Identity | null = null;
      if (validatedInput.assistantId) {
        assistantId = Identity.fromString(validatedInput.assistantId); // Throws Error if invalid UUID
      }

      return ok({ username, email, nickname, avatar, defaultLLMProviderConfigId, assistantId });

    } catch (e: unknown) {
      const errorToLog = e instanceof Error ? e : new Error(String(e));
      this.logger.warn('[CreateUserUseCase] Error creating user value objects', { error: errorToLog, input: validatedInput });
      if (e instanceof ValueError || e instanceof DomainError) { // DomainError could be from Identity if its internal error is a DomainError
        return resultError(e);
      }
      // Wrap other errors (like from Identity.fromString if it throws generic Error)
      return resultError(new ValueError(`Invalid input for value object creation: ${errorToLog.message}`));
    }
  }

  private _createUserEntity(
    username: UserUsername,
    email: UserEmail,
    nickname: UserNickname,
    avatar: UserAvatar,
    defaultLLMProviderConfigId: Identity,
    assistantId: Identity | null
  ): Result<User, DomainError | EntityError> { // Entity.create can throw EntityError
    try {
      const userProps: UserProps = {
        id: UserId.generate(), // Use generate for new UserId
        username,
        email,
        nickname,
        avatar,
        defaultLLMProviderConfigId,
        assistantId,
        // createdAt and updatedAt are handled by the entity's create method
      };

      // User.create itself doesn't return a Result, it throws EntityError
      const userEntity = User.create(userProps);
      return ok(userEntity);
    } catch (e:unknown) {
      const errorToLog = e instanceof Error ? e : new Error(String(e));
       this.logger.error('[CreateUserUseCase] Failed to create user entity', { error: errorToLog });
      if (e instanceof EntityError || e instanceof DomainError) { // If User.create throws EntityError
        return resultError(e);
      }
      return resultError(new EntityError(`Failed to create user entity: ${errorToLog.message}`));
    }
  }

  private _mapToOutput(userEntity: User): CreateUserUseCaseOutput {
    return {
      id: userEntity.id().value(), // Use id() getter
      username: userEntity.username().value(), // Use VO getters
      email: userEntity.email().value(),
      nickname: userEntity.nickname().value(),
      avatarUrl: userEntity.avatar().value(),
      defaultLLMProviderConfigId: userEntity.defaultLLMProviderConfigId().value(),
      assistantId: userEntity.assistantId()?.value() ?? null,
      createdAt: userEntity.createdAt().toISOString(), // Use getter
      updatedAt: userEntity.updatedAt().toISOString(), // Use getter
    };
  }
}
