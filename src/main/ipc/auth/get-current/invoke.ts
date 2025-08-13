import { z } from "zod";

import { sessionRegistry } from "@/main/services/session-registry";

import { UserSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const GetCurrentUserInputSchema = z.void();
const GetCurrentUserOutputSchema = UserSchema.nullable();

const handler = createIPCHandler({
  inputSchema: GetCurrentUserInputSchema,
  outputSchema: GetCurrentUserOutputSchema,
  handler: async () => {
    // Simply return from session registry cache - no database access needed
    const dbUser = sessionRegistry.getCurrentUser();

    if (!dbUser) {
      return null;
    }

    // Map to API format (sem campos técnicos)
    const apiUser = {
      id: dbUser.id,
      name: dbUser.name,
      avatar: dbUser.avatar,
      type: dbUser.type,
      status: dbUser.status,
      createdAt: new Date(dbUser.createdAt),
      updatedAt: new Date(dbUser.updatedAt),
    };

    return apiUser;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Auth {
      getCurrent: InferHandler<typeof handler>;
    }
  }
}
