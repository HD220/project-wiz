import { z } from "zod";

import { getDefaultLlmProvider } from "@/main/ipc/llm-provider/queries";
import { requireAuth } from "@/main/services/session-registry";

import { getLogger } from "@/shared/services/logger/config";
import { LlmProviderSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("llm-provider.get-default.invoke");

const GetDefaultProviderInputSchema = z.void();

const GetDefaultProviderOutputSchema = LlmProviderSchema.nullable();

const handler = createIPCHandler({
  inputSchema: GetDefaultProviderInputSchema,
  outputSchema: GetDefaultProviderOutputSchema,
  handler: async () => {
    logger.debug("Getting default LLM provider for user");

    const currentUser = requireAuth();

    // Get default provider with ownership validation
    const dbResult = await getDefaultLlmProvider(currentUser.id);

    // Mapeamento: SelectLlmProvider → LlmProvider
    let apiResult = null;
    if (dbResult) {
      apiResult = {
        id: dbResult.id,
        ownerId: dbResult.ownerId,
        name: dbResult.name,
        type: dbResult.type,
        apiKey: dbResult.apiKey,
        baseUrl: dbResult.baseUrl,
        defaultModel: dbResult.defaultModel,
        isDefault: dbResult.isDefault,
        deactivatedAt: dbResult.deactivatedAt
          ? new Date(dbResult.deactivatedAt)
          : null,
        createdAt: new Date(dbResult.createdAt),
        updatedAt: new Date(dbResult.updatedAt),
      };
    }

    logger.debug("Default LLM provider retrieved", {
      found: !!apiResult,
      userId: currentUser.id,
    });

    return apiResult;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      getDefault: InferHandler<typeof handler>;
    }
  }
}
