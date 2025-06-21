// src/domain/services/i-embedding.service.ts

export interface EmbeddingRequest {
  /**
   * Provider-prefixed model ID for embeddings, e.g., "openai/text-embedding-3-small"
   * or a custom ID resolvable by the ILLMProviderRegistry.
   */
  modelId: string;
  /** The string or array of strings to embed. */
  value: string | string[];
  /** Other provider-specific options, e.g., dimensions, input_type for OpenAI */
  options?: Record<string, any>;
}

export interface EmbeddingResponseData {
  /** The generated embedding vector. */
  embedding: number[];
  /** Optional: Index of the input if a batch was processed (not directly supported by Vercel SDK's embed for single value, but good for batch). */
  index?: number;
}

export interface EmbeddingResponse {
  /** Array of embedding data, one for each input string if 'value' was an array. */
  embeddings: EmbeddingResponseData[];
  /** Optional: Token usage information from the embedding model. */
  usage?: {
    promptTokens?: number; // Vercel SDK `embed` provides totalTokens, not promptTokens for embeddings usually
    totalTokens: number;
  };
  /** Optional: Any raw response from the provider if needed. */
  providerResponse?: any;
}

export interface IEmbeddingService {
  /**
   * Generates embeddings for the given input value(s) using the specified model.
   * @param request The embedding request details.
   * @returns A promise that resolves to the embedding response.
   */
  generateEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse>;
}
