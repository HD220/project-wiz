// src/infrastructure/agents/generic-agent-executor.ts
import { AgentPersonaTemplate } from '../../core/domain/entities/agent/persona-template.types';
import { Job } from '../../core/domain/entities/jobs/job.entity';
import { toolRegistry, ToolRegistry } from './tool-registry';
import { IAgentTool } from '../../core/tools/tool.interface';
import {
  AgentJobState,
  AgentExecutorResult
} from '../../core/domain/jobs/job-processing.types'; // PlanStep removed
import { IAgentExecutor } from '../../core/ports/agent/agent-executor.interface';

import { generateObject, tool as aiToolHelper, Tool, Message, generateText } from 'ai'; // ToolInvocation, ToolResult not directly used by this class anymore
import { z } from 'zod';
import { deepseek } from '@ai-sdk/deepseek'; // Or your chosen LLM provider

export class GenericAgentExecutor implements IAgentExecutor {
  private personaTemplate: AgentPersonaTemplate;
  private toolRegistryInstance: ToolRegistry;
  private availableAiTools: Record<string, Tool<any, any>>;

  private readonly MAX_HISTORY_MESSAGES_BEFORE_SUMMARY = 20;
  private readonly NUM_MESSAGES_TO_SUMMARIZE_CHUNK = 10; // Number of messages in the chunk to summarize
  private readonly PRESERVE_INITIAL_MESSAGES_COUNT = 2;  // System prompt + initial User prompt

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

