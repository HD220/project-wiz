const TYPES = {
  // === Repositories ===
  IAgentInternalStateRepository: Symbol.for("IAgentInternalStateRepository"),
  IAgentPersonaTemplateRepository: Symbol.for(
    "IAgentPersonaTemplateRepository"
  ),
  IAgentRepository: Symbol.for("IAgentRepository"),
  IAnnotationRepository: Symbol.for("IAnnotationRepository"),
  IJobRepository: Symbol.for("IJobRepository"),
  ILLMProviderConfigRepository: Symbol.for("ILLMProviderConfigRepository"),
  IMemoryRepository: Symbol.for("IMemoryRepository"),
  IProjectRepository: Symbol.for("IProjectRepository"),
  IQueueMetadataRepository: Symbol.for("IQueueMetadataRepository"),
  ISourceCodeRepository: Symbol.for("ISourceCodeRepository"),
  IUserRepository: Symbol.for("IUserRepository"),

  // === Services ===
  // Domain or Application Layer Services (Interfaces)
  IAgentExecutor: Symbol.for("IAgentExecutor"),
  IWorkerService: Symbol.for("IWorkerService"),

  // Infrastructure Layer Services (Interfaces)
  ILogger: Symbol.for("ILogger"),
  // Corrected to match interface and symbol in i-logger.service.ts
  IQueueService: Symbol.for("IQueueService"),
  IEmbeddingService: Symbol.for("IEmbeddingService"),

  // Adapters (Interfaces for external systems or complex drivers)
  IJobQueueAdapter: Symbol.for("IJobQueueAdapter"),
  ILLMAdapter: Symbol.for("ILLMAdapter"),
  IFileSystemAdapter: Symbol.for("IFileSystemAdapter"),
  IVersionControlAdapter: Symbol.for("IVersionControlAdapter"),

  // === Use Cases ===
  // Application Layer Use Cases (Specific command/query handlers)
  CreateAgentUseCase: Symbol.for("CreateAgentUseCase"),
  LoadAgentInternalStateUseCase: Symbol.for("LoadAgentInternalStateUseCase"),
  SaveAgentInternalStateUseCase: Symbol.for("SaveAgentInternalStateUseCase"),
  CreatePersonaTemplateUseCase: Symbol.for("CreatePersonaTemplateUseCase"),
  ListAnnotationsUseCase: Symbol.for("ListAnnotationsUseCase"),
  RemoveAnnotationUseCase: Symbol.for("RemoveAnnotationUseCase"),
  SaveAnnotationUseCase: Symbol.for("SaveAnnotationUseCase"),
  CancelJobUseCase: Symbol.for("CancelJobUseCase"),
  CreateJobUseCase: Symbol.for("CreateJobUseCase"),
  ListJobsUseCase: Symbol.for("ListJobsUseCase"),
  GetJobDetailsUseCase: Symbol.for("GetJobDetailsUseCase"),
  RetryJobUseCase: Symbol.for("RetryJobUseCase"),
  UpdateJobUseCase: Symbol.for("UpdateJobUseCase"),
  CreateLLMProviderConfigUseCase: Symbol.for("CreateLLMProviderConfigUseCase"),
  RemoveMemoryItemUseCase: Symbol.for("RemoveMemoryItemUseCase"),
  SaveMemoryItemUseCase: Symbol.for("SaveMemoryItemUseCase"),
  SearchMemoryItemsUseCase: Symbol.for("SearchMemoryItemsUseCase"),
  SearchSimilarMemoryItemsUseCase: Symbol.for(
    "SearchSimilarMemoryItemsUseCase"
  ),
  CreateProjectUseCase: Symbol.for("CreateProjectUseCase"),
  GetProjectDetailsAppUseCase: Symbol.for("GetProjectDetailsAppUseCase"),
  ListProjectsAppUseCase: Symbol.for("ListProjectsAppUseCase"),
  CreateUserUseCase: Symbol.for("CreateUserUseCase"),
  GetUserUseCase: Symbol.for("GetUserUseCase"),

  // === Tools ===
  FileSystemTool: Symbol.for("FileSystemTool"),
  ExecuteCommandTool: Symbol.for("ExecuteCommandTool"),
  DrizzleClient: Symbol.for("DrizzleClient"),

  // Worker Pool (if managed via DI)
  IWorkerPool: Symbol.for("IWorkerPool"),

  // Chat Service
  IChatService: Symbol.for("IChatService"),

  // Queue Scheduler Service
  QueueSchedulerService: Symbol.for("QueueSchedulerService"),

  // Specific Queue Services & Workers
  AgentJobQueueService: Symbol.for("AgentJobQueueService"),
  AgentJobWorkerService: Symbol.for("AgentJobWorkerService"),
  TaskTool: Symbol.for("TaskTool"),
};

export { TYPES };
