import { injectable, inject } from 'inversify';

import { ANNOTATION_REPOSITORY_INTERFACE_TYPE } from '@/core/application/common/constants';
import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';

import { IAnnotationRepository } from '@/domain/annotation/ports/annotation-repository.interface';
import { AnnotationId } from '@/domain/annotation/value-objects/annotation-id.vo';
import { AnnotationText } from '@/domain/annotation/value-objects/annotation-text.vo';
import { DomainError, ZodError, ValueError, NotFoundError } from '@/domain/common/errors';

import { ApplicationError } from '@/application/common/errors'; // Adicionado para o catch
import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error, isError, isSuccess } from '@/shared/result'; // Adicionado isSuccess

import {
  SaveAnnotationUseCaseInput,
  SaveAnnotationUseCaseInputSchema,
  SaveAnnotationUseCaseOutput,
} from './save-annotation.schema';

@injectable()
export class SaveAnnotationUseCase
  implements
    IUseCase<
      SaveAnnotationUseCaseInput,
      SaveAnnotationUseCaseOutput,
      DomainError | ZodError | ValueError | NotFoundError | ApplicationError
    >
{
  constructor(
    @inject(ANNOTATION_REPOSITORY_INTERFACE_TYPE) private readonly annotationRepository: IAnnotationRepository,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async execute(
    input: SaveAnnotationUseCaseInput,
  ): Promise<IUseCaseResponse<SaveAnnotationUseCaseOutput>> {
    const validInput = SaveAnnotationUseCaseInputSchema.parse(input);

    const annotationId = AnnotationId.fromString(validInput.id!);
    const existingAnnotation = await this.annotationRepository.findById(annotationId);

    if (!existingAnnotation) {
      const notFoundErr = new NotFoundError('Annotation', validInput.id!); 
      this.logger.warn(`[SaveAnnotationUseCase] ${notFoundErr.message}`, { error: notFoundErr, input: validInput });
      throw notFoundErr;
    }

    const annotationEntity = existingAnnotation;
    annotationEntity.updateText(AnnotationText.create(validInput.text));

    const finalAnnotation = await this.annotationRepository.save(annotationEntity);

    return successUseCaseResponse({
      annotationId: finalAnnotation.id.value,
      createdAt: finalAnnotation.createdAt.toISOString(),
      updatedAt: finalAnnotation.updatedAt.toISOString(),
    });
  }
}
