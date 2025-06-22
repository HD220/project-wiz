// src_refactored/core/domain/job/value-objects/related-activity-ids.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';
import { JobId } from './job-id.vo'; // Assuming JobId is used for activities too as per ADR-001

interface RelatedActivityIdsProps extends ValueObjectProps {
  jobIds: ReadonlyArray<JobId>;
}

export class RelatedActivityIds extends AbstractValueObject<RelatedActivityIdsProps> {
  private constructor(jobIds: JobId[]) {
    super({ jobIds: Object.freeze([...jobIds]) });
  }

  public static create(jobIds: JobId[] = []): RelatedActivityIds {
    if (!Array.isArray(jobIds)) {
      throw new Error('JobIds must be an array to create RelatedActivityIds.');
    }
    if (jobIds.some(id => !(id instanceof JobId))) {
        throw new Error('All elements in jobIds array must be instances of JobId.');
    }
    return new RelatedActivityIds(jobIds);
  }

  public list(): ReadonlyArray<JobId> {
    return [...this.props.jobIds];
  }

  public addRelatedId(jobId: JobId): RelatedActivityIds {
    if (!(jobId instanceof JobId)) {
        throw new Error('Invalid JobId provided to addRelatedId.');
    }
    if (this.props.jobIds.some(existingId => existingId.equals(jobId))) {
        return this;
    }
    const newJobIds = [...this.props.jobIds, jobId];
    return new RelatedActivityIds(newJobIds);
  }

  public count(): number {
    return this.props.jobIds.length;
  }

  public isEmpty(): boolean {
    return this.props.jobIds.length === 0;
  }

  public equals(other?: RelatedActivityIds): boolean {
    if (!super.equals(other) || !(other instanceof RelatedActivityIds)) {
        return false;
    }
    if (this.props.jobIds.length !== other.props.jobIds.length) {
        return false;
    }
    for (let i = 0; i < this.props.jobIds.length; i++) {
        if (!this.props.jobIds[i].equals(other.props.jobIds[i])) {
            return false;
        }
    }
    return true;
  }
}
