import { IUseCaseResponse } from './use-case-response.dto';

export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<IUseCaseResponse<TOutput>>;
}
