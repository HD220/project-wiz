// src_refactored/core/domain/annotation/annotation.entity.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';

import { EntityError, ValueError, DomainError, NotFoundError } from '@/domain/common/errors'; // Added EntityError
import { Identity } from '@/core/common/value-objects/identity.vo';

import { Annotation, AnnotationProps } from './annotation.entity';
import { AnnotationId } from './value-objects/annotation-id.vo';
import { AnnotationText } from './value-objects/annotation-text.vo';

describe('Annotation Entity', () => {
  let validProps: AnnotationProps;

  beforeEach(() => {
    validProps = {
      id: AnnotationId.generate(),
      text: AnnotationText.create('This is a test annotation.'),
      agentId: Identity.generate(),
      jobId: Identity.generate(),
    };
  });

  it('should create an Annotation entity with all properties', () => {
    const annotation = Annotation.create(validProps);
    expect(annotation).toBeInstanceOf(Annotation);
    expect(annotation.id().equals(validProps.id)).toBe(true);
    expect(annotation.text().value()).toBe('This is a test annotation.');
    expect(annotation.agentId()?.equals(validProps.agentId!)).toBe(true);
    expect(annotation.jobId()?.equals(validProps.jobId!)).toBe(true);
    expect(annotation.createdAt()).toBeInstanceOf(Date);
    expect(annotation.updatedAt()).toBeInstanceOf(Date);
    expect(annotation.createdAt()).toEqual(annotation.updatedAt());
  });

  it('should create an Annotation entity with optional properties (agentId, jobId) being null', () => {
    const propsMinimal: AnnotationProps = {
      id: AnnotationId.generate(),
      text: AnnotationText.create('Minimal annotation.'),
      agentId: null,
      jobId: null,
    };
    const annotation = Annotation.create(propsMinimal);
    expect(annotation.agentId()).toBeNull();
    expect(annotation.jobId()).toBeNull();
  });

  it('should create an Annotation entity with optional properties (agentId, jobId) being undefined', () => {
    const propsMinimalUndefined: AnnotationProps = {
      id: AnnotationId.generate(),
      text: AnnotationText.create('Minimal undefined annotation.'),
      // agentId and jobId are undefined
    };
    const annotation = Annotation.create(propsMinimalUndefined);
    expect(annotation.agentId()).toBeNull(); // Defaulted to null
    expect(annotation.jobId()).toBeNull();   // Defaulted to null
  });

  it('should throw EntityError if required properties (id, text) are missing', () => {
    expect(() => Annotation.create({ ...validProps, id: undefined } as any)).toThrow(EntityError);
    expect(() => Annotation.create({ ...validProps, text: undefined } as any)).toThrow(EntityError);
  });

  describe('updateText', () => {
    it('should update text and change updatedAt', () => {
      const annotation = Annotation.create(validProps);
      const originalUpdatedAt = annotation.updatedAt();
      const newText = AnnotationText.create('Updated annotation text.');

      return new Promise(resolve => setTimeout(() => {
        const updatedAnnotation = annotation.updateText(newText);
        expect(updatedAnnotation.text().equals(newText)).toBe(true);
        expect(updatedAnnotation.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        expect(updatedAnnotation.id().equals(annotation.id())).toBe(true);
        resolve(null);
      }, 10));
    });

    it('should return the same instance if text is not changed', () => {
      const annotation = Annotation.create(validProps);
      const updatedAnnotation = annotation.updateText(validProps.text);
      expect(updatedAnnotation).toBe(annotation);
      expect(updatedAnnotation.updatedAt()).toEqual(annotation.updatedAt());
    });

    it('should throw ValueError if new text is null', () => {
      const annotation = Annotation.create(validProps);
      expect(() => annotation.updateText(null as any)).toThrow(ValueError);
    });
  });

  describe('assignAgent', () => {
    it('should update agentId and change updatedAt', () => {
      const annotation = Annotation.create({ ...validProps, agentId: null });
      const originalUpdatedAt = annotation.updatedAt();
      const newAgentId = Identity.generate();

      return new Promise(resolve => setTimeout(() => {
        const updatedAnnotation = annotation.assignAgent(newAgentId);
        expect(updatedAnnotation.agentId()?.equals(newAgentId)).toBe(true);
        expect(updatedAnnotation.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        resolve(null);
      }, 10));
    });

    it('should set agentId to null and change updatedAt', () => {
      const annotation = Annotation.create(validProps); // Assumes validProps.agentId is not null
      const originalUpdatedAt = annotation.updatedAt();

      return new Promise(resolve => setTimeout(() => {
        const updatedAnnotation = annotation.assignAgent(null);
        expect(updatedAnnotation.agentId()).toBeNull();
        expect(updatedAnnotation.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        resolve(null);
      }, 10));
    });
  });

  describe('assignJob', () => {
    it('should update jobId and change updatedAt', () => {
      const annotation = Annotation.create({ ...validProps, jobId: null });
      const originalUpdatedAt = annotation.updatedAt();
      const newJobId = Identity.generate();

      return new Promise(resolve => setTimeout(() => {
        const updatedAnnotation = annotation.assignJob(newJobId);
        expect(updatedAnnotation.jobId()?.equals(newJobId)).toBe(true);
        expect(updatedAnnotation.updatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        resolve(null);
      }, 10));
    });
  });

  describe('equals', () => {
    it('should return true for entities with the same ID', () => {
      const id = AnnotationId.generate();
      const annotation1 = Annotation.create({ ...validProps, id });
      const annotation2 = Annotation.create({ ...validProps, id, text: AnnotationText.create('Different text') });
      expect(annotation1.equals(annotation2)).toBe(true);
    });

    it('should return false for entities with different IDs', () => {
      const annotation1 = Annotation.create(validProps);
      const annotation2 = Annotation.create({ ...validProps, id: AnnotationId.generate() });
      expect(annotation1.equals(annotation2)).toBe(false);
    });
  });
});
