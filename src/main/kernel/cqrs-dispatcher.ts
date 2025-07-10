export interface ICommand<T = unknown> {
  type: string;
  payload: T;
}

export interface IQuery<T = unknown> {
  type: string;
  payload: T;
}

export type CommandHandler<TCommand extends ICommand, TResult> = (
  command: TCommand,
) => Promise<TResult>;

export type QueryHandler<TQuery extends IQuery, TResult> = (
  query: TQuery,
) => Promise<TResult>;

export class CqrsDispatcher {
  private commandHandlers = new Map<
    string,
    CommandHandler<ICommand, unknown>
  >();
  private queryHandlers = new Map<string, QueryHandler<IQuery, unknown>>();

  registerCommandHandler<TCommand extends ICommand, TResult>(
    commandType: string,
    handler: CommandHandler<TCommand, TResult>,
  ) {
    if (this.commandHandlers.has(commandType)) {
      throw new Error(`Command handler for ${commandType} already registered.`);
    }
    this.commandHandlers.set(
      commandType,
      handler as CommandHandler<ICommand, unknown>,
    );
  }

  registerQueryHandler<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: QueryHandler<TQuery, TResult>,
  ) {
    if (this.queryHandlers.has(queryType)) {
      throw new Error(`Query handler for ${queryType} already registered.`);
    }
    this.queryHandlers.set(queryType, handler as QueryHandler<IQuery, unknown>);
  }

  async dispatchCommand<TCommand extends ICommand, TResult>(
    command: TCommand,
  ): Promise<TResult> {
    const handler = this.commandHandlers.get(command.type);
    if (!handler) {
      throw new Error(`No handler registered for command type ${command.type}`);
    }
    try {
      const typedHandler = handler as CommandHandler<TCommand, TResult>;
      return await typedHandler(command);
    } catch (error: unknown) {
      // TODO: Implement a centralized logging strategy
      console.error(`Error dispatching command ${command.type}:`, error);
      throw error;
    }
  }

  async dispatchQuery<TQuery extends IQuery, TResult>(
    query: TQuery,
  ): Promise<TResult> {
    const handler = this.queryHandlers.get(query.type);
    if (!handler) {
      throw new Error(`No handler registered for query type ${query.type}`);
    }
    try {
      const typedHandler = handler as QueryHandler<TQuery, TResult>;
      return await typedHandler(query);
    } catch (error: unknown) {
      // TODO: Implement a centralized logging strategy
      console.error(`Error dispatching query ${query.type}:`, error);
      throw error;
    }
  }
}
