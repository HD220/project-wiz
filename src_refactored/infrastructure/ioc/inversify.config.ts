// src_refactored/infrastructure/ioc/inversify.config.ts
import 'reflect-metadata';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'; // Added import
import { Container } from 'inversify';

// --- Core Application Ports ---
import { IJobEventEmitter, JOB_EVENT_EMITTER_TOKEN } from '@/core/application/ports/events/i-job-event-emitter.interface';
import { IAgentExecutor, AGENT_EXECUTOR_TOKEN } from '@/core/application/ports/services/i-agent-executor.interface';
import { IChatService, CHAT_SERVICE_TOKEN } from '@/core/application/ports/services/i-chat.service';
import { IEmbeddingService, EMBEDDING_SERVICE_TOKEN } from '@/core/application/ports/services/i-embedding.service';
import { IToolRegistryService, TOOL_REGISTRY_SERVICE_TOKEN } from '@/core/application/ports/services/i-tool-registry.service';
// IWorkerService might be bound later if specific worker instances are managed by DI beyond direct instantiation.

// --- Core Application Services ---
import { JobQueueService } from '@/core/application/queue/job-queue.service';
import { JobWorkerService } from '@/core/application/queue/job-worker.service'; // For type annotation if bound directly
import { QueueSchedulerService } from '@/core/application/queue/queue-scheduler.service';
import { CreateJobUseCase } from '@/core/application/queue/use-cases/create-job.use-case';
import { GetJobUseCase } from '@/core/application/queue/use-cases/get-job.use-case';
import { ChatService } from '@/core/application/services/chat.service';
import { GenericAgentExecutor } from '@/core/application/services/generic-agent-executor.service';

// --- Core Domain Ports (Repositories) ---
import { ILoggerService, LOGGER_SERVICE_TOKEN } from '@/core/common/services/i-logger.service';
import { IAgentInternalStateRepository, AGENT_INTERNAL_STATE_REPOSITORY_TOKEN } from '@/core/domain/agent/ports/agent-internal-state-repository.interface';
import { IAgentPersonaTemplateRepository, AGENT_PERSONA_TEMPLATE_REPOSITORY_TOKEN } from '@/core/domain/agent/ports/agent-persona-template-repository.interface';
import { IAgentRepository, AGENT_REPOSITORY_TOKEN } from '@/core/domain/agent/ports/agent-repository.interface';
import { IAnnotationRepository, ANNOTATION_REPOSITORY_TOKEN } from '@/core/domain/annotation/ports/annotation-repository.interface';
import { AgentExecutionPayload, AgentExecutorResult } from '@/core/domain/job/job-processing.types';
import { IJobRepository, JOB_REPOSITORY_TOKEN } from '@/core/domain/job/ports/job-repository.interface';
import { ILLMProviderConfigRepository, LLM_PROVIDER_CONFIG_REPOSITORY_TOKEN } from '@/core/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { IMemoryRepository, MEMORY_REPOSITORY_TOKEN } from '@/core/domain/memory/ports/memory-repository.interface';
import { IProjectRepository, PROJECT_REPOSITORY_TOKEN } from '@/core/domain/project/ports/project-repository.interface';
import { ISourceCodeRepository, SOURCE_CODE_REPOSITORY_TOKEN } from '@/core/domain/source-code/ports/source-code-repository.interface';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '@/core/domain/user/ports/user-repository.interface';

// --- Core Domain Entities/Types (for payload typing) ---

// --- Core Common Services ---

// --- Core Ports (Adapters) ---
import { ILLMAdapter, LLM_ADAPTER_TOKEN } from '@/core/ports/adapters/llm-adapter.interface';

// --- Use Cases (Example, bind as needed) ---


// --- Infrastructure Layer Implementations ---
import { MockLLMAdapter } from '../adapters/llm/mock-llm.adapter'; // Added MockLLMAdapter
import { InMemoryJobEventEmitter } from '../events/in-memory-job-event-emitter';
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
// import { TaskTool } from '../../../src/infrastructure/tools/task.tool'; // Path to old TaskTool if binding it

import { TYPES } from './types'; // Contains all symbols

export const AGENT_EXECUTION_QUEUE_NAME = 'agent-execution-queue';

const appContainer = new Container({ defaultScope: 'Singleton' });

// === Bindings ===
appContainer.bind<ILoggerService>(LOGGER_SERVICE_TOKEN).to(ConsoleLoggerService);
// Bind the db instance directly for DrizzleClient token
appContainer.bind<BetterSQLite3Database<typeof schema>>(TYPES.DrizzleClient).toConstantValue(db);
appContainer.bind<IJobEventEmitter>(JOB_EVENT_EMITTER_TOKEN).to(InMemoryJobEventEmitter);

// Repositories
appContainer.bind<IAgentInternalStateRepository>(AGENT_INTERNAL_STATE_REPOSITORY_TOKEN).to(InMemoryAgentInternalStateRepository);
appContainer.bind<IAgentPersonaTemplateRepository>(AGENT_PERSONA_TEMPLATE_REPOSITORY_TOKEN).to(InMemoryAgentPersonaTemplateRepository);
appContainer.bind<IAgentRepository>(AGENT_REPOSITORY_TOKEN).to(InMemoryAgentRepository);
appContainer.bind<IAnnotationRepository>(ANNOTATION_REPOSITORY_TOKEN).to(InMemoryAnnotationRepository);
appContainer.bind<IJobRepository>(JOB_REPOSITORY_TOKEN).to(DrizzleJobRepository);
appContainer.bind<ILLMProviderConfigRepository>(LLM_PROVIDER_CONFIG_REPOSITORY_TOKEN).to(InMemoryLLMProviderConfigRepository);
appContainer.bind<IMemoryRepository>(MEMORY_REPOSITORY_TOKEN).to(InMemoryMemoryRepository);
appContainer.bind<IProjectRepository>(PROJECT_REPOSITORY_TOKEN).to(InMemoryProjectRepository);
appContainer.bind<ISourceCodeRepository>(SOURCE_CODE_REPOSITORY_TOKEN).to(InMemorySourceCodeRepository);
appContainer.bind<IUserRepository>(USER_REPOSITORY_TOKEN).to(InMemoryUserRepository);

