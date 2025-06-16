// src/core/agents/generic-agent-executor.ts
import { AgentPersonaTemplate } from '../domain/entities/agent/persona-template.types';
import { Job } from '../domain/entities/jobs/job.entity';
import { toolRegistry, ToolRegistry } from '../../infrastructure/tools/tool-registry'; // Assuming singleton instance
import { IAgentTool } from '../tools/tool.interface';

import { generateObject, tool as aiToolHelper, Tool } from 'ai'; // Renamed 'tool' to 'aiToolHelper' to avoid conflict
import { z } from 'zod';
import { deepseek } from '@ai-sdk/deepseek'; // Or your chosen LLM provider

// Define structure for agent state stored within Job.data
export interface AgentJobState {
  currentPlan: PlanStep[];
  completedSteps: number;
  // internalScratchpad?: Record<string, any>; // For more complex state
  executionHistory?: { step: number; tool: string; params: any; result: any; error?: string }[];
}

// Define a structure for plan steps (consistent with OrchestratorAgent)
export interface PlanStep extends Record<string, any> {
  tool: string; // Name of the tool from ToolRegistry, e.g., 'fileSystem.readFile'
  params: any;  // Parameters for the tool method
  description: string; // LLM-generated description of what this step does
}

// Define the result structure for the executor's process method
export type AgentExecutorResultStatus = 'COMPLETED' | 'FAILED' | 'CONTINUE_PROCESSING';
export interface AgentExecutorResult {
  status: AgentExecutorResultStatus;
  message: string;
  output?: any; // Final output or accumulated outputs
  // jobDataToUpdate: Partial<Pick<JobProps, 'data'>>; // The calling worker will handle job saving
}

export class GenericAgentExecutor {
  private personaTemplate: AgentPersonaTemplate;
  private toolRegistryInstance: ToolRegistry;
  private availableAiTools: Record<string, Tool<any, any>>; // For ai-sdk { [toolName]: toolDefinition }

  constructor(personaTemplate: AgentPersonaTemplate, toolReg: ToolRegistry = toolRegistry) {
    this.personaTemplate = personaTemplate;
    this.toolRegistryInstance = toolReg;
    this.availableAiTools = this.prepareAiToolsForPersona();

    if (Object.keys(this.availableAiTools).length === 0) {
        console.warn(`GenericAgentExecutor for ${this.personaTemplate.role}: No tools found or loaded from registry for tool names: ${this.personaTemplate.toolNames.join(', ')}. Agent may not be able to perform actions.`);
    } else {
        console.log(`GenericAgentExecutor for ${this.personaTemplate.role} initialized with tools: ${Object.keys(this.availableAiTools).join(', ')}`);
    }
  }

  private prepareAiToolsForPersona(): Record<string, Tool<any, any>> {
    const toolsForSdk: Record<string, Tool<any, any>> = {};
    this.personaTemplate.toolNames.forEach(toolName => {
      const toolInstance = this.toolRegistryInstance.getTool(toolName);
      if (toolInstance) {
        toolsForSdk[toolInstance.name] = aiToolHelper({ // Using the imported 'aiToolHelper'
          description: toolInstance.description,
          parameters: toolInstance.parameters, // This is the Zod schema
          execute: async (params) => toolInstance.execute(params, { agentId: this.personaTemplate.id, role: this.personaTemplate.role /*, jobId: currentJob.id */ }), // Pass context if needed
        });
      } else {
        console.warn(`GenericAgentExecutor: Tool '${toolName}' specified in persona template '${this.personaTemplate.id}' not found in ToolRegistry.`);
      }
    });
    return toolsForSdk;
  }

