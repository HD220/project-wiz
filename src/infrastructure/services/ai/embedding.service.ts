// src/infrastructure/services/ai/embedding.service.ts
import { embed } from 'ai'; // Core embed function
import { openai } from 'ai/providers'; // Using OpenAI provider as an example
// To use other providers like Cohere or a specific one for DeepSeek (if supported by ai-sdk for embeddings):
// import { deepseek } from '@ai-sdk/deepseek'; // If deepseek has an embed function like openai.embedding()
// import { cohere } from 'ai/providers';

import { EmbeddingResult } from '../../../core/domain/ai/embedding.types';
import { IEmbeddingService } from '../../../core/ports/services/embedding.interface';

export class EmbeddingService implements IEmbeddingService {
  private embeddingModelName: string;
  public readonly dimensions: number; // Publicly accessible dimensions

  constructor(modelName: string = 'text-embedding-3-small', dimensions: number = 1536) {
    // Default to OpenAI's text-embedding-3-small if not specified
    // This could be made more configurable, e.g., via env vars or a config object
    this.embeddingModelName = modelName;
    this.dimensions = dimensions; // Store dimensions for VSS table setup

    console.log(\`EmbeddingService initialized with model: \${this.embeddingModelName}, dimensions: \${this.dimensions}\`);

    // Check for necessary API key based on chosen model/provider (conceptual)
    // For 'text-embedding-3-small' (OpenAI), OPENAI_API_KEY is implicitly used by ai-sdk
    if (this.embeddingModelName.startsWith('text-embedding-') && !process.env.OPENAI_API_KEY) {
      console.warn("Warning: OPENAI_API_KEY is not set. Embedding generation with OpenAI models will fail.");
    }
    // Add similar checks if using other providers like Cohere or a specific DeepSeek embedding model.
    // e.g. if (this.embeddingModelName.startsWith('deepseek-embed') && !process.env.DEEPSEEK_API_KEY) { ... }
  }

  async generateEmbedding(textToEmbed: string): Promise<EmbeddingResult> {
    if (!textToEmbed || textToEmbed.trim() === '') {
      console.warn("EmbeddingService: Attempted to embed empty or whitespace-only text. Returning empty embedding.");
      // Or throw error, depending on desired handling
      return { embedding: [], usage: { promptTokens: 0 } };
    }

    try {
      console.log(\`EmbeddingService: Generating embedding for text starting with: "\${textToEmbed.substring(0, 50)}..."\`);

      // Example using OpenAI provider via ai-sdk
      // Replace with other providers as needed, ensuring they are compatible with `embed()`
      const { embedding, usage } = await embed({
        // model: openai.embedding(this.embeddingModelName), // Standard way
        // Forcing a specific model string if the helper isn't flexible enough for all names:
        model: openai.embedding(this.embeddingModelName as any), // Using 'any' if modelName string isn't strictly typed in openai.embedding()
        // model: 'openai:text-embedding-3-small', // Alternative direct model string
        value: textToEmbed,
      });

      console.log(\`EmbeddingService: Embedding generated. Usage: \${usage.promptTokens} prompt tokens.\`);
      return { embedding, usage };

    } catch (error: any) {
      console.error("EmbeddingService: Error generating embedding:", error.message);
      // Consider the structure of errors from `ai-sdk` for more specific details
      // For now, rethrow or return a structure indicating failure
      throw new Error(\`Failed to generate embedding: \${error.message}\`);
    }
  }
}

// Optional: Export a singleton instance if preferred for easy access
// export const embeddingService = new EmbeddingService();
