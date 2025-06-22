// src_refactored/core/application/use-cases/annotation/list-annotations.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';
import { ListAnnotationsUseCase } from './list-annotations.use-case';
import { ListAnnotationsUseCaseInput } from './list-annotations.schema';
import { IAnnotationRepository } from '../../../../domain/annotation/ports/annotation-repository.interface';
import { AnnotationSearchFilters, PaginationOptions, PaginatedAnnotationsResult } from '../../../../domain/annotation/ports/annotation-repository.types';
import { Annotation } from '../../../../domain/annotation/annotation.entity';
import { AnnotationId } from '../../../../domain/annotation/value-objects/annotation-id.vo';
import { AnnotationText } from '../../../../domain/annotation/value-objects/annotation-text.vo';
import { Identity } from '../../../../common/value-objects/identity.vo';
import { ok, error } from '../../../../../shared/result';
import { DomainError } from '../../../../common/errors';

const mockAnnotationRepository: IAnnotationRepository = {
  search: vi.fn(),
  save: vi.fn(), findById: vi.fn(), findByAgentId: vi.fn(), findByJobId: vi.fn(), listAll: vi.fn(), delete: vi.fn(),
};

describe('ListAnnotationsUseCase', () => {
  let useCase: ListAnnotationsUseCase;
  const now = new Date();
  const testAgentId = Identity.generate();
  const testJobId = Identity.generate();

  const annotationEntity1 = Annotation.create({
    id: AnnotationId.generate(), text: AnnotationText.create('Annotation 1'), agentId: testAgentId, createdAt: now, updatedAt: now,
  });
  const annotationEntity2 = Annotation.create({
    id: AnnotationId.generate(), text: AnnotationText.create('Annotation 2 for job'), jobId: testJobId, createdAt: now, updatedAt: now,
  });

  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new ListAnnotationsUseCase(mockAnnotationRepository);
  });

  it('should successfully list annotations with default pagination and no filters', async () => {
    const paginatedResult: PaginatedAnnotationsResult = {
      annotations: [annotationEntity1, annotationEntity2], totalCount: 2, page: 1, pageSize: 20, totalPages: 1,
    };
    (mockAnnotationRepository.search as vi.Mock).mockResolvedValue(ok(paginatedResult));
    const input: ListAnnotationsUseCaseInput = {};
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const output = result.value;
      expect(output.annotations).toHaveLength(2);
      expect(output.annotations[0].id).toBe(annotationEntity1.id().value());
      expect(output.annotations[1].text).toBe('Annotation 2 for job');
      expect(output.totalCount).toBe(2);
      expect(output.page).toBe(1);
      expect(output.pageSize).toBe(20);
      expect(output.totalPages).toBe(1);
    }
    expect(mockAnnotationRepository.search).toHaveBeenCalledWith(
      {}, // Empty filters
      { page: 1, pageSize: 20 } // Default pagination
    );
  });

  it('should pass agentId and jobId filters to repository search method', async () => {
    const paginatedResult: PaginatedAnnotationsResult = {
      annotations: [annotationEntity1], totalCount: 1, page: 1, pageSize: 10, totalPages: 1,
    };
    (mockAnnotationRepository.search as vi.Mock).mockResolvedValue(ok(paginatedResult));
    const input: ListAnnotationsUseCaseInput = {
      agentId: testAgentId.value(),
      jobId: testJobId.value(), // This specific test might not return jobEntity1 if it doesn't have this jobId
      page: 1, pageSize: 10,
    };

    // Adjust mock to return entity1 if agentId matches, for this specific test case
     const filteredPaginatedResult: PaginatedAnnotationsResult = {
      annotations: [annotationEntity1], totalCount: 1, page: 1, pageSize: 10, totalPages: 1,
    };
    (mockAnnotationRepository.search as vi.Mock).mockImplementation(async (filters: Partial<AnnotationSearchFilters>) => {
        if (filters.agentId?.equals(testAgentId) && filters.jobId?.equals(testJobId)) {
             // This specific mock return is simplified; real repo would filter
            return ok(filteredPaginatedResult);
        }
        return ok({ annotations: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 });
    });


    await useCase.execute(input);

    expect(mockAnnotationRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: expect.any(Identity),
        jobId: expect.any(Identity),
      }),
      { page: 1, pageSize: 10 }
    );
    const calledFilters = (mockAnnotationRepository.search as vi.Mock).mock.calls[0][0] as AnnotationSearchFilters;
    expect(calledFilters.agentId?.value()).toBe(testAgentId.value());
    expect(calledFilters.jobId?.value()).toBe(testJobId.value());
  });

  it('should return ZodError for invalid input (e.g., invalid UUID for agentId)', async () => {
    const input = { agentId: "not-a-uuid" };
    const result = await useCase.execute(input as any);
    expect(result.isError()).toBe(true);
    if(result.isError()) {
        expect(result.value).toBeInstanceOf(ZodError);
        expect(result.value.errors[0].message).toBe("Agent ID must be a valid UUID if provided.");
    }
  });

  it('should return DomainError if repository search fails', async () => {
    const repoError = new DomainError('DB search failed for annotations');
    (mockAnnotationRepository.search as vi.Mock).mockResolvedValue(error(repoError));
    const input: ListAnnotationsUseCaseInput = {};
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if(result.isError()) {
        expect(result.value).toBeInstanceOf(DomainError);
        expect(result.value.message).toContain('Failed to list annotations');
    }
  });

  it('should handle empty result from repository correctly', async () => {
    const paginatedResult: PaginatedAnnotationsResult = {
      annotations: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0,
    };
    (mockAnnotationRepository.search as vi.Mock).mockResolvedValue(ok(paginatedResult));
    const input: ListAnnotationsUseCaseInput = {};
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if(result.isOk()){
        expect(result.value.annotations).toEqual([]);
        expect(result.value.totalCount).toBe(0);
    }
  });
});
