import { logger } from "../logger";
import { AgentManagementModule } from "../modules/agent-management/agent-management.module";
import { ChannelMessagingModule } from "../modules/channel-messaging/channel-messaging.module";
import { CommunicationModule } from "../modules/communication/communication.module";
import { DirectMessagesModule } from "../modules/direct-messages/direct-messages.module";
import { LlmProviderModule } from "../modules/llm-provider/llm-provider.module";
import { ProjectManagementModule } from "../modules/project-management/project-management.module";

import { DependencyContainer } from "./dependency-container";

export class ModuleLoader {
  private container: DependencyContainer;

  constructor() {
    this.container = DependencyContainer.getInstance();
  }

  async loadAndInitializeModules(): Promise<void> {
    try {
      logger.info("Starting module loading...");

      // Register all modules
      this.registerModules();

      // Initialize all modules in dependency order
      await this.container.initializeAll();

      logger.info("All modules loaded and initialized successfully");
    } catch (error) {
      logger.error("Failed to load modules:", error);
      throw error;
    }
  }

  private registerModules(): void {
    // Register modules in any order - the container will handle dependencies
    this.container.register(new ProjectManagementModule());
    this.container.register(new CommunicationModule());
    this.container.register(new LlmProviderModule());
    this.container.register(new AgentManagementModule());
    this.container.register(new ChannelMessagingModule());
    this.container.register(new DirectMessagesModule());

    logger.info("All modules registered");
  }

  getContainer(): DependencyContainer {
    return this.container;
  }
}
