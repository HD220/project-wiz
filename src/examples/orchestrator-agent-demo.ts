// src/examples/orchestrator-agent-demo.ts
import 'dotenv/config'; // To load .env for DEEPSEEK_API_KEY and DB_FILE_NAME

import { db } from '../infrastructure/services/drizzle'; // Your Drizzle DB instance
import { AgentPersona } from '../core/domain/entities/agent/persona.types';
import { Job } from '../core/domain/entities/jobs/job.entity';
import { Queue } from '../core/domain/entities/queue/queue.entity';

import { DrizzleJobRepository } from '../infrastructure/repositories/drizzle/job.repository';
import { DrizzleQueueRepository } from '../infrastructure/repositories/drizzle/queue.repository';
import { DrizzleAnnotationRepository } from '../infrastructure/repositories/drizzle/annotation.repository';

import { ListJobsUseCase } from '../core/application/use-cases/job/list-jobs.usecase';
import { SaveJobUseCase } from '../core/application/use-cases/job/save-job.usecase';
import { RemoveJobUseCase } from '../core/application/use-cases/job/remove-job.usecase';

import { ListAnnotationsUseCase } from '../core/application/use-cases/annotation/list-annotations.usecase';
import { SaveAnnotationUseCase } from '../core/application/use-cases/annotation/save-annotation.usecase';
import { RemoveAnnotationUseCase } from '../core/application/use-cases/annotation/remove-annotation.usecase';

import { TaskTool } from '../infrastructure/tools/task.tool';
import { FileSystemTool } from '../infrastructure/tools/file-system.tool';
import { AnnotationTool } from '../infrastructure/tools/annotation.tool';

import { OrchestratorAgent, OrchestratorAgentPayload } from '../infrastructure/agents/orchestrator.agent';
import { WorkerService } from '../core/domain/services/worker.service';
import path from 'path'; // For FileSystemTool base path if needed

