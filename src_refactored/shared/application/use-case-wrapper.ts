import { ZodError } from 'zod';

import { ILogger } from '../../core/common/services/i-logger.service';
import { CoreError } from '../errors/core.error';

import { IUseCaseResponse, errorUseCaseResponse } from './use-case-response.dto';
import { IUseCase } from './use-case.interface';

export class UseCaseWrapper<TInput, TOutput> implements IUseCase<TInput, TOutput> {
  constructor(
    private readonly decoratedUseCase: IUseCase<TInput, TOutput>,
    private readonly logger: ILogger,
  ) {}

  async execute(input: TInput): Promise<IUseCaseResponse<TOutput>> {
    try {
      return await this.decoratedUseCase.execute(input);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `Error in UseCase ${this.decoratedUseCase.constructor.name} with input: ${JSON.stringify(input)}`,
        error,
        { errorName: error.name, errorMessage: error.message, errorStack: error.stack, cause: error.cause }
      );

      if (error instanceof ZodError) {
        return errorUseCaseResponse({
          name: 'ValidationError',
          message: 'Input validation failed.',
          code: 'VALIDATION_ERROR',
          details: error.flatten().fieldErrors,
          cause: error,
        });
      } else if (error instanceof CoreError) {
        return errorUseCaseResponse({
          name: error.name,
          message: error.message,
          code: error.code || `CORE_${error.name.toUpperCase()}`,
          details: error.details,
          cause: error,
        });
      } else if (error instanceof Error) {
        return errorUseCaseResponse({
          name: error.name || 'SystemError',
          message: 'An unexpected system error occurred.',
          code: 'UNEXPECTED_SYSTEM_ERROR',
          cause: error,
        });
      } 
        return errorUseCaseResponse({
          name: 'UnknownError',
          message: 'An unknown error occurred.',
          code: 'UNKNOWN_ERROR',
          details: error,
        });
      
    }
  }
}
