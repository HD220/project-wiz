// src/core/domain/entities/annotation/annotation.entity.ts
import { randomUUID } from 'crypto';

export interface AnnotationProps {
  id: string;
  text: string;
  agentId?: string; // Or personaId, depending on how it's linked
  jobId?: string;   // Optional: link annotation to a specific job
  createdAt: Date;
  updatedAt: Date;
  // Consider other relevant fields: e.g., tags, type of annotation
}

export class Annotation {
  readonly id: string;
  text: string;
  agentId?: string;
  jobId?: string;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: Partial<AnnotationProps> & { text: string }) {
    this.id = props.id || randomUUID();
    this.text = props.text;
    this.agentId = props.agentId;
    this.jobId = props.jobId;
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateText(newText: string): void {
    this.text = newText;
    this._updatedAt = new Date();
  }

  // Add other methods as needed, e.g., for linking to agent/job

  static create(props: { text: string; agentId?: string; jobId?: string }): Annotation {
    return new Annotation(props);
  }

  // toProps might be useful for repository conversion
  public get props(): AnnotationProps {
    return {
      id: this.id,
      text: this.text,
      agentId: this.agentId,
      jobId: this.jobId,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
