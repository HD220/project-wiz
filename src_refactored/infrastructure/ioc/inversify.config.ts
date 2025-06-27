// src_refactored/infrastructure/ioc/inversify.config.ts
import 'reflect-metadata'; // Must be imported once at the application's entry point
import { Container } from 'inversify';
import { TYPES } from './types';

// --- Domain Layer Ports (Interfaces) ---
import { IAgentInternalStateRepository } from '@/core/domain/agent/ports/agent-internal-state-repository.interface';
import { IAgentPersonaTemplateRepository } from '@/core/domain/agent/ports/agent-persona-template-repository.interface';
import { IAgentRepository } from '@/core/domain/agent/ports/agent-repository.interface';
import { IAnnotationRepository } from '@/core/domain/annotation/ports/annotation-repository.interface';
import { IJobRepository } from '@/core/domain/job/ports/job-repository.interface';
import { ILLMProviderConfigRepository } from '@/core/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { IMemoryRepository } from '@/core/domain/memory/ports/memory-repository.interface';
import { IProjectRepository } from '@/core/domain/project/ports/project-repository.interface';
// import { IQueueMetadataRepository } from '@/core/domain/queue/ports/queue-metadata-repository.interface'; // If needed
import { ISourceCodeRepository } from '@/core/domain/source-code/ports/source-code-repository.interface';
import { IUserRepository } from '@/core/domain/user/ports/user-repository.interface';

// --- Service Interfaces (Domain, Application, Infrastructure) ---
import { ILoggerService } from '@/core/common/services/i-logger.service';
import { IToolRegistryService } from '@/core/application/ports/services/i-tool-registry.service';
import { IEmbeddingService } from '@/core/application/ports/services/i-embedding.service';
import { IAgentExecutor } from '@/core/application/ports/services/i-agent-executor.interface';
import { IWorkerService } from '@/core/application/ports/services/i-worker.service';
// import { IQueueService } from '@/core/application/ports/services/i-queue.service'; // If a high-level queue service exists

// --- Adapter Interfaces ---
import { IJobQueueAdapter } from '@/core/ports/adapters/job-queue.interface';
import { ILLMAdapter } from '@/core/ports/adapters/llm-adapter.interface';
// import { IFileSystemAdapter } from '@/core/ports/adapters/file-system.adapter.interface'; // If defined
// import { IVersionControlAdapter } from '@/core/ports/adapters/version-control.adapter.interface'; // If defined

// --- Use Cases ---
import { CreateAgentUseCase } from '@/core/application/use-cases/agent/create-agent.use-case';
import { LoadAgentInternalStateUseCase } from '@/core/application/use-cases/agent-internal-state/load-agent-internal-state.use-case';
import { SaveAgentInternalStateUseCase } from '@/core/application/use-cases/agent-internal-state/save-agent-internal-state.use-case';
import { CreatePersonaTemplateUseCase } from '@/core/application/use-cases/agent-persona-template/create-persona-template.use-case';
import { ListAnnotationsUseCase } from '@/core/application/use-cases/annotation/list-annotations.use-case';
import { RemoveAnnotationUseCase } from '@/core/application/use-cases/annotation/remove-annotation.use-case';
import { SaveAnnotationUseCase } from '@/core/application/use-cases/annotation/save-annotation.use-case';
import { CancelJobUseCase } from '@/core/application/use-cases/job/cancel-job.use-case';
import { CreateJobUseCase } from '@/core/application/use-cases/job/create-job.use-case';
import { ListJobsUseCase } from '@/core/application/use-cases/job/list-jobs.use-case';
// import { GetJobDetailsUseCase } from '@/core/application/use-cases/job/get-job-details.use-case'; // Example
import { RetryJobUseCase } from '@/core/application/use-cases/job/retry-job.use-case';
import { UpdateJobUseCase } from '@/core/application/use-cases/job/update-job.use-case';
import { CreateLLMProviderConfigUseCase } from '@/core/application/use-cases/llm-provider-config/create-llm-provider-config.use-case';
import { RemoveMemoryItemUseCase } from '@/core/application/use-cases/memory/remove-memory-item.use-case';
import { SaveMemoryItemUseCase } from '@/core/application/use-cases/memory/save-memory-item.use-case';
import { SearchMemoryItemsUseCase } from '@/core/application/use-cases/memory/search-memory-items.use-case';
import { SearchSimilarMemoryItemsUseCase } from '@/core/application/use-cases/memory/search-similar-memory-items.use-case';
import { CreateProjectUseCase } from '@/core/application/use-cases/project/create-project.use-case';
import { GetProjectDetailsUseCase as GetProjectDetailsAppUseCase } from '@/core/application/use-cases/project/get-project-details.use-case';
import { ListProjectsUseCase as ListProjectsAppUseCase } from '@/core/application/use-cases/project/list-projects.use-case';
import { CreateUserUseCase } from '@/core/application/use-cases/user/create-user.use-case';
import { GetUserUseCase } from '@/core/application/use-cases/user/get-user.use-case';


