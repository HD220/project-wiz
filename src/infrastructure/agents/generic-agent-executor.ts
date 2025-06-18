// src/infrastructure/agents/generic-agent-executor.ts
import { AgentPersonaTemplate } from '../../core/domain/entities/agent/persona-template.types';
import { Job } from '../../core/domain/entities/jobs/job.entity';
import { toolRegistry, ToolRegistry } from './tool-registry';
import { IAgentTool } from '../../core/tools/tool.interface';
import {
  AgentJobState,
  AgentExecutorResult
} from '../../core/domain/jobs/job-processing.types'; // PlanStep removed
import { JobRuntimeData } from '../../core/domain/entities/jobs/job-runtime-data.interface'; // Corrected import path
import { IAgentExecutor } from '../../core/ports/agent/agent-executor.interface';

import { generateObject, tool as aiToolHelper, Tool, Message, generateText, ToolCallPart, ToolResultPart } from 'ai';
import { z } from 'zod';
import { deepseek } from '@ai-sdk/deepseek'; // Or your chosen LLM provider
import { AnnotationTool } from '../tools/annotation.tool';

export class GenericAgentExecutor implements IAgentExecutor {
  private personaTemplate: AgentPersonaTemplate;
  private toolRegistryInstance: ToolRegistry;
  private availableAiTools: Record<string, Tool<any, any>>;
  private readonly internalAnnotationTool: AnnotationTool;

  private readonly MAX_HISTORY_MESSAGES_BEFORE_SUMMARY = 20;
  private readonly NUM_MESSAGES_TO_SUMMARIZE_CHUNK = 10; // Number of messages in the chunk to summarize
  private readonly PRESERVE_INITIAL_MESSAGES_COUNT = 2;  // System prompt + initial User prompt

