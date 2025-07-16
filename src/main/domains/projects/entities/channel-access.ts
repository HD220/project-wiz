import { ChannelData } from "./channel-data";

export class ChannelAccess {
  constructor(private data: ChannelData) {}

  canBeAccessedBy(userId: string): boolean {
    if (this.data.privacy.isPublic()) return true;
    return this.data.createdBy === userId;
  }

  isPrivate(): boolean {
    return this.data.privacy.isPrivate();
  }

  isEditable(): boolean {
    return true;
  }

  canBeDeleted(): boolean {
    return true;
  }
}
