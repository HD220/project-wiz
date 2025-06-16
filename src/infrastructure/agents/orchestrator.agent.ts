// src/infrastructure/agents/orchestrator.agent.ts
import { IPersonaAgent } from '../../core/ports/persona-agent.interface';
import { AgentPersona } from '../../core/domain/entities/agent/persona.types';
import { Job } from '../../core/domain/entities/jobs/job.entity';
import {
  ITaskTool,
  // Import Zod schemas if they are to be used directly for constructing tool definitions here
  // listParamsSchema as taskListParamsSchema, // Example of renaming if conflicts
  // saveParamsSchema as taskSaveParamsSchema,
  // removeParamsSchema as taskRemoveParamsSchema
} from '../tools/task.tool';
import {
  IFileSystemTool,
  // readFileParamsSchema, // etc.
} from '../tools/file-system.tool';
import {
  IAnnotationTool,
  // listAnnotationsParamsSchema, // etc.
} from '../tools/annotation.tool';

import { generateObject, tool } from 'ai';
import { z } from 'zod';
import { deepseek } from '@ai-sdk/deepseek'; // Or your chosen LLM provider

// Define the expected payload for jobs this agent will handle.
export interface OrchestratorAgentPayload {
  goal: string;
  initialContext?: any;
  // Add a field for plan continuation if needed
  currentPlan?: PlanStep[];
  completedSteps?: number; // Index of last completed step
}

// The result of this agent's processing.
export interface OrchestratorAgentResult {
  status: 'completed' | 'failed' | 'in_progress_step_complete' | 'pending_further_action';
  message: string;
  output?: any;
  remainingPlan?: PlanStep[];
  currentStepIndex?: number;
}

// Define a structure for plan steps
export interface PlanStep extends Record<string, any> { // Making it extensible
  tool: string; // e.g., 'fileSystemTool.writeFile'
  params: any;  // Parameters for the tool method
  description: string; // LLM-generated description of what this step does
}

export class OrchestratorAgent implements IPersonaAgent<OrchestratorAgentPayload, OrchestratorAgentResult> {
  readonly name: string;
  readonly persona: AgentPersona;

  public readonly taskManagerTool: ITaskTool;
  public readonly fileSystemTool: IFileSystemTool;
  public readonly annotationTool: IAnnotationTool;

  private readonly aiTools: any; // For ai-sdk

  constructor(
    persona: AgentPersona,
    taskManagerTool: ITaskTool,
    fileSystemTool: IFileSystemTool,
    annotationTool: IAnnotationTool,
    agentName?: string
  ) {
    this.persona = persona;
    this.name = agentName || `${persona.role} Orchestrator`;
    this.taskManagerTool = taskManagerTool;
    this.fileSystemTool = fileSystemTool;
    this.annotationTool = annotationTool;

    console.log(`OrchestratorAgent '${this.name}' initialized with persona: ${this.persona.role}`);
    console.log(` - Goal: ${this.persona.goal}`);
    console.log(' - Tools: TaskManager, FileSystem, Annotation');

    // Define tools for ai-sdk. Schemas should be imported from respective tool files or defined centrally.
    // For brevity, using simplified schemas here. In practice, import/use the exact Zod schemas from tool files.
    this.aiTools = {
      taskManagerListJobs: tool({
        description: "Lists jobs in a specified queue. Useful for checking existing tasks.",
        parameters: z.object({ queueId: z.string(), limit: z.number().optional() }),
        execute: async (params) => this.taskManagerTool.list(params),
      }),
      taskManagerSaveJob: tool({
        description: "Creates a new job or updates an existing one. Use this to schedule sub-tasks or modify existing ones.",
        parameters: z.object({ id: z.string().optional(), queueId: z.string(), name: z.string(), payload: z.any().optional(), priority: z.number().optional() }),
        execute: async (params) => this.taskManagerTool.save(params),
      }),
      taskManagerRemoveJob: tool({
        description: "Removes a job by its ID.",
        parameters: z.object({ jobId: z.string() }),
        execute: async (params) => this.taskManagerTool.remove(params),
      }),
      fileSystemReadFile: tool({
        description: "Reads the content of a file at a given path.",
        parameters: z.object({ filePath: z.string() }),
        execute: async (params) => this.fileSystemTool.readFile(params),
      }),
      fileSystemWriteFile: tool({
        description: "Writes content to a file at a given path. Creates directories if they don't exist.",
        parameters: z.object({ filePath: z.string(), content: z.string() }),
        execute: async (params) => this.fileSystemTool.writeFile(params),
      }),
      fileSystemListDirectory: tool({
        description: "Lists all files and directories within a given path.",
        parameters: z.object({ dirPath: z.string() }),
        execute: async (params) => this.fileSystemTool.listDirectory(params),
      }),
      fileSystemCreateDirectory: tool({
        description: "Creates a new directory at the specified path, including parent directories if needed.",
        parameters: z.object({ dirPath: z.string() }),
        execute: async (params) => this.fileSystemTool.createDirectory(params)
      }),
      fileSystemRemoveFile: tool({
        description: "Deletes a file at the specified path.",
        parameters: z.object({ filePath: z.string() }),
        execute: async (params) => this.fileSystemTool.removeFile(params)
      }),
      fileSystemRemoveDirectory: tool({
        description: "Deletes a directory and its contents recursively at the specified path.",
        parameters: z.object({ dirPath: z.string() }),
        execute: async (params) => this.fileSystemTool.removeDirectory(params)
      }),
      annotationSave: tool({
        description: "Saves an annotation (note or comment). Useful for logging thoughts, decisions, or progress.",
        parameters: z.object({ text: z.string(), agentId: z.string().optional(), jobId: z.string().optional() }),
        execute: async (params) => this.annotationTool.save({...params, agentId: this.persona.role }) // Auto-assign agentId from persona
      }),
      annotationList: tool({
        description: "Lists annotations made by this agent.",
        parameters: z.object({ limit: z.number().optional(), offset: z.number().optional() }),
        execute: async (params) => this.annotationTool.list({...params, agentId: this.persona.role }),
      }),
    };
  }

