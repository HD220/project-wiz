// src_refactored/infrastructure/ioc/types.ts
const TYPES = {
  // === Repositories ===
  // Domain Layer Ports (Interfaces)
  IAgentInternalStateRepository: Symbol.for('IAgentInternalStateRepository'),
  IAgentPersonaTemplateRepository: Symbol.for('IAgentPersonaTemplateRepository'),
  IAgentRepository: Symbol.for('IAgentRepository'),
  IAnnotationRepository: Symbol.for('IAnnotationRepository'),
  IJobRepository: Symbol.for('IJobRepository'),
  ILLMProviderConfigRepository: Symbol.for('ILLMProviderConfigRepository'),
  IMemoryRepository: Symbol.for('IMemoryRepository'),
  IProjectRepository: Symbol.for('IProjectRepository'),
  IQueueMetadataRepository: Symbol.for('IQueueMetadataRepository'), // For queue specific metadata
  ISourceCodeRepository: Symbol.for('ISourceCodeRepository'),
  IUserRepository: Symbol.for('IUserRepository'),
  // Note: IWorkerRepository might be needed if Worker becomes a full-fledged entity managed by a repo

  // === Services ===
  // Domain or Application Layer Services (Interfaces)
  IAgentExecutor: Symbol.for('IAgentExecutor'), // Core service for agent execution logic
  IWorkerService: Symbol.for('IWorkerService'),   // Manages worker lifecycle and job processing delegation

  // Infrastructure Layer Services (Interfaces)
  ILoggerService: Symbol.for('ILoggerService'),
  IToolRegistryService: Symbol.for('IToolRegistryService'), // Changed from IToolRegistry for clarity
  IQueueService: Symbol.for('IQueueService'), // High-level queue operations (might wrap IJobQueue)
  IEmbeddingService: Symbol.for('IEmbeddingService'), // For generating embeddings

  // Adapters (Interfaces for external systems or complex drivers)
  IJobQueueAdapter: Symbol.for('IJobQueueAdapter'), // Interface for the actual job queue implementation (BullMQ, RabbitMQ etc.)
  ILLMAdapter: Symbol.for('ILLMAdapter'),           // Interface for specific LLM provider communication
  IFileSystemAdapter: Symbol.for('IFileSystemAdapter'),
  IVersionControlAdapter: Symbol.for('IVersionControlAdapter'),


  // === Use Cases ===
  // Application Layer Use Cases (Specific command/query handlers)
  // Agent
  CreateAgentUseCase: Symbol.for('CreateAgentUseCase'),
  // AgentInternalState
  LoadAgentInternalStateUseCase: Symbol.for('LoadAgentInternalStateUseCase'),
  SaveAgentInternalStateUseCase: Symbol.for('SaveAgentInternalStateUseCase'),
  // AgentPersonaTemplate
  CreatePersonaTemplateUseCase: Symbol.for('CreatePersonaTemplateUseCase'),
  // Annotation
  ListAnnotationsUseCase: Symbol.for('ListAnnotationsUseCase'),
  RemoveAnnotationUseCase: Symbol.for('RemoveAnnotationUseCase'),
  SaveAnnotationUseCase: Symbol.for('SaveAnnotationUseCase'),
  // Job
  CancelJobUseCase: Symbol.for('CancelJobUseCase'),
  CreateJobUseCase: Symbol.for('CreateJobUseCase'),
  ListJobsUseCase: Symbol.for('ListJobsUseCase'),
  GetJobDetailsUseCase: Symbol.for('GetJobDetailsUseCase'), // Assuming this exists or will
  RetryJobUseCase: Symbol.for('RetryJobUseCase'),
  UpdateJobUseCase: Symbol.for('UpdateJobUseCase'),
  // LLMProviderConfig
  CreateLLMProviderConfigUseCase: Symbol.for('CreateLLMProviderConfigUseCase'),
  // Memory
  RemoveMemoryItemUseCase: Symbol.for('RemoveMemoryItemUseCase'),
  SaveMemoryItemUseCase: Symbol.for('SaveMemoryItemUseCase'),
  SearchMemoryItemsUseCase: Symbol.for('SearchMemoryItemsUseCase'),
  SearchSimilarMemoryItemsUseCase: Symbol.for('SearchSimilarMemoryItemsUseCase'),
  // Project
  CreateProjectUseCase: Symbol.for('CreateProjectUseCase'),
  GetProjectDetailsAppUseCase: Symbol.for('GetProjectDetailsAppUseCase'), // Renamed to avoid conflict with domain one
  ListProjectsAppUseCase: Symbol.for('ListProjectsAppUseCase'),       // Renamed
  // User
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  GetUserUseCase: Symbol.for('GetUserUseCase'),
  // Queue Management Use Cases (if any, e.g., PauseQueueUseCase, ResumeQueueUseCase)

  // === Tools ===
  // Specific IAgentTool implementations
  FileSystemTool: Symbol.for('FileSystemTool'),
  ExecuteCommandTool: Symbol.for('ExecuteCommandTool'),
  // Add other specific tools here

  // === Factories & Other Infrastructure ===
  // Example: If a factory is complex enough to be injected
  // IQueueClientFactory: Symbol.for('IQueueClientFactory'), // If queue client creation is complex

  // Example: Database Connection/Client (if directly injected, though often wrapped by repositories)
  DrizzleClient: Symbol.for('DrizzleClient'), // For the Drizzle ORM client instance
  // Add other specific infrastructure components if needed

  // Specific LLM Providers (if multiple are to be switchable via DI for the ILLMAdapter)
  // OpenAIService: Symbol.for('OpenAIService'),
  // AnthropicService: Symbol.for('AnthropicService'),

  // Worker Pool (if managed via DI)
  IWorkerPool: Symbol.for('IWorkerPool'),

  // Chat Service
  IChatService: Symbol.for('IChatService'),

  // Queue Scheduler Service
  QueueSchedulerService: Symbol.for('QueueSchedulerService'),

  // Specific Queue Services & Workers
  AgentJobQueueService: Symbol.for('AgentJobQueueService'),
  AgentJobWorkerService: Symbol.for('AgentJobWorkerService'),
  TaskTool: Symbol.for('TaskTool'), // For binding the (old) TaskTool
};

export { TYPES };
