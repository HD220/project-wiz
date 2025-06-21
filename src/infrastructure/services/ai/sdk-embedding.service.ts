// src/infrastructure/services/ai/sdk-embedding.service.ts
import { injectable, inject } from 'inversify';
import {
    IEmbeddingService,
    EmbeddingRequest,
    EmbeddingResponse,
    EmbeddingResponseData
} from '@/domain/services/i-embedding.service';
import { ILLMProviderRegistry } from '@/infrastructure/services/llm/llm-provider.registry'; // Path to our registry interface
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';
import { embed, EmbedResult, LanguageModel } from 'ai'; // Core Vercel AI SDK function and type

@injectable()
export class SdkEmbeddingService implements IEmbeddingService {
  private registry: ILLMProviderRegistry;
  private logger: ILoggerService;

  constructor(
    @inject(TYPES.LLMProviderRegistry) registry: ILLMProviderRegistry,
    @inject(TYPES.ILoggerService) logger: ILoggerService
  ) {
    this.registry = registry;
    this.logger = logger;
    this.logger.info('[SdkEmbeddingService] Initialized.');
  }

  async generateEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    this.logger.info(`[SdkEmbeddingService] generateEmbeddings called for modelId: ${request.modelId}`);
    this.logger.debug(`[SdkEmbeddingService] Full request: ${JSON.stringify(request)}`);

    try {
      const model = this.registry.get(request.modelId) as LanguageModel; // Cast to LanguageModel, embed expects this.

      // Vercel AI SDK's `embed` function expects a model that has an `doEmbed` method.
      // This check verifies if the retrieved model is likely an embedding model.
      if (!model || typeof (model as any).doEmbed !== 'function') {
        this.logger.error(`[SdkEmbeddingService] Embedding model not found or invalid in registry: ${request.modelId}. Model object does not have a doEmbed method.`);
        throw new Error(`Embedding model not found or invalid in registry: ${request.modelId}. Ensure it's an embedding model.`);
      }

      const embedderOptions: Record<string, any> = { ...request.options };
      // Example of mapping a specific option if its name differs from SDK
      // if (request.options?.dimensions) embedderOptions.dimensions = request.options.dimensions;
      // For most common options like 'dimensions', the Vercel SDK embed function might pick them up directly if passed.

      const result: EmbedResult = await embed({ // Removed <any> as EmbedResult is now directly from 'ai'
        model: model,
        value: request.value,
        ...embedderOptions
      });

      this.logger.info(`[SdkEmbeddingService] Embeddings generated successfully for model ${request.modelId}.`);

      let responseEmbeddings: EmbeddingResponseData[];

      if (typeof request.value === 'string') {
        // Single input string: result.embedding should be number[]
        if (!result.embedding || !Array.isArray(result.embedding)) {
            this.logger.error(`[SdkEmbeddingService] Expected single embedding vector for single input string with model ${request.modelId}. Received: ${JSON.stringify(result)}`);
            throw new Error('Invalid embedding result for single input string.');
        }
        responseEmbeddings = [{ embedding: result.embedding, index: 0 }];
      } else {
        // Array of input strings: result.embeddings should be number[][]
        if (!result.embeddings || !Array.isArray(result.embeddings) || !result.embeddings.every(e => Array.isArray(e))) {
            this.logger.error(`[SdkEmbeddingService] Expected array of embedding vectors for batch input with model ${request.modelId}. Received: ${JSON.stringify(result)}`);
            throw new Error('Invalid embedding result for batch input strings.');
        }
        responseEmbeddings = result.embeddings.map((emb, idx) => ({
            embedding: emb,
            index: idx
        }));
      }

      return {
        embeddings: responseEmbeddings,
        usage: result.usage ? { totalTokens: result.usage.totalTokens } : undefined,
        providerResponse: result.rawResponse,
      };

    } catch (error: any) {
      this.logger.error(`[SdkEmbeddingService] Error during generateEmbeddings for model ${request.modelId}: ${error.message}`, error.stack);
      // It's generally good to re-throw the error so the caller can decide how to handle it,
      // potentially after logging or transforming it.
      throw error;
    }
  }
}