async function mainDemo() {
  console.log("--- Orchestrator Agent Demo ---");

  // --- 0. Configuration & Basic Checks ---
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("DEEPSEEK_API_KEY is not set. OrchestratorAgent requires it.");
    return;
  }
  if (!process.env.DB_FILE_NAME) {
    console.error("DB_FILE_NAME is not set. This demo requires a database connection.");
    return;
  }
  console.log(`Using database: ${process.env.DB_FILE_NAME}`);
  // Create a dedicated output directory for this demo's file operations
  const fileSystemDemoBasePath = path.resolve(process.cwd(), 'orchestrator_demo_output');
  try {
    await fs.promises.mkdir(fileSystemDemoBasePath, { recursive: true });
    console.log(`File system operations will be based in: ${fileSystemDemoBasePath}`);
  } catch (e) {
    console.error(`Failed to create base directory for FileSystemTool at ${fileSystemDemoBasePath}`, e)
    return;
  }


  // --- 1. Instantiate Repositories ---
  const jobRepository = new DrizzleJobRepository(db);
  const queueRepository = new DrizzleQueueRepository(db);
  const annotationRepository = new DrizzleAnnotationRepository(db);
  console.log("Repositories instantiated.");

  // --- 2. Instantiate UseCases ---
  // Job UseCases
  const listJobsUseCase = new ListJobsUseCase(jobRepository);
  const saveJobUseCase = new SaveJobUseCase(jobRepository);
  const removeJobUseCase = new RemoveJobUseCase(jobRepository);
  // Annotation UseCases
  const listAnnotationsUseCase = new ListAnnotationsUseCase(annotationRepository);
  const saveAnnotationUseCase = new SaveAnnotationUseCase(annotationRepository);
  const removeAnnotationUseCase = new RemoveAnnotationUseCase(annotationRepository);
  console.log("UseCases instantiated.");

  // --- 3. Instantiate Tools ---
  const taskTool = new TaskTool(listJobsUseCase, saveJobUseCase, removeJobUseCase);
  // Initialize FileSystemTool with a specific base path for this demo
  const fileSystemTool = new FileSystemTool(fileSystemDemoBasePath);
  const annotationTool = new AnnotationTool(listAnnotationsUseCase, saveAnnotationUseCase, removeAnnotationUseCase);
  console.log("Tools instantiated.");

  // --- 4. Define Agent Persona and Instantiate Agent ---
  const orchestratorPersona: AgentPersona = {
    role: "Senior Software Engineer",
    goal: "To efficiently manage software development tasks, including file system operations, task scheduling, and maintaining a clear record of actions.",
    backstory: "I am an experienced AI software engineer designed to automate and streamline development workflows. I can plan complex tasks, execute them using available tools, and keep track of my progress.",
  };
  const orchestratorAgent = new OrchestratorAgent(
    orchestratorPersona,
    taskTool,
    fileSystemTool,
    annotationTool,
    "OrchestratorGPT-1" // Explicit agent name
  );
  console.log(`Agent '${orchestratorAgent.name}' instantiated.`);

  // --- 5. Setup Queue for the Agent ---
  const agentQueueName = "orchestrator_agent_queue";
  let agentQueue = await queueRepository.findByName(agentQueueName);
  if (!agentQueue) {
    console.log(`Queue '${agentQueueName}' not found, creating it...`);
    const newQueueEntity = Queue.create({ name: agentQueueName, concurrency: 1 }); // Concurrency 1 for sequential task processing by this agent
    await queueRepository.save(newQueueEntity);
    agentQueue = newQueueEntity;
    console.log(`Queue '${agentQueueName}' created with ID ${agentQueue.id}`);
  } else {
    console.log(`Queue '${agentQueueName}' found with ID ${agentQueue.id}`);
  }
  if (!agentQueue) {
      console.error("Failed to obtain agent queue. Exiting.");
      return;
  }

  // --- 6. Define and Enqueue the High-Level Job ---
  const highLevelGoal = "Create a directory 'test_project', then create a file 'test_project/readme.md' with content '# My Test Project', then list contents of the 'test_project' directory, and finally, add an annotation 'Test project setup complete.'";

  const initialJobPayload: OrchestratorAgentPayload = {
    goal: highLevelGoal,
    // initialContext: { projectPath: 'output/test_project' } // context can be passed if needed
  };

  const existingJobs = await jobRepository.findPending(agentQueue.id, 10);
  const jobAlreadyExists = existingJobs.some(j => j.name === "OrchestratorDemoJob" && JSON.stringify(j.payload) === JSON.stringify(initialJobPayload));

  if (!jobAlreadyExists) {
    const orchestratorJob = Job.create({
        queueId: agentQueue.id,
        name: "OrchestratorDemoJob",
        payload: initialJobPayload,
        priority: 1,
        maxAttempts: 1, // Set to 1 to avoid automatic retries for this demo if it fails mid-plan
    });
    await jobRepository.save(orchestratorJob);
    console.log(`Enqueued job '${orchestratorJob.name}' (ID: ${orchestratorJob.id}) with goal: "${highLevelGoal}"`);
  } else {
    console.log("Demo job with the same goal already exists in the queue. Skipping new job creation.");
  }


  // --- 7. Instantiate and Start WorkerService ---
  // IMPORTANT: The WorkerService needs to be adapted to handle the 'in_progress_step_complete'
  // status from OrchestratorAgentResult by saving the job's updated payload (currentPlan, completedSteps)
  // and allowing it to be picked up again. This demo will run the agent once per poll.
  // For true multi-step execution as designed in OrchestratorAgent, WorkerService modifications are needed.

  console.log("\n--- Starting WorkerService for OrchestratorAgent ---");
  console.warn("NOTE: The current WorkerService might not fully support the multi-step plan execution of OrchestratorAgent without modifications for re-queuing 'in_progress_step_complete' jobs with updated payloads.");

  const workerService = new WorkerService(
    queueRepository,
    jobRepository,
    orchestratorAgent,
    { pollFrequencyMs: 5000 } // Poll every 5 seconds
  );

  // Let the worker run for a limited time for this demo, or indefinitely until stopped.
  // For this script, we'll let it run and user can stop with Ctrl+C.
  // It will process one step of the plan per poll if the agent returns 'in_progress_step_complete'.
  await workerService.start(agentQueue.name);
  console.log(`WorkerService started for queue '${agentQueue.name}'. Monitoring for jobs...`);
  console.log("Demo will now run. Check console logs and the 'orchestrator_demo_output' directory.");
  console.log("Press Ctrl+C to stop the demo worker.");

  // Keep the script running so the worker can operate.
  // In a real app, this would be part of the main application lifecycle.
  // For this demo, we'll just let it run until manually stopped.
  // Handle Ctrl+C for graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nSIGINT received. Stopping WorkerService...');
    workerService.stop();
    // Give some time for worker to finish current poll/job if any
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('WorkerService stopped. Demo finished.');
    // Clean up the demo directory
    try {
        // await fs.promises.rm(fileSystemDemoBasePath, { recursive: true, force: true });
        // console.log(`Cleaned up demo directory: ${fileSystemDemoBasePath}`);
        console.log(`Demo output is in: ${fileSystemDemoBasePath}. Please review or remove manually.`);
    } catch(e) {
        console.warn(`Could not automatically clean up demo directory ${fileSystemDemoBasePath}:`, e);
    }
    process.exit(0);
  });
}

// Ensure fs/promises is imported if used directly in mainDemo for mkdir
import fs from 'fs'; // Using 'fs' for fs.promises.mkdir in the setup part of mainDemo

mainDemo().catch(error => {
  console.error("Error running Orchestrator Agent Demo:", error);
  process.exit(1);
});
