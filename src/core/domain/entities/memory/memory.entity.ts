// src/core/domain/entities/memory/memory.entity.ts
import { randomUUID } from 'crypto';

export interface MemoryItemProps {
  id: string;
  content: string;
  tags?: string[];
  source?: string; // e.g., 'user_interaction', 'file_analysis', 'self_reflection'
  embedding?: number[]; // For future semantic search; store as JSON or in a separate vector DB table
  createdAt: Date;
  updatedAt: Date;
}

export class MemoryItem {
  readonly id: string;
  content: string;
  tags: string[];
  source?: string;
  embedding?: number[];
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: Partial<Pick<MemoryItemProps, 'id' | 'tags' | 'source' | 'embedding' | 'createdAt' | 'updatedAt'>> & { content: string }) {
    this.id = props.id || randomUUID();
    this.content = props.content;
    this.tags = props.tags || [];
    this.source = props.source;
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

  static create(props: { content: string; tags?: string[]; source?: string; embedding?: number[] }): MemoryItem {
    return new MemoryItem(props);
  }

  public get props(): MemoryItemProps {
    return {
      id: this.id,
      content: this.content,
      tags: this.tags,
      source: this.source,
      embedding: this.embedding,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
