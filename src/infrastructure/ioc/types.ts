const TYPES = {
  // Repositórios
  IJobRepository: Symbol.for('IJobRepository'),
  IAIAgentRepository: Symbol.for('IAIAgentRepository'),
  IProjectRepository: Symbol.for('IProjectRepository'), // Assuming it will be needed

  // Serviços de Domínio/Aplicação
  IAIAgentExecutionService: Symbol.for('IAIAgentExecutionService'),
  // IProjectService: Symbol.for('IProjectService'), // Assuming it will be needed

  // Serviços de Infraestrutura
  ILLMService: Symbol.for('ILLMService'),
  IToolRegistry: Symbol.for('IToolRegistry'),
  ILoggerService: Symbol.for('ILoggerService'),
  // IQueueClient is not globally injected, but instantiated with parameters.

  // Casos de Uso
  EnqueueJobUseCase: Symbol.for('EnqueueJobUseCase'),
  CreateProjectUseCase: Symbol.for('CreateProjectUseCase'), // Assuming it will be needed

  // Outras dependências específicas
  // DatabaseConnection: Symbol.for('DatabaseConnection'), // Example if direct DB access needed
};

export { TYPES };
