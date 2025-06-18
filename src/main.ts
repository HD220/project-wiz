// src/main.ts
import 'dotenv/config'; // Ensure this is at the very top

import { db } from './infrastructure/services/drizzle/index';
import { DrizzleQueueRepository } from './infrastructure/repositories/drizzle/queue.repository';
import { DrizzleJobRepository } from './infrastructure/repositories/drizzle/job.repository';
import { DrizzleAnnotationRepository } from './infrastructure/repositories/drizzle/annotation.repository';
import { FileSystemAgentPersonaTemplateRepository } from './infrastructure/repositories/file-system-agent-persona-template.repository';

import { WorkerService } from './core/domain/services/worker.service';
import { Queue } from './core/domain/entities/queue/queue.entity';
import { Job } from './core/domain/entities/jobs/job.entity';
import { AgentPersonaTemplate } from './core/domain/entities/agent/persona-template.types'; // For type usage

import { ListJobsUseCase } from './core/application/use-cases/job/list-jobs.usecase';
import { SaveJobUseCase } from './core/application/use-cases/job/save-job.usecase';
import { RemoveJobUseCase } from './core/application/use-cases/job/remove-job.usecase';
import { ListAnnotationsUseCase } from './core/application/use-cases/annotation/list-annotations.usecase';
import { SaveAnnotationUseCase } from './core/application/use-cases/annotation/save-annotation.usecase';
import { RemoveAnnotationUseCase } from './core/application/use-cases/annotation/remove-annotation.usecase';
import { DrizzleMemoryRepository } from './infrastructure/repositories/drizzle/memory.repository';
import { SaveMemoryItemUseCase } from './core/application/use-cases/memory/save-memory-item.usecase';
// import { SearchMemoryItemsUseCase } from './core/application/use-cases/memory/search-memory-items.usecase'; // Removed old
import { SearchSimilarMemoryItemsUseCase } from './core/application/use-cases/memory/search-similar-memory-items.usecase'; // Added new
import { RemoveMemoryItemUseCase } from './core/application/use-cases/memory/remove-memory-item.usecase';
import { EmbeddingService } from './infrastructure/services/ai/embedding.service'; // Added

import { TaskTool, getTaskToolDefinitions } from './infrastructure/tools/task.tool';
import { FileSystemTool, getFileSystemToolDefinitions } from './infrastructure/tools/file-system.tool';
import { AnnotationTool, getAnnotationToolDefinitions } from './infrastructure/tools/annotation.tool';
import { TerminalTool, getTerminalToolDefinitions } from './infrastructure/tools/terminal.tool';
import { MemoryTool, getMemoryToolDefinitions } from './infrastructure/tools/memory.tool'; // Added
import { toolRegistry } from './infrastructure/tools/tool-registry';

import { IAgentExecutor } from './core/ports/agent/agent-executor.interface';
import { GenericAgentExecutor } from './infrastructure/agents/generic-agent-executor';

import path from 'path'; // For FileSystemTool CWD if needed

// Helper function (can be kept from previous versions)
async function initializeQueue(queueRepo: DrizzleQueueRepository, queueName: string, concurrency: number): Promise<Queue> {
  let queue = await queueRepo.findByName(queueName);
  if (!queue) {
    console.log(`Queue ${queueName} not found, creating it...`);
    const newQueueEntity = Queue.create({ name: queueName, concurrency });
    await queueRepo.save(newQueueEntity);
    queue = newQueueEntity;
    console.log(`Queue ${queueName} created with ID ${queue.id}`);
  } else {
    console.log(`Queue ${queueName} found with ID ${queue.id}`);
    if (queue.concurrency !== concurrency) {
      console.log(`Updating concurrency for ${queueName} from ${queue.concurrency} to ${concurrency}`);
      // This part requires Queue entity to have a method to update concurrency, or handle directly.
      // For now, we're just logging. A real update would be:
      // queue.updateConcurrency(concurrency); // Assuming such method exists
      // await queueRepo.save(queue);
    }
  }
  if (!queue) {
    throw new Error(`Failed to find or create queue for ${queueName}`);
  }
  return queue;
}


