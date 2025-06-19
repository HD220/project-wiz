// src/infrastructure/services/llm/deepseek.service.ts
import { injectable, inject } from 'inversify';
// import { TYPES } from '@/infrastructure/ioc/types'; // For API keys or other configs if needed
import {
  ILLMService,
  LLMStreamRequest,
  LLMStreamEvent,
  ChatMessage,
  LLMToolDefinition,
} from '@/domain/services/i-llm.service';
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';


@injectable()
export class DeepSeekLLMService implements ILLMService {
  private apiKey: string | undefined;
  private logger: ILoggerService;

  constructor(
    // Example: Inject API key or configuration service here if needed
    // @inject(TYPES.DeepSeekApiKey) apiKey: string,
    @inject(TYPES.ILoggerService) logger: ILoggerService,
  ) {
    // This is just an example; API key management should be robust
    this.apiKey = process.env.DEEPSEEK_API_KEY; // Or from a config service
    this.logger = logger;
    if (!this.apiKey) {
      this.logger.warn('[DeepSeekLLMService] DEEPSEEK_API_KEY not found in environment variables. Service may not function.');
    }
  }

  async *streamText(params: LLMStreamRequest): AsyncIterable<LLMStreamEvent> {
    this.logger.info(`[DeepSeekLLMService] streamText called with model ${params.modelId}. Messages count: ${params.messages.length}`);
    this.logger.debug(`[DeepSeekLLMService] Params: ${JSON.stringify(params, null, 2)}`);

    if (!this.apiKey) {
        this.logger.error('[DeepSeekLLMService] API Key is not configured.');
        yield { type: 'llm-error', error: 'API Key for DeepSeekLLMService is not configured.' };
        return;
    }

    // Placeholder: Simulate a streaming response
    yield { type: 'text-delta', textDelta: 'Simulating DeepSeek response... ' };
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    // Simulate processing messages and generating a response
    const lastUserMessage = params.messages.filter(m => m.role === 'user').pop();
    const responseContent = `Hello! You said: "${lastUserMessage?.content || 'nothing'}". This is a simulated stream from DeepSeek.`;

    for (const char of responseContent) {
      yield { type: 'text-delta', textDelta: char };
      await new Promise(resolve => setTimeout(resolve, 20)); // Simulate char-by-char streaming
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate a tool call if tools are provided in the request and a specific input is given
    if (params.tools && params.tools.length > 0 && lastUserMessage?.content?.toLowerCase().includes('call tool')) {
        const toolToCall = params.tools[0];
        const toolCallId = `tool_call_${Date.now()}`;
        this.logger.info(`[DeepSeekLLMService] Simulating tool call for: ${toolToCall.function.name}`);

        yield {
            type: 'tool-call',
            toolCallId: toolCallId,
            toolName: toolToCall.function.name,
            args: JSON.stringify({ message: "Simulated arguments for " + toolToCall.function.name })
        };
        await new Promise(resolve => setTimeout(resolve, 50));
        yield { type: 'stream-end', finishReason: 'tool_calls' };
    } else {
        yield { type: 'stream-end', finishReason: 'stop' };
    }
  }
}
