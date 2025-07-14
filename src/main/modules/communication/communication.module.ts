import { BaseModule } from "../../kernel/base-module";

import { ChannelService } from "./application/channel.service";
import { ChannelMapper } from "./channel.mapper";
import { ChannelIpcHandlers } from "./ipc/handlers";
import { ChannelRepository } from "./persistence/channel.repository";

export class CommunicationModule extends BaseModule {
  private channelRepository!: ChannelRepository;
  private channelService!: ChannelService;
  private channelMapper!: ChannelMapper;
  private channelIpcHandlers!: ChannelIpcHandlers;

  getName(): string {
    return "communication";
  }

  getDependencies(): string[] {
    return []; // No dependencies
  }

  protected async onInitialize(): Promise<void> {
    this.channelRepository = new ChannelRepository();
    this.channelMapper = new ChannelMapper();
    this.channelService = new ChannelService(
      this.channelRepository,
      this.channelMapper,
    );
    this.channelIpcHandlers = new ChannelIpcHandlers(
      this.channelService,
      this.channelMapper,
    );
  }

  protected onRegisterIpcHandlers(): void {
    this.channelIpcHandlers.registerHandlers();
  }

  // Public getters for other modules
  getChannelService(): ChannelService {
    if (!this.isInitialized()) {
      throw new Error("CommunicationModule must be initialized first");
    }
    return this.channelService;
  }

  getChannelRepository(): ChannelRepository {
    if (!this.isInitialized()) {
      throw new Error("CommunicationModule must be initialized first");
    }
    return this.channelRepository;
  }
}
