import { z } from "zod";

import { AbstractEntity, EntityProps } from "@/core/common/base.entity";
import { Identity } from "@/core/common/value-objects/identity.vo";

import { EntityError } from "@/domain/common/errors";

import { AnnotationId } from "./value-objects/annotation-id.vo";
import { AnnotationText } from "./value-objects/annotation-text.vo";

export interface AnnotationProps {
  id: AnnotationId;
  text: AnnotationText;
  agentId?: Identity | null;
  jobId?: Identity | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const AnnotationPropsSchema = z.object({
  id: z.custom<AnnotationId>((val) => val instanceof AnnotationId),
  text: z.custom<AnnotationText>((val) => val instanceof AnnotationText),
  agentId: z.custom<Identity | null | undefined>((val) => val === null || val === undefined || val instanceof Identity).optional(),
  jobId: z.custom<Identity | null | undefined>((val) => val === null || val === undefined || val instanceof Identity).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

interface InternalAnnotationProps extends EntityProps<AnnotationId> {
  text: AnnotationText;
  agentId?: Identity | null;
  jobId?: Identity | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Annotation extends AbstractEntity<AnnotationId, InternalAnnotationProps> {
  private constructor(props: InternalAnnotationProps) {
    super(props);
  }

  public static create(props: AnnotationProps): Annotation {
    const validationResult = AnnotationPropsSchema.safeParse(props);
    if (!validationResult.success) {
      throw new EntityError("Invalid Annotation props.", {
        details: validationResult.error.flatten().fieldErrors,
      });
    }

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

  public get text(): AnnotationText { return this.props.text; }
  public get agentId(): Identity | null | undefined { return this.props.agentId; }
  public get jobId(): Identity | null | undefined { return this.props.jobId; }

  // --- Update Methods ---
  public updateText(newText: AnnotationText): Annotation {
    if (this.text.equals(newText)) {
      return this;
    }
    const newProps = { ...this.props, text: newText, updatedAt: new Date() };
    return new Annotation(newProps);
  }

  public assignAgent(agentId: Identity | null): Annotation {
    if (this.agentId === agentId || (this.agentId?.equals(agentId))) {
        return this;
    }
    const newProps = { ...this.props, agentId: agentId, updatedAt: new Date() };
    return new Annotation(newProps);
  }

  public assignJob(jobId: Identity | null): Annotation {
    if (this.jobId?.equals(jobId ?? null)) {
        return this;
    }
    const newProps = { ...this.props, jobId: jobId, updatedAt: new Date() };
    return new Annotation(newProps);
  }
}
