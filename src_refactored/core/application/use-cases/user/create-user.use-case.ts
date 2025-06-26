import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/result';
import { IUseCase } from '../../common/ports/use-case.interface';
import { CreateUserInput, CreateUserOutput, CreateUserInputSchema } from './create-user.schema';
import { UserEntity, UserProps } from '../../../domain/user/user.entity';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';
import { UserUsername } from '../../../domain/user/value-objects/user-username.vo';
import { UserEmail } from '../../../domain/user/value-objects/user-email.vo';
import { UserNickname } from '../../../domain/user/value-objects/user-nickname.vo';
import { UserAvatar } from '../../../domain/user/value-objects/user-avatar.vo';
import { Identity } from '../../../common/value-objects/identity.vo'; // For LLMProviderConfigId and AgentId
import { IUserRepository, UserRepositoryToken } from '../../../domain/user/ports/user-repository.interface';
import { LoggerServiceToken, ILoggerService } from '../../../common/services/i-logger.service';
import { DomainError, ValidationError, ApplicationError } from '../../../common/errors';
// TODO: Import or define a HashingService if password hashing is to be done in the use case.
// For now, password is not explicitly handled by UserEntity for hashing.

@injectable()
export class CreateUserUseCase implements IUseCase<CreateUserInput, Promise<Result<CreateUserOutput, DomainError>>> {
  constructor(
    @inject(UserRepositoryToken) private readonly userRepository: IUserRepository,
    @inject(LoggerServiceToken) private readonly logger: ILoggerService,
    // @inject(HashingServiceToken) private readonly hashingService: IHashingService, // Example
  ) {}

  async execute(input: CreateUserInput): Promise<Result<CreateUserOutput, DomainError>> {
    this.logger.info(`[CreateUserUseCase] Attempting to create user with username: ${input.username}`);

    const validationResult = CreateUserInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for CreateUserUseCase';
      this.logger.error(`[CreateUserUseCase] Validation Error: ${errorMessage}`, validationResult.error.flatten());
      return Result.fail(new ValidationError(errorMessage, validationResult.error.flatten().fieldErrors));
    }

    const validatedInput = validationResult.data;

    try {
      // Check if username or email already exists
      const existingByUsername = await this.userRepository.findByUsername(UserUsername.create(validatedInput.username).getOrThrow()); // Assuming VO creation won't fail here due to Zod
      if (existingByUsername.isSuccess() && existingByUsername.value) {
        return Result.fail(new ApplicationError('Username already exists.'));
      }
      const existingByEmail = await this.userRepository.findByEmail(UserEmail.create(validatedInput.email).getOrThrow());
      if (existingByEmail.isSuccess() && existingByEmail.value) {
        return Result.fail(new ApplicationError('Email already exists.'));
      }

      // Create Value Objects
      const usernameResult = UserUsername.create(validatedInput.username);
      const emailResult = UserEmail.create(validatedInput.email);
      const nicknameResult = UserNickname.create(validatedInput.nickname);
      const avatarResult = UserAvatar.create(validatedInput.avatarUrl || null); // Default to null if undefined
      const llmConfigIdResult = Identity.create(validatedInput.defaultLLMProviderConfigId);
      let assistantIdResult: Result<Identity | null, DomainError> = Result.ok(null);
      if (validatedInput.assistantId) {
        assistantIdResult = Identity.create(validatedInput.assistantId);
      }


      const results = Result.combine([
        usernameResult, emailResult, nicknameResult, avatarResult, llmConfigIdResult, assistantIdResult
      ]);
      if (results.isFailure()) {
        this.logger.warn('[CreateUserUseCase] Error creating user value objects', results.error);
        return Result.fail(results.error);
      }

      // TODO: Password Hashing - This is a critical step.
      // const hashedPassword = await this.hashingService.hash(validatedInput.password);
      // For now, we are not including password in UserEntity props directly for this example,
      // as UserEntity doesn't have a password field. This needs alignment with domain model.
      // If UserEntity were to store a hashed password, it would be passed here.

      const userProps: UserProps = {
        id: UserId.create(), // Generate new User ID
        username: usernameResult.value,
        email: emailResult.value,
        nickname: nicknameResult.value,
        avatar: avatarResult.value,
        defaultLLMProviderConfigId: llmConfigIdResult.value,
        assistantId: assistantIdResult.isSuccess() ? assistantIdResult.value : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userEntityResult = UserEntity.create(userProps);
      if (userEntityResult.isFailure()) {
        this.logger.error('[CreateUserUseCase] Failed to create user entity', userEntityResult.error);
        return Result.fail(userEntityResult.error);
      }
      const userEntity = userEntityResult.value;

      // Assuming the repository handles the actual password storage if applicable.
      const saveResult = await this.userRepository.add(userEntity); // Using 'add' as per IRepository convention
      if (saveResult.isFailure()) {
        this.logger.error('[CreateUserUseCase] Failed to save user to repository', saveResult.error);
        return Result.fail(saveResult.error);
      }

      this.logger.info(`[CreateUserUseCase] User created successfully: ${userEntity.id.value}`);

      const output: CreateUserOutput = {
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
      return Result.ok(output);

    } catch (error: any) {
      this.logger.error('[CreateUserUseCase] Unexpected error while creating user', error);
      // Check if it's a DomainError we can propagate
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(new ApplicationError(`An unexpected error occurred: ${error.message}`));
    }
  }
}
