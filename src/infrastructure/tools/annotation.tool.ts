// src/infrastructure/tools/annotation.tool.ts
import { Annotation } from '../../core/domain/entities/annotation/annotation.entity';
import {
  IListAnnotationsUseCase
} from '../../core/application/use-cases/annotation/list-annotations.usecase';
import {
  ISaveAnnotationUseCase,
  SaveAnnotationDTO
} from '../../core/application/use-cases/annotation/save-annotation.usecase';
import {
  IRemoveAnnotationUseCase
} from '../../core/application/use-cases/annotation/remove-annotation.usecase';
import { z } from 'zod';

// Zod Schemas for AI SDK tool parameters
export const listAnnotationsParamsSchema = z.object({
  agentId: z.string().describe("The ID of the agent whose annotations are to be listed."),
  limit: z.number().optional().describe("Maximum number of annotations to return."),
  offset: z.number().optional().describe("Number of annotations to skip for pagination."),
}).describe("Parameters for listing annotations.");

export const saveAnnotationParamsSchema = z.object({
  id: z.string().optional().describe("The ID of the annotation to update. Omit for new annotation."),
  text: z.string().describe("The content of the annotation."),
  agentId: z.string().optional().describe("The ID of the agent creating this annotation. Usually automatically determined by the agent calling the tool."),
  jobId: z.string().optional().describe("Optional ID of a job this annotation is related to."),
}).describe("Parameters for saving (creating or updating) an annotation.");

export const removeAnnotationParamsSchema = z.object({
  annotationId: z.string().describe("The ID of the annotation to remove."),
}).describe("Parameters for removing an annotation.");

// Interface for AnnotationTool
export interface IAnnotationTool {
  list(params: z.infer<typeof listAnnotationsParamsSchema>): Promise<Annotation[]>; // Consider AnnotationDTO
  save(params: z.infer<typeof saveAnnotationParamsSchema>): Promise<Annotation>;   // Consider AnnotationDTO
  remove(params: z.infer<typeof removeAnnotationParamsSchema>): Promise<void>;
}

// Implementation of AnnotationTool
export class AnnotationTool implements IAnnotationTool {
  constructor(
    private listAnnotationsUseCase: IListAnnotationsUseCase,
    private saveAnnotationUseCase: ISaveAnnotationUseCase,
    private removeAnnotationUseCase: IRemoveAnnotationUseCase
  ) {}

  async list(params: z.infer<typeof listAnnotationsParamsSchema>): Promise<Annotation[]> {
    console.log(`AnnotationTool.list: Called for agentId ${params.agentId}`);
    return this.listAnnotationsUseCase.execute(params.agentId, params.limit, params.offset);
  }

  async save(params: z.infer<typeof saveAnnotationParamsSchema>): Promise<Annotation> {
    console.log(`AnnotationTool.save: Called for annotation text "${params.text.substring(0, 30)}..."`);
    // The 'params' object should conform to SaveAnnotationDTO or be adaptable.
    // Note: The agentId in params might be redundant if the agent itself knows its ID.
    // The UseCase DTO (SaveAnnotationDTO) expects 'text' and optionally id, agentId, jobId.
    const annotationData: SaveAnnotationDTO = {
      id: params.id,
      text: params.text,
      agentId: params.agentId, // Agent should ideally pass its own ID here
      jobId: params.jobId,
    };
    return this.saveAnnotationUseCase.execute(annotationData);
  }

  async remove(params: z.infer<typeof removeAnnotationParamsSchema>): Promise<void> {
    console.log(`AnnotationTool.remove: Called for annotationId ${params.annotationId}`);
    await this.removeAnnotationUseCase.execute(params.annotationId);
  }
}
