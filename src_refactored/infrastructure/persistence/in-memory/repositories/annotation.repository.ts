import { injectable } from "inversify";

import { Identity } from "@/core/common/value-objects/identity.vo";
import { Annotation } from "@/core/domain/annotation/annotation.entity";
import { IAnnotationRepository } from "@/core/domain/annotation/ports/annotation-repository.interface";
import {
  AnnotationSearchFilters,
  PaginationOptions,
  PaginatedAnnotationsResult,
} from "@/core/domain/annotation/ports/annotation-repository.types";
import { AnnotationId } from "@/core/domain/annotation/value-objects/annotation-id.vo";
import { NotFoundError } from "@/core/domain/common/errors";

@injectable()
export class InMemoryAnnotationRepository implements IAnnotationRepository {
  private readonly annotations: Map<string, Annotation> = new Map();

  async save(annotation: Annotation): Promise<Annotation> {
    this.annotations.set(annotation.id.value, annotation);
    return annotation;
  }

  async findById(id: AnnotationId): Promise<Annotation | null> {
    const annotation = this.annotations.get(id.value);
    return annotation || null;
  }

  async findByAgentId(
    agentId: Identity,
    limit?: number,
    offset?: number
  ): Promise<Annotation[]> {
    let foundAnnotations = Array.from(this.annotations.values()).filter(
      (ann) => ann.agentId?.equals(agentId)
    );
    if (offset) {
      foundAnnotations = foundAnnotations.slice(offset);
    }
    if (limit) {
      foundAnnotations = foundAnnotations.slice(0, limit);
    }
    return foundAnnotations;
  }

  async findByJobId(
    jobId: Identity,
    limit?: number,
    offset?: number
  ): Promise<Annotation[]> {
    let foundAnnotations = Array.from(this.annotations.values()).filter(
      (ann) => ann.jobId?.equals(jobId)
    );
    if (offset) {
      foundAnnotations = foundAnnotations.slice(offset);
    }
    if (limit) {
      foundAnnotations = foundAnnotations.slice(0, limit);
    }
    return foundAnnotations;
  }

  async listAll(limit?: number, offset?: number): Promise<Annotation[]> {
    let allAnnotations = Array.from(this.annotations.values());
    if (offset) {
      allAnnotations = allAnnotations.slice(offset);
    }
    if (limit) {
      allAnnotations = allAnnotations.slice(0, limit);
    }
    return allAnnotations;
  }

  async delete(id: AnnotationId): Promise<void> {
    if (!this.annotations.has(id.value)) {
      throw new NotFoundError("Annotation", id.value);
    }
    this.annotations.delete(id.value);
  }

  async search(
    filters: Partial<AnnotationSearchFilters>,
    pagination: PaginationOptions
  ): Promise<PaginatedAnnotationsResult> {
    let filteredAnnotations = Array.from(this.annotations.values());

    if (filters.agentId) {
      filteredAnnotations = filteredAnnotations.filter((ann) =>
        ann.agentId?.equals(filters.agentId!)
      );
    }
    if (filters.jobId) {
      filteredAnnotations = filteredAnnotations.filter((ann) =>
        ann.jobId?.equals(filters.jobId!)
      );
    }

    const totalCount = filteredAnnotations.length;
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const annotations = filteredAnnotations.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalCount / pagination.pageSize);

    return {
      annotations,
      totalCount,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages,
    };
  }
}