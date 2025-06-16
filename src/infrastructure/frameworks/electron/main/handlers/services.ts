import { db } from "@/infrastructure/services/drizzle";
import type { WorkerRepository } from "@/core/application/ports/worker-repository.interface";
import type { QueueService } from "@/core/application/ports/queue-service.interface";
import { WorkerAssignmentServiceImpl } from "@/infrastructure/services/worker-assignment.service";
import { WorkerJobServiceAdapter } from "@/core/application/adapters/worker-job-service.adapter";
import { UserRepositoryDrizzle } from "@/infrastructure/repositories/user-drizzle.repository";
import { LLMProviderRepositoryDrizzle } from "@/infrastructure/repositories/llm-provider-drizzle.repository";
import { LLMProviderConfigRepositoryDrizzle } from "@/infrastructure/repositories/llm-provider-config-drizzle.repository";
import { JobRepositoryDrizzle } from "@/infrastructure/repositories/job-drizzle.repository";
import { WorkerJobServiceImpl } from "@/infrastructure/services/worker-job.service";
import { ProcessJobUseCase } from "@/core/application/use-cases/process-job.usecase";
import { ElectronIpcHandler } from "@/infrastructure/frameworks/electron/electron-ipc.adapter";
import { UserQuery } from "@/core/application/queries/user.query";
import { LLMProviderQuery } from "@/core/application/queries/llm-provider.query";

// Repositories
export const llmProviderRepository = new LLMProviderRepositoryDrizzle(db);
export const llmProviderConfigRepository =
  new LLMProviderConfigRepositoryDrizzle(db);
export const userRepository = new UserRepositoryDrizzle(db);
export const jobRepository = new JobRepositoryDrizzle(db);

// Queries
export const userQuery = new UserQuery(userRepository);
export const llmProviderQuery = new LLMProviderQuery(llmProviderRepository);

// Services
export const workerRepository: WorkerRepository = {} as WorkerRepository;
export const queueService: QueueService = {} as QueueService;
export const workerAssignmentService = new WorkerAssignmentServiceImpl(
  workerRepository
);

// Initialize services with circular dependency
export const workerJobService = new WorkerJobServiceImpl(
  {} as ProcessJobUseCase,
  queueService
);

export const workerJobServiceAdapter = new WorkerJobServiceAdapter(
  workerJobService,
  jobRepository,
  workerRepository
);

export const processJobUseCase = new ProcessJobUseCase(
  jobRepository,
  workerJobServiceAdapter,
  workerAssignmentService
);

// Assign processJobUseCase after initialization
Object.assign(workerJobService, { processJobUseCase });

export function registerServices(_ipcHandler: ElectronIpcHandler) {
  // Renomeado para _ipcHandler
  // Currently no services need explicit IPC registration
  // This function exists for consistency with other handler modules
}