async function main() {
  console.log('Starting Application - Refactored Main Setup...');

  // API Key Check (moved earlier for clarity)
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("CRITICAL: DEEPSEEK_API_KEY is not set. LLM-dependent agents will fail.");
    // Depending on desired behavior, might exit: process.exit(1);
  }
  if (!process.env.DB_FILE_NAME) {
    console.error("CRITICAL: DB_FILE_NAME is not set. Database operations will fail.");
    process.exit(1); // Essential for operation
  }
  console.log(`Using database: ${process.env.DB_FILE_NAME}`);

  // --- 1. Database and Core Repositories ---
  const queueRepository = new DrizzleQueueRepository(db);
  const jobRepository = new DrizzleJobRepository(db);
  const annotationRepository = new DrizzleAnnotationRepository(db);
  const memoryRepository = new DrizzleMemoryRepository(db); // Added
  const personaTemplateRepository = new FileSystemAgentPersonaTemplateRepository();
  await personaTemplateRepository.init();

  console.log("Repositories instantiated.");

  // --- 2. UseCases ---
  // Job UseCases
  const listJobsUseCase = new ListJobsUseCase(jobRepository);
  const saveJobUseCase = new SaveJobUseCase(jobRepository);
  const removeJobUseCase = new RemoveJobUseCase(jobRepository);
  // Annotation UseCases
  const listAnnotationsUseCase = new ListAnnotationsUseCase(annotationRepository);
  const saveAnnotationUseCase = new SaveAnnotationUseCase(annotationRepository);
  const removeAnnotationUseCase = new RemoveAnnotationUseCase(annotationRepository);

  // Embedding Service
  const embeddingService = new EmbeddingService(); // Added
  console.log("EmbeddingService instantiated.");

  // Memory UseCases
  const saveMemoryItemUseCase = new SaveMemoryItemUseCase(memoryRepository, embeddingService); // Updated
  const searchSimilarMemoryItemsUseCase = new SearchSimilarMemoryItemsUseCase(memoryRepository, embeddingService); // New
  const removeMemoryItemUseCase = new RemoveMemoryItemUseCase(memoryRepository);
  console.log("UseCases instantiated.");

  // --- 3. Tools and ToolRegistry ---
  const CWD = process.cwd(); // Or a specific workspace path like path.resolve(process.cwd(), 'agent_workspace')
  console.log(`FileSystemTool operations will be based in CWD: ${CWD}`);
  const fileSystemToolInstance = new FileSystemTool(CWD);
  const annotationToolInstance = new AnnotationTool(listAnnotationsUseCase, saveAnnotationUseCase, removeAnnotationUseCase);
  const taskToolInstance = new TaskTool(listJobsUseCase, saveJobUseCase, removeJobUseCase);
  const terminalToolInstance = new TerminalTool(CWD);
  const memoryToolInstance = new MemoryTool(saveMemoryItemUseCase, searchSimilarMemoryItemsUseCase, removeMemoryItemUseCase); // Updated

  getFileSystemToolDefinitions(fileSystemToolInstance).forEach(t => toolRegistry.registerTool(t));
  getAnnotationToolDefinitions(annotationToolInstance).forEach(t => toolRegistry.registerTool(t));
  getTaskToolDefinitions(taskToolInstance).forEach(t => toolRegistry.registerTool(t));
  getTerminalToolDefinitions(terminalToolInstance).forEach(t => toolRegistry.registerTool(t));
  getMemoryToolDefinitions(memoryToolInstance).forEach(t => toolRegistry.registerTool(t)); // Added

  console.log("All tools registered in ToolRegistry:");
  toolRegistry.getAllTools().forEach(t => console.log(` - ${t.name} (${t.description.substring(0,50)}...)`));

  // --- 4. Setup and Start Workers for Personas ---
  const activeWorkers: WorkerService[] = [];

  const rolesToActivate = [
    "FileSystem Manager",
    // "Code Generator", // Example: Add other roles here to activate them
    // "Generic Task Processor"
  ];

  for (const roleName of rolesToActivate) {
    const personaTemplate = await personaTemplateRepository.findByRole(roleName);

    if (personaTemplate) {
      console.log(`
--- Setting up Worker for Persona Role: ${roleName} ---`);
      // Each worker gets its own GenericAgentExecutor instance configured with its persona
      const agentExecutor = new GenericAgentExecutor(personaTemplate, toolRegistry, annotationToolInstance);
      const queueName = `${roleName.toLowerCase().replace(/\s+/g, '_')}_queue`; // e.g., filesystem_manager_queue
      const agentQueue = await initializeQueue(queueRepository, queueName, 1); // Concurrency 1 per agent type for now

      const worker = new WorkerService(
        queueRepository,
        jobRepository,
        agentExecutor, // Pass the IAgentExecutor instance
        personaTemplate.role // Pass the role string this worker handles
        // { pollFrequencyMs: 7000 } // Optional custom poll frequency
      );
      await worker.start(agentQueue.name);
      activeWorkers.push(worker);

      // Add a sample job for the FileSystem Manager if it's that role
      if (roleName === "FileSystem Manager") {
        const sampleGoal = "Create a file named 'main_welcome.txt' in the root directory with content 'Hello from the FileSystem Manager Agent via main.ts!', then list contents of the root directory, and save an annotation about this task.";
        const existingJob = (await jobRepository.findPending(agentQueue.id, 20)).find(j => j.payload.goal === sampleGoal && j.targetAgentRole === roleName);
        if (!existingJob) {
            const job = Job.create({
                queueId: agentQueue.id,
                name: "MainFileSystemDemoTask",
                payload: { goal: sampleGoal },
                targetAgentRole: roleName,
                priority: 1
            });
            await jobRepository.save(job);
            console.log(`Sample job for ${roleName} enqueued with ID: ${job.id}`);
        } else {
            console.log(`Sample job for ${roleName} already exists.`);
        }
      }
    } else {
      console.warn(`Persona template for role '${roleName}' not found. Worker not started for this role.`);
    }
  }

  if (activeWorkers.length > 0) {
    console.log('\nAll active WorkerServices are running. Press Ctrl+C to stop.');
  } else {
    console.warn('\nNo active WorkerServices started. Check persona template definitions and roles in rolesToActivate array.');
  }

  // --- Graceful Shutdown ---
  const shutdown = async () => {
    console.log('\nSIGINT/SIGTERM received. Stopping WorkerServices...');
    activeWorkers.forEach(worker => worker.stop());
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give time for graceful stop
    console.log('All workers stopped. Exiting.');
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(error => {
  console.error('Error during application startup or execution:', error);
  process.exit(1);
});
