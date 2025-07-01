import { injectable } from "inversify";

import { Annotation } from "@/core/domain/annotation/annotation.entity";
import { IAnnotationRepository } from "@/core/domain/annotation/ports/annotation-repository.interface";
import { AnnotationId } from "@/core/domain/annotation/value-objects/annotation-id.vo";
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";

import { Result, Ok, Err } from "@/shared/result";

@injectable()
export class InMemoryAnnotationRepository implements IAnnotationRepository {
  private readonly annotations: Map<string, Annotation> = new Map();

  async save(annotation: Annotation): Promise<Result<void, Error>> {
    this.annotations.set(annotation.id.value, annotation);
    return Ok(undefined);
  }

  async findById(id: AnnotationId): Promise<Result<Annotation | null, Error>> {
    const annotation = this.annotations.get(id.value);
    return Ok(annotation || null);
  }

  async findByJobId(jobId: JobIdVO): Promise<Result<Annotation[], Error>> {
    const foundAnnotations = Array.from(this.annotations.values()).filter(
      (ann) => ann.jobId()?.equals(jobId)
    );
    return Ok(foundAnnotations);
  }

  async findAll(): Promise<Result<Annotation[], Error>> {
    return Ok(Array.from(this.annotations.values()));
  }

  async delete(id: AnnotationId): Promise<Result<void, Error>> {
    if (!this.annotations.has(id.value)) {
      return Err(new Error(`Annotation with ID ${id.value} not found.`));
    }
    this.annotations.delete(id.value);
    return Ok(undefined);
  }
}
