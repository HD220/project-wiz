// src_refactored/core/domain/annotation/ports/annotation-repository.interface.ts
import { Result } from '../../../../shared/result';
import { DomainError } from '../../../common/errors';
import { Annotation } from '../annotation.entity';
import { AnnotationId } from '../value-objects/annotation-id.vo';
import { Identity } from '../../../common/value-objects/identity.vo'; // For AgentId, JobId

export interface IAnnotationRepository {
  /**
   * Saves an annotation entity. Handles creation or updates.
   * @param annotation The annotation entity to save.
   * @returns A Result containing the saved annotation or a DomainError.
   */
  save(annotation: Annotation): Promise<Result<Annotation, DomainError>>;

  /**
   * Finds an annotation by its ID.
   * @param id The AnnotationId of the annotation.
   * @returns A Result containing the annotation or null if not found, or a DomainError.
   */
  findById(id: AnnotationId): Promise<Result<Annotation | null, DomainError>>;

  /**
   * Finds annotations by Agent ID.
   * @param agentId The Identity of the agent.
   * @param limit Optional limit for pagination.
   * @param offset Optional offset for pagination.
   * @returns A Result containing an array of annotations or a DomainError.
   */
  findByAgentId(agentId: Identity, limit?: number, offset?: number): Promise<Result<Annotation[], DomainError>>;

  /**
   * Finds annotations by Job ID.
   * @param jobId The Identity of the job.
   * @param limit Optional limit for pagination.
   * @param offset Optional offset for pagination.
   * @returns A Result containing an array of annotations or a DomainError.
   */
  findByJobId(jobId: Identity, limit?: number, offset?: number): Promise<Result<Annotation[], DomainError>>;

  /**
   * Lists all annotations.
   * Implementations may add pagination parameters if necessary.
   * @param limit Optional limit for pagination.
   * @param offset Optional offset for pagination.
   * @returns A Result containing an array of annotations or a DomainError.
   */
  listAll(limit?: number, offset?: number): Promise<Result<Annotation[], DomainError>>;

  /**
   * Deletes an annotation by its ID.
   * @param id The AnnotationId of the annotation to delete.
   * @returns A Result containing void or a DomainError.
   */
  delete(id: AnnotationId): Promise<Result<void, DomainError>>;

  /**
   * Searches for annotations based on filters and pagination options.
   * @param filters Optional filters (e.g., agentId, jobId).
   * @param pagination Pagination options (page, pageSize).
   * @returns A Result containing the paginated list of annotations or a DomainError.
   */
  search(
    filters: Partial<AnnotationSearchFilters>,
    pagination: PaginationOptions,
  ): Promise<Result<PaginatedAnnotationsResult, DomainError>>;
}

export const IAnnotationRepositoryToken = Symbol('IAnnotationRepository');
