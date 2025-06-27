// src_refactored/core/domain/annotation/value-objects/annotation-id.vo.spec.ts
import { randomUUID } from 'crypto';

import { describe, it, expect } from 'vitest';

import { AnnotationId } from './annotation-id.vo';

describe('AnnotationId', () => {
  it('should create an AnnotationId from a valid UUID string', () => {
    const validUUID = randomUUID();
    const annotationId = AnnotationId.fromString(validUUID);
    expect(annotationId).toBeInstanceOf(AnnotationId);
    expect(annotationId.value()).toBe(validUUID);
  });

  it('should generate a valid AnnotationId', () => {
    const annotationId = AnnotationId.generate();
    expect(annotationId).toBeInstanceOf(AnnotationId);
    expect(annotationId.value()).toMatch(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
  });

  it('should throw an error if creating from an invalid UUID string', () => {
    const invalidUUID = 'not-a-uuid';
    // Error comes from Identity's constructor
    expect(() => AnnotationId.fromString(invalidUUID)).toThrow('Invalid UUID format');
  });

  it('should correctly compare two AnnotationIds with the same value', () => {
    const uuid = randomUUID();
    const id1 = AnnotationId.fromString(uuid);
    const id2 = AnnotationId.fromString(uuid);
    expect(id1.equals(id2)).toBe(true);
  });

  it('should correctly compare two AnnotationIds with different values', () => {
    const id1 = AnnotationId.generate();
    const id2 = AnnotationId.generate();
    expect(id1.equals(id2)).toBe(false);
  });
});
