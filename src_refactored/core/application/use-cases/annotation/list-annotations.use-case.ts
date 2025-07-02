// src_refactored/core/application/use-cases/annotation/list-annotations.use-case.ts
import { injectable, inject } from 'inversify';
import { ZodError } from 'zod';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { Identity } from '@/core/common/value-objects/identity.vo';

import { Annotation } from '@/domain/annotation/annotation.entity';
import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import {
  PaginatedAnnotationsResult,
  AnnotationSearchFilters,
  PaginationOptions,
} from '@/domain/annotation/ports/annotation-repository.types';
import { DomainError, ValueError } from '@/domain/common/errors';

import { IUseCase as Executable } from '@/application/common/ports/use-case.interface';

import { TYPES } from '@/infrastructure/ioc/types';

import { Result, ok, error as resultError, isError, isSuccess } from '@/shared/result';


import {
  ListAnnotationsUseCaseInput,
  ListAnnotationsUseCaseInputSchema,
  ListAnnotationsUseCaseOutput,
  AnnotationListItem,
} from './list-annotations.schema';

@injectable()
export class ListAnnotationsUseCase
  implements
    Executable<
      ListAnnotationsUseCaseInput,
      ListAnnotationsUseCaseOutput,
      DomainError | ZodError | ValueError
    >
{
  constructor(
    @inject(TYPES.IAnnotationRepository) private readonly annotationRepository: IAnnotationRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(
    input: ListAnnotationsUseCaseInput,
  ): Promise<Result<ListAnnotationsUseCaseOutput, DomainError | ZodError | ValueError>> {
    const validationResult = ListAnnotationsUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return resultError(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const filters = this._buildSearchFilters(validInput);
      const pagination = this._buildPaginationOptions(validInput);

      const repoResult = await this.annotationRepository.search(filters, pagination);

      if (isError(repoResult)) {
        const err = repoResult.error instanceof DomainError ? repoResult.error : new DomainError('Failed to list annotations', repoResult.error);
        this.logger.error(
          `[ListAnnotationsUseCase] Repository error: ${err.message}`,
          { error: repoResult.error, useCase: 'ListAnnotationsUseCase', input: validInput },
        );
        return resultError(err);
      }

      const paginatedData = repoResult.value;

      const output: ListAnnotationsUseCaseOutput = {
        items: paginatedData.annotations.map(this._mapToListItem),
        totalCount: paginatedData.totalCount,
        page: paginatedData.page,
        pageSize: paginatedData.pageSize,
        totalPages: paginatedData.totalPages,
      };
      return ok(output);

    } catch (e: unknown) {
      if (e instanceof ValueError) {
         this.logger.warn(`[ListAnnotationsUseCase] Value error during filter build: ${e.message}`, { error: e, useCase: 'ListAnnotationsUseCase', input: validInput });
        return resultError(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      const logError = e instanceof Error ? e : new Error(message);
      this.logger.error(
        `[ListAnnotationsUseCase] Unexpected error: ${message}`,
        { error: logError, useCase: 'ListAnnotationsUseCase', input: validInput },
      );
      if (e instanceof DomainError || e instanceof ZodError) {
          return resultError(e);
      }
      return resultError(new DomainError(`Unexpected error listing annotations: ${message}`, logError));
    }
  }

  private _buildSearchFilters(validInput: ListAnnotationsUseCaseInput): Partial<AnnotationSearchFilters> {
    const filters: Partial<AnnotationSearchFilters> = {};
    if (validInput.agentId) {
      filters.agentId = Identity.fromString(validInput.agentId);
    }
    if (validInput.jobId) {
      filters.jobId = Identity.fromString(validInput.jobId);
    }
    return filters;
  }

  private _buildPaginationOptions(validInput: ListAnnotationsUseCaseInput): PaginationOptions {
    return {
      page: validInput.page,
      pageSize: validInput.pageSize,
    };
  }

  private _mapToListItem(annotation: Annotation): AnnotationListItem {
    return {
      id: annotation.id().value(),
      text: annotation.text().value(),
      agentId: annotation.agentId()?.value() || null,
      jobId: annotation.jobId()?.value() || null,
      createdAt: annotation.createdAt().toISOString(),
      updatedAt: annotation.updatedAt().toISOString(),
    };
  }
}
