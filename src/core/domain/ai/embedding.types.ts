// src/core/domain/ai/embedding.types.ts
export interface EmbeddingResult {
  embedding: number[];
  usage: { promptTokens: number; totalTokens?: number };
}
