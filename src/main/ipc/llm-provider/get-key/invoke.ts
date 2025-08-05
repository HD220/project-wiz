import { z } from "zod";
import { findLlmProviderById } from "@/main/ipc/llm-provider/queries";
import { getLogger } from "@/shared/services/logger/config";
import * as crypto from "crypto";

const logger = getLogger("llm-provider.get-decrypted-key.invoke");

// Encryption key for API key storage (32 bytes for AES-256)
const validEncryptionKey = Buffer.from(
  "5ca95f9b8176faa6a2493fb069edeeae74b27044164b00862d100ba1d8ec57ec",
  "hex",
);

/**
 * Decrypt API key for secure storage
 */
function decryptApiKey(encryptedData: string): string {
  try {
    const combined = Buffer.from(encryptedData, "base64");

    // Extract components
    const iv = combined.subarray(0, 16);
    const authTag = combined.subarray(16, 32);
    const encrypted = combined.subarray(32);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      validEncryptionKey,
      iv,
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (_error) {
    throw new Error("Failed to decrypt API key");
  }
}

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
  
  // 2. Find provider without ownership validation (for system use)
  const provider = await findLlmProviderById(validatedProviderId);
  
  if (!provider) {
    throw new Error(`LLM provider not found: ${validatedProviderId}`);
  }

  // 3. Decrypt the API key
  const decryptedApiKey = decryptApiKey(provider.apiKey);
  
  // 4. Validate output
  const result = GetDecryptedKeyOutputSchema.parse({
    apiKey: decryptedApiKey
  });
  
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
