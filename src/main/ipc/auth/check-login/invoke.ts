import { z } from "zod";

import { sessionRegistry } from "@/main/services/session-registry";

import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const IsLoggedInInputSchema = z.void();
const IsLoggedInOutputSchema = z.object({
  isLoggedIn: z.boolean(),
});

const handler = createIPCHandler({
  inputSchema: IsLoggedInInputSchema,
  outputSchema: IsLoggedInOutputSchema,
  handler: async () => {
    // Use session registry directly - no database access needed
    const isLoggedIn = sessionRegistry.isLoggedIn();

    return { isLoggedIn };
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Auth {
      isLoggedIn: InferHandler<typeof handler>;
    }
  }
}
