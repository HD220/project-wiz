// src_refactored/core/application/use-cases/memory/save-memory-item.schema.ts
import { z } from 'zod';

/**
 * Input schema for SaveMemoryItemUseCase.
 */
export const SaveMemoryItemUseCaseInputSchema = z.object({
  id: z.string().uuid({ message: "MemoryItem ID must be a valid UUID if provided." })
    .optional()
    .describe("Optional ID of the memory item to update. If omitted, a new item will be created."),

  content: z.string()
    .trim()
    .min(1, { message: "Memory content cannot be empty." })
    // Aligned with MemoryItemContent VO
    .max(10000, { message: "Memory content must be no more than 10000 characters long." })
    .describe("The textual content of the memory item."),

  agentId: z.string().uuid({ message: "Agent ID must be a valid UUID if provided." })
    .optional()
    .nullable()
    .describe("Optional ID of the agent associated with this memory item."),

  tags: z.array(
      z.string()
        .trim()
        .min(1, { message: "Individual tag cannot be empty." })
        .max(50, { message: "Individual tag must be no more than 50 characters." })
    )
    .max(20, { message: "A memory item can have a maximum of 20 tags." })
    // If not provided, existing tags (on update) might be kept or cleared depending on use case logic. Default to empty for create.
    .optional()
    .describe("Optional array of tags for categorization. Max 20 tags, each 1-50 chars."),

  source: z.string()
    .trim()
    // VO makes it nullable, so empty string if provided implies intent to clear
    .min(1, { message: "Source cannot be empty if provided."})
    .max(100, { message: "Source must be no more than 100 characters long." })
    .optional()
    .nullable()
    .describe("Optional source of this memory item (e.g., 'user_interaction', 'file_analysis')."),

  // Basic validation, more specific (e.g. dimension) could be added if needed
  embedding: z.array(z.number())
    .optional()
    .nullable()
    .refine(val => val === null || val === undefined || val.length > 0, {
      message: "Embedding array cannot be empty if provided. Use null or omit for no embedding.",
    })
    .describe("Optional pre-computed embedding vector for the content."),
}).strict();

export type SaveMemoryItemUseCaseInput = z.infer<typeof SaveMemoryItemUseCaseInputSchema>;

/**
 * Output schema for SaveMemoryItemUseCase.
 */
export const SaveMemoryItemUseCaseOutputSchema = z.object({
  memoryItemId: z.string().uuid().describe("The ID of the saved (created or updated) memory item."),
  createdAt: z.string().datetime().describe("The ISO 8601 date and time when the memory item was created."),
  updatedAt: z.string().datetime().describe("The ISO 8601 date and time when the memory item was last updated."),
});

export type SaveMemoryItemUseCaseOutput = z.infer<typeof SaveMemoryItemUseCaseOutputSchema>;
