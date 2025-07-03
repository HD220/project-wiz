import { injectable, inject } from "inversify";

import { ANNOTATION_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { IAnnotationRepository } from "@/core/domain/annotation/ports/annotation-repository.interface";
import { AnnotationId } from "@/core/domain/annotation/value-objects/annotation-id.vo";

import {
  IUseCaseResponse,
  successUseCaseResponse,
} from "@/shared/application/use-case-response.dto";


import {
  RemoveAnnotationUseCaseInput,
  RemoveAnnotationUseCaseInputSchema,
  RemoveAnnotationUseCaseOutput,
} from "./remove-annotation.schema";

@injectable()
export class RemoveAnnotationUseCase
  implements
    IUseCase<
      RemoveAnnotationUseCaseInput,
      RemoveAnnotationUseCaseOutput
    >
{
  constructor(
    @inject(ANNOTATION_REPOSITORY_INTERFACE_TYPE)
    private readonly annotationRepository: IAnnotationRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  async execute(
    input: RemoveAnnotationUseCaseInput
  ): Promise<IUseCaseResponse<RemoveAnnotationUseCaseOutput>> {
    const validInput = RemoveAnnotationUseCaseInputSchema.parse(input);

    const annotationIdVo = AnnotationId.fromString(validInput.annotationId);

    await this.annotationRepository.delete(annotationIdVo);

    return successUseCaseResponse({
      success: true,
      annotationId: validInput.annotationId,
    });
  }
}