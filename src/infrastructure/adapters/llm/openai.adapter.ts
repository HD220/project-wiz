// src/infrastructure/adapters/llm/openai.adapter.ts
import { Result, ok, error } from '@/shared/result';
import { ILLM } from '@/core/application/llms/llm.interface';
// ITool from the project's definition might be different from CoreTool from 'ai'
// import { ITool } from '@/core/application/tools/tool.interface';
import { DomainError } from '@/core/common/errors';
import { generateText, LanguageModel, GenerateTextResult, CoreTool } from 'ai';
import { openai } from '@ai-sdk/openai';
// For handling API key more flexibly, e.g. if passed directly
// import { OpenAIProvider } from '@ai-sdk/openai';

export class OpenAIAdapter implements ILLM {
    private model: LanguageModel;

    constructor(
        apiKey?: string, // API Key can be optional if OPENAI_API_KEY env var is set
        modelName: string = "gpt-4o-mini" // Default to a cost-effective and capable model
    ) {
        if (apiKey) {
            console.warn(
                "OpenAIAdapter: API key was provided to constructor. " +
                "Consider using the OPENAI_API_KEY environment variable for @ai-sdk/openai. " +
                "This explicit API key will be used to create a specific provider instance."
            );
            // Create a specific OpenAI provider instance with the given API key
            // This overrides the default behavior of reading from process.env.OPENAI_API_KEY
            this.model = openai(modelName, { apiKey: apiKey });
        } else {
            if (!process.env.OPENAI_API_KEY) {
                console.warn(
                    "OpenAIAdapter: OPENAI_API_KEY environment variable is not set and no API key was provided. " +
                    "LLM calls will likely fail if the environment is not otherwise configured."
                );
            }
            this.model = openai(modelName); // Uses OPENAI_API_KEY from env or other global config
        }
        console.log(`OpenAIAdapter initialized for model ${modelName}.`);
    }

    async generate(prompt: string, toolsSchema?: CoreTool[]): Promise<Result<string>> {
        try {
            console.log("OpenAIAdapter.generate called with prompt snippet:", prompt.substring(0, 150) + "...");
            if (toolsSchema && toolsSchema.length > 0) {
                console.log(`Tools schemas provided to generateText: ${toolsSchema.map(t => t.name).join(', ')}`);
            }

            const params: Parameters<typeof generateText>[0] = {
                model: this.model,
                prompt: prompt,
            };

            // Add tools to params if provided and non-empty
            // Note: The actual ITool instances from our application would need to be mapped to CoreTool schema.
            // For this subtask, we are accepting CoreTool[] directly as per ILLM interface update.
            if (toolsSchema && toolsSchema.length > 0) {
                params.tools = toolsSchema;
                // params.toolChoice = "auto"; // Let the LLM decide. Or be more specific if needed.
            }

            const { text, toolCalls, finishReason, usage, warnings } = await generateText(params);

            if (warnings && warnings.length > 0) {
                console.warn("OpenAIAdapter.generate warnings:", warnings);
            }

            // Handle tool calls if they are returned by the LLM
            if (toolCalls && toolCalls.length > 0) {
                console.log("OpenAIAdapter: LLM returned toolCalls.", toolCalls);
                // For now, return a string indicating a tool call was requested.
                // The AgentService will need to parse this and act accordingly.
                // A more structured approach might involve returning the toolCalls object itself
                // or a specific representation, but that would change the Result<string> contract.
                // For this iteration, we'll format it as a string that AgentService can parse.
                const firstToolCall = toolCalls[0];
                return ok(`EXECUTE_TASK: ${firstToolCall.toolName} PARAMS: ${JSON.stringify(firstToolCall.args)}`);
            }

            console.log("OpenAIAdapter.generate text response (first 100 chars):", text.substring(0,100) + "...");
            return ok(text);

        } catch (e) {
            console.error("Error in OpenAIAdapter.generate:", e);
            // AI SDK errors are typically instances of APIError or specific subclasses
            if (e instanceof Error) {
                return error(new DomainError(`LLM generation failed: ${e.name} - ${e.message}`, e));
            }
            return error(new DomainError("Unknown error during LLM generation.", undefined, false, String(e)));
        }
    }
}
