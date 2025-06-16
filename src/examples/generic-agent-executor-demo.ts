// src/examples/generic-agent-executor-demo.ts
import 'dotenv/config';
// --- Core Entity & Service Imports ---
import { db } from '../infrastructure/services/drizzle';
import { Job } from '../core/domain/entities/jobs/job.entity';
import { Queue } from '../core/domain/entities/queue/queue.entity';
import { AgentPersonaTemplate } from '../core/domain/entities/agent/persona-template.types';
import { WorkerService } from '../core/domain/services/worker.service';
import { GenericAgentExecutor } from '../core/agents/generic-agent-executor'; // The star of the show

// --- Repository Imports ---
import { DrizzleJobRepository } from '../infrastructure/repositories/drizzle/job.repository';
import { DrizzleQueueRepository } from '../infrastructure/repositories/drizzle/queue.repository';
// import { DrizzleAnnotationRepository } from '../infrastructure/repositories/drizzle/annotation.repository'; // Needed if persona uses annotation tools

// --- Tool & ToolRegistry Imports ---
import { toolRegistry } from '../infrastructure/tools/tool-registry';
// Note: Tool definition functions (e.g., getFileSystemToolDefinitions) and actual tool classes
// (FileSystemTool, AnnotationTool, TaskTool) are not directly instantiated here if we assume
// toolRegistry is populated by a central startup process (like in main.ts).
// If this demo were fully standalone for tool setup, those imports and instantiations would be here.

// --- Node.js Utilities ---
import path from 'path';
import fs from 'fs'; // Using 'fs' for fs.promises.mkdir in the setup part of mainDemo

// --- Persona Template Definition ---
const fileManagerPersona: AgentPersonaTemplate = {
  id: "FileSystemManager_v1", // Unique ID for this template
  role: "FileSystem Manager",
  goal: "Manage files and directories efficiently and accurately based on instructions.",
  backstory: "I am an AI assistant that specializes in all forms of file and directory manipulation. I can create, read, write, move, and delete items in the file system.",
  toolNames: [ // Tools this persona is allowed to use
    'fileSystem.readFile',
    'fileSystem.writeFile',
    'fileSystem.listDirectory',
    'fileSystem.createDirectory',
    'fileSystem.removeFile',
    'fileSystem.removeDirectory',
    'fileSystem.moveFile',
    'fileSystem.moveDirectory',
    'annotation.save', // To log its actions
    // 'taskManager.saveJob' // Example: if it needed to create follow-up tasks
  ],
};

