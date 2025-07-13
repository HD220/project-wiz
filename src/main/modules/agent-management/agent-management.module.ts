import { BaseModule } from '../../kernel/base-module';
import { AgentRepository } from './persistence/agent.repository';
import { AgentService } from './application/agent.service';
import { AgentMapper } from './agent.mapper';
import { AgentIpcHandlers } from './ipc/agent.handlers';
import { 
  AgentCreatedEvent, 
  AgentUpdatedEvent, 
  AgentDeletedEvent,
  EVENT_TYPES 
} from '../../kernel/events';

export class AgentManagementModule extends BaseModule {
  private agentRepository!: AgentRepository;
  private agentService!: AgentService;
  private agentMapper!: AgentMapper;
  private agentIpcHandlers!: AgentIpcHandlers;

  getName(): string {
    return 'agent-management';
  }

  getDependencies(): string[] {
    return []; // No dependencies for now
  }

  protected async onInitialize(): Promise<void> {
    this.agentRepository = new AgentRepository();
    this.agentMapper = new AgentMapper();
    this.agentService = new AgentService(this.agentRepository, this.agentMapper);
    this.agentIpcHandlers = new AgentIpcHandlers(
      this.agentService,
      this.agentMapper,
    );
  }

  protected subscribeToEvents(): void {
    // Listen to LLM provider changes to update agent configurations
    this.subscribeToEvent(EVENT_TYPES.LLM_PROVIDER_DELETED, async (event) => {
      // Handle agent updates when their LLM provider is deleted
      console.log(`LLM Provider ${event.entityId} deleted, checking agent dependencies...`);
      // TODO: Implement logic to handle agents using deleted LLM provider
    });
  }

  protected onRegisterIpcHandlers(): void {
    this.agentIpcHandlers.registerHandlers();
  }

  // Public getters for other modules
  getAgentService(): AgentService {
    if (!this.isInitialized()) {
      throw new Error('AgentManagementModule must be initialized first');
    }
    return this.agentService;
  }

  getAgentRepository(): AgentRepository {
    if (!this.isInitialized()) {
      throw new Error('AgentManagementModule must be initialized first');
    }
    return this.agentRepository;
  }
}