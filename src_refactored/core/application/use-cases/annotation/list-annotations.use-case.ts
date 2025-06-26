// src_refactored/core/application/use-cases/annotation/list-annotations.use-case.ts
import { ZodError } from 'zod';
import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';
import {
  ListAnnotationsUseCaseInput,
  ListAnnotationsUseCaseInputSchema,
  ListAnnotationsUseCaseOutput,
  AnnotationListItem,
} from './list-annotations.schema';
import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationSearchFilters, PaginationOptions } from '@/domain/annotation/ports/annotation-repository.types';
import { Identity } from '@/core/common/value-objects/identity.vo';
import { Annotation } from '@/domain/annotation/annotation.entity';
import { Result, ok, error } from '@/shared/result';
import { DomainError, ValueError } from '@/domain/common/errors';

export class ListAnnotationsUseCase
  implements
    Executable<
      ListAnnotationsUseCaseInput,
      ListAnnotationsUseCaseOutput,
      DomainError | ZodError | ValueError
    >
{
  constructor(private annotationRepository: IAnnotationRepository) {}

  async execute(
    input: ListAnnotationsUseCaseInput,
  ): Promise<Result<ListAnnotationsUseCaseOutput, DomainError | ZodError | ValueError>> {
    const validationResult = ListAnnotationsUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const filters: Partial<AnnotationSearchFilters> = {};
      if (validInput.agentId) {
        filters.agentId = Identity.fromString(validInput.agentId);
      }
      if (validInput.jobId) {
        filters.jobId = Identity.fromString(validInput.jobId);
      }
      // Add other filters like textContains here if implemented

      const pagination: PaginationOptions = {
        page: validInput.page,
        pageSize: validInput.pageSize,
      };

      const searchResult = await this.annotationRepository.search(filters, pagination);
      if (searchResult.isError()) {
        return error(new DomainError(`Failed to list annotations: ${searchResult.value.message}`, searchResult.value));
      }

      const paginatedData = searchResult.value;

      const annotationListItems: AnnotationListItem[] = paginatedData.annotations.map(
        (annotationEntity: Annotation): AnnotationListItem => ({
          id: annotationEntity.id().value(),
          text: annotationEntity.text().value(),
          agentId: annotationEntity.agentId()?.value() || null,
          jobId: annotationEntity.jobId()?.value() || null,
          createdAt: annotationEntity.createdAt().toISOString(),
          updatedAt: annotationEntity.updatedAt().toISOString(),
        }),
      );

      return ok({
        annotations: annotationListItems,
        totalCount: paginatedData.totalCount,
        page: paginatedData.page,
        pageSize: paginatedData.pageSize,
        totalPages: paginatedData.totalPages,
      });

    } catch (err: any) {
      if (err instanceof ZodError || err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error(`[ListAnnotationsUseCase] Unexpected error:`, err);
      return error(new DomainError(`Unexpected error listing annotations: ${err.message || err}`));
    }
  }
}
