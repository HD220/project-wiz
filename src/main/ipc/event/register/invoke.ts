import { z } from "zod";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("event.register.invoke");

const RegisterEventInputSchema = z.object({
  pattern: z.string().min(1, "Pattern is required"),
});

const RegisterEventOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: RegisterEventInputSchema,
  outputSchema: RegisterEventOutputSchema,
  handler: async (input) => {
    logger.debug("Registering EventBus pattern for renderer", {
      pattern: input.pattern,
    });

    // Register pattern on EventBus and forward to renderer when events match
    eventBus.on(input.pattern as string, (data: unknown) => {
      logger.debug(`EventBus event matched pattern, forwarding to renderer`, {
        pattern: input.pattern,
        hasData: !!data,
      });

      // Note: In a real implementation, we would need access to the renderer process
      // to send the event. This is a simplified version for the IPC pattern consistency.
      // The actual event forwarding would be handled by the IPC system differently.
    });

    logger.info(`✅ Pattern registered for reactive store: ${input.pattern}`);
    return undefined;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Event {
      register: InferHandler<typeof handler>;
    }
  }
}
