// src_refactored/infrastructure/ioc/inversify.config.ts
import 'reflect-metadata';
import { Container } from 'inversify';

// --- Domain Layer Ports (Interfaces) ---
import { IJobEventEmitter } from '@/core/application/ports/events/i-job-event-emitter.interface'; // Added
import { IAgentExecutor } from '@/core/application/ports/services/i-agent-executor.interface';
import { IChatService } from '@/core/application/ports/services/i-chat.service';
import { IEmbeddingService } from '@/core/application/ports/services/i-embedding.service';
import { IToolRegistryService } from '@/core/application/ports/services/i-tool-registry.service';
import { IWorkerService } from '@/core/application/ports/services/i-worker.service';
import { QueueSchedulerService } from '@/core/application/queue/queue-scheduler.service'; // Added
import { ChatService } from '@/core/application/services/chat.service';
import { GenericAgentExecutor } from '@/core/application/services/generic-agent-executor.service';
import { CreateAgentUseCase } from '@/core/application/use-cases/agent/create-agent.use-case';

// --- Use Cases ---
import { LoadAgentInternalStateUseCase } from '@/core/application/use-cases/agent-internal-state/load-agent-internal-state.use-case';
import { SaveAgentInternalStateUseCase } from '@/core/application/use-cases/agent-internal-state/save-agent-internal-state.use-case';
import { CreatePersonaTemplateUseCase } from '@/core/application/use-cases/agent-persona-template/create-persona-template.use-case';
import { ListAnnotationsUseCase } from '@/core/application/use-cases/annotation/list-annotations.use-case';
import { RemoveAnnotationUseCase } from '@/core/application/use-cases/annotation/remove-annotation.use-case';
import { SaveAnnotationUseCase } from '@/core/application/use-cases/annotation/save-annotation.use-case';
import { CancelJobUseCase } from '@/core/application/use-cases/job/cancel-job.use-case';
import { CreateJobUseCase } from '@/core/application/use-cases/job/create-job.use-case';
import { ListJobsUseCase } from '@/core/application/use-cases/job/list-jobs.use-case';
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
import { ILoggerService } from '@/core/common/services/i-logger.service';
import { IAgentInternalStateRepository } from '@/core/domain/agent/ports/agent-internal-state-repository.interface';
import { IAgentPersonaTemplateRepository } from '@/core/domain/agent/ports/agent-persona-template-repository.interface';
import { IAgentRepository } from '@/core/domain/agent/ports/agent-repository.interface';
import { IAnnotationRepository } from '@/core/domain/annotation/ports/annotation-repository.interface';
import { IJobRepository } from '@/core/domain/job/ports/job-repository.interface';
import { ILLMProviderConfigRepository } from '@/core/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { IMemoryRepository } from '@/core/domain/memory/ports/memory-repository.interface';
import { IProjectRepository } from '@/core/domain/project/ports/project-repository.interface';
import { ISourceCodeRepository } from '@/core/domain/source-code/ports/source-code-repository.interface';
import { IUserRepository } from '@/core/domain/user/ports/user-repository.interface';
// import { IJobQueueAdapter } from '@/core/ports/adapters/job-queue.interface'; // Not used for now
// import { ILLMAdapter } from '@/core/ports/adapters/llm-adapter.interface'; // Not used for now


// --- Infrastructure Layer Implementations ---
import { InMemoryJobEventEmitter } from '../events/in-memory-job-event-emitter'; // Added
import { db, schema } from '../persistence/drizzle/drizzle.client';
import { DrizzleJobRepository } from '../persistence/drizzle/job/drizzle-job.repository';
import { InMemoryAgentInternalStateRepository } from '../persistence/in-memory/repositories/agent-internal-state.repository.ts';
import { InMemoryAgentPersonaTemplateRepository } from '../persistence/in-memory/repositories/agent-persona-template.repository.ts';
import { InMemoryAgentRepository } from '../persistence/in-memory/repositories/agent.repository.ts';
import { InMemoryAnnotationRepository } from '../persistence/in-memory/repositories/annotation.repository.ts';
import { InMemoryLLMProviderConfigRepository } from '../persistence/in-memory/repositories/llm-provider-config.repository.ts';
import { InMemoryMemoryRepository } from '../persistence/in-memory/repositories/memory.repository.ts';
import { InMemoryProjectRepository } from '../persistence/in-memory/repositories/project.repository.ts';
import { InMemorySourceCodeRepository } from '../persistence/in-memory/repositories/source-code.repository.ts';
import { InMemoryUserRepository } from '../persistence/in-memory/repositories/user.repository.ts';
import { ConsoleLoggerService } from '../services/logger/console-logger.service.ts';
import { ToolRegistryService } from '../services/tool-registry/tool-registry.service.ts';
import { FileSystemTool } from '../tools/file-system.tool.ts';

import { TYPES } from './types';


const appContainer = new Container({ defaultScope: 'Singleton' });