  async process(job: Job<OrchestratorAgentPayload, OrchestratorAgentResult>): Promise<OrchestratorAgentResult> {
    console.log(`
${this.name} (Job ID: ${job.id}): Processing goal: "${job.payload.goal}"`);
    let currentPlan = job.payload.currentPlan || [];
    let completedSteps = job.payload.completedSteps || 0;
    let accumulatedOutput: any[] = [];

    // --- Ensure API Key is available ---
    if (!process.env.DEEPSEEK_API_KEY) {
        console.error(`${this.name}: DEEPSEEK_API_KEY is not set. Cannot proceed with LLM tasks.`);
        return { status: 'failed', message: "DEEPSEEK_API_KEY is not configured." };
    }

    // --- STEP 1: Planning (LLM Call) ---
    if (currentPlan.length === 0) {
      console.log(`${this.name}: Planning phase starting for goal: "${job.payload.goal}"`);
      const systemPrompt = \`You are ${this.persona.role}, an AI assistant. Your goal is: ${this.persona.goal}. Your backstory is: ${this.persona.backstory}.
      You need to achieve the following high-level task: "${job.payload.goal}".
      Based on this task, generate a detailed, step-by-step plan using ONLY the available tools.
      Each step in the plan should specify the exact tool method to call and the parameters for that method.
      Be methodical. Think step by step. If a task involves multiple operations (e.g. read, then write), make them separate steps.
      If you need to create a file and then write to it, ensure 'fileSystemWriteFile' is used with content.
      For file or directory removal, ensure the correct tool is chosen ('fileSystemRemoveFile' or 'fileSystemRemoveDirectory').
      You can use 'annotationSave' to log your thoughts or progress at any step.\`;

      try {
        const { object: planObject } = await generateObject({
          model: deepseek('deepseek-chat'), // Use a model that supports tool calling well
          system: systemPrompt,
          prompt: `Generate a plan to achieve the task: "${job.payload.goal}". Context: ${JSON.stringify(job.payload.initialContext || {})}`,
          schema: z.object({
            plan: z.array(
              z.object({
                tool: z.string().describe("Full tool name, e.g., 'fileSystemReadFile' or 'annotationSave'."),
                params: z.any().describe("Parameters object for the tool call."),
                description: z.string().describe("Your description of what this step achieves."),
              })
            ).describe("The sequence of tool calls to achieve the goal."),
            initialThought: z.string().describe("Your initial thought process or summary of the plan.")
          }),
        });

        if (!planObject.plan || planObject.plan.length === 0) {
          console.warn(`${this.name}: LLM did not generate a plan.`);
          return { status: 'failed', message: 'LLM failed to generate a plan.' };
        }
        currentPlan = planObject.plan as PlanStep[];
        console.log(`${this.name}: Plan generated by LLM: ${planObject.initialThought}`);
        currentPlan.forEach((step, idx) => console.log(`  Step ${idx + 1}: ${step.description} (Tool: ${step.tool}, Params: ${JSON.stringify(step.params)})`));

        // Save an annotation about the plan
        await this.annotationTool.save({ text: `Generated plan for goal "${job.payload.goal}": ${planObject.initialThought}`, agentId: this.persona.role, jobId: job.id });

      } catch (error) {
        console.error(`${this.name}: Error during LLM planning phase:`, error);
        return { status: 'failed', message: `LLM planning error: ${error instanceof Error ? error.message : 'Unknown error'}` };
      }
    } else {
      console.log(`${this.name}: Resuming execution of existing plan from step ${completedSteps + 1}.`);
    }

    // --- STEP 2: Execution ---
    console.log(`${this.name}: Execution phase starting.`);
    try {
      for (let i = completedSteps; i < currentPlan.length; i++) {
        const step = currentPlan[i];
        console.log(`${this.name}: Executing Step ${i + 1}/${currentPlan.length}: ${step.description} (Tool: ${step.tool})`);

        const toolMethod = this.aiTools[step.tool]?.execute;
        if (!toolMethod) {
          throw new Error(`Unknown tool or method: ${step.tool}`);
        }

        const result = await toolMethod(step.params);
        console.log(`${this.name}: Step ${i + 1} result:`, result !== undefined ? result : "No explicit result (void)");
        accumulatedOutput.push({ step: step.description, tool: step.tool, params: step.params, result: result !== undefined ? result : "void" });
        completedSteps = i + 1;

        // Simple re-queuing logic: After each step, save progress and re-queue.
        // More sophisticated logic could decide to run more steps before re-queuing.
        // This ensures that if a step takes long or the agent is stopped, progress isn't lost
        // and other jobs can be picked up.
        if (i < currentPlan.length - 1) {
            console.log(`${this.name}: Step ${completedSteps} completed. Re-queuing job to continue plan.`);
            job.payload.currentPlan = currentPlan;
            job.payload.completedSteps = completedSteps;
            // This would require the job entity/props to be mutable or a new job instance created for saving.
            // For simplicity, we assume job.payload can be updated. In a real system, Job entity methods would handle this.
            // await this.taskManagerTool.save(job.props as any); // This needs job.props to be SaveJobDTO compatible

            // For the purpose of this subtask, we'll simulate the re-queue by returning 'in_progress_step_complete'
            // The actual call to taskManagerTool.save(job) would be needed in a full worker loop.
            return {
                status: 'in_progress_step_complete',
                message: `Step ${completedSteps} ('${step.description}') completed. Plan execution paused, ready for next step.`,
                remainingPlan: currentPlan,
                currentStepIndex: completedSteps,
                output: accumulatedOutput
            };
        }
      }

      console.log(`${this.name}: All plan steps executed successfully for goal: "${job.payload.goal}"`);
      await this.annotationTool.save({ text: `Successfully completed goal "${job.payload.goal}"`, agentId: this.persona.role, jobId: job.id });
      return {
        status: 'completed',
        message: `Goal "${job.payload.goal}" achieved successfully.`,
        output: accumulatedOutput,
      };

    } catch (error) {
      console.error(`${this.name}: Error during plan execution (Step ${completedSteps + 1} - ${currentPlan[completedSteps]?.tool}):`, error);
      await this.annotationTool.save({ text: `Error during execution of goal "${job.payload.goal}" at step ${completedSteps + 1} (${currentPlan[completedSteps]?.tool}): ${error instanceof Error ? error.message : 'Unknown error'}`, agentId: this.persona.role, jobId: job.id });
      return {
        status: 'failed',
        message: `Error executing step ${completedSteps + 1} ('${currentPlan[completedSteps]?.description}'): ${error instanceof Error ? error.message : 'Unknown error'}`,
        output: accumulatedOutput
      };
    }
  }
}
