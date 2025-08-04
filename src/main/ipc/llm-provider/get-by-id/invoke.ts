import { 
  getLlmProviderById,
  type GetLlmProviderByIdInput,
  type GetLlmProviderByIdOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("llm-provider.get-by-id.invoke");

export default async function(id: GetLlmProviderByIdInput): Promise<GetLlmProviderByIdOutput> {
  logger.debug("Getting LLM provider by ID", { providerId: id });

  // Execute core business logic
  const result = await getLlmProviderById(id);
  
  logger.debug("LLM provider found", { found: !!result, providerId: id });
  
  // Note: No event emission for queries/get operations
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      getById: (id: GetLlmProviderByIdInput) => Promise<GetLlmProviderByIdOutput>
    }
  }
}
EOF < /dev/null
