// src_refactored/core/application/use-cases/annotation/save-annotation.use-case.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZodError } from 'zod';

import { SaveAnnotationUseCase } from './save-annotation.use-case';
import { SaveAnnotationUseCaseInput } from './save-annotation.schema';

import { DomainError, NotFoundError, ValueError } from '@/application/common/errors'; // Or @/domain/common/errors
import { Identity } from '@/core/common/value-objects/identity.vo';
import { Annotation } from '@/domain/annotation/annotation.entity';
import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '@/domain/annotation/value-objects/annotation-id.vo';
import { AnnotationText } from '@/domain/annotation/value-objects/annotation-text.vo';
import { ok, error } from '@/shared/result';

const mockAnnotationRepository: IAnnotationRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  findByAgentId: vi.fn(),
  findByJobId: vi.fn(),
  listAll: vi.fn(),
  delete: vi.fn(),
};

describe('SaveAnnotationUseCase', () => {
  let useCase: SaveAnnotationUseCase;
  const testAgentId = Identity.generate();
  const testJobId = Identity.generate();
  const existingAnnotationId = AnnotationId.generate();
  let existingAnnotation: Annotation;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers(); // Control time for createdAt/updatedAt
    useCase = new SaveAnnotationUseCase(mockAnnotationRepository);

    const now = new Date();
    vi.setSystemTime(now);
    existingAnnotation = Annotation.create({
      id: existingAnnotationId,
      text: AnnotationText.create('Original text'),
      agentId: testAgentId,
      jobId: testJobId,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Creation Scenarios ---
  it('should successfully create a new annotation with all fields', async () => {
    (mockAnnotationRepository.save as vi.Mock).mockImplementation(async (anno: Annotation) => ok(anno)); // Assume save returns the saved entity

    const input: SaveAnnotationUseCaseInput = {
      text: 'New annotation text',
      agentId: testAgentId.value(),
      jobId: testJobId.value(),
    };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(mockAnnotationRepository.save).toHaveBeenCalledTimes(1);
    const savedAnnotation = (mockAnnotationRepository.save as vi.Mock).mock.calls[0][0] as Annotation;

    if (result.isOk()) {
      expect(result.value.annotationId).toBe(savedAnnotation.id().value());
      expect(savedAnnotation.text().value()).toBe('New annotation text');
      expect(savedAnnotation.agentId()?.equals(testAgentId)).toBe(true);
      expect(savedAnnotation.jobId()?.equals(testJobId)).toBe(true);
      expect(new Date(result.value.createdAt)).toEqual(new Date(result.value.updatedAt));
    }
  });

  it('should successfully create a new annotation with only required text', async () => {
    (mockAnnotationRepository.save as vi.Mock).mockImplementation(async (anno: Annotation) => ok(anno));
    const input: SaveAnnotationUseCaseInput = { text: 'Minimal annotation' };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedAnnotation = (mockAnnotationRepository.save as vi.Mock).mock.calls[0][0] as Annotation;
    expect(savedAnnotation.text().value()).toBe('Minimal annotation');
    expect(savedAnnotation.agentId()).toBeNull();
    expect(savedAnnotation.jobId()).toBeNull();
  });

  // --- Update Scenarios ---
  it('should successfully update an existing annotation text', async () => {
    (mockAnnotationRepository.findById as vi.Mock).mockResolvedValue(ok(existingAnnotation));
    (mockAnnotationRepository.save as vi.Mock).mockImplementation(async (anno: Annotation) => ok(anno));

    const updateTime = new Date(Date.now() + 1000);
    vi.setSystemTime(updateTime);

    const input: SaveAnnotationUseCaseInput = { id: existingAnnotationId.value(), text: 'Updated annotation text' };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(mockAnnotationRepository.save).toHaveBeenCalledTimes(1);
    const savedAnnotation = (mockAnnotationRepository.save as vi.Mock).mock.calls[0][0] as Annotation;
    if (result.isOk()) {
      expect(result.value.annotationId).toBe(existingAnnotationId.value());
      expect(savedAnnotation.text().value()).toBe('Updated annotation text');
      // agentId and jobId should remain the same as they were not in the input for update
      expect(savedAnnotation.agentId()?.equals(existingAnnotation.agentId()!)).toBe(true);
      expect(savedAnnotation.jobId()?.equals(existingAnnotation.jobId()!)).toBe(true);
      expect(new Date(result.value.updatedAt)).toEqual(updateTime);
      expect(new Date(result.value.createdAt)).toEqual(existingAnnotation.createdAt());
    }
  });

  it('should update agentId and jobId of an existing annotation', async () => {
    (mockAnnotationRepository.findById as vi.Mock).mockResolvedValue(ok(existingAnnotation));
    (mockAnnotationRepository.save as vi.Mock).mockImplementation(async (anno: Annotation) => ok(anno));
    const newAgentId = Identity.generate();
    const newJobId = Identity.generate();
    const input: SaveAnnotationUseCaseInput = {
      id: existingAnnotationId.value(),
      text: existingAnnotation.text().value(), // Text remains same
      agentId: newAgentId.value(),
      jobId: newJobId.value(),
    };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedAnnotation = (mockAnnotationRepository.save as vi.Mock).mock.calls[0][0] as Annotation;
    expect(savedAnnotation.agentId()?.equals(newAgentId)).toBe(true);
    expect(savedAnnotation.jobId()?.equals(newJobId)).toBe(true);
  });

  it('should clear agentId and jobId if null is provided in input for update', async () => {
    (mockAnnotationRepository.findById as vi.Mock).mockResolvedValue(ok(existingAnnotation));
    (mockAnnotationRepository.save as vi.Mock).mockImplementation(async (anno: Annotation) => ok(anno));
    const input: SaveAnnotationUseCaseInput = {
      id: existingAnnotationId.value(),
      text: existingAnnotation.text().value(),
      agentId: null,
      jobId: null,
    };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedAnnotation = (mockAnnotationRepository.save as vi.Mock).mock.calls[0][0] as Annotation;
    expect(savedAnnotation.agentId()).toBeNull();
    expect(savedAnnotation.jobId()).toBeNull();
  });


  it('should return NotFoundError if annotation to update is not found', async () => {
    (mockAnnotationRepository.findById as vi.Mock).mockResolvedValue(ok(null));
    const input: SaveAnnotationUseCaseInput = { id: AnnotationId.generate().value(), text: 'Text for non-existing' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(NotFoundError);
  });

  // --- Error Scenarios ---
  it('should return ZodError for invalid input (e.g., empty text)', async () => {
    const input: SaveAnnotationUseCaseInput = { text: '' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(ZodError);
      expect(result.value.errors[0].message).toBe("Annotation text cannot be empty.");
    }
  });

  it('should return ValueError if AnnotationText VO creation fails', async () => {
    const originalTextCreate = AnnotationText.create;
    AnnotationText.create = vi.fn().mockImplementation(() => { throw new ValueError("Mocked text VO error"); });
    const input: SaveAnnotationUseCaseInput = { text: 'This will fail VO creation' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(ValueError);
    AnnotationText.create = originalTextCreate;
  });

  it('should return DomainError if repository save fails', async () => {
    (mockAnnotationRepository.save as vi.Mock).mockResolvedValue(error(new DomainError('DB save failed')));
    const input: SaveAnnotationUseCaseInput = { text: 'Valid text' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value).toBeInstanceOf(DomainError);
        expect(result.value.message).toContain('Failed to save annotation');
    }
  });

  it('should return DomainError if repository findById fails during update', async () => {
    (mockAnnotationRepository.findById as vi.Mock).mockResolvedValue(error(new DomainError('DB find failed')));
    const input: SaveAnnotationUseCaseInput = { id: existingAnnotationId.value(), text: 'Updated text' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value.message).toContain('Failed to fetch annotation for update');
    }
  });
});