// --- Infrastructure Layer Implementations ---
// Persistence
import { DrizzleJobRepository } from '../persistence/drizzle/repositories/job.repository';
import { InMemoryAgentRepository } from '../persistence/in-memory/repositories/agent.repository'; // Example
import { InMemoryProjectRepository } from '../persistence/in-memory/repositories/project.repository'; // Example
import { InMemoryAgentInternalStateRepository } from '../persistence/in-memory/repositories/agent-internal-state.repository'; // Example
import { InMemoryAgentPersonaTemplateRepository } from '../persistence/in-memory/repositories/agent-persona-template.repository'; // Example
import { InMemoryAnnotationRepository } from '../persistence/in-memory/repositories/annotation.repository'; // Example
import { InMemoryLLMProviderConfigRepository } from '../persistence/in-memory/repositories/llm-provider-config.repository'; // Example
import { InMemoryMemoryRepository } from '../persistence/in-memory/repositories/memory.repository'; // Example
import { InMemorySourceCodeRepository } from '../persistence/in-memory/repositories/source-code.repository'; // Example
import { InMemoryUserRepository } from '../persistence/in-memory/repositories/user.repository'; // Example

// Services
import { ConsoleLoggerService } from '../services/logger/console-logger.service';
import { ToolRegistryService } from '../services/tool-registry/tool-registry.service';
import { GenericAgentExecutor } from '@/core/application/services/generic-agent-executor.service';
// import { WorkerService } from '@/core/application/services/worker.service'; // Assuming this is the one to bind
// import { SdkEmbeddingService } from '../services/ai/sdk-embedding.service'; // Example
// import { SdkLLMAdapter } from '../adapters/llm/sdk-llm.adapter'; // Example
// import { BullMQJobQueueAdapter } from '../queue/bullmq/bullmq-job-queue.adapter'; // Example

// Tools
import { FileSystemTool } from '../tools/file-system.tool';
// import { ExecuteCommandTool } from '../tools/execute-command.tool'; // Example

// Drizzle Client (example, may need actual setup)
import { db, schema } from '../persistence/drizzle/drizzle.client'; // Assuming this file exists and exports db and schema


// Create the container
const appContainer = new Container({ defaultScope: 'Singleton' });

// === Bindings ===

// Logger (essential, bind first)
appContainer.bind<ILoggerService>(TYPES.ILoggerService).to(ConsoleLoggerService);

// Database Client (example, actual setup might differ)
// This is a simplified binding. In a real app, you'd have a proper DB connection manager.
appContainer.bind(TYPES.DrizzleClient).toConstantValue({ db, schema });


// Repositories (using In-Memory for now, switch to Drizzle as they are implemented)
appContainer.bind<IAgentInternalStateRepository>(TYPES.IAgentInternalStateRepository).to(InMemoryAgentInternalStateRepository);
appContainer.bind<IAgentPersonaTemplateRepository>(TYPES.IAgentPersonaTemplateRepository).to(InMemoryAgentPersonaTemplateRepository);
appContainer.bind<IAgentRepository>(TYPES.IAgentRepository).to(InMemoryAgentRepository);
appContainer.bind<IAnnotationRepository>(TYPES.IAnnotationRepository).to(InMemoryAnnotationRepository);
appContainer.bind<IJobRepository>(TYPES.IJobRepository).to(DrizzleJobRepository); // Example using Drizzle
appContainer.bind<ILLMProviderConfigRepository>(TYPES.ILLMProviderConfigRepository).to(InMemoryLLMProviderConfigRepository);
appContainer.bind<IMemoryRepository>(TYPES.IMemoryRepository).to(InMemoryMemoryRepository);
appContainer.bind<IProjectRepository>(TYPES.IProjectRepository).to(InMemoryProjectRepository);
// appContainer.bind<IQueueMetadataRepository>(TYPES.IQueueMetadataRepository).to(InMemoryQueueMetadataRepository);
appContainer.bind<ISourceCodeRepository>(TYPES.ISourceCodeRepository).to(InMemorySourceCodeRepository);
appContainer.bind<IUserRepository>(TYPES.IUserRepository).to(InMemoryUserRepository);

// Infrastructure Services & Adapters
appContainer.bind<IToolRegistryService>(TYPES.IToolRegistryService).to(ToolRegistryService);
// appContainer.bind<IEmbeddingService>(TYPES.IEmbeddingService).to(SdkEmbeddingService);
// appContainer.bind<ILLMAdapter>(TYPES.ILLMAdapter).to(SdkLLMAdapter);
// appContainer.bind<IJobQueueAdapter>(TYPES.IJobQueueAdapter).to(BullMQJobQueueAdapter);

// Application Services
appContainer.bind<IAgentExecutor>(TYPES.IAgentExecutor).to(GenericAgentExecutor);
// appContainer.bind<IWorkerService>(TYPES.IWorkerService).to(WorkerService); // Assuming WorkerService is in core/application

