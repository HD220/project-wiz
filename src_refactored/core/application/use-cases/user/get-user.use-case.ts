import { injectable, inject } from 'inversify';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service'; // Corrected import

import { IUserRepository, UserRepositoryToken } from '@/domain/user/ports/user-repository.interface';
import { UserEntity } from '@/domain/user/user.entity';
import { UserEmail } from '@/domain/user/value-objects/user-email.vo';
import { UserId } from '@/domain/user/value-objects/user-id.vo';

import { ApplicationError, DomainError, NotFoundError, ValidationError } from '@/application/common/errors';
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error as resultError, isError, isSuccess } from '@/shared/result'; // Import helpers

import { GetUserInput, GetUserOutput, GetUserInputSchema } from './get-user.schema';

@injectable()
export class GetUserUseCase implements IUseCase<GetUserInput, Promise<Result<GetUserOutput | null, DomainError>>> {
  constructor(
    @inject(UserRepositoryToken) private readonly userRepository: IUserRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger, // Corrected token and type
  ) {}

  async execute(input: GetUserInput): Promise<Result<GetUserOutput | null, DomainError>> {
    this.logger.info(`[GetUserUseCase] Attempting to get user with input: ${JSON.stringify(input)}`);

    const validationResult = this._validateInput(input);
    if (isError(validationResult)) { // Corrected
      return resultError(validationResult.error); // Corrected
    }
    const validatedInput = validationResult.value;

    try {
      const userResult = await this._fetchUser(validatedInput);
      if (isError(userResult)) { // Corrected
        // Log specific not found cases or propagate other domain errors
        if (userResult.error instanceof NotFoundError) {
          this.logger.info(`[GetUserUseCase] User not found with input: ${JSON.stringify(validatedInput)}`);
        } else {
          this.logger.warn('[GetUserUseCase] Error while fetching user', userResult.error);
        }
        return resultError(userResult.error); // Corrected
      }

      const userEntity = userResult.value;
      if (!userEntity) { // This check remains, as Result<UserEntity | null> allows null in success
        this.logger.info(`[GetUserUseCase] User not found after successful fetch: ${JSON.stringify(validatedInput)}`);
        return resultError(new NotFoundError('User not found.')); // Corrected
      }

      this.logger.info(`[GetUserUseCase] User found: ${userEntity.id.value}`);
      return ok(this._mapToOutput(userEntity)); // Corrected

    } catch (err: unknown) { // Changed 'error' to 'err'
      this.logger.error('[GetUserUseCase] Unexpected error while getting user', err);
      if (err instanceof DomainError) {
        return resultError(err); // Corrected
      }
      const message = err instanceof Error ? err.message : String(err);
      return resultError(new ApplicationError(`An unexpected error occurred: ${message}`)); // Corrected
    }
  }

  private _validateInput(input: GetUserInput): Result<GetUserInput, ValidationError> {
    const validationResult = GetUserInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for GetUserUseCase';
      this.logger.error(`[GetUserUseCase] Validation Error: ${errorMessage}`, validationResult.error.flatten());
      return resultError(new ValidationError(errorMessage, validationResult.error.flatten().fieldErrors)); // Corrected
    }
    return ok(validationResult.data); // Corrected
  }

  private async _fetchUser(validatedInput: GetUserInput): Promise<Result<UserEntity | null, DomainError>> {
    const { userId, email } = validatedInput;
    // Assuming UserId.create and UserEmail.create throw on error, caught by the main try/catch
    // And repository methods return Result
    try {
      if (userId) {
        const userIdVo = UserId.create(userId);
        return this.userRepository.findById(userIdVo);
      } else if (email) {
        const emailVo = UserEmail.create(email);
        return this.userRepository.findByEmail(emailVo);
      }
      // This path should ideally not be reached due to Zod validation, but included for robustness
      return resultError(new ValidationError('Either userId or email must be provided.')); // Corrected
    } catch (e) {
        const err = e instanceof DomainError ? e : new DomainError(e instanceof Error ? e.message : String(e));
        this.logger.warn(`[GetUserUseCase] Error creating VO in _fetchUser: ${err.message}`, err);
        return resultError(err);
    }
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
