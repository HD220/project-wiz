// src_refactored/core/domain/annotation/annotation.entity.ts
import { AbstractEntity, EntityProps } from '@/core/common/base.entity';
import { EntityError, ValueError } from '@/core/common/errors';
import { Identity } from '@/core/common/value-objects/identity.vo'; // For AgentId and JobId

import { AnnotationId } from './value-objects/annotation-id.vo';
import { AnnotationText } from './value-objects/annotation-text.vo';

export interface AnnotationProps {
  id: AnnotationId;
  text: AnnotationText;
  agentId?: Identity | null;
  jobId?: Identity | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InternalAnnotationProps extends EntityProps<AnnotationId> {
  text: AnnotationText;
  agentId?: Identity | null;
  jobId?: Identity | null;
}

export class Annotation extends AbstractEntity<AnnotationId, InternalAnnotationProps> {
  private constructor(props: InternalAnnotationProps) {
    super(props);
  }

  public static create(props: AnnotationProps): Annotation {
    this.validateProps(props);

    const now = new Date();
    const internalProps: InternalAnnotationProps = {
      id: props.id,
      text: props.text,
      agentId: props.agentId === undefined ? null : props.agentId,
      jobId: props.jobId === undefined ? null : props.jobId,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return new Annotation(internalProps);
  }

  private static validateProps(props: AnnotationProps): void {
    if (!props.id) throw new EntityError('Annotation ID is required.');
    if (!props.text) throw new EntityError('Annotation text is required.');
    // agentId and jobId are optional
  }

  // --- Getters for VOs ---
  public text(): AnnotationText { return this.props.text; }
  public agentId(): Identity | null | undefined { return this.props.agentId; }
  public jobId(): Identity | null | undefined { return this.props.jobId; }

  // --- Update Methods ---
  public updateText(newText: AnnotationText): Annotation {
    if (!newText) {
      throw new ValueError('New text cannot be null or undefined for update.');
    }
    if (this.props.text.equals(newText)) {
      return this; // No change
    }
    const newProps = { ...this.props, text: newText, updatedAt: new Date() };
    return new Annotation(newProps);
  }

  // Optional: methods to update agentId or jobId if they can be changed post-creation
  public assignAgent(agentId: Identity | null): Annotation {
    if (this.props.agentId === agentId || (this.props.agentId?.equals(agentId))) {
        return this; // No change
    }
    const newProps = { ...this.props, agentId: agentId, updatedAt: new Date() };
    return new Annotation(newProps);
  }

  public assignJob(jobId: Identity | null): Annotation {
    if (this.props.jobId === jobId || (this.props.jobId?.equals(jobId))) {
        return this; // No change
    }
    const newProps = { ...this.props, jobId: jobId, updatedAt: new Date() };
    return new Annotation(newProps);
  }
}