// Use Cases (typically transient, unless stateless and all deps are singletons)
appContainer.bind<CreateAgentUseCase>(TYPES.CreateAgentUseCase).to(CreateAgentUseCase).inTransientScope();
appContainer.bind<LoadAgentInternalStateUseCase>(TYPES.LoadAgentInternalStateUseCase).to(LoadAgentInternalStateUseCase).inTransientScope();
appContainer.bind<SaveAgentInternalStateUseCase>(TYPES.SaveAgentInternalStateUseCase).to(SaveAgentInternalStateUseCase).inTransientScope();
appContainer.bind<CreatePersonaTemplateUseCase>(TYPES.CreatePersonaTemplateUseCase).to(CreatePersonaTemplateUseCase).inTransientScope();
appContainer.bind<ListAnnotationsUseCase>(TYPES.ListAnnotationsUseCase).to(ListAnnotationsUseCase).inTransientScope();
appContainer.bind<RemoveAnnotationUseCase>(TYPES.RemoveAnnotationUseCase).to(RemoveAnnotationUseCase).inTransientScope();
appContainer.bind<SaveAnnotationUseCase>(TYPES.SaveAnnotationUseCase).to(SaveAnnotationUseCase).inTransientScope();
appContainer.bind<CancelJobUseCase>(TYPES.CancelJobUseCase).to(CancelJobUseCase).inTransientScope();
appContainer.bind<CreateJobUseCase>(TYPES.CreateJobUseCase).to(CreateJobUseCase).inTransientScope();
appContainer.bind<ListJobsUseCase>(TYPES.ListJobsUseCase).to(ListJobsUseCase).inTransientScope();
// appContainer.bind<GetJobDetailsUseCase>(TYPES.GetJobDetailsUseCase).to(GetJobDetailsUseCase).inTransientScope();
appContainer.bind<RetryJobUseCase>(TYPES.RetryJobUseCase).to(RetryJobUseCase).inTransientScope();
appContainer.bind<UpdateJobUseCase>(TYPES.UpdateJobUseCase).to(UpdateJobUseCase).inTransientScope();
appContainer.bind<CreateLLMProviderConfigUseCase>(TYPES.CreateLLMProviderConfigUseCase).to(CreateLLMProviderConfigUseCase).inTransientScope();
appContainer.bind<RemoveMemoryItemUseCase>(TYPES.RemoveMemoryItemUseCase).to(RemoveMemoryItemUseCase).inTransientScope();
appContainer.bind<SaveMemoryItemUseCase>(TYPES.SaveMemoryItemUseCase).to(SaveMemoryItemUseCase).inTransientScope();
appContainer.bind<SearchMemoryItemsUseCase>(TYPES.SearchMemoryItemsUseCase).to(SearchMemoryItemsUseCase).inTransientScope();
appContainer.bind<SearchSimilarMemoryItemsUseCase>(TYPES.SearchSimilarMemoryItemsUseCase).to(SearchSimilarMemoryItemsUseCase).inTransientScope();
appContainer.bind<CreateProjectUseCase>(TYPES.CreateProjectUseCase).to(CreateProjectUseCase).inTransientScope();
appContainer.bind<GetProjectDetailsAppUseCase>(TYPES.GetProjectDetailsAppUseCase).to(GetProjectDetailsAppUseCase).inTransientScope();
appContainer.bind<ListProjectsAppUseCase>(TYPES.ListProjectsAppUseCase).to(ListProjectsAppUseCase).inTransientScope();
appContainer.bind<CreateUserUseCase>(TYPES.CreateUserUseCase).to(CreateUserUseCase).inTransientScope();
appContainer.bind<GetUserUseCase>(TYPES.GetUserUseCase).to(GetUserUseCase).inTransientScope();

// Tools
appContainer.bind<FileSystemTool>(TYPES.FileSystemTool).to(FileSystemTool).inSingletonScope();
// appContainer.bind<ExecuteCommandTool>(TYPES.ExecuteCommandTool).to(ExecuteCommandTool).inSingletonScope();

// --- Post-build setup: Register tools ---
// This might be done in a separate bootstrap phase of the application.
const toolRegistryInstance = appContainer.get<IToolRegistryService>(TYPES.IToolRegistryService);
const loggerForTools = appContainer.get<ILoggerService>(TYPES.ILoggerService);

try {
  const fileSystemToolInstance = appContainer.get<FileSystemTool>(TYPES.FileSystemTool);
  toolRegistryInstance.registerTool(fileSystemToolInstance);
  loggerForTools.info('[InversifyConfig] FileSystemTool registered with ToolRegistryService.');
} catch (error) {
  loggerForTools.error('[InversifyConfig] CRITICAL: Failed to register FileSystemTool:', error);
}

// try {
//   const executeCommandToolInstance = appContainer.get<ExecuteCommandTool>(TYPES.ExecuteCommandTool);
//   toolRegistryInstance.registerTool(executeCommandToolInstance);
//   loggerForTools.info('[InversifyConfig] ExecuteCommandTool registered with ToolRegistryService.');
// } catch (error) {
//   loggerForTools.error('[InversifyConfig] CRITICAL: Failed to register ExecuteCommandTool:', error);
// }

export { appContainer };
