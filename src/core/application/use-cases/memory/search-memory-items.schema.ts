// src/core/application/use-cases/memory/search-memory-items.schema.ts
import { z } from "zod";

/**
 * Input schema for SearchMemoryItemsUseCase (non-semantic text/tag search).
 */
export const SearchMemoryItemsUseCaseInputSchema = z
  .object({
    agentId: z
      .string()
      .uuid({ message: "Agent ID must be a valid UUID if provided." })
      .optional()
      .nullable()
      .describe(
        "Optional Agent ID to scope the search to a specific agent's memories."
      ),

    queryText: z
      .string()
      .trim()
      .min(1, { message: "Query text cannot be empty if provided." })
      .optional()
      .describe("Optional text to search within memory content."),

    tags: z
      .array(
        z.string().trim().min(1, { message: "Individual tag cannot be empty." })
      )
      // If tags array is present, it must have items
      .min(1, {
        message: "Tags array cannot be empty if provided to filter by tags.",
      })
      .optional()
      .describe(
        "Optional array of tags to filter memories. Behavior might be AND or OR for multiple tags (to be defined by repository implementation)."
      ),

    // TODO: Consider date range filters, source filter.

    page: z
      .number()
      .int({ message: "Page number must be an integer." })
      .positive({ message: "Page number must be positive." })
      .optional()
      .default(1)
      .describe("Page number for pagination, 1-indexed."),

    pageSize: z
      .number()
      .int({ message: "Page size must be an integer." })
      .positive({ message: "Page size must be positive." })
      .max(100, { message: "Page size cannot exceed 100." })
      .optional()
      .default(20)
      .describe("Number of memory items per page for pagination."),
  })
  .strict();

export type SearchMemoryItemsUseCaseInput = z.infer<
  typeof SearchMemoryItemsUseCaseInputSchema
>;

/**
 * Schema for a single memory item in the search results list.
 * Does not include the embedding for brevity in lists.
 */
export const MemoryListItemSchema = z.object({
  id: z.string().uuid().describe("MemoryItem ID."),
  // Or full content if preferred
  contentExcerpt: z
    .string()
    .describe(
      "An excerpt or summary of the memory content (actual content may be longer)."
    ),
  // For full content: content: z.string().describe("Full text content of the memory item."),
  agentId: z
    .string()
    .uuid()
    .nullable()
    .describe("Associated Agent ID, or null."),
  tags: z.array(z.string()).describe("Tags associated with the memory item."),
  source: z.string().nullable().describe("Source of the memory item, or null."),
  createdAt: z.string().datetime().describe("Creation timestamp."),
  updatedAt: z.string().datetime().describe("Last update timestamp."),
  // relevanceScore: z.number().optional().describe("Relevance score if applicable (more for semantic search).")
});

export type MemoryListItem = z.infer<typeof MemoryListItemSchema>;

/**
 * Output schema for SearchMemoryItemsUseCase, including pagination details.
 */
export const SearchMemoryItemsUseCaseOutputSchema = z.object({
  items: z
    .array(MemoryListItemSchema)
    .describe("Array of memory list items for the current page."),
  totalCount: z
    .number()
    .int()
    .describe("Total number of memory items matching the filters."),
  page: z.number().int().describe("Current page number."),
  pageSize: z.number().int().describe("Number of memory items per page."),
  totalPages: z.number().int().describe("Total number of pages."),
});

export type SearchMemoryItemsUseCaseOutput = z.infer<
  typeof SearchMemoryItemsUseCaseOutputSchema
>;
