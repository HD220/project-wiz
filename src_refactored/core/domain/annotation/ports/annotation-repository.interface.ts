// src_refactored/core/domain/annotation/ports/annotation-repository.interface.ts
import { Identity } from "@/core/common/value-objects/identity.vo";

import { Annotation } from "../annotation.entity";
import { AnnotationId } from "../value-objects/annotation-id.vo";

import {
  AnnotationSearchFilters,
  PaginationOptions,
  PaginatedAnnotationsResult,
} from "./annotation-repository.types";

export interface IAnnotationRepository {
  save(annotation: Annotation): Promise<Annotation>;

  findById(id: AnnotationId): Promise<Annotation | null>;

  findByAgentId(
    agentId: Identity,
    limit?: number,
    offset?: number
  ): Promise<Annotation[]>;

  findByJobId(
    jobId: Identity,
    limit?: number,
    offset?: number
  ): Promise<Annotation[]>;

  listAll(limit?: number, offset?: number): Promise<Annotation[]>;

  delete(id: AnnotationId): Promise<void>;

  search(
    filters: Partial<AnnotationSearchFilters>,
    pagination: PaginationOptions
  ): Promise<PaginatedAnnotationsResult>;
}

export const IAnnotationRepositoryToken = Symbol("IAnnotationRepository");