import * as crypto from "crypto";

import { z } from "zod";

import { findLlmProviderById } from "@/main/ipc/llm-provider/queries";

import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("llm-provider.get-key.invoke");

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

const GetKeyInputSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
});

const GetKeyOutputSchema = z.object({
  apiKey: z.string(),
});

const handler = createIPCHandler({
  inputSchema: GetKeyInputSchema,
  outputSchema: GetKeyOutputSchema,
  handler: async (input) => {
    logger.debug("Getting decrypted API key", { providerId: input.providerId });

    // IMPORTANT: This handler does NOT have authentication because it is used internally
    // by the system to make calls to LLM APIs. If it had authentication,
    // agents and workers would not be able to access decrypted keys.

    // Find provider without ownership validation (for system use)
    const provider = await findLlmProviderById(input.providerId);

    if (!provider) {
      throw new Error(`LLM provider not found: ${input.providerId}`);
    }

    // Decrypt the API key
    const decryptedApiKey = decryptApiKey(provider.apiKey);

    logger.debug("Decrypted API key retrieved successfully", {
      providerId: input.providerId,
    });

    return {
      apiKey: decryptedApiKey,
    };
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface LlmProvider {
      getKey: InferHandler<typeof handler>;
    }
  }
}
