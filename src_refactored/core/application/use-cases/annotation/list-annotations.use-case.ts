import { injectable, inject } from "inversify";

import { ANNOTATION_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { Identity } from "@/core/common/value-objects/identity.vo";
import { Annotation } from "@/core/domain/annotation/annotation.entity";
import { IAnnotationRepository } from "@/core/domain/annotation/ports/annotation-repository.interface";
import {
  AnnotationSearchFilters,
  PaginationOptions,
} from "@/core/domain/annotation/ports/annotation-repository.types";

import {
  IUseCaseResponse,
  successUseCaseResponse,
} from "@/shared/application/use-case-response.dto";


import {
  ListAnnotationsUseCaseInput,
  ListAnnotationsUseCaseInputSchema,
  ListAnnotationsUseCaseOutput,
  AnnotationListItem,
} from "./list-annotations.schema";

@injectable()
export class ListAnnotationsUseCase
  implements
    IUseCase<
      ListAnnotationsUseCaseInput,
      ListAnnotationsUseCaseOutput
    >
{
  constructor(
    @inject(ANNOTATION_REPOSITORY_INTERFACE_TYPE)
    private readonly annotationRepository: IAnnotationRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  async execute(
    input: ListAnnotationsUseCaseInput
  ): Promise<IUseCaseResponse<ListAnnotationsUseCaseOutput>> {
    const validInput = ListAnnotationsUseCaseInputSchema.parse(input);

    const filters = this._buildSearchFilters(validInput);
    const pagination = this._buildPaginationOptions(validInput);

    const paginatedData = await this.annotationRepository.search(
      filters,
      pagination
    );

    const output: ListAnnotationsUseCaseOutput = {
      annotations: paginatedData.annotations.map(this._mapToListItem),
      totalCount: paginatedData.totalCount,
      page: paginatedData.page,
      pageSize: paginatedData.pageSize,
      totalPages: paginatedData.totalPages,
    };
    return successUseCaseResponse(output);
  }

  private _buildSearchFilters(
    validInput: ListAnnotationsUseCaseInput
  ): Partial<AnnotationSearchFilters> {
    const filters: Partial<AnnotationSearchFilters> = {};
    if (validInput.agentId) {
      filters.agentId = Identity.fromString(validInput.agentId);
    }
    if (validInput.jobId) {
      filters.jobId = Identity.fromString(validInput.jobId);
    }
    return filters;
  }

  private _buildPaginationOptions(
    validInput: ListAnnotationsUseCaseInput
  ): PaginationOptions {
    return {
      page: validInput.page,
      pageSize: validInput.pageSize,
    };
  }

  private _mapToListItem(annotation: Annotation): AnnotationListItem {
    return {
      id: annotation.id.value,
      text: annotation.text.value,
      agentId: annotation.agentId?.value ?? null,
      jobId: annotation.jobId?.value ?? null,
      createdAt: annotation.createdAt.toISOString(),
      updatedAt: annotation.updatedAt.toISOString(),
    };
  }
}