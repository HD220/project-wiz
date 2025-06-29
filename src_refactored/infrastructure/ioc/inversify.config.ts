// src_refactored/infrastructure/ioc/inversify.config.ts
import 'reflect-metadata';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'; // Added import
import { Container } from 'inversify';

// --- Core Application Ports ---
// import { IJobEventEmitter, JOB_EVENT_EMITTER_TOKEN } from '@/core/application/ports/events/i-job-event-emitter.interface'; // To be re-added by new queue system if needed
import { IAgentExecutor, AGENT_EXECUTOR_TOKEN } from '@/core/application/ports/services/i-agent-executor.interface';
import { IChatService, CHAT_SERVICE_TOKEN } from '@/core/application/ports/services/i-chat.service';
import { IEmbeddingService, EMBEDDING_SERVICE_TOKEN } from '@/core/application/ports/services/i-embedding.service'; // Keep
import { IToolRegistryService, TOOL_REGISTRY_SERVICE_TOKEN } from '@/core/application/ports/services/i-tool-registry.service';

// --- Core Application Services ---
// Queue/Worker related services (JobQueueService, JobWorkerService, QueueSchedulerService) are removed. Will be re-added by new implementation.
// Use cases CreateJobUseCase, GetJobUseCase are removed.
import { ChatService } from '@/core/application/services/chat.service';
import { GenericAgentExecutor } from '@/core/application/services/generic-agent-executor.service';

// Queue System specific imports
import { IJobRepository, JOB_REPOSITORY_TOKEN } from '@/core/application/ports/job-repository.interface';
import { AbstractQueue, getQueueServiceToken } from '@/core/application/queue/abstract-queue';
import { DrizzleQueueService } from '../queue/drizzle/queue.service';
import { DrizzleJobRepository } from '../persistence/drizzle/job/drizzle-job.repository';


// --- Core Domain Ports (Repositories) ---
import { ILoggerService, LOGGER_SERVICE_TOKEN } from '@/core/common/services/i-logger.service';
import { IAgentInternalStateRepository, AGENT_INTERNAL_STATE_REPOSITORY_TOKEN } from '@/core/domain/agent/ports/agent-internal-state-repository.interface';
import { IAgentPersonaTemplateRepository, AGENT_PERSONA_TEMPLATE_REPOSITORY_TOKEN } from '@/core/domain/agent/ports/agent-persona-template-repository.interface';
import { IAgentRepository, AGENT_REPOSITORY_TOKEN } from '@/core/domain/agent/ports/agent-repository.interface';
import { IAnnotationRepository, ANNOTATION_REPOSITORY_TOKEN } from '@/core/domain/annotation/ports/annotation-repository.interface';
// AgentExecutionPayload, AgentExecutorResult from job-processing.types.ts are removed.
// IJobRepository, JOB_REPOSITORY_TOKEN are removed. Will be re-added by new implementation.
import { ILLMProviderConfigRepository, LLM_PROVIDER_CONFIG_REPOSITORY_TOKEN } from '@/core/domain/llm-provider-config/ports/llm-provider-config-repository.interface';
import { IMemoryRepository, MEMORY_REPOSITORY_TOKEN } from '@/core/domain/memory/ports/memory-repository.interface';
import { IProjectRepository, PROJECT_REPOSITORY_TOKEN } from '@/core/domain/project/ports/project-repository.interface';
import { ISourceCodeRepository, SOURCE_CODE_REPOSITORY_TOKEN } from '@/core/domain/source-code/ports/source-code-repository.interface';
import { IUserRepository, USER_REPOSITORY_TOKEN } from '@/core/domain/user/ports/user-repository.interface';

// --- Core Ports (Adapters) ---
import { ILLMAdapter, LLM_ADAPTER_TOKEN } from '@/core/ports/adapters/llm-adapter.interface';

// --- Infrastructure Layer Implementations ---
import { MockLLMAdapter } from '../adapters/llm/mock-llm.adapter';
// InMemoryJobEventEmitter removed.
import { db, schema } from '../persistence/drizzle/drizzle.client';
// DrizzleJobRepository removed.
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

import { TYPES } from './types'; // Contains all symbols

export const MAIN_QUEUE_NAME = 'main-job-queue'; // Name for the primary job queue
// export const AGENT_EXECUTION_QUEUE_NAME = 'agent-execution-queue'; // Will be re-defined by new queue system if needed

const appContainer = new Container({ defaultScope: 'Singleton' });

// === Bindings ===
appContainer.bind<ILoggerService>(LOGGER_SERVICE_TOKEN).to(ConsoleLoggerService);
appContainer.bind<BetterSQLite3Database<typeof schema>>(TYPES.DrizzleClient).toConstantValue(db);
// appContainer.bind<IJobEventEmitter>(JOB_EVENT_EMITTER_TOKEN).to(InMemoryJobEventEmitter); // Removed

