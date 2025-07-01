// src_refactored/core/domain/memory/memory-item.entity.ts
import { AbstractEntity, EntityProps } from '@/core/common/base.entity';
import { Identity } from '@/core/common/value-objects/identity.vo';

import { EntityError, ValueError } from '@/domain/common/errors';

import { MemoryItemContent } from './value-objects/memory-item-content.vo';
import { MemoryItemEmbedding } from './value-objects/memory-item-embedding.vo';
import { MemoryItemId } from './value-objects/memory-item-id.vo';
import { MemoryItemSource } from './value-objects/memory-item-source.vo';
import { MemoryItemTags } from './value-objects/memory-item-tags.vo';

export interface MemoryItemProps {
  id: MemoryItemId;
  content: MemoryItemContent;
  tags: MemoryItemTags;
  source: MemoryItemSource;
  embedding: MemoryItemEmbedding;
  agentId?: Identity | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InternalMemoryItemProps extends EntityProps<MemoryItemId> {
  content: MemoryItemContent;
  tags: MemoryItemTags;
  source: MemoryItemSource;
  embedding: MemoryItemEmbedding;
  agentId?: Identity | null;
}

export class MemoryItem extends AbstractEntity<MemoryItemId, InternalMemoryItemProps> {
  private constructor(props: InternalMemoryItemProps) {
    super(props);
  }

  public static create(props: MemoryItemProps): MemoryItem {
    this.validateProps(props);

    const now = new Date();
    const internalProps: InternalMemoryItemProps = {
      id: props.id,
      content: props.content,
      tags: props.tags || MemoryItemTags.create(null),
      source: props.source || MemoryItemSource.create(null),
      embedding: props.embedding || MemoryItemEmbedding.create(null),
      agentId: props.agentId === undefined ? null : props.agentId,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return new MemoryItem(internalProps);
  }

  private static validateProps(props: MemoryItemProps): void {
    if (!props.id) throw new EntityError('MemoryItem ID is required.');
    if (!props.content) throw new EntityError('MemoryItem content is required.');
    // Tags, source, embedding, agentId are handled with defaults or are optional VOs.
  }

  // --- Getters for VOs ---
  public content(): MemoryItemContent { return this.props.content; }
  public tags(): MemoryItemTags { return this.props.tags; }
  public source(): MemoryItemSource { return this.props.source; }
  public embedding(): MemoryItemEmbedding { return this.props.embedding; }
  public agentId(): Identity | null | undefined { return this.props.agentId; }

  // --- Update Methods ---
  public updateContent(newContent: MemoryItemContent): MemoryItem {
    if (!newContent) throw new ValueError('New content cannot be null or undefined.');
    if (this.props.content.equals(newContent)) return this;
    return new MemoryItem({ ...this.props, content: newContent, updatedAt: new Date() });
  }

  public updateTags(newTags: MemoryItemTags): MemoryItem {
    if (!newTags) throw new ValueError('New tags cannot be null or undefined.');
    if (this.props.tags.equals(newTags)) return this;
    return new MemoryItem({ ...this.props, tags: newTags, updatedAt: new Date() });
  }

  public updateSource(newSource: MemoryItemSource): MemoryItem {
    if (!newSource) throw new ValueError('New source cannot be null or undefined.');
    if (this.props.source.equals(newSource)) return this;
    return new MemoryItem({ ...this.props, source: newSource, updatedAt: new Date() });
  }

  public setEmbedding(newEmbedding: MemoryItemEmbedding): MemoryItem {
    if (!newEmbedding) throw new ValueError('New embedding cannot be null or undefined.');
    if (this.props.embedding.equals(newEmbedding)) return this;
    return new MemoryItem({ ...this.props, embedding: newEmbedding, updatedAt: new Date() });
  }

  public assignAgent(agentId: Identity | null): MemoryItem {
    if (this.props.agentId === agentId || (this.props.agentId?.equals(agentId))) {
        return this;
    }
    return new MemoryItem({ ...this.props, agentId: agentId, updatedAt: new Date() });
  }
}
