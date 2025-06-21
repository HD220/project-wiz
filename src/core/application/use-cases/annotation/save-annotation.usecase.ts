// src/core/application/use-cases/annotation/save-annotation.usecase.ts
import { Annotation, AnnotationProps } from '../../../domain/entities/annotation/annotation.entity';
import { IAnnotationRepository } from '../../../../core/ports/repositories/annotation.interface';

// DTO for saving an annotation. Could be more specific than full AnnotationProps.
export type SaveAnnotationDTO = Partial<Pick<AnnotationProps, 'id' | 'agentId' | 'jobId'>> & { text: string };

export interface ISaveAnnotationUseCase {
  execute(data: SaveAnnotationDTO): Promise<Annotation>;
}

export class SaveAnnotationUseCase implements ISaveAnnotationUseCase {
  constructor(private annotationRepository: IAnnotationRepository) {}

  async execute(data: SaveAnnotationDTO): Promise<Annotation> {
    console.log(`SaveAnnotationUseCase: Saving annotation (ID: ${data.id || 'new'}) for agent ${data.agentId}`);
    let annotationToSave: Annotation;

    if (data.id) {
      const existingAnnotation = await this.annotationRepository.findById(data.id);
      if (existingAnnotation) {
        existingAnnotation.updateText(data.text);
        // Potentially update other fields like agentId, jobId if allowed
        if (data.agentId) existingAnnotation.agentId = data.agentId;
        if (data.jobId) existingAnnotation.jobId = data.jobId;
        annotationToSave = existingAnnotation;
      } else {
        // If ID provided but not found, treat as new or throw error.
        // For simplicity, let's treat as new if ID not found, but this might be debatable.
        // Alternatively, throw new Error(`Annotation with id ${data.id} not found for update.`);
        annotationToSave = Annotation.create({
          text: data.text,
          agentId: data.agentId,
          jobId: data.jobId
        });
         // Override ID if it was intended to be a specific one but wasn't found
        (annotationToSave as any).id = data.id;
      }
    } else {
      annotationToSave = Annotation.create({
        text: data.text,
        agentId: data.agentId,
        jobId: data.jobId
      });
    }

    await this.annotationRepository.save(annotationToSave);
    // Assuming repository.save handles setting createdAt/updatedAt correctly on the entity instance
    // or that fetching it again is preferred. For now, return the instance passed to save.
    return annotationToSave;
  }
}