  public async processJob(job: Job<any, any>): Promise<AgentExecutorResult> {
    console.log(`
AgentExecutor (${this.personaTemplate.role} - ${this.personaTemplate.id}): Processing Job ID ${job.id}, Name: ${job.name}`);
    const jobGoal = job.payload?.goal || job.name; // Assuming goal is in payload or use job name

    // --- 1. Initialize or Load Agent State from Job ---
    let agentState: AgentJobState = job.data?.agentState || {
      currentPlan: [],
      completedSteps: 0,
      executionHistory: [],
    };
    // Ensure executionHistory is initialized
    agentState.executionHistory = agentState.executionHistory || [];


    // --- 2. API Key Check ---
    if (!process.env.DEEPSEEK_API_KEY) { // Or your chosen LLM provider's key
      console.error(`AgentExecutor (${this.personaTemplate.role}): LLM API Key not set.`);
      agentState.executionHistory.push({ step: agentState.completedSteps, tool: 'system', params: {}, result: null, error: "LLM API Key not set." });
      job.data = { ...job.data, agentState }; // Persist error in history
      return { status: 'FAILED', message: "LLM API Key not configured.", /*jobDataToUpdate: { data: job.data }*/ };
    }

    // --- 3. Planning Phase (if no plan or plan is completed but goal might not be) ---
    // Simple model: if plan is empty, generate one. If plan exists, execute next step.
    // More complex: LLM could be asked to verify plan completion or re-plan if context changes.
    if (agentState.currentPlan.length === 0 || agentState.completedSteps === agentState.currentPlan.length) {
        // If plan was completed, but we are called again, it might mean previous execution was only partial
        // or the goal is not yet met. For now, if plan is "done", we assume goal is met unless error.
        // A more robust system might re-evaluate. If currentPlan exists and completedSteps == length, we assume it's done.
        if (agentState.currentPlan.length > 0 && agentState.completedSteps === agentState.currentPlan.length) {
             console.log(`AgentExecutor (${this.personaTemplate.role}): Existing plan completed. Assuming goal achieved.`);
             job.data = { ...job.data, agentState };
             return { status: 'COMPLETED', message: 'Previously completed plan executed.', output: agentState.executionHistory, /*jobDataToUpdate: { data: job.data }*/ };
        }

      console.log(`AgentExecutor (${this.personaTemplate.role}): Planning phase for goal: "${jobGoal}"`);
      const systemPrompt = \`You are ${this.personaTemplate.role}. Your primary goal is: "${this.personaTemplate.goal}". Your backstory is: "${this.personaTemplate.backstory}".
You are currently working on the task: "${jobGoal}".
Generate a step-by-step plan to achieve this task using ONLY the tools available to you.
Available tools: ${Object.values(this.availableAiTools).map(t => t.description).join(', ')}.
Each step in your plan must specify the exact tool name (e.g., 'fileSystem.readFile') and its parameters.
Be methodical. If a task involves multiple operations (e.g., read a file, then write a modified version), make them separate, sequential steps.
If the goal is simple and can be achieved with one tool call, create a plan with one step.\`;

      try {
        const { object: planObject } = await generateObject({
          model: deepseek('deepseek-chat'),
          system: systemPrompt,
          prompt: \`Generate a plan for task: "${jobGoal}".
Initial job payload/context (if any): ${JSON.stringify(job.payload)}\`,
          schema: z.object({
            plan: z.array(
              z.object({
                tool: z.string().describe("Full tool name from the available tools list."),
                params: z.any().describe("Parameters object for the tool call."),
                description: z.string().describe("Your description of what this step achieves."),
              })
            ).describe("The sequence of tool calls to achieve the goal. Should not be empty unless goal is trivial and unachievable with tools."),
            initialThought: z.string().describe("Your brief rationale for this plan."),
          }),
          // Pass the dynamically prepared tools for this persona
          tools: this.availableAiTools
        });

        if (!planObject.plan || planObject.plan.length === 0) {
          console.warn(`AgentExecutor (${this.personaTemplate.role}): LLM did not generate a plan for "${jobGoal}".`);
          agentState.executionHistory.push({ step: agentState.completedSteps, tool: 'planner', params: {}, result: null, error: "LLM failed to generate a plan." });
          job.data = { ...job.data, agentState };
          return { status: 'FAILED', message: 'LLM failed to generate a plan.', /*jobDataToUpdate: { data: job.data }*/ };
        }
        agentState.currentPlan = planObject.plan as PlanStep[];
        agentState.completedSteps = 0; // Reset completed steps for new plan
        agentState.executionHistory.push({ step: 0, tool: 'planner', params: { goal: jobGoal }, result: { thought: planObject.initialThought, plan: agentState.currentPlan }, error: undefined });

        console.log(`AgentExecutor (${this.personaTemplate.role}): Plan generated: ${planObject.initialThought}`);
        agentState.currentPlan.forEach((step, idx) => console.log(`  Step ${idx + 1}: ${step.description} (Tool: ${step.tool})`));

      } catch (error) {
        console.error(`AgentExecutor (${this.personaTemplate.role}): Error during LLM planning phase:`, error);
        agentState.executionHistory.push({ step: agentState.completedSteps, tool: 'planner', params: {}, result: null, error: \`LLM planning error: ${error instanceof Error ? error.message : 'Unknown error'}\` });
        job.data = { ...job.data, agentState };
        return { status: 'FAILED', message: \`LLM planning error: ${error instanceof Error ? error.message : 'Unknown error'}\`, /*jobDataToUpdate: { data: job.data }*/ };
      }
    } else {
      console.log(`AgentExecutor (${this.personaTemplate.role}): Resuming execution of existing plan from step ${agentState.completedSteps + 1}. Total steps: ${agentState.currentPlan.length}`);
    }

    // --- 4. Execution Phase ---
    if (agentState.completedSteps < agentState.currentPlan.length) {
      const stepToExecute = agentState.currentPlan[agentState.completedSteps];
      console.log(`AgentExecutor (${this.personaTemplate.role}): Executing Step ${agentState.completedSteps + 1}/${agentState.currentPlan.length}: ${stepToExecute.description} (Tool: ${stepToExecute.tool})`);

      const toolToCall = this.availableAiTools[stepToExecute.tool]; // This is an ai-sdk prepared tool object
      if (!toolToCall || typeof toolToCall.execute !== 'function') {
         const errorMsg = `Execution error: Tool '${stepToExecute.tool}' not found or not executable in prepared tools.`;
        console.error(`AgentExecutor (${this.personaTemplate.role}): ${errorMsg}`);
        agentState.executionHistory.push({ step: agentState.completedSteps + 1, tool: stepToExecute.tool, params: stepToExecute.params, result: null, error: errorMsg });
        job.data = { ...job.data, agentState };
        return { status: 'FAILED', message: errorMsg, /*jobDataToUpdate: { data: job.data }*/ };
      }

      try {
        // The `toolToCall.execute` is already the bound `execute` from the IAgentTool instance,
        // wrapped by ai-sdk's `tool` helper.
        // The `ai-sdk` `tool` helper's `execute` expects the validated params.
        // The `generateObject` function, when it decides to call a tool, typically provides the params.
        // Here, we are manually executing a plan step, so we call the original tool's execute method.
        // This part needs refinement: we should use the `toolToCall` which is the ai-sdk tool object,
        // or directly call the original tool method from toolRegistry.
        // Let's assume we call the original tool method for directness in a manual loop.
        const originalToolInstance = this.toolRegistryInstance.getTool(stepToExecute.tool);
        if (!originalToolInstance) throw new Error (\`Original tool instance for '${stepToExecute.tool}' not found in registry\`);

        // Validate params with the tool's Zod schema before execution
        const validationResult = originalToolInstance.parameters.safeParse(stepToExecute.params);
        if (!validationResult.success) {
            throw new Error(\`Invalid parameters for tool '${stepToExecute.tool}': ${validationResult.error.errors.map(e => e.message).join(', ')}\`);
        }

        const result = await originalToolInstance.execute(validationResult.data, { agentId: this.personaTemplate.id, role: this.personaTemplate.role, jobId: job.id });

        console.log(`AgentExecutor (${this.personaTemplate.role}): Step ${agentState.completedSteps + 1} result:`, result !== undefined ? result : "No explicit result (void)");
        agentState.executionHistory.push({ step: agentState.completedSteps + 1, tool: stepToExecute.tool, params: validationResult.data, result: result !== undefined ? result : "void", error: undefined });
        agentState.completedSteps++;
        job.data = { ...job.data, agentState }; // Persist state after each successful step

        if (agentState.completedSteps < agentState.currentPlan.length) {
          console.log(`AgentExecutor (${this.personaTemplate.role}): Step completed. Requesting continuation.`);
          return { status: 'CONTINUE_PROCESSING', message: `Step ${agentState.completedSteps} ('${stepToExecute.description}') completed. Plan execution paused, ready for next step.`, /*jobDataToUpdate: { data: job.data }*/ };
        } else {
          console.log(`AgentExecutor (${this.personaTemplate.role}): All plan steps executed successfully for goal: "${jobGoal}"`);
          return { status: 'COMPLETED', message: `Goal "${jobGoal}" achieved successfully.`, output: agentState.executionHistory, /*jobDataToUpdate: { data: job.data }*/ };
        }

      } catch (error) {
        console.error(`AgentExecutor (${this.personaTemplate.role}): Error during plan execution (Step ${agentState.completedSteps + 1} - ${stepToExecute.tool}):`, error);
        agentState.executionHistory.push({ step: agentState.completedSteps + 1, tool: stepToExecute.tool, params: stepToExecute.params, result: null, error: \`Execution error: ${error instanceof Error ? error.message : 'Unknown error'}\` });
        job.data = { ...job.data, agentState };
        return { status: 'FAILED', message: \`Error executing step ${agentState.completedSteps + 1} ('${stepToExecute.description}'): ${error instanceof Error ? error.message : 'Unknown error'}\`, /*jobDataToUpdate: { data: job.data }*/ };
      }
    } else {
      // This case (plan exists and all steps completed) should ideally be caught at the beginning of the method.
      console.log(`AgentExecutor (${this.personaTemplate.role}): All plan steps previously executed.`);
      job.data = { ...job.data, agentState };
      return { status: 'COMPLETED', message: 'All plan steps previously executed.', output: agentState.executionHistory, /*jobDataToUpdate: { data: job.data }*/ };
    }
  }
}
