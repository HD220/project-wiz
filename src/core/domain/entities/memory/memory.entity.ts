// src/core/domain/entities/memory/memory.entity.ts
import { randomUUID } from 'crypto';

export interface MemoryItemProps {
  id: string;
  content: string;
  tags?: string[];
  source?: string; // e.g., 'user_interaction', 'file_analysis', 'self_reflection'
  embedding?: number[]; // For future semantic search; store as JSON or in a separate vector DB table
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MemoryItem {
  readonly id: string;
  content: string;
  tags: string[];
  source?: string;
  agentId?: string; // Added
  embedding?: number[];
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: Partial<Pick<MemoryItemProps, 'id' | 'tags' | 'source' | 'embedding' | 'createdAt' | 'updatedAt' | 'agentId'>> & { content: string }) {
    this.id = props.id || randomUUID();
    this.content = props.content;
    this.tags = props.tags || [];
    this.source = props.source;
    this.agentId = props.agentId; // Added
    this.embedding = props.embedding; // Not used in initial search
    this.createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  updateContent(newContent: string, newTags?: string[]): void {
    this.content = newContent;
    if (newTags !== undefined) {
      this.tags = newTags;
    }
    this._updatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this._updatedAt = new Date();
    }
  }

  static create(props: { content: string; agentId?: string; tags?: string[]; source?: string; embedding?: number[] }): MemoryItem {
    // The constructor now accepts agentId directly if it's part of the props passed to it.
    // The type of props for constructor is Partial<Pick<MemoryItemProps...>>
    // So, we ensure the props passed to new MemoryItem includes agentId if provided in `create`'s props.
    return new MemoryItem({ ...props });
  }

  public get props(): MemoryItemProps {
    return {
      id: this.id,
      content: this.content,
      tags: this.tags,
      source: this.source,
      agentId: this.agentId, // Added
      embedding: this.embedding,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
