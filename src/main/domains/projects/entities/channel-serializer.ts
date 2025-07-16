import { ChannelData } from "./channel-data";

export class ChannelSerializer {
  static toPlainObject(
    identity: string,
    data: ChannelData,
  ): {
    id: string;
    name: string;
    projectId: string;
    createdBy: string;
    isPrivate: boolean;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: identity,
      name: data.name.getValue(),
      projectId: data.projectId.getValue(),
      createdBy: data.createdBy,
      isPrivate: data.privacy.getValue(),
      description: data.description.getValue(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}