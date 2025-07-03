import { z } from "zod";

import { AbstractEntity, EntityProps } from "@/core/common/base.entity";
import { Identity } from "@/core/common/value-objects/identity.vo";

import { EntityError } from "@/domain/common/errors";

import { MemoryItemContent } from './value-objects/memory-item-content.vo';
import { MemoryItemEmbedding } from './value-objects/memory-item-embedding.vo';
import { MemoryItemId } from './value-objects/memory-item-id.vo';
import { MemoryItemSource } from './value-objects/memory-item-source.vo';
import { MemoryItemTags } from './value-objects/memory-item-tags.vo';

export interface MemoryItemProps {
  id: MemoryItemId;
  content: MemoryItemContent;
  tags?: MemoryItemTags;
  source?: MemoryItemSource;
  embedding?: MemoryItemEmbedding;
  agentId?: Identity | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const MemoryItemPropsSchema = z.object({
  id: z.custom<MemoryItemId>((val) => val instanceof MemoryItemId),
  content: z.custom<MemoryItemContent>((val) => val instanceof MemoryItemContent),
  tags: z.custom<MemoryItemTags>((val) => val instanceof MemoryItemTags).optional(),
  source: z.custom<MemoryItemSource>((val) => val instanceof MemoryItemSource).optional(),
  embedding: z.custom<MemoryItemEmbedding>((val) => val instanceof MemoryItemEmbedding).optional(),
  agentId: z.custom<Identity | null | undefined>((val) => val === null || val === undefined || val instanceof Identity).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

interface InternalMemoryItemProps extends EntityProps<MemoryItemId> {
  content: MemoryItemContent;
  tags: MemoryItemTags;
  source: MemoryItemSource;
  embedding?: MemoryItemEmbedding | null;
  agentId?: Identity | null;
  createdAt: Date;
  updatedAt: Date;
}

export class MemoryItem extends AbstractEntity<MemoryItemId, InternalMemoryItemProps> {
  private constructor(props: InternalMemoryItemProps) {
    super(props);
  }

  public static create(props: MemoryItemProps): MemoryItem {
    const validationResult = MemoryItemPropsSchema.safeParse(props);
    if (!validationResult.success) {
      throw new EntityError("Invalid MemoryItem props.", {
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    const now = new Date();
    const internalProps: InternalMemoryItemProps = {
      id: props.id,
      content: props.content,
      tags: props.tags || MemoryItemTags.create([]),
      source: props.source || MemoryItemSource.create("unknown"),
      embedding: props.embedding === undefined ? null : props.embedding,
      agentId: props.agentId === undefined ? null : props.agentId,
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return new MemoryItem(internalProps);
  }

  public get content(): MemoryItemContent { return this.props.content; }
  public get tags(): MemoryItemTags { return this.props.tags; }
  public get source(): MemoryItemSource { return this.props.source; }
  public get embedding(): MemoryItemEmbedding | null | undefined { return this.props.embedding; }
  public get agentId(): Identity | null | undefined { return this.props.agentId; }

  public updateContent(newContent: MemoryItemContent): MemoryItem {
    if (this.content.equals(newContent)) return this;
    return new MemoryItem({ ...this.props, content: newContent, updatedAt: new Date() });
  }

  public updateTags(newTags: MemoryItemTags): MemoryItem {
    if (this.tags.equals(newTags)) return this;
    return new MemoryItem({ ...this.props, tags: newTags, updatedAt: new Date() });
  }

  public updateSource(newSource: MemoryItemSource): MemoryItem {
    if (this.source.equals(newSource)) return this;
    return new MemoryItem({ ...this.props, source: newSource, updatedAt: new Date() });
  }

  public setEmbedding(newEmbedding: MemoryItemEmbedding): MemoryItem {
    if (this.embedding?.equals(newEmbedding)) return this;
    return new MemoryItem({ ...this.props, embedding: newEmbedding, updatedAt: new Date() });
  }

  public assignAgent(agentId: Identity | null): MemoryItem {
    if (this.agentId === agentId || (this.agentId?.equals(agentId))) {
        return this;
    }
    return new MemoryItem({ ...this.props, agentId: agentId, updatedAt: new Date() });
  }
}

