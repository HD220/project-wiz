// src/examples/fullstack-agent-demo.ts
// This script demonstrates the GenericAgentExecutor with a "Fullstack Developer" persona
// to process a multi-step goal involving file system, terminal, and memory operations.
// It relies on tools being registered in the ToolRegistry by a central setup (e.g., main.ts).
// For a full understanding of the architecture, see docs/autonomous-agent-architecture.md.
import 'dotenv/config';

// --- Core Entity & Service Imports ---
import { db } from '../infrastructure/services/drizzle';
import { Job } from '../core/domain/entities/jobs/job.entity';
import { Queue } from '../core/domain/entities/queue/queue.entity';
import { AgentPersonaTemplate } from '../core/domain/entities/agent/persona-template.types';
import { WorkerService } from '../core/domain/services/worker.service';

// --- Repository Imports ---
import { DrizzleJobRepository } from '../infrastructure/repositories/drizzle/job.repository';
import { DrizzleQueueRepository } from '../infrastructure/repositories/drizzle/queue.repository';
import { FileSystemAgentPersonaTemplateRepository } from '../infrastructure/repositories/file-system-agent-persona-template.repository';
import { DrizzleAnnotationRepository } from '../infrastructure/repositories/drizzle/annotation.repository';
import { ListAnnotationsUseCase } from '../core/application/use-cases/annotation/list-annotations.usecase';
import { SaveAnnotationUseCase } from '../core/application/use-cases/annotation/save-annotation.usecase';
import { RemoveAnnotationUseCase } from '../core/application/use-cases/annotation/remove-annotation.usecase';
import { AnnotationTool } from '../infrastructure/tools/annotation.tool';
// import { DrizzleMemoryRepository } from '../infrastructure/repositories/drizzle/memory.repository'; // Needed if persona uses memory tools that require it

// --- Tool & ToolRegistry Imports ---
import { toolRegistry } from '../infrastructure/tools/tool-registry';

// --- Agent Executor ---
import { GenericAgentExecutor } from '../infrastructure/agents/generic-agent-executor';
import { IAgentExecutor } from '../core/ports/agent/agent-executor.interface';


// --- Node.js Utilities ---
import path from 'path';
import fs from 'fs'; // Using 'fs' for fs.promises.mkdir and fs.promises.rm in the setup/cleanup

