import { ChannelCore } from "./channel-core.entity";
import { ChannelAccess } from "./channel-access";
import { ChannelSerializer } from "./channel-serializer";
import { ChannelFactory } from "./channel-factory";

export class Channel {
  constructor(private readonly core: ChannelCore) {}

  static create(props: {
    id?: string;
    name: string;
    projectId: string;
    createdBy: string;
    isPrivate?: boolean;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Channel {
    return new Channel(ChannelCore.create(props));
  }

  getId(): string {
    return this.core.getId();
  }

  getName(): string {
    return this.core.getName();
  }

  getProjectId(): string {
    return this.core.getProjectId();
  }

  canBeAccessedBy(userId: string): boolean {
    return new ChannelAccess(this.core.getData()).canBeAccessedBy(userId);
  }

  isPrivate(): boolean {
    return new ChannelAccess(this.core.getData()).isPrivate();
  }

  static createGeneral(projectId: string, createdBy: string): Channel {
    return ChannelFactory.createGeneral(projectId, createdBy);
  }

  toPlainObject() {
    return ChannelSerializer.toPlainObject(this.core.getId(), this.core.getData());
  }
}
