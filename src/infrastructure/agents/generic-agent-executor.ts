// src/infrastructure/agents/generic-agent-executor.ts
import { AgentPersonaTemplate } from '../../core/domain/entities/agent/persona-template.types';
import { Job } from '../../core/domain/entities/jobs/job.entity';
import { toolRegistry, ToolRegistry } from './tool-registry';
import { IAgentTool } from '../../core/tools/tool.interface';
import {
  AgentJobState,
  // PlanStep, // No longer using pre-defined PlanStep for iterative execution
  AgentExecutorResult
} from '../../core/domain/jobs/job-processing.types';
import { IAgentExecutor } from '../../core/ports/agent/agent-executor.interface';

import { generateObject, tool as aiToolHelper, Tool, Message, ToolInvocation, ToolResult } from 'ai';
import { z } from 'zod';
import { deepseek } from '@ai-sdk/deepseek'; // Or your chosen LLM provider

export class GenericAgentExecutor implements IAgentExecutor {
  private personaTemplate: AgentPersonaTemplate;
  private toolRegistryInstance: ToolRegistry;
  private availableAiTools: Record<string, Tool<any, any>>;

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
        toolsForSdk[toolInstance.name] = aiToolHelper({
          description: toolInstance.description,
          parameters: toolInstance.parameters,
          execute: async (params) => toolInstance.execute(params, { agentId: this.personaTemplate.id, role: this.personaTemplate.role }),
        });
      } else {
        console.warn(`GenericAgentExecutor: Tool '${toolName}' specified in persona template '${this.personaTemplate.id}' not found in ToolRegistry.`);
      }
    });
    return toolsForSdk;
  }

  public async processJob(job: Job<any, any>): Promise<AgentExecutorResult> {
    console.log(`
AgentExecutor (${this.personaTemplate.role} - ${this.personaTemplate.id}): Iteratively Processing Job ID ${job.id}, Name: ${job.name}`);
    const jobGoal = job.payload?.goal || job.name;

    let agentState: AgentJobState = job.data?.agentState || {
      conversationHistory: [],
      executionHistory: [],
    };
    agentState.conversationHistory = agentState.conversationHistory || [];
    agentState.executionHistory = agentState.executionHistory || [];

    // --- API Key Check ---
    if (!process.env.DEEPSEEK_API_KEY) { // Or your chosen LLM provider's key
      console.error(`AgentExecutor (${this.personaTemplate.role}): LLM API Key not set.`);
      agentState.executionHistory.push({ tool: 'system', params: {}, result: null, error: "LLM API Key not set." });
      job.data = { ...job.data, agentState };
      return { status: 'FAILED', message: "LLM API Key not configured." };
    }

    // --- Construct initial messages if history is empty ---
    if (agentState.conversationHistory.length === 0) {
      const systemPrompt = \`You are ${this.personaTemplate.role}. Your primary goal is: "${this.personaTemplate.goal}". Your backstory is: "${this.personaTemplate.backstory}".
You are currently working on the overall task: "${jobGoal}".
You have access to the following tools:
${Object.entries(this.availableAiTools).map(([name, toolDef]) => `- ${name}: ${toolDef.description}`).join('\n')}
Based on the user's request and the conversation history (which will include results or errors from previous tool calls), decide the next action. This could be calling one of your tools or providing a final answer if the goal is achieved.

**Error Handling and Re-planning:**
If a previous tool call resulted in an error, that error information will be in the conversation history. You MUST analyze this error.
- If the error seems temporary or due to incorrect parameters you provided, you MAY try the same tool again with corrected parameters, or try a different tool if more appropriate.
- If a tool consistently fails, or if the error indicates a fundamental problem with achieving a step, explain the issue in your final summary and indicate why the goal cannot be fully achieved.
- Do not repeatedly try the same failing tool call with the same parameters. Adapt your plan.

If you call a tool, I will execute it and give you back the result (or an error message if it fails).\`;
      agentState.conversationHistory.push({ role: 'system', content: systemPrompt });
      agentState.conversationHistory.push({ role: 'user', content: \`The task is: "${jobGoal}". Initial context (if any): ${JSON.stringify(job.payload?.initialContext || {})}. Please proceed.\` });
    }

    console.log(`AgentExecutor (${this.personaTemplate.role}): Current conversation length: ${agentState.conversationHistory.length}. Last message: ${agentState.conversationHistory[agentState.conversationHistory.length-1]?.content.substring(0,100)}`);

    try {
      const { messages: newMessages, toolCalls, toolResults, finishReason, usage, object: finalObject } = await generateObject({
        model: deepseek('deepseek-chat'),
        messages: agentState.conversationHistory,
        schema: z.object({
          finalSummary: z.string().describe("A summary of all actions taken and the final outcome if the goal is complete and no more tool calls are needed."),
          outputData: z.any().optional().describe("Any relevant data produced as a final result."),
        }),
        tools: this.availableAiTools,
        maxToolRoundtrips: 1,
      });

      agentState.conversationHistory = newMessages;

      if (toolCalls && toolCalls.length > 0) {
        console.log(`AgentExecutor (${this.personaTemplate.role}): LLM decided to call ${toolCalls.length} tool(s). SDK handled execution.`);
        toolCalls.forEach(tc => {
          const tr = toolResults?.find(r => r.toolCallId === tc.toolCallId);
          agentState.executionHistory?.push({
              tool: tc.toolName,
              params: tc.args,
              result: tr?.result !== undefined ? tr.result : "No explicit result from tool execution by SDK.",
              error: tr?.result instanceof Error ? tr.result.message : undefined
          });
          console.log(\`  Tool call: ${tc.toolName}, Args: ${JSON.stringify(tc.args)}\`);
          if (tr) console.log(\`  Tool result: \${JSON.stringify(tr.result)}\`);
        });

        job.data = { ...job.data, agentState };
        return { status: 'CONTINUE_PROCESSING', message: `Executed tool(s): ${toolCalls.map(t => t.toolName).join(', ')}. Ready for next step.` };

      } else if (finishReason === 'stop' || finishReason === 'length') {
        console.log(`AgentExecutor (${this.personaTemplate.role}): Goal considered complete by LLM. Final summary: ${finalObject?.finalSummary}`);
        agentState.executionHistory?.push({ tool: 'LLM', params: { finalDecision: true }, result: finalObject, error: undefined });
        job.data = { ...job.data, agentState };
        return { status: 'COMPLETED', message: finalObject?.finalSummary || "Goal achieved.", output: finalObject?.outputData };

      } else if (finishReason === 'error') {
          console.error(`AgentExecutor (${this.personaTemplate.role}): LLM generation error.`);
          agentState.executionHistory?.push({ tool: 'LLM', params: {}, result: null, error: "LLM generation error" });
          job.data = { ...job.data, agentState };
          return { status: 'FAILED', message: 'LLM generation error.' };

      } else if (finishReason === 'tool-calls' && (!toolCalls || toolCalls.length === 0)) {
          // This condition means the LLM intended to call tools, but for some reason, they weren't captured or returned.
          // This might happen if the LLM's response format is off or if there's an issue with how ai-sdk processes it when no valid tool calls are made.
          console.warn(`AgentExecutor (${this.personaTemplate.role}): LLM finishReason was 'tool-calls' but no toolCalls were processed or returned. This may indicate the LLM tried to call a tool it doesn't have or formatted its request incorrectly.`);
          agentState.executionHistory?.push({ tool: 'LLM', params: {}, result: null, error: "LLM indicated tool_calls finish reason but no valid calls were processed." });
          job.data = { ...job.data, agentState };
          // Treat as needing continuation, as the LLM likely expects to make a tool call.
          return { status: 'CONTINUE_PROCESSING', message: 'LLM intended tool use, but no valid tool calls were made. Review conversation history.' };
      }

      console.warn(\`AgentExecutor (\${this.personaTemplate.role}): LLM interaction finished with unhandled reason: \${finishReason}\`);
      agentState.executionHistory?.push({ tool: 'LLM', params: {}, result: null, error: \`LLM interaction finished with unhandled reason: \${finishReason}\` });
      job.data = { ...job.data, agentState };
      return { status: 'FAILED', message: \`LLM interaction finished with unhandled reason: \${finishReason}\` };

    } catch (error) {
      console.error(`AgentExecutor (${this.personaTemplate.role}): Error during LLM interaction or tool execution:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      agentState.executionHistory?.push({ tool: 'system', params: {}, result: null, error: \`LLM/Tool error: ${errorMessage}\` });
      job.data = { ...job.data, agentState };
      return { status: 'FAILED', message: \`Error during LLM interaction: ${errorMessage}\` };
    }
  }
}
