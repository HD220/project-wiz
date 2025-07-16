import {
  ChannelName,
  ChannelDescription,
  ChannelPrivacy,
  ProjectIdentity,
} from "../value-objects";
import { ChannelData } from "./channel-data";

export class ChannelBuilder {
  static buildData(props: {
    name: string;
    projectId: string;
    createdBy: string;
    isPrivate?: boolean;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): ChannelData {
    return {
      name: new ChannelName(props.name),
      description: new ChannelDescription(props.description),
      privacy: new ChannelPrivacy(props.isPrivate || false),
      projectId: new ProjectIdentity(props.projectId),
      createdBy: props.createdBy,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  static buildGeneralChannel(
    projectId: string,
    createdBy: string,
  ): ChannelData {
    return this.buildData({
      name: "geral",
      projectId,
      createdBy,
      isPrivate: false,
      description: "Canal principal do projeto",
    });
  }
}