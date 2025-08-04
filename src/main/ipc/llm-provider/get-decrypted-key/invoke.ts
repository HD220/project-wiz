import { 
  getDecryptedApiKey,
  type GetDecryptedKeyInput,
  type GetDecryptedKeyOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("llm-provider.get-decrypted-key.invoke");

export default async function(providerId: GetDecryptedKeyInput): Promise<GetDecryptedKeyOutput> {
  logger.debug("Getting decrypted API key", { providerId });

  // IMPORTANT: This handler does NOT have authentication because it is used internally
  // by the system to make calls to LLM APIs. If it had authentication,
  // agents and workers would not be able to access decrypted keys.
  
  // Execute core business logic
  const result = await getDecryptedApiKey(providerId);
  
  logger.debug("Decrypted API key retrieved successfully", { providerId });
  
  // Note: No event emission for internal queries
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      getDecryptedKey: (providerId: GetDecryptedKeyInput) => Promise<GetDecryptedKeyOutput>
    }
  }
}
EOF < /dev/null
