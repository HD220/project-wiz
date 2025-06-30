// src_refactored/core/domain/annotation/ports/annotation-repository.types.ts
import { Identity } from '@/core/common/value-objects/identity.vo';

import { Annotation } from '../annotation.entity';

export interface AnnotationSearchFilters {
  agentId?: Identity;
  jobId?: Identity;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedAnnotationsResult {
  annotations: Annotation[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
