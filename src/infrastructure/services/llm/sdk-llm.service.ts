// src/infrastructure/services/llm/sdk-llm.service.ts
import { injectable, inject } from 'inversify';
import {
    ILLMService,
    LLMStreamRequest,
    RevisedLLMStreamEvent,
    ChatMessage, // For constructing prompts if needed, or for type safety
    ToolInvocation // For casting/type safety if directly handling tool events
} from '@/domain/services/i-llm.service';
import { ILLMProviderRegistry } from '@/infrastructure/services/llm/llm-provider.registry'; // Correct path
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';
import {
    streamText,
    StreamTextResult,
    // ToolCallStreamPart, // From 'ai' package, for type checking stream parts (not directly used if using fullStream)
    // TextStreamPart, // (not directly used if using fullStream)
    FinishReason, // For typing the finishReason from the SDK
    CoreMessage // For casting if necessary
} from 'ai'; // Core Vercel AI SDK function

@injectable()
export class SdkLlmService implements ILLMService {
  private registry: ILLMProviderRegistry;
  private logger: ILoggerService;

  constructor(
    @inject(TYPES.LLMProviderRegistry) registry: ILLMProviderRegistry,
    @inject(TYPES.ILoggerService) logger: ILoggerService
  ) {
    this.registry = registry;
    this.logger = logger;
    this.logger.info('[SdkLlmService] Initialized.');
  }

  async *streamText(params: LLMStreamRequest): AsyncIterable<RevisedLLMStreamEvent> {
    this.logger.info(`[SdkLlmService] streamText called for modelId: ${params.modelId}`);
    this.logger.debug(`[SdkLlmService] Full request params: ${JSON.stringify(params)}`);

    try {
      // The get method in our ILLMProviderRegistry is typed to accept the string modelId directly.
      const model = this.registry.get(params.modelId);
      if (!model) {
        this.logger.error(`[SdkLlmService] Model not found in registry: ${params.modelId}`);
        yield { type: 'llm-error', error: `Model not found in registry: ${params.modelId}` };
        return;
      }

      let messagesForSdk: CoreMessage[] = params.messages as CoreMessage[]; // Cast our ChatMessage[] to CoreMessage[]
      if (params.systemPrompt) {
        if (messagesForSdk.length > 0 && messagesForSdk[0].role === 'system') {
            this.logger.warn('[SdkLlmService] System prompt provided in params and as first message. Using params.systemPrompt and overriding first message.');
            messagesForSdk = [{ role: 'system', content: params.systemPrompt }, ...messagesForSdk.slice(1)];
        } else {
            messagesForSdk = [{ role: 'system', content: params.systemPrompt }, ...messagesForSdk];
        }
      }

      const result: StreamTextResult<any> = await streamText({ // 'any' for tool schemas for now
        model: model,
        messages: messagesForSdk,
        tools: params.tools as any, // Cast tools as well
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        // onFinish: (data) => { // Optional onFinish callback
        //   this.logger.info(`[SdkLlmService] Stream finished. Finish reason: ${data.finishReason}, Usage: ${JSON.stringify(data.usage)}`);
        // },
      });

      for await (const part of result.fullStream) {
        this.logger.debug(`[SdkLlmService] Received stream part: ${JSON.stringify(part)}`);
        if (part.type === 'text-delta') {
          yield { type: 'text-delta', textDelta: part.textDelta };
        } else if (part.type === 'tool-call') {
          // Vercel AI SDK part: { type: 'tool-call', toolCallId: string, toolName: string, args: any }
          // Our ToolInvocation: { toolCallId: string, toolName: string, args: any }
          yield {
            type: 'tool-call',
            toolInvocation: {
                toolCallId: part.toolCallId,
                toolName: part.toolName,
                args: part.args
            }
          };
        } else if (part.type === 'error') { // Handle error parts from the stream
            this.logger.error(`[SdkLlmService] Error part received in stream: ${part.error}`);
            yield { type: 'llm-error', error: String(part.error) };
        }
        // Other part types like 'tool-result' are not expected from streamText's primary output stream.
        // 'finish' is derived from awaiting the response.
      }

      // Await the full response to get the final finishReason and usage stats.
      const finalProcessing = await result.experimental_awaitResponse();
      this.logger.info(`[SdkLlmService] Stream processing finished. Reason: ${finalProcessing.finishReason}. Usage: ${JSON.stringify(finalProcessing.usage)}`);
      yield { type: 'stream-end', finishReason: finalProcessing.finishReason as FinishReason };

    } catch (error: any) {
      this.logger.error(`[SdkLlmService] Error during streamText for model ${params.modelId}: ${error.message}`, error);
      yield { type: 'llm-error', error: error.message || 'Unknown error in SdkLlmService' };
    }
  }
}
