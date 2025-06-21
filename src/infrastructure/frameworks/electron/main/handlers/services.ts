import { db } from "@/infrastructure/services/drizzle";
import { ElectronIpcHandler } from "@/infrastructure/frameworks/electron/electron-ipc.adapter";

// --- Repository Instantiations ---
import { UserRepositoryDrizzle } from "@/infrastructure/repositories/user-drizzle.repository";
import { LLMProviderRepositoryDrizzle } from "@/infrastructure/repositories/llm-provider-drizzle.repository";
import { LLMProviderConfigRepositoryDrizzle } from "@/infrastructure/repositories/llm-provider-config-drizzle.repository";
import { JobRepositoryDrizzle } from "@/infrastructure/repositories/job-drizzle.repository";
import { AgentStateDrizzleRepository } from "@/infrastructure/repositories/agent-state-drizzle.repository";
import { WorkerDrizzleRepository } from "@/infrastructure/repositories/worker-drizzle.repository";

export const ipcHandlerInstance = new ElectronIpcHandler();
export const userRepository = new UserRepositoryDrizzle(db);
export const llmProviderRepository = new LLMProviderRepositoryDrizzle(db);
export const llmProviderConfigRepository = new LLMProviderConfigRepositoryDrizzle(db);
export const jobRepository = new JobRepositoryDrizzle(db);
export const agentStateRepository = new AgentStateDrizzleRepository(db);
export const workerRepository = new WorkerDrizzleRepository(db);

// --- Query Instantiations ---
import { UserQuery } from "@/core/application/queries/user.query";
import { LLMProviderQuery } from "@/core/application/queries/llm-provider.query";
export const userQuery = new UserQuery(userRepository);
export const llmProviderQuery = new LLMProviderQuery(llmProviderRepository);

// --- UseCase Instantiations ---
import { CreateUserUseCase } from "@/core/application/use-cases/user/create-user.usecase";
import { CreateLLMProviderConfigUseCase } from "@/core/application/use-cases/llm-provider/create-llm-provider-config.usecase";
// Explicitly import ProcessJobUseCase for type signature if needed by JobHandlers, even if mocked
import { ProcessJobUseCase } from "@/core/application/use-cases/process-job.usecase";


export const createUserUseCase = new CreateUserUseCase(userRepository, llmProviderConfigRepository);
export const createLLMProviderConfigUseCase = new CreateLLMProviderConfigUseCase(llmProviderConfigRepository, llmProviderRepository);

// Mocked ProcessJobUseCase as per instructions
export const processJobUseCase: ProcessJobUseCase = {
    execute: async (data: any) => {
        console.log('[Mock] processJobUseCase called with:', data);
        // Simulate a successful outcome structure if needed by the caller,
        // or a structure that indicates it's a mock.
        // Based on IpcChannelsInternal["JOB"]["PROCESS"]["response"] it expects Result<Job | null, Error>
        // and JobHandlers uses ok(result) or error(message).
        // The actual ProcessJobUseCase returns Result<void, Error>
        return { success: true, value: undefined }; // Minimal mock that won't break IPC handler's ok()
    }
} as any; // Cast to any to satisfy the type if the mock is too simple


// --- Core Application Service Instantiations ---
import { QueueService } from "@/core/application/services/queue.service";
export const queueService = new QueueService(jobRepository);

import { JobDefinitionService } from "@/core/application/services/job-definition.service";
export const jobDefinitionService = new JobDefinitionService(queueService);

import { TaskFactory } from "@/core/application/factories/task.factory";
import { MockLLMAdapter } from "@/infrastructure/adapters/llm/mock-llm.adapter";
export const taskFactory = new TaskFactory();
export const llmAdapter = new MockLLMAdapter();

import { AutonomousAgent } from "@/core/application/services/agent/autonomous-agent.service";
export const autonomousAgent = new AutonomousAgent(taskFactory, llmAdapter, agentStateRepository);

import { WorkerService } from "@/core/application/services/worker.service";
export const workerService = new WorkerService(queueService, autonomousAgent, agentStateRepository);

// registerServices function for consistency, though not strictly needed if main.ts imports instances
export function registerServices(_ipcHandler: ElectronIpcHandler) {
  // console.log("services.ts: registerServices called. Services instantiated.");
}
