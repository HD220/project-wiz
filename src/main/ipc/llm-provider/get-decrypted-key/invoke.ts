import { z } from "zod";
import { getDecryptedApiKey } from "./queries";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("llm-provider.get-decrypted-key.invoke");

// Input schema
const GetDecryptedKeyInputSchema = z.string().min(1, "Provider ID is required");

// Output schema
const GetDecryptedKeyOutputSchema = z.object({
  apiKey: z.string(),
});

type GetDecryptedKeyInput = z.infer<typeof GetDecryptedKeyInputSchema>;
type GetDecryptedKeyOutput = z.infer<typeof GetDecryptedKeyOutputSchema>;

export default async function(providerId: GetDecryptedKeyInput): Promise<GetDecryptedKeyOutput> {
  logger.debug("Getting decrypted API key", { providerId });

  // 1. Validate input
  const validatedProviderId = GetDecryptedKeyInputSchema.parse(providerId);

  // IMPORTANT: This handler does NOT have authentication because it is used internally
  // by the system to make calls to LLM APIs. If it had authentication,
  // agents and workers would not be able to access decrypted keys.
  
  // 2. Execute query
  const dbResult = await getDecryptedApiKey(validatedProviderId);
  
  // 3. Validate output
  const result = GetDecryptedKeyOutputSchema.parse(dbResult);
  
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
