// src_refactored/core/application/use-cases/memory/search-similar-memory-items.schema.spec.ts
import { describe, it, expect } from 'vitest';
import {
  SearchSimilarMemoryItemsUseCaseInputSchema,
  SearchSimilarMemoryItemsUseCaseOutputSchema,
  SimilarMemoryListItemSchema,
} from './search-similar-memory-items.schema';

describe('SearchSimilarMemoryItemsUseCase Schemas', () => {
  describe('SearchSimilarMemoryItemsUseCaseInputSchema', () => {
    const validEmbedding = [0.1, 0.2, 0.3];
    const validAgentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    it('should validate a correct input with all fields', () => {
      const input = {
        queryEmbedding: validEmbedding,
        agentId: validAgentId,
        limit: 5,
      };
      const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields omitted (agentId, limit)', () => {
      const input = { queryEmbedding: validEmbedding };
      const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10); // Default limit
        expect(result.data.agentId).toBeUndefined();
      }
    });

    it('should validate with agentId as null', () => {
      const input = { queryEmbedding: validEmbedding, agentId: null };
      const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.agentId).toBeNull();
      }
    });

    it('should fail if queryEmbedding is missing', () => {
      const input = { agentId: validAgentId };
      const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['queryEmbedding']);
      }
    });

    it('should fail if queryEmbedding is an empty array', () => {
      const input = { queryEmbedding: [] };
      const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['queryEmbedding']);
        expect(result.error.errors[0].message).toBe('Query embedding array cannot be empty.');
      }
    });

    it('should fail if queryEmbedding contains non-numbers', () => {
      const input = { queryEmbedding: [0.1, 'not-a-number', 0.3] };
      const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['queryEmbedding', 1]);
      }
    });

    it('should fail if agentId is an invalid UUID', () => {
      const input = { queryEmbedding: validEmbedding, agentId: 'invalid-uuid' };
      const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['agentId']);
        expect(result.error.errors[0].message).toBe('Agent ID must be a valid UUID if provided.');
      }
    });

    it('should fail if limit is not an integer', () => {
      const input = { queryEmbedding: validEmbedding, limit: 5.5 };
      const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['limit']);
        expect(result.error.errors[0].message).toBe('Limit must be an integer.');
      }
    });

    it('should fail if limit is not positive', () => {
      const input = { queryEmbedding: validEmbedding, limit: 0 };
      const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['limit']);
        expect(result.error.errors[0].message).toBe('Limit must be positive.');
      }
    });

    it('should fail if limit exceeds maximum', () => {
      const input = { queryEmbedding: validEmbedding, limit: 51 };
      const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['limit']);
        expect(result.error.errors[0].message).toBe('Limit cannot exceed 50 for similarity search.');
      }
    });

    it('should fail for extra fields due to .strict()', () => {
        const input = { queryEmbedding: validEmbedding, extra: "field" };
        const result = SearchSimilarMemoryItemsUseCaseInputSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some(issue => issue.code === "unrecognized_keys")).toBe(true);
        }
    });
  });

  describe('SimilarMemoryListItemSchema', () => {
    const baseValidItem = {
      id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      contentExcerpt: 'Some text',
      agentId: null,
      tags: [],
      source: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should validate a correct item with relevanceScore', () => {
      const item = { ...baseValidItem, relevanceScore: 0.85 };
      const result = SimilarMemoryListItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('should validate a correct item without relevanceScore (it is optional)', () => {
      const item = { ...baseValidItem };
      const result = SimilarMemoryListItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('should fail if base MemoryListItem fields are invalid (e.g., id)', () => {
      const item = { ...baseValidItem, id: 'not-uuid', relevanceScore: 0.9 };
      const result = SimilarMemoryListItemSchema.safeParse(item);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['id']);
      }
    });

     it('should fail if relevanceScore is not a number', () => {
      const item = { ...baseValidItem, relevanceScore: "high" };
      const result = SimilarMemoryListItemSchema.safeParse(item);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['relevanceScore']);
      }
    });
  });

  describe('SearchSimilarMemoryItemsUseCaseOutputSchema', () => {
    const validListItem = {
      id: 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      contentExcerpt: 'Excerpt content',
      agentId: 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      tags: ['tag1'],
      source: 'test-source',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      relevanceScore: 0.99,
    };

    it('should validate a correct output with items', () => {
      const output = { items: [validListItem] };
      const result = SearchSimilarMemoryItemsUseCaseOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it('should validate a correct output with an empty items array', () => {
      const output = { items: [] };
      const result = SearchSimilarMemoryItemsUseCaseOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it('should fail if items is not an array', () => {
      const output = { items: "not-an-array" };
      const result = SearchSimilarMemoryItemsUseCaseOutputSchema.safeParse(output);
      expect(result.success).toBe(false);
       if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['items']);
      }
    });

    it('should fail if an item in the array does not match SimilarMemoryListItemSchema', () => {
      const invalidItem = { ...validListItem, relevanceScore: "very high" }; // Invalid score
      const output = { items: [invalidItem] };
      const result = SearchSimilarMemoryItemsUseCaseOutputSchema.safeParse(output);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['items', 0, 'relevanceScore']);
      }
    });
  });
});