async function mainDemo() {
  console.log("--- Generic Agent Executor Demo ---");

  // --- 0. Configuration & Basic Checks ---
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("DEEPSEEK_API_KEY is not set. GenericAgentExecutor requires it for planning/execution.");
    return;
  }
  if (!process.env.DB_FILE_NAME) {
    console.error("DB_FILE_NAME is not set. This demo requires a database connection.");
    return;
  }
  console.log(`Using database: ${process.env.DB_FILE_NAME}`);

  const fileSystemDemoBasePath = path.resolve(process.cwd(), 'generic_agent_demo_output');
  try {
    await fs.promises.mkdir(fileSystemDemoBasePath, { recursive: true });
    console.log(`File system operations will be based in: ${fileSystemDemoBasePath}. Ensure this path is writable.`);
  } catch (e) {
    console.error(`Failed to create base directory for FileSystemTool at ${fileSystemDemoBasePath}`, e);
    return;
  }

  // --- 1. Instantiate Repositories (db is imported and should be initialized by Drizzle) ---
  const jobRepository = new DrizzleJobRepository(db);
  const queueRepository = new DrizzleQueueRepository(db);
  // const annotationRepository = new DrizzleAnnotationRepository(db); // Instantiate if annotation.save is used by persona
  console.log("Repositories instantiated.");

  // --- 2. Tool Registry Check ---
  // This demo assumes that tools (TaskTool, FileSystemTool, AnnotationTool) have been instantiated
  // with their dependencies (UseCases -> Repositories) and registered with the toolRegistry
  // in a central place like main.ts or a dedicated configuration file.
  if (toolRegistry.getAllTools().length === 0) {
    console.error("CRITICAL: ToolRegistry is empty. This demo relies on tools being registered during application startup (e.g., in main.ts).");
    console.log("Please ensure FileSystemTool, AnnotationTool, and TaskTool methods are registered in 'toolRegistry'.");
    return;
  }
  // Verify that the tools required by the persona are available in the registry
  let allPersonaToolsRegistered = true;
  for (const toolName of fileManagerPersona.toolNames) {
    if (!toolRegistry.getTool(toolName)) {
      console.error(`CRITICAL: Tool '${toolName}' required by persona '${fileManagerPersona.role}' is not registered in ToolRegistry.`);
      allPersonaToolsRegistered = false;
    }
  }
  if (!allPersonaToolsRegistered) {
    console.error("One or more tools required by the persona are missing from the registry. Aborting demo.");
    return;
  }
  console.log("ToolRegistry populated (assumed from startup). Necessary persona tools checked.");

  // --- 3. Queue Setup ---
  const agentQueueName = "generic_executor_queue";
  let agentQueue = await queueRepository.findByName(agentQueueName);
  if (!agentQueue) {
    const newQueueEntity = Queue.create({ name: agentQueueName, concurrency: 1 }); // Concurrency 1 for sequential processing
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

  // --- 4. Define and Enqueue Job ---
  const multiStepGoal = `First, create a directory named 'project_gamma' inside the demo base path ('${fileSystemDemoBasePath}'). Then, inside 'project_gamma', create a file named 'status_report.txt' with the content 'Project Gamma: All systems nominal.'. After that, list the contents of the 'project_gamma' directory. Finally, save an annotation stating: 'Project gamma setup and initial status report complete.'`;

  const jobPayload = {
    goal: multiStepGoal,
    // initialContext: { basePath: fileSystemDemoBasePath } // Context can be passed if agent needs it
  };

  const existingJobs = await jobRepository.findPending(agentQueue.id, 10);
  const jobAlreadyExists = existingJobs.some(j => j.name === "GenericExecutorDemoJob_Gamma" && j.payload.goal === multiStepGoal);

  if (!jobAlreadyExists) {
    const demoJob = Job.create({
      queueId: agentQueue.id,
      name: "GenericExecutorDemoJob_Gamma",
      payload: jobPayload,
      targetAgentRole: fileManagerPersona.role, // Targeting the persona's role
      // requiredCapabilities: fileManagerPersona.toolNames, // Could also list capabilities if needed for worker selection
      priority: 1,
      maxAttempts: 1, // Set to 1 for this demo to see full plan execution or failure
    });
    await jobRepository.save(demoJob);
    console.log(`Enqueued job '${demoJob.name}' (ID: ${demoJob.id}) targeting role '${fileManagerPersona.role}'.`);
  } else {
    console.log("Demo job with the same goal already exists in the queue. Skipping new job creation.");
  }

  // --- 5. WorkerService Setup & Start ---
  console.log("\n--- Starting WorkerService for GenericAgentExecutor with Persona: " + fileManagerPersona.role + " ---");

  // WorkerService now takes the AgentPersonaTemplate and toolRegistry
  const workerService = new WorkerService(
    queueRepository,
    jobRepository,
    fileManagerPersona, // Pass the persona template
    toolRegistry        // Pass the tool registry (which GenericAgentExecutor will use)
    // { pollFrequencyMs: 7000 } // Optional: adjust poll frequency
  );

  await workerService.start(agentQueue.name);
  console.log(`WorkerService started for queue '${agentQueue.name}', using persona '${fileManagerPersona.role}'. Monitoring for jobs...`);
  console.log(`FileSystemTool operations are sandboxed to: ${fileSystemDemoBasePath}`);
  console.log("Demo will now run. Check console logs for agent actions and the output directory.");
  console.log("Press Ctrl+C to stop the demo worker.");

  process.on('SIGINT', async () => {
    console.log('\nSIGINT received. Stopping WorkerService...');
    workerService.stop();
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('WorkerService stopped. Demo finished.');
    console.log(`Demo output (if any) is in: ${fileSystemDemoBasePath}. Please review or remove manually.`);
    process.exit(0);
  });
}

mainDemo().catch(error => {
  console.error("Error running Generic Agent Executor Demo:", error);
  process.exit(1);
});
