import { ChannelBuilder } from "./channel-builder";
import { ChannelData } from "./channel-data";

export class ChannelCore {
  constructor(
    private readonly identity: string,
    private data: ChannelData,
  ) {}

  static create(props: {
    id?: string;
    name: string;
    projectId: string;
    createdBy: string;
    isPrivate?: boolean;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): ChannelCore {
    const identity = props.id || crypto.randomUUID();
    const data = ChannelBuilder.buildData(props);
    return new ChannelCore(identity, data);
  }

  getId(): string {
    return this.identity;
  }

  getName(): string {
    return this.data.name.getValue();
  }

  getProjectId(): string {
    return this.data.projectId.getValue();
  }

  getData(): ChannelData {
    return this.data;
  }

  private touchUpdatedAt(): void {
    this.data.updatedAt = new Date();
  }
}
