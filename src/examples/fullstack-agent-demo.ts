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
// import { DrizzleAnnotationRepository } from '../infrastructure/repositories/drizzle/annotation.repository'; // Needed if persona uses annotation tools that require it
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
  const demoOutputBasePath = path.join(CWD, 'fullstack_agent_demo_output');
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
  // const annotationRepository = new DrizzleAnnotationRepository(db); // Instantiate if persona uses annotation tools
  // const memoryRepository = new DrizzleMemoryRepository(db); // Instantiate if persona uses memory tools
  const personaTemplateRepository = new FileSystemAgentPersonaTemplateRepository(); // Loads from config/personas/
  await personaTemplateRepository.init();
  console.log("Repositories instantiated.");

  // --- 2. Tool Registry Check & Persona Template Fetching ---
  // This demo assumes tools (TaskTool, FileSystemTool, AnnotationTool, TerminalTool, MemoryTool)
  // and their dependencies (UseCases, Repositories) are instantiated and registered with toolRegistry
  // in a central setup file (e.g., main.ts).
  if (toolRegistry.getAllTools().length === 0) { // Basic check, could be more specific
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

  // Verify all tools for this persona are in the registry
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

  // --- 3. Instantiate Agent Executor for the Persona ---
  const agentExecutor: IAgentExecutor = new GenericAgentExecutor(fullstackPersonaTemplate, toolRegistry);
  console.log(`GenericAgentExecutor instantiated for role: ${fullstackPersonaTemplate.role}`);

  // --- 4. Queue Setup ---
  const agentQueueName = "fullstack_developer_queue";
  let agentQueue = await queueRepository.findByName(agentQueueName);
  if (!agentQueue) {
    const newQueueEntity = Queue.create({ name: agentQueueName, concurrency: 1 }); // Concurrency 1 for focused sequential processing
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
  const multiStepGoal = \`
1. Create a new directory named 'my_web_project' inside the path '${demoOutputBasePath}'.
2. Inside 'my_web_project', create a file named 'index.html' with the content '<h1>Hello, AI Developer!</h1>'.
3. Execute the terminal command 'ls -la "${demoOutputBasePath}/my_web_project"'.
4. Save a memory: 'Successfully created initial web project structure (index.html) and listed its contents using terminal.' with tags ['web_project_init', 'file_system', 'terminal_ops'].
5. Search memories with the query 'web_project_init'.
6. Save an annotation: 'Fullstack Developer demo: Initial project setup phase (HTML file and directory creation, terminal list, memory save/search) complete.'
  \`;

  const jobPayload = {
    goal: multiStepGoal,
    initialContext: { // Provide base path context if tools need it explicitly, though FileSystemTool is CWD-aware from its own init
        projectBasePath: demoOutputBasePath
    }
  };

  const jobName = "FullstackDemoProjectSetup";
  const existingJobs = await jobRepository.findPendingByRole(agentQueue.id, fullstackPersonaTemplate.role, 20);
  const jobAlreadyExists = existingJobs.some(j => j.name === jobName && j.payload.goal === multiStepGoal);

  if (!jobAlreadyExists) {
    const demoJob = Job.create({
      queueId: agentQueue.id,
      name: jobName,
      payload: jobPayload,
      targetAgentRole: fullstackPersonaTemplate.role,
      priority: 1,
      maxAttempts: 1, // Set to 1 for this demo to observe one full plan execution attempt
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
    agentExecutor, // Pass the pre-configured IAgentExecutor instance
    fullstackPersonaTemplate.role // Pass the role this worker handles
  );

  await workerService.start(agentQueue.name);
  console.log(\`WorkerService started for queue '\${agentQueue.name}', handling role '\${fullstackPersonaTemplate.role}'. Monitoring for jobs...\`);
  console.log("This demo will run and the agent will attempt the multi-step goal.");
  console.log("Check console logs for detailed agent actions, LLM planning, tool calls, and results.");
  console.log(\`Expected output directory: \${demoOutputBasePath}/my_web_project\`);
  console.log("Press Ctrl+C to stop the demo worker.");

  process.on('SIGINT', async () => {
    console.log('\nSIGINT received. Stopping WorkerService...');
    workerService.stop();
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('WorkerService stopped. Demo finished.');
    console.log(\`Demo output (if any) is in: \${demoOutputBasePath}.\`);
    console.log("Consider running 'rm -rf " + demoOutputBasePath + "' to clean up.");
    process.exit(0);
  });
}

mainDemo().catch(error => {
  console.error("Error running Fullstack Developer Agent Demo:", error);
  process.exit(1);
});
