// src/core/application/use-cases/annotation/remove-annotation.usecase.ts
import { IAnnotationRepository } from '../../../../core/ports/repositories/annotation.interface';

export interface IRemoveAnnotationUseCase {
  execute(annotationId: string): Promise<void>;
}

export class RemoveAnnotationUseCase implements IRemoveAnnotationUseCase {
  constructor(private annotationRepository: IAnnotationRepository) {}

  async execute(annotationId: string): Promise<void> {
    console.log(`RemoveAnnotationUseCase: Removing annotation ${annotationId}`);
    const annotation = await this.annotationRepository.findById(annotationId);
    if (!annotation) {
      // Depending on desired behavior, could silently succeed or throw.
      // Throwing makes it explicit if an ID is expected to exist.
      throw new Error(`Annotation with id ${annotationId} not found.`);
    }
    await this.annotationRepository.delete(annotationId);
    console.log(`RemoveAnnotationUseCase: Annotation ${annotationId} removed.`);
  }
}
