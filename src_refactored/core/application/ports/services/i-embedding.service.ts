// src_refactored/core/application/ports/services/i-embedding.service.ts
// Assuming EmbeddingError will be in domain/common/errors
import { EmbeddingError } from '@/domain/common/errors';

import { Result } from '@/shared/result';

// Changed to type alias
export type EmbeddingVector = number[];

export interface IEmbeddingService {
  /**
   * Generates an embedding vector for the given text.
   * @param text The text to embed.
   * @param modelId Optional model ID if the service supports multiple embedding models.
   * @returns A Result containing the embedding vector or an EmbeddingError.
   */
  generateEmbedding(text: string, modelId?: string): Promise<Result<EmbeddingVector, EmbeddingError>>;

  /**
   * Generates embeddings for a batch of texts.
   * @param texts An array of texts to embed.
   * @param modelId Optional model ID.
   * @returns A Result containing an array of embedding vectors or an EmbeddingError.
   *          The order of embeddings should correspond to the order of input texts.
   */
  generateEmbeddings(texts: string[], modelId?: string): Promise<EmbeddingVector[]>;

  // Optional: Get dimensions of embeddings for a model
  // getEmbeddingDimensions(modelId?: string): Promise<Result<number, EmbeddingError>>;
}

export const IEmbeddingServiceToken = Symbol('IEmbeddingService');
