import { injectable, inject } from 'inversify';

import { ApplicationError, ApplicationValidationError } from '@/core/application/common/errors';
import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { DomainError, NotFoundError } from '@/core/domain/common/errors';
import { IUserRepository, IUserRepositoryToken } from '@/core/domain/user/ports/user-repository.interface';
import { User } from '@/core/domain/user/user.entity';
import { UserEmail } from '@/core/domain/user/value-objects/user-email.vo';
import { UserId } from '@/core/domain/user/value-objects/user-id.vo';

import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error as resultError, isError, isSuccess } from '@/shared/result';

import { GetUserInput, GetUserOutput, GetUserInputSchema } from './get-user.schema';

@injectable()
export class GetUserUseCase implements IUseCase<GetUserInput, GetUserOutput | null, DomainError> {
  constructor(
    @inject(IUserRepositoryToken) private readonly userRepository: IUserRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
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
        return resultError(new NotFoundError('User not found.'));
      }

      this.logger.info(`[GetUserUseCase] User found: ${userEntity.id().value()}`);
      return ok(this._mapToOutput(userEntity));

    } catch (err: unknown) {
      const errorInstance = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        '[GetUserUseCase] Unexpected error while getting user',
        errorInstance,
        { input }
      );
      if (errorInstance instanceof DomainError) {
        return resultError(errorInstance);
      }
      // For other errors, wrap in ApplicationError
      return resultError(new ApplicationError(`An unexpected error occurred: ${errorInstance.message}`, errorInstance));
    }
  }

  private _validateInput(input: GetUserInput): Result<GetUserInput, ValidationError> {
    const validationResult = GetUserInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for GetUserUseCase';
      this.logger.error(`[GetUserUseCase] Validation Error: ${errorMessage}`, validationResult.error.flatten());
      return resultError(new ApplicationValidationError(errorMessage, validationResult.error.flatten().fieldErrors));
    }
    return ok(validationResult.data);
  }

  private async _fetchUser(validatedInput: GetUserInput): Promise<Result<User | null, DomainError>> {
    const { userId, email } = validatedInput;
    // Assuming UserEmail.create might throw ValueError, caught by the main try/catch
    // And repository methods return Result
    try {
      if (userId) {
        const userIdVo = UserId.fromString(userId); // Assuming this is safe or throws ValueError
        return this.userRepository.findById(userIdVo);
      } else if (email) {
        const emailVo = UserEmail.create(email); // Can throw ValueError
        return this.userRepository.findByEmail(emailVo);
      }
      // This path should ideally not be reached due to Zod validation
      return resultError(new ApplicationValidationError('Either userId or email must be provided.'));
    } catch (e) {
        // Catch ValueError from UserEmail.create or UserId.fromString (if it throws)
        const err = e instanceof DomainError ? e : new DomainError(e instanceof Error ? e.message : String(e), e instanceof Error ? e : undefined);
        this.logger.warn(`[GetUserUseCase] Error creating VO in _fetchUser: ${err.message}`, { errorName: err.name, errorMessage: err.message, originalError: e });
        return resultError(err);
    }
  }

  private _mapToOutput(userEntity: User): GetUserOutput {
    return {
      id: userEntity.id().value(),
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
