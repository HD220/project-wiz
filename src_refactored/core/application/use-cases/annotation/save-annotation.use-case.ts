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
  ): Promise<Result<SaveAnnotationUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError | ApplicationError>> {
    const validationResult = SaveAnnotationUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      this.logger.warn('[SaveAnnotationUseCase] Input validation failed.', {
        error: validationResult.error.flatten(),
        useCase: 'SaveAnnotationUseCase',
        input,
      });
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      // Assumindo que validInput.id sempre existirá e será uma string válida para AnnotationId.fromString
      // Se validInput.id for opcional, esta linha pode falhar ou precisar de tratamento.
      // Para seguir o código fornecido, vamos assumir que id está presente para o fluxo de atualização.
      // A lógica de criação (se id não existe) não está presente neste snippet.
      const annotationId = AnnotationId.fromString(validInput.id!);
      const existingAnnotationResult = await this.annotationRepository.findById(annotationId);

	  if(isError(existingAnnotationResult)){
          this.logger.error(`[SaveAnnotationUseCase] Error fetching annotation ${validInput.id}: ${existingAnnotationResult.error.message}`, existingAnnotationResult.error, {input: validInput});
		  return error(existingAnnotationResult.error);
	  }
      if (!existingAnnotationResult.value) {
          const notFoundErr = new NotFoundError('Annotation', validInput.id!);
          this.logger.warn(`[SaveAnnotationUseCase] ${notFoundErr.message}`, { error: notFoundErr, input: validInput });
          return error(notFoundErr);
      }

	  const annotationEntity = existingAnnotationResult.value;
      // A validação de text e a criação de AnnotationText podem lançar ValueError.
	  annotationEntity.updateText(AnnotationText.create(validInput.text));
      // Lógica para atualizar agentId e jobId, se fornecidos, precisaria ser adicionada aqui.

      const saveResult = await this.annotationRepository.save(annotationEntity);

      if (isError(saveResult)) {
        // Assumindo que saveResult.error é um DomainError conforme a interface do repositório
        const domainError = saveResult.error;
        this.logger.error(`[SaveAnnotationUseCase] Repository save error: ${domainError.message}`, domainError, {input: validInput});
        return error(domainError);
      }

      // Se IAnnotationRepository.save retorna void, precisamos usar annotationEntity.
      // Se retorna a entidade, saveResult.value seria a entidade.
      // Para manter simples por agora, vamos assumir que o save atualiza 'annotationEntity' in-place ou o retorna.
      // Idealmente, o tipo de retorno de saveResult.value seria verificado.
      // Usando annotationEntity para consistência se saveResult.value for void.
      const finalAnnotation = (isSuccess(saveResult) && saveResult.value) ? saveResult.value : annotationEntity;

      return ok({
        annotationId: finalAnnotation.id.value,
        createdAt: finalAnnotation.createdAt().toISOString(),
        updatedAt: finalAnnotation.updatedAt().toISOString(),
      });

    } catch (caughtException: unknown) {
      let exceptionMessage: string;
      let errorInstanceForLog: Error;

      if (caughtException instanceof Error) {
        exceptionMessage = caughtException.message;
        errorInstanceForLog = caughtException;
      } else {
        exceptionMessage = String(caughtException);
        errorInstanceForLog = new Error(exceptionMessage);
      }

      if(
		caughtException instanceof ValueError ||
		caughtException instanceof DomainError ||
		caughtException instanceof ZodError ||
		caughtException instanceof NotFoundError
	  ){
        // Usar exceptionMessage que já foi extraído e é uma string.
		this.logger.warn(`[SaveAnnotationUseCase] Known error (${(caughtException as Error).name}): ${exceptionMessage}`, { error: errorInstanceForLog, input: validInput });
		return error(caughtException); // Retorna o erro original tipado
	  }
		const unexpectedMsg = `[SaveAnnotationUseCase] Unexpected error: ${exceptionMessage}`;
		this.logger.error(unexpectedMsg, errorInstanceForLog, { input: validInput });
		return error(new ApplicationError(unexpectedMsg, errorInstanceForLog));

    }
  }
}
