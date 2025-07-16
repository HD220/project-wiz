import {
  ChannelName,
  ChannelDescription,
  ChannelPrivacy,
  ProjectIdentity,
} from "../value-objects";

export interface ChannelData {
  name: ChannelName;
  description: ChannelDescription;
  privacy: ChannelPrivacy;
  projectId: ProjectIdentity;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}