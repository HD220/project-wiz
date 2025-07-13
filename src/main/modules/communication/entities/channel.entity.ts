import { z } from "zod";
import {
  ChannelSchema,
  type ChannelData,
} from "./channel.schema";
import { ChannelTypeEnum } from "../../../../shared/types/channel.types";

export class ChannelEntity {
  private props: ChannelData;

  constructor(data: Partial<ChannelData> | ChannelData) {
    this.props = ChannelSchema.parse(data);
  }

  getId(): string {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  getProjectId(): string {
    return this.props.projectId;
  }

  getType(): ChannelTypeEnum {
    return this.props.type;
  }

  getCreatedBy(): string {
    return this.props.createdBy;
  }

  isPrivate(): boolean {
    return this.props.isPrivate;
  }

  isArchived(): boolean {
    return this.props.isArchived;
  }

  getDescription(): string | undefined {
    return this.props.description;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(data: { name: string }): void {
    const validated = z.object({ name: ChannelSchema.shape.name }).parse(data);
    this.props.name = validated.name;
    this.props.updatedAt = new Date();
  }

  updateDescription(data: { description?: string }): void {
    const validated = z.object({ description: ChannelSchema.shape.description }).parse(data);
    this.props.description = validated.description;
    this.props.updatedAt = new Date();
  }

  archive(): void {
    this.props.isArchived = true;
    this.props.updatedAt = new Date();
  }

  unarchive(): void {
    this.props.isArchived = false;
    this.props.updatedAt = new Date();
  }

  toPlainObject(): ChannelData {
    return { ...this.props };
  }
}