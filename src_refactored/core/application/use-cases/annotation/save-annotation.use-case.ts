import { injectable, inject } from "inversify";

import { ANNOTATION_REPOSITORY_INTERFACE_TYPE } from "@/core/application/common/constants";
import { IUseCase } from "@/core/application/common/ports/use-case.interface";
import { ILogger, LOGGER_INTERFACE_TYPE } from "@/core/common/services/i-logger.service";
import { IAnnotationRepository } from "@/core/domain/annotation/ports/annotation-repository.interface";
import { AnnotationId } from "@/core/domain/annotation/value-objects/annotation-id.vo";
import { AnnotationText } from "@/core/domain/annotation/value-objects/annotation-text.vo";
import { NotFoundError } from "@/core/domain/common/errors";

import {
  IUseCaseResponse,
  successUseCaseResponse,
} from "@/shared/application/use-case-response.dto";

import {
  SaveAnnotationUseCaseInput,
  SaveAnnotationUseCaseInputSchema,
  SaveAnnotationUseCaseOutput,
} from "./save-annotation.schema";

@injectable()
export class SaveAnnotationUseCase
  implements
    IUseCase<
      SaveAnnotationUseCaseInput,
      SaveAnnotationUseCaseOutput
    >
{
  constructor(
    @inject(ANNOTATION_REPOSITORY_INTERFACE_TYPE)
    private readonly annotationRepository: IAnnotationRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  async execute(
    input: SaveAnnotationUseCaseInput
  ): Promise<IUseCaseResponse<SaveAnnotationUseCaseOutput>> {
    const validInput = SaveAnnotationUseCaseInputSchema.parse(input);

    const annotationId = AnnotationId.fromString(validInput.id!);
    const existingAnnotation = await this.annotationRepository.findById(
      annotationId
    );

    if (!existingAnnotation) {
      const notFoundErr = new NotFoundError("Annotation", validInput.id!);
      this.logger.warn(`[SaveAnnotationUseCase] ${notFoundErr.message}`,
        { error: notFoundErr, input: validInput }
      );
      throw notFoundErr;
    }

    const annotationEntity = existingAnnotation;
    annotationEntity.updateText(AnnotationText.create(validInput.text));

    const finalAnnotation = await this.annotationRepository.save(
      annotationEntity
    );

    return successUseCaseResponse({
      annotationId: finalAnnotation.id.value(),
      createdAt: finalAnnotation.createdAt.toISOString(),
      updatedAt: finalAnnotation.updatedAt.toISOString(),
    });
  }
}