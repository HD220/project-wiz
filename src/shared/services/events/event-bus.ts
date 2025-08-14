import { EventEmitter } from "events";

import { BrowserWindow } from "electron";

import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("event-bus");

/**
 * Internal Event Bus class
 */
class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    logger.info("🔄 EventBus initialized");
  }

  emit(eventName: string, data: unknown): boolean {
    logger.debug(`📤 Emitting event: ${eventName}`);
    return this.emitter.emit(eventName, data);
  }

  on(eventName: string, listener: (data: unknown) => void): this {
    logger.debug(`👂 Registering listener for: ${eventName}`);
    this.emitter.on(eventName, listener);
    return this;
  }

  once(eventName: string, listener: (data: unknown) => void): this {
    logger.debug(`👂 Registering one-time listener for: ${eventName}`);
    this.emitter.once(eventName, listener);
    return this;
  }

  removeAllListeners(eventName?: string): this {
    if (eventName) {
      logger.debug(`🗑️ Removing all listeners for: ${eventName}`);
      this.emitter.removeAllListeners(eventName);
    } else {
      logger.debug("🗑️ Removing all listeners");
      this.emitter.removeAllListeners();
    }
    return this;
  }
}

/**
 * Event Bridge class
 */
class EventBridge {
  private mainWindow: BrowserWindow | null = null;

  initialize(mainWindow: BrowserWindow): void {
    this.mainWindow = mainWindow;
    this.setupForwarding();
    logger.info("✅ EventBridge initialized");
  }

  private setupForwarding(): void {
    // Better approach: listen to the emitter directly for all events
    const originalEmit = eventBus.emit.bind(eventBus);
    eventBus.emit = (eventName: string, data: unknown) => {
      const result = originalEmit(eventName, data);

      // Forward all events starting with "event:" to renderer
      if (eventName.startsWith("event:")) {
        this.forwardToRenderer(eventName, data);
      }

      return result;
    };

    logger.info("🚀 Event forwarding active");
  }

  private forwardToRenderer(eventName: string, eventData: unknown): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(eventName, eventData);
    }
  }
}

// Internal instances
const eventBus = new EventBus();
const eventBridge = new EventBridge();

/**
 * Public API - Emit reactive events
 */
export function emit(eventName: string, payload: unknown): void {
  eventBus.emit(eventName, payload);
}

/**
 * Public API - Listen to events
 */
export function listen(
  eventName: string,
  listener: (data: unknown) => void,
): void {
  eventBus.on(eventName, listener);
}

/**
 * Initialize the event system
 */
export function initialize(mainWindow: BrowserWindow): void {
  eventBridge.initialize(mainWindow);
  logger.info("🚀 Event system initialized");
}
