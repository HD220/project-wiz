// src/core/ports/services/embedding.interface.ts
import { EmbeddingResult } from '../../domain/ai/embedding.types';

export interface IEmbeddingService {
  generateEmbedding(text: string): Promise<EmbeddingResult>;
  // Optionally, add readonly dimensions property to the interface if UseCases need it
  readonly dimensions: number;
}
