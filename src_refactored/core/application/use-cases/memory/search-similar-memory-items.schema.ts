// src_refactored/core/application/use-cases/memory/search-similar-memory-items.schema.ts
import { z } from 'zod';
import { MemoryListItemSchema } from './search-memory-items.schema'; // Reuse for base structure

/**
 * Input schema for SearchSimilarMemoryItemsUseCase.
 */
export const SearchSimilarMemoryItemsUseCaseInputSchema = z.object({
  queryEmbedding: z.array(z.number())
    .min(1, { message: "Query embedding array cannot be empty." })
    .describe("The embedding vector to search for similar items."),

  agentId: z.string().uuid({ message: "Agent ID must be a valid UUID if provided." })
    .optional()
    .nullable()
    .describe("Optional Agent ID to scope the search to a specific agent's memories."),

  limit: z.number()
    .int({ message: "Limit must be an integer." })
    .positive({ message: "Limit must be positive." })
    .max(50, { message: "Limit cannot exceed 50 for similarity search." }) // Sensible default max for similarity
    .optional()
    .default(10)
    .describe("Optional maximum number of similar items to return."),
}).strict();

export type SearchSimilarMemoryItemsUseCaseInput = z.infer<typeof SearchSimilarMemoryItemsUseCaseInputSchema>;

/**
 * Schema for a single memory item in the similarity search results list.
 * Extends MemoryListItemSchema to include an optional relevance score.
 */
export const SimilarMemoryListItemSchema = MemoryListItemSchema.extend({
  relevanceScore: z.number()
    .optional()
    .describe("Optional relevance score indicating similarity (higher is typically better). Exact range depends on the search provider."),
});

export type SimilarMemoryListItem = z.infer<typeof SimilarMemoryListItemSchema>;

/**
 * Output schema for SearchSimilarMemoryItemsUseCase.
 */
export const SearchSimilarMemoryItemsUseCaseOutputSchema = z.object({
  items: z.array(SimilarMemoryListItemSchema)
    .describe("Array of memory list items found to be similar, ordered by relevance if available."),
});

export type SearchSimilarMemoryItemsUseCaseOutput = z.infer<typeof SearchSimilarMemoryItemsUseCaseOutputSchema>;
