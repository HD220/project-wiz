// src/core/application/use-cases/memory/remove-memory-item.schema.ts
import { z } from "zod";

/**
 * Input schema for RemoveMemoryItemUseCase.
 */
export const RemoveMemoryItemUseCaseInputSchema = z
  .object({
    memoryItemId: z
      .string()
      .uuid({ message: "MemoryItem ID must be a valid UUID." })
      .describe("The ID of the memory item to remove."),
  })
  .strict();

export type RemoveMemoryItemUseCaseInput = z.infer<
  typeof RemoveMemoryItemUseCaseInputSchema
>;

/**
 * Output schema for RemoveMemoryItemUseCase.
 */
export const RemoveMemoryItemUseCaseOutputSchema = z.object({
  memoryItemId: z
    .string()
    .uuid()
    .describe("The ID of the memory item that was targeted for removal."),
  success: z
    .boolean()
    .describe(
      "Indicates whether the removal operation was flagged as successful (e.g., item found and deletion processed, or item not found but operation is considered idempotent)."
    ),
});

export type RemoveMemoryItemUseCaseOutput = z.infer<
  typeof RemoveMemoryItemUseCaseOutputSchema
>;