// Repositories
appContainer.bind<IAgentInternalStateRepository>(AGENT_INTERNAL_STATE_REPOSITORY_TOKEN).to(InMemoryAgentInternalStateRepository);
appContainer.bind<IAgentPersonaTemplateRepository>(AGENT_PERSONA_TEMPLATE_REPOSITORY_TOKEN).to(InMemoryAgentPersonaTemplateRepository);
appContainer.bind<IAgentRepository>(AGENT_REPOSITORY_TOKEN).to(InMemoryAgentRepository);
appContainer.bind<IAnnotationRepository>(ANNOTATION_REPOSITORY_TOKEN).to(InMemoryAnnotationRepository);
appContainer.bind<IJobRepository>(JOB_REPOSITORY_TOKEN).to(DrizzleJobRepository); // Re-added for new queue system
appContainer.bind<ILLMProviderConfigRepository>(LLM_PROVIDER_CONFIG_REPOSITORY_TOKEN).to(InMemoryLLMProviderConfigRepository);
appContainer.bind<IMemoryRepository>(MEMORY_REPOSITORY_TOKEN).to(InMemoryMemoryRepository);
appContainer.bind<IProjectRepository>(PROJECT_REPOSITORY_TOKEN).to(InMemoryProjectRepository);
appContainer.bind<ISourceCodeRepository>(SOURCE_CODE_REPOSITORY_TOKEN).to(InMemorySourceCodeRepository);
appContainer.bind<IUserRepository>(USER_REPOSITORY_TOKEN).to(InMemoryUserRepository);

// Infrastructure Services & Adapters
appContainer.bind<IToolRegistryService>(TOOL_REGISTRY_SERVICE_TOKEN).to(ToolRegistryService);
appContainer.bind<ILLMAdapter>(LLM_ADAPTER_TOKEN).to(MockLLMAdapter);

// Application Services
appContainer.bind<IAgentExecutor>(AGENT_EXECUTOR_TOKEN).to(GenericAgentExecutor);
appContainer.bind<IChatService>(CHAT_SERVICE_TOKEN).to(ChatService);
// appContainer.bind<QueueSchedulerService>(TYPES.QueueSchedulerService).to(QueueSchedulerService); // Removed

// --- Queue Services ---
// Main Queue Service (Drizzle-based)
// This uses a factory to correctly instantiate DrizzleQueueService with its specific dependencies
// (queueName, jobRepository, and options)
appContainer.bind<AbstractQueue<unknown, unknown>>(getQueueServiceToken(MAIN_QUEUE_NAME))
  .toDynamicValue((context) => {
    const jobRepository = context.container.get<IJobRepository>(JOB_REPOSITORY_TOKEN);
    const logger = context.container.get<ILoggerService>(LOGGER_SERVICE_TOKEN);

    const queueOptions = {
      // defaultJobOptions: { priority: 10 }, // Example default options
      stalledJobs: {
        checkIntervalMs: 15000, // Check every 15s
        olderThanMs: 30000,     // Stalled if lock older than 30s
        limitPerCheck: 10,      // Max stalled jobs to process per check
      }
    };
    const queueName = MAIN_QUEUE_NAME;
    logger.info(`[InversifyConfig] Creating DrizzleQueueService instance for queue: ${queueName}`);

    const queueService = new DrizzleQueueService<unknown, unknown>(
      queueName,
      jobRepository,
      queueOptions,
    );
    // Start maintenance tasks for the queue to be active.
    queueService.startMaintenance();
    logger.info(`[InversifyConfig] DrizzleQueueService for ${queueName} maintenance started.`);
    return queueService;
  }).inSingletonScope(); // Ensure only one instance of this named queue


// JobQueueService for Agent Execution (example of a named queue service)
// Binding for TYPES.AgentJobQueueService removed. Will be re-added by new queue system.

// Use Cases (typically transient)
// Bindings for CreateJobUseCase and GetJobDetailsUseCase removed.
// appContainer.bind<CreateAgentUseCase>(TYPES.CreateAgentUseCase).to(CreateAgentUseCase).inTransientScope(); // Commented out if CreateAgentUseCase is not imported
// appContainer.bind<LoadAgentInternalStateUseCase>(TYPES.LoadAgentInternalStateUseCase).to(LoadAgentInternalStateUseCase).inTransientScope(); // Commented out
// appContainer.bind<SaveAgentInternalStateUseCase>(TYPES.SaveAgentInternalStateUseCase).to(SaveAgentInternalStateUseCase).inTransientScope(); // Commented out
// ... and so on for all use cases listed in TYPES (ensure no other job-related use cases are bound here)

// Tools
appContainer.bind<FileSystemTool>(TYPES.FileSystemTool).to(FileSystemTool).inSingletonScope();

// --- Eagerly instantiate services that need to start running ---
const logger = appContainer.get<ILoggerService>(LOGGER_SERVICE_TOKEN); // Get logger once

// Eager instantiation of QueueSchedulerService removed.
// Eager instantiation and setup of AgentJobWorker removed.

// Tool Registration (example) - This can stay as it's generic
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
