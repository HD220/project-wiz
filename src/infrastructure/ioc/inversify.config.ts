import 'reflect-metadata'; // Must be imported once at the application's entry point
import { Container } from 'inversify';
import { TYPES } from './types';

// --- Domain Layer Interfaces ---
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
import { IProjectRepository } from '@/domain/repositories/i-project.repository'; // Example
import { IAIAgentExecutionService } from '@/domain/services/agent/i-ai-agent-execution.service'; // Corrected path from docs
import { ILLMService } from '@/domain/services/i-llm.service'; // Corrected path from docs
import { IToolRegistry } from '@/domain/services/i-tool-registry.service'; // Corrected path from docs
import { ILoggerService } from '@/domain/services/i-logger.service'; // Corrected path from docs
import { IAgentLifecycleService } from '@/domain/services/i-agent-lifecycle.service';

// --- Domain Layer Implementations (Use Cases are implementations) ---
import { EnqueueJobUseCase } from '@/domain/use-cases/job/enqueue-job.use-case';
import { CreateProjectUseCase } from '@/domain/use-cases/project/create-project.use-case'; // Example

// --- Infrastructure Layer Implementations ---
import { DrizzleJobRepository } from '@/infrastructure/persistence/drizzle/repositories/job.repository';
import { InMemoryAIAgentRepository } from '@/infrastructure/persistence/in-memory/repositories/ai-agent.repository';
import { InMemoryProjectRepository } from '@/infrastructure/persistence/in-memory/repositories/project.repository';
import { AIAgentExecutionService } from '@/domain/services/agent/ai-agent-execution.service';
import { DeepSeekLLMService } from '@/infrastructure/services/llm/deepseek.service';
import { ToolRegistry } from '@/infrastructure/services/tool-registry/tool-registry';
import { AgentLifecycleService } from '@/infrastructure/services/agent-lifecycle/agent-lifecycle.service';
import { FileSystemTool } from '@/infrastructure/tools/filesystem.tool';
import { ExecuteCommandTool } from '@/infrastructure/tools/execute-command.tool';
// Placeholder/Dummy implementations for now, actual ones will be in later phases

class ConsoleLoggerService implements ILoggerService {
  log(message: string, ...meta: any[]): void { console.log(message, meta); }
  error(message: string, ...meta: any[]): void { console.error(message, meta); }
  warn(message: string, ...meta: any[]): void { console.warn(message, meta); }
  info(message: string, ...meta: any[]): void { console.info(message, meta); }
  debug(message: string, ...meta: any[]): void { console.debug(message, meta); }
}

// Create the container
const container = new Container({ defaultScope: 'Singleton' });

// --- Bindings for Repositories ---
container.bind<IJobRepository>(TYPES.IJobRepository).to(DrizzleJobRepository);
container.bind<IAIAgentRepository>(TYPES.IAIAgentRepository).to(InMemoryAIAgentRepository);
container.bind<IProjectRepository>(TYPES.IProjectRepository).to(InMemoryProjectRepository); // Example

// --- Bindings for Domain/Application Services ---
container.bind<IAIAgentExecutionService>(TYPES.IAIAgentExecutionService).to(AIAgentExecutionService);

// --- Bindings for Infrastructure Services ---
container.bind<ILLMService>(TYPES.ILLMService).to(DeepSeekLLMService);
container.bind<IToolRegistry>(TYPES.IToolRegistry).to(ToolRegistry);
container.bind<ILoggerService>(TYPES.ILoggerService).to(ConsoleLoggerService);
container.bind<IAgentLifecycleService>(TYPES.IAgentLifecycleService).to(AgentLifecycleService);

// --- Bindings for Use Cases ---
// Use Cases are often better as transient if they have state or are short-lived operations.
// However, if they are stateless and their dependencies are singletons, they can also be singletons.
container.bind<EnqueueJobUseCase>(TYPES.EnqueueJobUseCase).to(EnqueueJobUseCase).inTransientScope();
container.bind<CreateProjectUseCase>(TYPES.CreateProjectUseCase).to(CreateProjectUseCase).inTransientScope(); // Example

// Bind concrete tools
container.bind<FileSystemTool>(TYPES.FileSystemTool).to(FileSystemTool).inSingletonScope();
container.bind<ExecuteCommandTool>(TYPES.ExecuteCommandTool).to(ExecuteCommandTool).inSingletonScope();

// --- Post-build setup: Register tools ---
// This assumes the container is fully configured before this part runs.
// In a more complex app, this might be part of an explicit initialization phase.
const toolRegistryInstance = container.get<IToolRegistry>(TYPES.IToolRegistry);
const loggerInstance = container.get<ILoggerService>(TYPES.ILoggerService); // Get logger once for convenience

// Register FileSystemTool
const fileSystemToolInstance = container.get<FileSystemTool>(TYPES.FileSystemTool);
toolRegistryInstance.registerTool(fileSystemToolInstance)
  .then(() => {
    loggerInstance.info('[InversifyConfig] FileSystemTool registered with ToolRegistry.');
  })
  .catch(error => {
    loggerInstance.error('[InversifyConfig] CRITICAL: Failed to register FileSystemTool:', error);
  });

// Register ExecuteCommandTool
const executeCommandToolInstance = container.get<ExecuteCommandTool>(TYPES.ExecuteCommandTool);
toolRegistryInstance.registerTool(executeCommandToolInstance)
  .then(() => {
    loggerInstance.info('[InversifyConfig] ExecuteCommandTool registered with ToolRegistry.');
  })
  .catch(error => {
    loggerInstance.error('[InversifyConfig] CRITICAL: Failed to register ExecuteCommandTool:', error);
  });

export { container };
