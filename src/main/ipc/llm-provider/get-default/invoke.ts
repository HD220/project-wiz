import { z } from "zod";
import { getDefaultProvider } from "./queries";
import { LlmProviderSchema } from "@/shared/types";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("llm-provider.get-default.invoke");

// Output schema (nullable - user might not have a default provider)
const GetDefaultProviderOutputSchema = LlmProviderSchema.nullable();

type GetDefaultProviderOutput = z.infer<typeof GetDefaultProviderOutputSchema>;

export default async function(): Promise<GetDefaultProviderOutput> {
  logger.debug("Getting default LLM provider for user");

  // 1. Check authentication
  const currentUser = requireAuth();
  
  // 2. Execute query
  const dbResult = await getDefaultProvider({ userId: currentUser.id });
  
  // 3. Map SelectLlmProvider → LlmProvider (remove technical fields)
  let apiResult = null;
  if (dbResult) {
    apiResult = {
      id: dbResult.id,
      userId: dbResult.userId,
      name: dbResult.name,
      type: dbResult.type,
      baseUrl: dbResult.baseUrl,
      defaultModel: dbResult.defaultModel,
      isDefault: dbResult.isDefault,
      createdAt: new Date(dbResult.createdAt),
      updatedAt: new Date(dbResult.updatedAt),
    };
  }
  
  // 4. Validate output
  const result = GetDefaultProviderOutputSchema.parse(apiResult);
  
  logger.debug("Default LLM provider retrieved", { found: !!result, userId: currentUser.id });
  
  // Note: No event emission for queries/get operations
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      getDefault: () => Promise<GetDefaultProviderOutput>
    }
  }
}
