// src_refactored/core/domain/annotation/ports/annotation-repository.types.ts
import { Identity } from '@/core/common/value-objects/identity.vo'; // For AgentId, JobId

import { Annotation } from '../annotation.entity';

export interface AnnotationSearchFilters {
  agentId?: Identity;
  jobId?: Identity;
  // textContains?: string; // Optional future filter
}

export interface PaginationOptions { // This could be a shared type
  page: number; // 1-indexed
  pageSize: number;
}

export interface PaginatedAnnotationsResult {
  annotations: Annotation[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
