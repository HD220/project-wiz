import { IpcMainInvokeEvent } from "electron";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("event.register.invoke");

export default function(pattern: string, event: IpcMainInvokeEvent): void {
  logger.debug("Registering EventBus pattern for renderer", { pattern });

  // Register pattern on EventBus and forward to renderer when events match
  eventBus.on(pattern as any, (data: any) => {
    logger.debug(`EventBus event matched pattern, forwarding to renderer`, { 
      pattern, 
      hasData: !!data 
    });
    
    event.sender.send(pattern, data);
  });

  logger.info(`✅ Pattern registered for reactive store: ${pattern}`);
}

declare global {
  namespace WindowAPI {
    interface Event {
      register: (pattern: string) => Promise<void>
    }
  }
}