// Infrastructure Services & Adapters
appContainer.bind<IToolRegistryService>(TOOL_REGISTRY_SERVICE_TOKEN).to(ToolRegistryService);
appContainer.bind<ILLMAdapter>(LLM_ADAPTER_TOKEN).to(MockLLMAdapter); // Bind Mock LLM Adapter

// Application Services
appContainer.bind<IAgentExecutor>(AGENT_EXECUTOR_TOKEN).to(GenericAgentExecutor);
appContainer.bind<IChatService>(CHAT_SERVICE_TOKEN).to(ChatService);
appContainer.bind<QueueSchedulerService>(TYPES.QueueSchedulerService).to(QueueSchedulerService);

// JobQueueService for Agent Execution (example of a named queue service)
appContainer.bind<JobQueueService<AgentExecutionPayload, AgentExecutorResult>>(TYPES.AgentJobQueueService)
  .toDynamicValue(context => new JobQueueService<AgentExecutionPayload, AgentExecutorResult>(
    AGENT_EXECUTION_QUEUE_NAME,
    context.container.get<IJobRepository>(JOB_REPOSITORY_TOKEN),
    context.container.get<IJobEventEmitter>(JOB_EVENT_EMITTER_TOKEN)
  )).inSingletonScope();

// Use Cases (typically transient)
// Bind them using their class name as symbol or dedicated symbols from TYPES
appContainer.bind<CreateJobUseCase<unknown, unknown>>(TYPES.CreateJobUseCase).to(CreateJobUseCase).inTransientScope();
appContainer.bind<GetJobUseCase<unknown, unknown>>(TYPES.GetJobDetailsUseCase).to(GetJobUseCase).inTransientScope(); // Assuming GetJobDetailsUseCase is the token for GetJobUseCase
// ... Bind other use cases from TYPES ...
appContainer.bind<CreateAgentUseCase>(TYPES.CreateAgentUseCase).to(CreateAgentUseCase).inTransientScope();
appContainer.bind<LoadAgentInternalStateUseCase>(TYPES.LoadAgentInternalStateUseCase).to(LoadAgentInternalStateUseCase).inTransientScope();
appContainer.bind<SaveAgentInternalStateUseCase>(TYPES.SaveAgentInternalStateUseCase).to(SaveAgentInternalStateUseCase).inTransientScope();
// ... and so on for all use cases listed in TYPES

// Tools
appContainer.bind<FileSystemTool>(TYPES.FileSystemTool).to(FileSystemTool).inSingletonScope();

// --- Eagerly instantiate services that need to start running ---
const logger = appContainer.get<ILoggerService>(LOGGER_SERVICE_TOKEN); // Get logger once

try {
    appContainer.get<QueueSchedulerService>(TYPES.QueueSchedulerService);
    logger.info('[InversifyConfig] QueueSchedulerService started.');
} catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[InversifyConfig] CRITICAL: Failed to start QueueSchedulerService:', err);
}

try {
    const agentExecutor = appContainer.get<GenericAgentExecutor>(AGENT_EXECUTOR_TOKEN);
    const agentJobWorker = new JobWorkerService<AgentExecutionPayload, AgentExecutorResult>(
        AGENT_EXECUTION_QUEUE_NAME,
        agentExecutor.process.bind(agentExecutor),
        { concurrency: 2 }, // Example options
        appContainer.get<IJobRepository>(JOB_REPOSITORY_TOKEN),
        appContainer.get<IJobEventEmitter>(JOB_EVENT_EMITTER_TOKEN),
        logger.getSubLogger({ name: 'AgentWorker' })
    );
    // agentJobWorker.run(); // Already starts due to autorun:true default
    logger.info(`[InversifyConfig] AgentJobWorkerService started for queue: ${AGENT_EXECUTION_QUEUE_NAME}`);
    // If JobWorkerService needs to be injectable itself and managed by container:
    // appContainer.bind<JobWorkerService<AgentExecutionPayload, AgentExecutorResult>>(TYPES.AgentJobWorkerService)
    //   .toConstantValue(agentJobWorker);
    // Then other services could depend on TYPES.AgentJobWorkerService if needed.
} catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('[InversifyConfig] CRITICAL: Failed to start AgentJobWorkerService:', err);
}


// Tool Registration (example)
try {
  const toolRegistryInstance = appContainer.get<IToolRegistryService>(TOOL_REGISTRY_SERVICE_TOKEN);
  const fileSystemToolInstance = appContainer.get<FileSystemTool>(TYPES.FileSystemTool);
  toolRegistryInstance.registerTool(fileSystemToolInstance);
  logger.info('[InversifyConfig] FileSystemTool registered with ToolRegistryService.');
} catch (error) {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error('[InversifyConfig] CRITICAL: Failed to register FileSystemTool:', err);
}

export { appContainer };