  private async _summarizeFailedAttempt(
    historyToSummarize: Message[],
    jobGoal: string,
    replanReason: string
  ): Promise<string> {
    console.log(`GenericAgentExecutor (${this.personaTemplate.role}): Summarizing failed attempt for re-planning.`);
    if (historyToSummarize.length === 0) {
      return "No specific history for failed attempt, but re-plan requested by LLM. Reason: " + replanReason;
    }

    // Keep the history for summarization manageable, e.g., last 10-15 messages if it's extremely long
    const relevantHistory = historyToSummarize.slice(-15); // Take last 15 messages for summary context

    const summarizationPrompt = \`The overall goal was: "${jobGoal}".
A previous attempt to achieve this goal using a sequence of tool calls and reasoning has failed.
The reason given by the AI planning module for requesting a full re-plan is: "${replanReason}".
The recent conversation history leading to this decision was:
${relevantHistory.map(msg => `${msg.role}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`).join('\n')}
---
Create a very concise summary of this failed attempt, highlighting the critical error or reason for failure and the decision to re-plan. This summary will inform a new planning cycle.\`;

    try {
      // Using generateText for a simple text summary
      const { text: summaryText } = await generateText({
        model: deepseek('deepseek-chat'), // Use a fast model for summarization
        prompt: summarizationPrompt,
        // maxTokens: 150, // Keep summary concise
      });
      return summaryText || "Summary of failed attempt could not be generated, but re-plan was requested: " + replanReason;
    } catch (error) {
      console.error(\`GenericAgentExecutor (\${this.personaTemplate.role}): Error during failed attempt summarization LLM call:\`, error);
      return \`Error summarizing failed attempt. Re-plan requested by LLM due to: \${replanReason}\`;
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

  private async _summarizeOldestMessages(currentHistory: Message[], jobGoal: string): Promise<Message[]> {
    if (currentHistory.length <= this.MAX_HISTORY_MESSAGES_BEFORE_SUMMARY) {
      return currentHistory; // No summarization needed
    }

    console.log(`GenericAgentExecutor (${this.personaTemplate.role}): History length ${currentHistory.length} exceeds max ${this.MAX_HISTORY_MESSAGES_BEFORE_SUMMARY}. Attempting summarization.`);

    const preservedInitialMessages = currentHistory.slice(0, this.PRESERVE_INITIAL_MESSAGES_COUNT);

    // Determine the chunk to summarize
    // This chunk starts after the preserved initial messages.
    const summarizationChunk = currentHistory.slice(
      this.PRESERVE_INITIAL_MESSAGES_COUNT,
      this.PRESERVE_INITIAL_MESSAGES_COUNT + this.NUM_MESSAGES_TO_SUMMARIZE_CHUNK
    );

    // The rest of the messages after the chunk that was summarized
    const remainingLaterMessages = currentHistory.slice(
      this.PRESERVE_INITIAL_MESSAGES_COUNT + this.NUM_MESSAGES_TO_SUMMARIZE_CHUNK
    );

    if (summarizationChunk.length === 0) {
      console.warn(`GenericAgentExecutor (${this.personaTemplate.role}): Summarization triggered but no messages available in the designated chunk to summarize.`);
      return currentHistory; // Should not happen if MAX_HISTORY > PRESERVE_INITIAL + NUM_MESSAGES_TO_SUMMARIZE_CHUNK
    }

    const summarizationPrompt = \`Concisely summarize the key information, decisions, tool calls, tool results, and errors from the following conversation segment. This summary will replace these messages to save space for an ongoing task.
Overall Task Goal: "${jobGoal}"
Conversation segment to summarize:
${summarizationChunk.map(msg => `${msg.role}: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}`).join('\n')}
---
Provide a concise summary that retains all critical information for continuing the overall task:\`;

    try {
      // Using generateObject to potentially get a more structured summary if needed,
      // or just a text summary. For simplicity, let's expect a text summary.
      const { object: summaryObject } = await generateObject({
        model: deepseek('deepseek-chat'), // Or a specific summarization model
        prompt: summarizationPrompt,
        schema: z.object({
          summary: z.string().describe("Concise summary of the conversation segment."),
        }),
      });

      const summaryText = summaryObject.summary;

      if (!summaryText || summaryText.trim() === "") {
        console.warn(`GenericAgentExecutor (${this.personaTemplate.role}): Summarization LLM call returned empty summary. Original history preserved for this turn.`);
        return currentHistory;
      }

      const summaryMessage: Message = {
        role: 'system', // Or 'assistant' if preferred, 'system' might be good for "memory"
        content: \`Summary of preceding ${summarizationChunk.length} messages (approx. turns): ${summaryText}\`,
      };

      const newHistory = [...preservedInitialMessages, summaryMessage, ...remainingLaterMessages];
      console.log(\`GenericAgentExecutor (\${this.personaTemplate.role}): Conversation history summarized. Old length: \${currentHistory.length}, New length: \${newHistory.length}\`);
      return newHistory;

    } catch (error) {
      console.error(\`GenericAgentExecutor (\${this.personaTemplate.role}): Error during history summarization LLM call:\`, error);
      return currentHistory; // Return original history on summarization error
    }
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
      agentState.executionHistory.push({ timestamp: new Date(), type: 'system_error', name: 'api_key_check', params: {}, result: null, error: "LLM API Key not set." });
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
- If you determine that the current overall approach has fundamentally failed and you need to start fresh with a new plan to achieve the original task ("${jobGoal}"), you MUST indicate this by setting a 'requestReplan' flag to true in your response, along with a 'finalSummary' explaining the reason.

If you call a tool, I will execute it and give you back the result (or an error message if it fails).\`;
      agentState.conversationHistory.push({ role: 'system', content: systemPrompt });

      let initialUserContent = \`The task is: "${jobGoal}". Initial context (if any): ${JSON.stringify(job.payload?.initialContext || {})}.\`;
      if (job.data?.lastFailureSummary) {
        initialUserContent += \`
A previous attempt to solve this failed. Summary of that attempt: "${job.data.lastFailureSummary}". Please generate a new plan considering this past failure.\`;
        // Clear the summary after using it - decided against for now, see longer comment in prompt.
      }
      initialUserContent += " Please proceed.";
      agentState.conversationHistory.push({ role: 'user', content: initialUserContent });
    }

    // Summarize conversation history if needed
    agentState.conversationHistory = await this._summarizeOldestMessages(agentState.conversationHistory, jobGoal);

    console.log(`AgentExecutor (${this.personaTemplate.role}): Conversation length after potential summarization: ${agentState.conversationHistory.length}. Last message: ${agentState.conversationHistory[agentState.conversationHistory.length-1]?.content.substring(0,100)}`);

    try {
      const { messages: newMessages, toolCalls, toolResults, finishReason, usage, object: finalObject } = await generateObject({
        model: deepseek('deepseek-chat'),
        messages: agentState.conversationHistory,
        schema: z.object({
          finalSummary: z.string().describe("A summary of all actions taken and the final outcome if the goal is complete and no more tool calls are needed. If requesting a re-plan, this summary should explain why."),
          outputData: z.any().optional().describe("Any relevant data produced as a final result."),
          requestReplan: z.boolean().optional().describe("Set to true if you determine the current approach/plan has failed due to an unrecoverable error with a tool, and a completely new plan is needed to achieve the original goal. If true, also explain why in 'finalSummary'.")
        }),
        tools: this.availableAiTools,
        maxToolRoundtrips: 1,
      });

      agentState.conversationHistory = newMessages;

      if (finalObject?.requestReplan === true) {
        console.log(`AgentExecutor (${this.personaTemplate.role}): LLM requested a re-plan. Reason: ${finalObject.finalSummary}`);
        agentState.executionHistory?.push({
          timestamp: new Date(),
          type: 'llm_event',
          name: 'replan_requested',
          params: { reason: finalObject.finalSummary },
          result: null,
          error: undefined
        });

        // Summarize the failed attempt to provide context for the new plan
        const failureSummary = await this._summarizeFailedAttempt(
          agentState.conversationHistory, // Pass the history that includes the failure and replan request
          jobGoal,
          finalObject.finalSummary
        );

        // Signal to re-initialize history in the next turn with failure context
        agentState.conversationHistory = []; // Mark history as needing re-init
        // Store summary for re-initialization
        job.data = {
          ...job.data,
          agentState,
          lastFailureSummary: failureSummary // Store summary at job.data level
        };

        return {
          status: 'CONTINUE_PROCESSING',
          message: "Re-planning initiated by LLM. Previous attempt summarized. Ready for new planning cycle."
        };
      }

      if (toolCalls && toolCalls.length > 0) {
        console.log(`AgentExecutor (${this.personaTemplate.role}): LLM decided to call ${toolCalls.length} tool(s). SDK handled execution.`);
        toolCalls.forEach(tc => {
          const tr = toolResults?.find(r => r.toolCallId === tc.toolCallId);
          agentState.executionHistory?.push({
              timestamp: new Date(),
              type: 'tool_call',
              name: tc.toolName,
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
        agentState.executionHistory?.push({ timestamp: new Date(), type: 'llm_event', name: 'goal_completed', params: { finalDecision: true }, result: finalObject, error: undefined });
        job.data = { ...job.data, agentState };
        return { status: 'COMPLETED', message: finalObject?.finalSummary || "Goal achieved.", output: finalObject?.outputData };

      } else if (finishReason === 'error') {
          console.error(`AgentExecutor (${this.personaTemplate.role}): LLM generation error.`);
          agentState.executionHistory?.push({ timestamp: new Date(), type: 'llm_error', name: 'generation', params: {}, result: null, error: "LLM generation error" });
          job.data = { ...job.data, agentState };
          return { status: 'FAILED', message: 'LLM generation error.' };

      } else if (finishReason === 'tool-calls' && (!toolCalls || toolCalls.length === 0)) {
          console.warn(`AgentExecutor (${this.personaTemplate.role}): LLM finishReason was 'tool-calls' but no toolCalls were processed/returned. This may indicate the LLM tried to call a tool it doesn't have or formatted its request incorrectly.`);
          agentState.executionHistory?.push({ timestamp: new Date(), type: 'llm_warning', name: 'tool_call_mismatch', params: {}, result: null, error: "LLM indicated tool_calls finish reason but no valid calls were processed." });
          job.data = { ...job.data, agentState };
          return { status: 'CONTINUE_PROCESSING', message: 'LLM intended tool use, but no valid tool calls were made. Review conversation history.' };
      }

      console.warn(\`AgentExecutor (\${this.personaTemplate.role}): LLM interaction finished with unhandled reason: \${finishReason}\`);
      agentState.executionHistory?.push({ timestamp: new Date(), type: 'llm_warning', name: 'unhandled_finish_reason', params: { finishReason }, result: null, error: \`LLM interaction finished with unhandled reason: \${finishReason}\` });
      job.data = { ...job.data, agentState };
      return { status: 'FAILED', message: \`LLM interaction finished with unhandled reason: \${finishReason}\` };

    } catch (error) {
      console.error(`AgentExecutor (${this.personaTemplate.role}): Error during LLM interaction or tool execution:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      agentState.executionHistory?.push({ timestamp: new Date(), type: 'system_error', name: 'processJob_exception', params: {}, result: null, error: \`LLM/Tool error: ${errorMessage}\` });
      job.data = { ...job.data, agentState };
      return { status: 'FAILED', message: \`Error during LLM interaction: ${errorMessage}\` };
    }
  }
}
