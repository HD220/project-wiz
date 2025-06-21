// src/core/ports/repositories/annotation.interface.ts
import { Annotation, AnnotationProps } from '../../domain/entities/annotation/annotation.entity';

export interface IAnnotationRepository {
  findById(id: string): Promise<Annotation | null>;
  findByAgentId(agentId: string, limit?: number, offset?: number): Promise<Annotation[]>;
  // findByJobId(jobId: string, limit?: number, offset?: number): Promise<Annotation[]>; // Optional
  save(annotation: Annotation): Promise<void>; // Handles create and update
  delete(id: string): Promise<void>;
  // listAll(limit?: number, offset?: number): Promise<Annotation[]>; // Optional
}