async function mainDemo() {
  console.log("--- Fullstack Developer Agent Demo (via Generic Agent Executor) ---");

  // --- 0. Configuration & Basic Checks ---
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("CRITICAL: DEEPSEEK_API_KEY is not set. GenericAgentExecutor requires it.");
    return;
  }
  if (!process.env.DB_FILE_NAME) {
    console.error("CRITICAL: DB_FILE_NAME is not set. This demo requires a database connection.");
    return;
  }
  console.log(`Using database: ${process.env.DB_FILE_NAME}`);

  const CWD = process.cwd();
  const demoOutputBasePath = path.join(CWD, 'fullstack_code_gen_demo_output');
  try {
    await fs.promises.rm(demoOutputBasePath, { recursive: true, force: true }); // Clean up from previous runs
    await fs.promises.mkdir(demoOutputBasePath, { recursive: true });
    console.log(`Demo output directory for FileSystemTool operations: ${demoOutputBasePath}. Ensure this path is writable.`);
  } catch (e) {
    console.error(`Failed to create/clean base directory for FileSystemTool at ${demoOutputBasePath}`, e);
    return;
  }

  // --- 1. Instantiate Repositories ---
  const jobRepository = new DrizzleJobRepository(db);
  const queueRepository = new DrizzleQueueRepository(db);
  const annotationRepository = new DrizzleAnnotationRepository(db);
  // const memoryRepository = new DrizzleMemoryRepository(db); // Instantiate if persona uses memory tools
  const personaTemplateRepository = new FileSystemAgentPersonaTemplateRepository(); // Loads from config/personas/
  await personaTemplateRepository.init();
  console.log("Repositories instantiated.");

  // --- 2. Tool Registry Check & Persona Template Fetching ---
  if (toolRegistry.getAllTools().length === 0) {
      console.error("CRITICAL: ToolRegistry is empty or not fully populated. This demo relies on tools being registered during application startup.");
      console.log("Please ensure your main application setup (e.g., main.ts) registers all required tools (FileSystem, Annotation, TaskManager, Terminal, Memory).");
      return;
  }
  console.log("ToolRegistry assumed populated by application startup.");

  const fullstackPersonaRole = "Fullstack Developer";
  const fullstackPersonaTemplate = await personaTemplateRepository.findByRole(fullstackPersonaRole);

  if (!fullstackPersonaTemplate) {
    console.error(`CRITICAL: Persona template for role '${fullstackPersonaRole}' not found. Ensure 'config/personas/fullstack_developer_v1.json' exists and is loaded.`);
    return;
  }
  console.log(`Found persona template for: ${fullstackPersonaTemplate.role} (ID: ${fullstackPersonaTemplate.id})`);

  let allPersonaToolsRegistered = true;
  for (const toolName of fullstackPersonaTemplate.toolNames) {
    if (!toolRegistry.getTool(toolName)) {
      console.error(`CRITICAL: Tool '${toolName}' (required by persona '${fullstackPersonaTemplate.role}') is NOT registered in ToolRegistry! Aborting.`);
      allPersonaToolsRegistered = false;
    }
  }
  if (!allPersonaToolsRegistered) {
    return;
  }
  console.log("All required tools for the Fullstack Developer persona are registered.");

  // --- 3. Instantiate UseCases & Internal Tools for Agent Executor ---
  // Annotation UseCases (needed for internal AnnotationTool instance for GenericAgentExecutor)
  const listAnnotationsUseCase = new ListAnnotationsUseCase(annotationRepository);
  const saveAnnotationUseCase = new SaveAnnotationUseCase(annotationRepository);
  const removeAnnotationUseCase = new RemoveAnnotationUseCase(annotationRepository);
  console.log("Demo: Annotation UseCases instantiated.");

  // AnnotationTool instance for GenericAgentExecutor's internal use
  const annotationToolInstance = new AnnotationTool(listAnnotationsUseCase, saveAnnotationUseCase, removeAnnotationUseCase);
  console.log("Demo: Internal AnnotationTool instance created.");

  // --- 4. Instantiate Agent Executor for the Persona ---
  const agentExecutor: IAgentExecutor = new GenericAgentExecutor(fullstackPersonaTemplate, toolRegistry, annotationToolInstance);
  console.log(`GenericAgentExecutor instantiated for role: ${fullstackPersonaTemplate.role}`);

  // --- 5. Queue Setup ---
  const agentQueueName = "fullstack_developer_queue";
  let agentQueue = await queueRepository.findByName(agentQueueName);
  if (!agentQueue) {
    const newQueueEntity = Queue.create({ name: agentQueueName, concurrency: 1 });
    await queueRepository.save(newQueueEntity);
    agentQueue = newQueueEntity;
    console.log(`Queue '${agentQueueName}' created with ID: ${agentQueue.id}.`);
  } else {
    console.log(`Queue '${agentQueueName}' found with ID: ${agentQueue.id}.`);
  }
  if (!agentQueue) {
    console.error("Failed to create or find agent queue. Exiting.");
    return;
  }

  // --- 5. Define and Enqueue Job ---
  const ambiguousGoal = "Develop a user authentication feature for our new web application. It needs to be secure and user-friendly.";

  const jobPayload = {
    goal: ambiguousGoal,
    initialContext: {
        // Optional: Provide specific context if agent needs it beyond the CWD of tools
        // For instance, if FileSystemTool's baseCWD was not the project root but a generic workspace.
    }
  };

  const jobName = "AmbiguousAuthFeatureDemo";
  const existingJobs = await jobRepository.findPendingByRole(agentQueue.id, fullstackPersonaTemplate.role, 20);
  const jobAlreadyExists = existingJobs.some(j => j.name === jobName && j.payload.goal === ambiguousGoal);

  if (!jobAlreadyExists) {
    const demoJob = Job.create({
      queueId: agentQueue.id,
      name: jobName,
      payload: jobPayload,
      targetAgentRole: fullstackPersonaTemplate.role,
      priority: 1,
      maxAttempts: 1,
    });
    await jobRepository.save(demoJob);
    console.log(\`Enqueued job '\${demoJob.name}' (ID: \${demoJob.id}) targeting role '\${fullstackPersonaTemplate.role}'.\`);
  } else {
    console.log(\`Demo job '\${jobName}' with the same goal already exists in the queue. Skipping new job creation.\`);
  }

  // --- 6. WorkerService Setup & Start ---
  console.log("\n--- Starting WorkerService for Fullstack Developer Agent ---");

  const workerService = new WorkerService(
    queueRepository,
    jobRepository,
    agentExecutor,
    fullstackPersonaTemplate.role
  );

  await workerService.start(agentQueue.name);
  console.log(\`WorkerService started for queue '\${agentQueue.name}', handling role '\${fullstackPersonaTemplate.role}'. Monitoring for jobs...\`);

  console.log("\n--- Goal for Fullstack Developer Agent (Ambiguous Task) ---");
  console.log(ambiguousGoal);
  console.log("\n--- Expected Outcomes (Verify in Agent Logs/ExecutionHistory & Annotations Table) ---");
  console.log("- The agent should NOT attempt to write files or execute commands immediately.");
  console.log("- The agent's primary response should be to ask clarifying questions about the authentication feature.");
  console.log("- Check 'executionHistory' (logged by the demo when the job finishes or in agent logs if it's a long sequence) for an 'llm_event' with name 'clarification_questions_asked'.");
  console.log("- An annotation should be saved containing these questions. It should be tagged with 'clarification_needed' and 'job:<JOB_ID>'. You might need to query your DB's 'annotations' table to see it, or look for logs from AnnotationTool.save().");
  console.log("- The job should return with a status like 'CONTINUE_PROCESSING' and a message indicating questions were asked and user input is awaited.");
  console.log("Run the demo and observe the console output for the agent's behavior.");
  console.log("Press Ctrl+C to stop the demo worker.");

  process.on('SIGINT', async () => {
    console.log('\nSIGINT received. Stopping WorkerService...');
    workerService.stop();
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('WorkerService stopped. Demo finished.');
    console.log(\`Demo output (if any) is in: \${demoOutputBasePath}.\`);
    console.log("Consider running 'rm -rf " + demoOutputBasePath + "' to clean up."); // Path in message updated
    process.exit(0);
  });
}

mainDemo().catch(error => {
  console.error("Error running Fullstack Developer Agent Demo:", error);
  process.exit(1);
});
