import { injectable, inject } from 'inversify';
import { Result } from '../../../../shared/result';
import { IUseCase } from '../../common/ports/use-case.interface';
import { GetUserInput, GetUserOutput, GetUserInputSchema } from './get-user.schema';
import { UserEntity } from '../../../domain/user/user.entity';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';
import { UserEmail } from '../../../domain/user/value-objects/user-email.vo';
import { IUserRepository, UserRepositoryToken } from '../../../domain/user/ports/user-repository.interface';
import { LoggerServiceToken, ILoggerService } from '../../../common/services/i-logger.service';
import { DomainError, ValidationError, ApplicationError, NotFoundError } from '../../../common/errors';

@injectable()
export class GetUserUseCase implements IUseCase<GetUserInput, Promise<Result<GetUserOutput | null, DomainError>>> {
  constructor(
    @inject(UserRepositoryToken) private readonly userRepository: IUserRepository,
    @inject(LoggerServiceToken) private readonly logger: ILoggerService,
  ) {}

  async execute(input: GetUserInput): Promise<Result<GetUserOutput | null, DomainError>> {
    this.logger.info(`[GetUserUseCase] Attempting to get user with input: ${JSON.stringify(input)}`);

    const validationResult = GetUserInputSchema.safeParse(input);
    if (!validationResult.success) {
      const errorMessage = 'Invalid input for GetUserUseCase';
      this.logger.error(`[GetUserUseCase] Validation Error: ${errorMessage}`, validationResult.error.flatten());
      return Result.fail(new ValidationError(errorMessage, validationResult.error.flatten().fieldErrors));
    }

    const { userId, email } = validationResult.data;

    try {
      let userResult: Result<UserEntity | null, DomainError>;

      if (userId) {
        const userIdResult = UserId.create(userId);
        if (userIdResult.isFailure()) {
          return Result.fail(userIdResult.error);
        }
        userResult = await this.userRepository.findById(userIdResult.value);
      } else if (email) {
        const userEmailResult = UserEmail.create(email);
        if (userEmailResult.isFailure()) {
          return Result.fail(userEmailResult.error);
        }
        userResult = await this.userRepository.findByEmail(userEmailResult.value);
      } else {
        // This case should be caught by Zod schema's refine, but as a safeguard:
        return Result.fail(new ValidationError('Either userId or email must be provided.'));
      }

      if (userResult.isFailure()) {
        this.logger.warn('[GetUserUseCase] Repository error while fetching user', userResult.error);
        return Result.fail(userResult.error);
      }

      const userEntity = userResult.value;

      if (!userEntity) {
        this.logger.info(`[GetUserUseCase] User not found with input: ${JSON.stringify(input)}`);
        return Result.fail(new NotFoundError('User not found.'));
      }

      this.logger.info(`[GetUserUseCase] User found: ${userEntity.id.value}`);

      const output: GetUserOutput = {
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
      this.logger.error('[GetUserUseCase] Unexpected error while getting user', error);
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(new ApplicationError(`An unexpected error occurred: ${error.message}`));
    }
  }
}
