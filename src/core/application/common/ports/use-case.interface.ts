export interface IUseCase<TRequest, TOutput> {
  execute(request: TRequest): Promise<TOutput>;
}
