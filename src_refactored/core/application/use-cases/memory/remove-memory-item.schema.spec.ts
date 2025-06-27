// src_refactored/core/application/use-cases/memory/remove-memory-item.schema.spec.ts
import { describe, it, expect } from 'vitest';

import {
  RemoveMemoryItemUseCaseInputSchema,
  RemoveMemoryItemUseCaseOutputSchema,
} from './remove-memory-item.schema';

describe('RemoveMemoryItemUseCase Schemas', () => {
  describe('RemoveMemoryItemUseCaseInputSchema', () => {
    it('should validate a correct input', () => {
      const validInput = { memoryItemId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' };
      const result = RemoveMemoryItemUseCaseInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should fail if memoryItemId is missing', () => {
      const invalidInput = {};
      const result = RemoveMemoryItemUseCaseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['memoryItemId']);
        expect(result.error.errors[0].message).toBe('Required');
      }
    });

    it('should fail if memoryItemId is not a valid UUID', () => {
      const invalidInput = { memoryItemId: 'not-a-uuid' };
      const result = RemoveMemoryItemUseCaseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['memoryItemId']);
        expect(result.error.errors[0].message).toBe('MemoryItem ID must be a valid UUID.');
      }
    });

    it('should fail if extra fields are provided due to .strict()', () => {
      const invalidInput = {
        memoryItemId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        extraField: 'unexpected',
      };
      const result = RemoveMemoryItemUseCaseInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
          const issues = result.error.issues;
          expect(issues.some(issue => issue.code === "unrecognized_keys")).toBe(true);
      }
    });
  });

  describe('RemoveMemoryItemUseCaseOutputSchema', () => {
    it('should validate a correct output', () => {
      const validOutput = {
        memoryItemId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        success: true,
      };
      const result = RemoveMemoryItemUseCaseOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it('should validate output with success as false', () => {
      const validOutput = {
        memoryItemId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        success: false,
      };
      const result = RemoveMemoryItemUseCaseOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it('should fail if memoryItemId is missing', () => {
      const invalidOutput = { success: true };
      const result = RemoveMemoryItemUseCaseOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['memoryItemId']);
      }
    });

    it('should fail if memoryItemId is not a valid UUID', () => {
      const invalidOutput = { memoryItemId: 'not-a-uuid', success: true };
      const result = RemoveMemoryItemUseCaseOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['memoryItemId']);
      }
    });

    it('should fail if success is missing', () => {
      const invalidOutput = { memoryItemId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' };
      const result = RemoveMemoryItemUseCaseOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['success']);
      }
    });

    it('should fail if success is not a boolean', () => {
      const invalidOutput = {
        memoryItemId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        success: 'true_string',
      };
      const result = RemoveMemoryItemUseCaseOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['success']);
      }
    });
  });
});
