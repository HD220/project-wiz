import { injectable, inject } from 'inversify';

import { ILoggerService, LoggerServiceToken } from '@/core/common/services/i-logger.service';

import { IUserRepository, UserRepositoryToken } from '@/domain/user/ports/user-repository.interface';
import { UserEntity } from '@/domain/user/user.entity';
import { UserEmail } from '@/domain/user/value-objects/user-email.vo';
import { UserId } from '@/domain/user/value-objects/user-id.vo';

import { ApplicationError, DomainError, NotFoundError, ValidationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result } from '@/shared/result';

import { GetUserInput, GetUserOutput, GetUserInputSchema } from './get-user.schema';

@injectable()
export class GetUserUseCase implements IUseCase<GetUserInput, Promise<Result<GetUserOutput | null, DomainError>>> {
  constructor(
    @inject(UserRepositoryToken) private readonly userRepository: IUserRepository,
    @inject(LoggerServiceToken) private readonly logger: ILoggerService,
  ) {}

  async execute(input: GetUserInput): Promise<Result<GetUserOutput | null, DomainError>> {
    this.logger.info(`[GetUserUseCase] Attempting to get user with input: ${JSON.stringify(input)}`);

    const validationResult = this._validateInput(input);
    if (validationResult.isFailure()) {
      return Result.fail(validationResult.error);
    }
    const validatedInput = validationResult.value;

    try {
      const userResult = await this._fetchUser(validatedInput);
      if (userResult.isFailure()) {
        // Log specific not found cases or propagate other domain errors
        if (userResult.error instanceof NotFoundError) {
          this.logger.info(`[GetUserUseCase] User not found with input: ${JSON.stringify(validatedInput)}`);
        } else {
          this.logger.warn('[GetUserUseCase] Error while fetching user', userResult.error);
        }
        return Result.fail(userResult.error);
      }

      const userEntity = userResult.value;
      // This null check might be redundant if _fetchUser guarantees a non-null UserEntity on success
      // or if NotFoundError is the specific error for "not found".
      if (!userEntity) {
        this.logger.info(`[GetUserUseCase] User not found after fetch (should be caught by NotFoundError): ${JSON.stringify(validatedInput)}`);
        return Result.fail(new NotFoundError('User not found.'));
      }

      this.logger.info(`[GetUserUseCase] User found: ${userEntity.id.value}`);
      return Result.ok(this._mapToOutput(userEntity));

    } catch (error: unknown) {
      this.logger.error('[GetUserUseCase] Unexpected error while getting user', error);
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(new ApplicationError(`An unexpected error occurred: ${message}`));
    }
  }

  private _validateInput(input: GetUserInput): Result<GetUserInput, ValidationError> {
    const validationResult = GetUserInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for GetUserUseCase';
      this.logger.error(`[GetUserUseCase] Validation Error: ${errorMessage}`, validationResult.error.flatten());
      return Result.fail(new ValidationError(errorMessage, validationResult.error.flatten().fieldErrors));
    }
    return Result.ok(validationResult.data);
  }

  private async _fetchUser(validatedInput: GetUserInput): Promise<Result<UserEntity | null, DomainError>> {
    const { userId, email } = validatedInput;

    if (userId) {
      const userIdResult = UserId.create(userId);
      if (userIdResult.isFailure()) return Result.fail(userIdResult.error);
      return this.userRepository.findById(userIdResult.value);
    } else if (email) {
      const userEmailResult = UserEmail.create(email);
      if (userEmailResult.isFailure()) return Result.fail(userEmailResult.error);
      return this.userRepository.findByEmail(userEmailResult.value);
    }
    // This path should ideally not be reached due to Zod validation, but included for robustness
    return Result.fail(new ValidationError('Either userId or email must be provided.'));
  }

  private _mapToOutput(userEntity: UserEntity): GetUserOutput {
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
