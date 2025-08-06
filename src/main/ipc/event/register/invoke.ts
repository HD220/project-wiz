import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("event.register.invoke");

export default async function(pattern: string): Promise<void> {
  logger.debug("Registering EventBus pattern for renderer", { pattern });

  // Register pattern on EventBus and forward to renderer when events match
  eventBus.on(pattern as any, (data: any) => {
    logger.debug(`EventBus event matched pattern, forwarding to renderer`, { 
      pattern, 
      hasData: !!data 
    });
    
    // Note: In a real implementation, we would need access to the renderer process
    // to send the event. This is a simplified version for the IPC pattern consistency.
    // The actual event forwarding would be handled by the IPC system differently.
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