  constructor(
    personaTemplate: AgentPersonaTemplate,
    toolReg: ToolRegistry = toolRegistry,
    internalAnnotationTool: AnnotationTool // Added new parameter
  ) {
    this.personaTemplate = personaTemplate;
    this.toolRegistryInstance = toolReg;
    this.internalAnnotationTool = internalAnnotationTool; // Assign to class property
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

  private _initializeConversationHistory(job: Job<any, any>, agentState: AgentJobState, jobGoal: string): void {
    const systemPrompt = \`You are \${this.personaTemplate.role}. Your primary goal is: "\${this.personaTemplate.goal}". Your backstory is: "\${this.personaTemplate.backstory}".
You are currently working on the overall task: "\${jobGoal}".
You have access to the following tools:
\${Object.entries(this.availableAiTools).map(([name, toolDef]) => `- \${name}: \${toolDef.description}`).join('\n')}

**Requirement Clarification:**
Before generating a plan or calling any tools, you MUST first assess the clarity of the overall task: "\${jobGoal}".
- If the task goal is ambiguous, lacks sufficient detail for you to create a concrete, actionable plan, or if you foresee multiple significantly different valid interpretations, your primary action is to ask clarifying questions.
- Formulate specific, numbered questions that, if answered, would provide the necessary details for you to proceed effectively.
- You MUST provide these questions in a 'clarifyingQuestions' array in your response.
- When you provide 'clarifyingQuestions', do not also attempt to call other tools or request a re-plan in the same response. Your sole focus should be on asking these questions. Await further input before proceeding with planning or execution.

**Workflow for Coding Tasks:**
When your task involves writing a script or code:
1. First, your primary output should be the complete code content as a string. Clearly indicate that this code is ready to be saved to a file.
2. In a subsequent step or as part of your plan, you MUST use the 'fileSystem.writeFile' tool to save this code to an appropriate file (e.g., 'script.js', 'module.ts'). You need to specify the full path and filename.
3. If execution of the script is required (either explicitly stated in the goal or as a logical next step), after successfully saving the file, you MUST use the 'terminal.executeCommand' tool.
   - For Node.js JavaScript files (.js), the command would typically be 'node path/to/your/script.js'.
   - For TypeScript files (.ts), you might use 'npx tsx path/to/your/script.ts' if 'tsx' is available, or plan for a transpilation step if necessary.
   - Ensure the command is executed in the correct working directory if relevant.
4. You should then analyze the output (stdout, stderr, exitCode) from 'terminal.executeCommand' to determine success or failure and report accordingly, or plan further steps if needed (like debugging).

Based on the user's request and the conversation history (which will include results or errors from previous tool calls), decide the next action. This could be calling one of your tools or providing a final answer if the goal is achieved.

**Error Handling and Re-planning:**
If a previous tool call resulted in an error, that error information will be in the conversation history. You MUST analyze this error.
- If the error seems temporary or due to incorrect parameters you provided, you MAY try the same tool again with corrected parameters, or try a different tool if more appropriate.
- If a tool consistently fails, or if the error indicates a fundamental problem with achieving a step, explain the issue in your final summary and indicate why the goal cannot be fully achieved.
- Do not repeatedly try the same failing tool call with the same parameters. Adapt your plan.
- If you determine that the current overall approach has fundamentally failed and you need to start fresh with a new plan to achieve the original task ("\${jobGoal}"), you MUST indicate this by setting a 'requestReplan' flag to true in your response, along with a 'finalSummary' explaining the reason.

If you call a tool, I will execute it and give you back the result (or an error message if it fails).\`;
    agentState.conversationHistory.push({ role: 'system', content: systemPrompt });

    let initialUserContent = \`The task is: "\${jobGoal}". Initial context (if any): \${JSON.stringify(job.payload?.initialContext || {})}.\`;
    // Access job.data directly here as we are within the class method that has access to the job object.
    // The JobRuntimeData type for job.data was defined in RT006.2
    if (job.data?.lastFailureSummary) {
      initialUserContent += \`
A previous attempt to solve this failed. Summary of that attempt: "\${job.data.lastFailureSummary}". Please generate a new plan considering this past failure.\`;
    }
    initialUserContent += " Please proceed.";
    agentState.conversationHistory.push({ role: 'user', content: initialUserContent });
  }

  private async _fetchNextLLMDecision(
    conversationHistory: Message[]
  ): Promise<{
    messages: Message[],
    toolCalls?: ToolCallPart[],
    toolResults?: ToolResultPart[],
    finishReason: string,
    usage: { promptTokens: number, completionTokens?: number, totalTokens: number },
    object: any
  }> {
    const llmResponseSchema = z.object({
      finalSummary: z.string().describe("A summary of all actions taken and the final outcome if the goal is complete and no more tool calls are needed. If requesting a re-plan or asking clarifying questions, this summary can provide context or state the questions if not using the dedicated field."),
      outputData: z.any().optional().describe("Any relevant data produced as a final result (not typically used when asking questions or requesting re-plan)."),
      requestReplan: z.boolean().optional().describe("Set to true if a completely new plan is needed due to unrecoverable errors. If true, explain why in 'finalSummary' and do not ask clarifying questions or call tools."),
      clarifyingQuestions: z.array(z.string()).optional().describe("If the task goal is ambiguous, provide a list of specific questions here. If you use this field, do not also set 'requestReplan' or expect tool calls in the same turn.")
    });

    const {
      messages,
      toolCalls,
      toolResults,
      finishReason,
      usage,
      object: finalObject
    } = await generateObject({
      model: deepseek('deepseek-chat'),
      messages: conversationHistory,
      schema: llmResponseSchema,
      tools: this.availableAiTools,
      maxToolRoundtrips: 1,
    });

    return { messages, toolCalls, toolResults, finishReason, usage, object: finalObject };
  }

  private async _executeToolsAndHandleResults(
    toolCalls: ToolCallPart[],
    currentConversationHistory: Message[], // Renamed to avoid conflict with agentState.conversationHistory
    job: Job<any,any>, // Added job for context if needed by tools, though not directly used in this simplified version
    agentState: AgentJobState // Passed for potential future use, not directly modified here for lastFailureSummary
  ): Promise<{ toolResults: ToolResultPart[], conversationHistory: Message[] }> {
    const toolResults: ToolResultPart[] = [];
    let updatedConversationHistory = [...currentConversationHistory];

    for (const toolCall of toolCalls) {
      console.log(`GenericAgentExecutor (${this.personaTemplate.role}): Processing tool call: \${toolCall.toolName}, Args:`, toolCall.args);
      // The AI SDK automatically adds the toolCall to the messages array.
      // If we were manually constructing, we'd add it here:
      // updatedConversationHistory.push(toolCall);

      const registeredTool = this.toolRegistryInstance.getTool(toolCall.toolName);

      if (!registeredTool) {
        const errorMsg = `Tool '\${toolCall.toolName}' not found in registry.`;
        console.error(`GenericAgentExecutor (${this.personaTemplate.role}): \${errorMsg}`);
        const errorResult: ToolResultPart = {
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          args: toolCall.args,
          result: { error: errorMsg },
        };
        toolResults.push(errorResult);
        updatedConversationHistory.push(errorResult);
        continue;
      }

      try {
        const executionResult = await registeredTool.execute(
          toolCall.args,
          { agentId: this.personaTemplate.id, role: this.personaTemplate.role } // Pass execution context
        );

        const toolResult: ToolResultPart = {
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          args: toolCall.args,
          result: executionResult,
        };
        toolResults.push(toolResult);
        updatedConversationHistory.push(toolResult);
        console.log(`GenericAgentExecutor (${this.personaTemplate.role}): Tool '\${toolCall.toolName}' executed. Result:`, executionResult);

      } catch (e: any) {
        const errorMsg = `Error executing tool '\${toolCall.toolName}': \${e.message}`;
        console.error(`GenericAgentExecutor (${this.personaTemplate.role}): \${errorMsg}`, e);
        const errorResult: ToolResultPart = {
          toolCallId: toolCall.toolCallId,
          toolName: toolCall.toolName,
          args: toolCall.args,
          result: { error: errorMsg }, // Ensure error is serializable
        };
        toolResults.push(errorResult);
        updatedConversationHistory.push(errorResult);
        // As per subtask: lastFailureSummary not updated here.
      }
    }
    return { toolResults, conversationHistory: updatedConversationHistory };
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
      job.setData({ ...(job.data || {}), agentState });
      return { status: 'FAILED', message: "LLM API Key not configured." };
    }

    // --- Construct initial messages if history is empty ---
    if (agentState.conversationHistory.length === 0) {
      this._initializeConversationHistory(job, agentState, jobGoal);
    }

    // Summarize conversation history if needed
    agentState.conversationHistory = await this._summarizeOldestMessages(agentState.conversationHistory, jobGoal);

    console.log(`AgentExecutor (${this.personaTemplate.role}): Conversation length after potential summarization: ${agentState.conversationHistory.length}. Last message: ${agentState.conversationHistory[agentState.conversationHistory.length-1]?.content.substring(0,100)}`);

    try {
      const {
        messages: newMessages,
        toolCalls,
        toolResults,
        finishReason,
        usage,
        object: finalObject
      } = await this._fetchNextLLMDecision(agentState.conversationHistory);

      agentState.conversationHistory = newMessages;

      // Ensure toolCalls and toolResults are defined before trying to access them,
      // even if the types from _fetchNextLLMDecision allow undefined.
      // The subsequent logic (e.g., if (toolCalls && toolCalls.length > 0)) already handles this.

      // IMPORTANT: The order of these checks matters.
      // 1. Clarifying questions: If LLM asks questions, we stop and wait for user.
      // 2. Re-plan: If LLM requests re-plan, we reset and prepare for new planning.
      // 3. Tool Calls: If LLM wants to use tools, we execute them.
      // 4. Stop/Completion: If LLM indicates completion.
      // 5. Errors/Other: Fallbacks.

      if (finalObject?.clarifyingQuestions && finalObject.clarifyingQuestions.length > 0) {
        console.log(`AgentExecutor (${this.personaTemplate.role}): LLM asked ${finalObject.clarifyingQuestions.length} clarifying questions for job ${job.id}.`);

        const questionsText = \`Clarifying questions for job '${job.id}' (Original Goal: "${jobGoal}"):
- ${finalObject.clarifyingQuestions.join('\n- ')}\`;

        try {
          await this.internalAnnotationTool.save({
            text: questionsText,
            agentId: this.personaTemplate.id,
            jobId: job.id,
            tags: ['clarification_needed', \`job:\${job.id}\`, \`agent_role:\${this.personaTemplate.role}\`]
          });
          console.log(`AgentExecutor (${this.personaTemplate.role}): Clarifying questions saved as annotation.`);

          agentState.executionHistory?.push({
            timestamp: new Date(),
            type: 'llm_event',
            name: 'clarification_questions_asked',
            params: { questions: finalObject.clarifyingQuestions },
            result: 'Clarifying questions saved as annotation.',
            error: undefined,
          });
        } catch (annotationError: any) {
          console.error(`AgentExecutor (${this.personaTemplate.role}): Failed to save clarifying questions as annotation:`, annotationError.message);
          agentState.executionHistory?.push({
            timestamp: new Date(),
            type: 'system_error',
            name: 'save_clarification_annotation_failed',
            params: { questions: finalObject.clarifyingQuestions },
            result: null,
            error: annotationError.message,
          });
        }

        job.setData({ ...(job.data || {}), agentState });
        return {
          status: 'CONTINUE_PROCESSING', // Or a new status like 'PENDING_USER_CLARIFICATION' if WorkerService is adapted
          message: \`Agent has clarifying questions regarding job ${job.id} (Goal: "${jobGoal}"). Check annotations tagged with 'clarification_needed' and 'job:${job.id}'. User input needed to update job or provide context.\`,
        };
      }

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
        // job.data is now managed by Job entity methods, use setData for type safety
        const newJobData: JobRuntimeData = {
          ...(job.data || {}), // Preserve existing fields from job.data
          agentState,       // Overwrite agentState
          lastFailureSummary: failureSummary // Add/overwrite lastFailureSummary
        };
        job.setData(newJobData);

        return {
          status: 'CONTINUE_PROCESSING',
          message: "Re-planning initiated by LLM. Previous attempt summarized. Ready for new planning cycle."
        };
      }

      if (toolCalls && toolCalls.length > 0) { // This block should now use _executeToolsAndHandleResults
        console.log(`AgentExecutor (${this.personaTemplate.role}): LLM returned ${toolCalls.length} tool call(s) to be executed.`);

        // Note: `agentState.conversationHistory` at this point includes the LLM's `tool_calls` message.
        // The `_executeToolsAndHandleResults` method will append `tool_results` messages to this history.
        const execOutcome = await this._executeToolsAndHandleResults(
          toolCalls,
          agentState.conversationHistory,
          job,
          agentState // Pass agentState for context, though it's not directly modified for lastFailureSummary inside
        );

        agentState.conversationHistory = execOutcome.conversationHistory; // Update history with tool results

        // Log tool executions to executionHistory
        // The `toolCalls` are what the LLM requested.
        // The `execOutcome.toolResults` are what our execution wrapper produced.
        toolCalls.forEach(requestedToolCall => {
          const result = execOutcome.toolResults.find(r => r.toolCallId === requestedToolCall.toolCallId);
          agentState.executionHistory?.push({
            timestamp: new Date(),
            type: 'tool_call',
            name: requestedToolCall.toolName,
            params: requestedToolCall.args,
            result: result?.result !== undefined ? result.result : "No explicit result from tool execution.",
            error: (result?.result as any)?.error ? String((result.result as any).error) : undefined,
          });
        });

        job.setData({ ...(job.data || {}), agentState });
        return { status: 'CONTINUE_PROCESSING', message: `Executed tool(s): ${toolCalls.map(t => t.toolName).join(', ')}. Ready for next LLM iteration.` };

      } else if (finishReason === 'stop' || finishReason === 'length') {
        console.log(`AgentExecutor (${this.personaTemplate.role}): Goal considered complete by LLM. Final summary: ${finalObject?.finalSummary}`);
        agentState.executionHistory?.push({ timestamp: new Date(), type: 'llm_event', name: 'goal_completed', params: { finalDecision: true }, result: finalObject, error: undefined });
        job.setData({ ...(job.data || {}), agentState });
        return { status: 'COMPLETED', message: finalObject?.finalSummary || "Goal achieved.", output: finalObject?.outputData };

      } else if (finishReason === 'error') {
          console.error(`AgentExecutor (${this.personaTemplate.role}): LLM generation error.`);
          agentState.executionHistory?.push({ timestamp: new Date(), type: 'llm_error', name: 'generation', params: {}, result: null, error: "LLM generation error" });
          job.setData({ ...(job.data || {}), agentState });
          return { status: 'FAILED', message: 'LLM generation error.' };

      } else if (finishReason === 'tool-calls' && (!toolCalls || toolCalls.length === 0)) {
          console.warn(`AgentExecutor (${this.personaTemplate.role}): LLM finishReason was 'tool-calls' but no toolCalls were processed/returned. This may indicate the LLM tried to call a tool it doesn't have or formatted its request incorrectly.`);
          agentState.executionHistory?.push({ timestamp: new Date(), type: 'llm_warning', name: 'tool_call_mismatch', params: {}, result: null, error: "LLM indicated tool_calls finish reason but no valid calls were processed." });
          job.setData({ ...(job.data || {}), agentState });
          return { status: 'CONTINUE_PROCESSING', message: 'LLM intended tool use, but no valid tool calls were made. Review conversation history.' };
      }

      console.warn(\`AgentExecutor (\${this.personaTemplate.role}): LLM interaction finished with unhandled reason: \${finishReason}\`);
      agentState.executionHistory?.push({ timestamp: new Date(), type: 'llm_warning', name: 'unhandled_finish_reason', params: { finishReason }, result: null, error: \`LLM interaction finished with unhandled reason: \${finishReason}\` });
      job.setData({ ...(job.data || {}), agentState });
      return { status: 'FAILED', message: \`LLM interaction finished with unhandled reason: \${finishReason}\` };

    } catch (error) {
      console.error(`AgentExecutor (${this.personaTemplate.role}): Error during LLM interaction or tool execution:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      agentState.executionHistory?.push({ timestamp: new Date(), type: 'system_error', name: 'processJob_exception', params: {}, result: null, error: \`LLM/Tool error: ${errorMessage}\` });
      // When an exception occurs, job.data might not have been updated with the latest agentState if the error happened before job.setData
      // However, the WorkerService will save the job with whatever state it had *before* this processJob call if this throws.
      // For clarity, we can set it here one last time, though its persistence depends on WorkerService's error handling.
      job.setData({ ...(job.data || {}), agentState });
      return { status: 'FAILED', message: \`Error during LLM interaction: ${errorMessage}\` };
    }
  }
}
