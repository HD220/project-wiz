import { IModule } from './interfaces/module.interface';
import { EventBus, IEvent, EventListener } from './event-bus';

export abstract class BaseModule implements IModule {
  protected initialized = false;
  protected eventBus: EventBus;

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  abstract getName(): string;
  abstract getDependencies(): string[];
  
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    await this.onInitialize();
    this.subscribeToEvents();
    this.initialized = true;
  }

  registerIpcHandlers(): void {
    if (!this.initialized) {
      throw new Error(`Module ${this.getName()} must be initialized before registering IPC handlers`);
    }
    
    this.onRegisterIpcHandlers();
  }

  protected abstract onInitialize(): Promise<void>;
  protected abstract onRegisterIpcHandlers(): void;

  // Event handling methods
  protected subscribeToEvents(): void {
    // Override in child classes to subscribe to events
  }

  protected publishEvent<T extends IEvent>(event: T): Promise<void> {
    return this.eventBus.publish(event);
  }

  protected subscribeToEvent<T extends IEvent>(
    eventType: T["type"],
    listener: EventListener<T>
  ): void {
    this.eventBus.subscribe(eventType, listener);
  }

  protected isInitialized(): boolean {
    return this.initialized;
  }
}