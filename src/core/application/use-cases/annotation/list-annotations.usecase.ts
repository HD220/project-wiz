// src/core/application/use-cases/annotation/list-annotations.usecase.ts
import { Annotation } from '../../../domain/entities/annotation/annotation.entity';
import { IAnnotationRepository } from '../../../../core/ports/repositories/annotation.interface';

export interface IListAnnotationsUseCase {
  execute(agentId: string, limit?: number, offset?: number): Promise<Annotation[]>;
}

export class ListAnnotationsUseCase implements IListAnnotationsUseCase {
  constructor(private annotationRepository: IAnnotationRepository) {}

  async execute(agentId: string, limit: number = 20, offset: number = 0): Promise<Annotation[]> {
    console.log(`ListAnnotationsUseCase: Listing annotations for agent ${agentId}`);
    return this.annotationRepository.findByAgentId(agentId, limit, offset);
  }
}
