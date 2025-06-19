import 'reflect-metadata'; // Must be imported once at the application's entry point
import { Container } from 'inversify';
import { TYPES } from './types';

// --- Domain Layer Interfaces ---
import { IJobRepository } from '@/domain/repositories/i-job.repository';
import { IAIAgentRepository } from '@/domain/repositories/i-ai-agent.repository';
// import { IProjectRepository } from '@/domain/repositories/i-project.repository'; // Example
import { IAIAgentExecutionService } from '@/domain/services/agent/i-ai-agent-execution.service'; // Corrected path from docs
import { ILLMService } from '@/domain/services/i-llm.service'; // Corrected path from docs
import { IToolRegistry } from '@/domain/services/i-tool-registry.service'; // Corrected path from docs
import { ILoggerService } from '@/domain/services/i-logger.service'; // Corrected path from docs

// --- Domain Layer Implementations (Use Cases are implementations) ---
import { EnqueueJobUseCase } from '@/domain/use-cases/job/enqueue-job.use-case';
// import { CreateProjectUseCase } from '@/domain/use-cases/project/create-project.use-case'; // Example

// --- Infrastructure Layer Implementations ---
import { DrizzleJobRepository } from '@/infrastructure/persistence/drizzle/repositories/job.repository';
import { InMemoryAIAgentRepository } from '@/infrastructure/repositories/in-memory-ai-agent.repository';
// Placeholder/Dummy implementations for now, actual ones will be in later phases

class AIAgentExecutionService implements IAIAgentExecutionService {
  getJobProcessorForAgent(agentId: string): (job: any) => Promise<any> {
    throw new Error('AIAgentExecutionService.getJobProcessorForAgent not implemented');
  }
}

class DeepSeekLLMService implements ILLMService {
  streamText(params: any): Promise<any> { throw new Error('DeepSeekLLMService.streamText not implemented'); }
  // Other methods as per interface
}

class ToolRegistry implements IToolRegistry {
  getToolDefinitions(toolNames: string[]): any[] { throw new Error('ToolRegistry.getToolDefinitions not implemented'); }
  executeTool(toolName: string, args: any): Promise<any> { throw new Error('ToolRegistry.executeTool not implemented'); }
  // Other methods as per interface
}

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
// container.bind<IProjectRepository>(TYPES.IProjectRepository).to(DummyProjectRepository); // Example

// --- Bindings for Domain/Application Services ---
container.bind<IAIAgentExecutionService>(TYPES.IAIAgentExecutionService).to(AIAgentExecutionService);

// --- Bindings for Infrastructure Services ---
container.bind<ILLMService>(TYPES.ILLMService).to(DeepSeekLLMService);
container.bind<IToolRegistry>(TYPES.IToolRegistry).to(ToolRegistry);
container.bind<ILoggerService>(TYPES.ILoggerService).to(ConsoleLoggerService);

// --- Bindings for Use Cases ---
// Use Cases are often better as transient if they have state or are short-lived operations.
// However, if they are stateless and their dependencies are singletons, they can also be singletons.
container.bind<EnqueueJobUseCase>(TYPES.EnqueueJobUseCase).to(EnqueueJobUseCase).inTransientScope();
// container.bind<CreateProjectUseCase>(TYPES.CreateProjectUseCase).to(CreateProjectUseCase).inTransientScope(); // Example

export { container };