// === Bindings ===
appContainer.bind<ILoggerService>(TYPES.ILoggerService).to(ConsoleLoggerService);
appContainer.bind(TYPES.DrizzleClient).toConstantValue({ db, schema });
appContainer.bind<IJobEventEmitter>(TYPES.IJobEventEmitter).to(InMemoryJobEventEmitter); // Added

// Repositories
appContainer.bind<IAgentInternalStateRepository>(TYPES.IAgentInternalStateRepository).to(InMemoryAgentInternalStateRepository);
appContainer.bind<IAgentPersonaTemplateRepository>(TYPES.IAgentPersonaTemplateRepository).to(InMemoryAgentPersonaTemplateRepository);
appContainer.bind<IAgentRepository>(TYPES.IAgentRepository).to(InMemoryAgentRepository);
appContainer.bind<IAnnotationRepository>(TYPES.IAnnotationRepository).to(InMemoryAnnotationRepository);
appContainer.bind<IJobRepository>(TYPES.IJobRepository).to(DrizzleJobRepository);
appContainer.bind<ILLMProviderConfigRepository>(TYPES.ILLMProviderConfigRepository).to(InMemoryLLMProviderConfigRepository);
appContainer.bind<IMemoryRepository>(TYPES.IMemoryRepository).to(InMemoryMemoryRepository);
appContainer.bind<IProjectRepository>(TYPES.IProjectRepository).to(InMemoryProjectRepository);
appContainer.bind<ISourceCodeRepository>(TYPES.ISourceCodeRepository).to(InMemorySourceCodeRepository);
appContainer.bind<IUserRepository>(TYPES.IUserRepository).to(InMemoryUserRepository);

// Infrastructure Services & Adapters
appContainer.bind<IToolRegistryService>(TYPES.IToolRegistryService).to(ToolRegistryService);

// Application Services
appContainer.bind<IAgentExecutor>(TYPES.IAgentExecutor).to(GenericAgentExecutor);
appContainer.bind<IChatService>(TYPES.IChatService).to(ChatService);
appContainer.bind<QueueSchedulerService>(TYPES.QueueSchedulerService).to(QueueSchedulerService); // Added binding

// Use Cases
appContainer.bind<CreateAgentUseCase>(TYPES.CreateAgentUseCase).to(CreateAgentUseCase).inTransientScope();
appContainer.bind<LoadAgentInternalStateUseCase>(TYPES.LoadAgentInternalStateUseCase).to(LoadAgentInternalStateUseCase).inTransientScope();
// ... other use case bindings ...
appContainer.bind<SaveAgentInternalStateUseCase>(TYPES.SaveAgentInternalStateUseCase).to(SaveAgentInternalStateUseCase).inTransientScope();
appContainer.bind<CreatePersonaTemplateUseCase>(TYPES.CreatePersonaTemplateUseCase).to(CreatePersonaTemplateUseCase).inTransientScope();
appContainer.bind<ListAnnotationsUseCase>(TYPES.ListAnnotationsUseCase).to(ListAnnotationsUseCase).inTransientScope();
appContainer.bind<RemoveAnnotationUseCase>(TYPES.RemoveAnnotationUseCase).to(RemoveAnnotationUseCase).inTransientScope();
appContainer.bind<SaveAnnotationUseCase>(TYPES.SaveAnnotationUseCase).to(SaveAnnotationUseCase).inTransientScope();
appContainer.bind<CancelJobUseCase>(TYPES.CancelJobUseCase).to(CancelJobUseCase).inTransientScope();
appContainer.bind<CreateJobUseCase>(TYPES.CreateJobUseCase).to(CreateJobUseCase).inTransientScope();
appContainer.bind<ListJobsUseCase>(TYPES.ListJobsUseCase).to(ListJobsUseCase).inTransientScope();
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

// --- Post-build setup: Register tools & Start Services ---
const toolRegistryInstance = appContainer.get<IToolRegistryService>(TYPES.IToolRegistryService);
const loggerForTools = appContainer.get<ILoggerService>(TYPES.ILoggerService);

try {
  const fileSystemToolInstance = appContainer.get<FileSystemTool>(TYPES.FileSystemTool);
  toolRegistryInstance.registerTool(fileSystemToolInstance);
  loggerForTools.info('[InversifyConfig] FileSystemTool registered with ToolRegistryService.');
} catch (error) {
  const err = error instanceof Error ? error : new Error(String(error));
  loggerForTools.error('[InversifyConfig] CRITICAL: Failed to register FileSystemTool:', err);
}

// Instantiate QueueSchedulerService to start its cycle
try {
    appContainer.get<QueueSchedulerService>(TYPES.QueueSchedulerService);
    loggerForTools.info('[InversifyConfig] QueueSchedulerService started.');
} catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    loggerForTools.error('[InversifyConfig] CRITICAL: Failed to start QueueSchedulerService:', err);
}


export { appContainer };
