import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { llmProvidersTable } from "@/main/database/schemas/llm-provider.schema";
import * as crypto from "crypto";

const { getDatabase } = createDatabaseConnection(true);

// Encryption key for API key storage (32 bytes for AES-256) - deve ser a mesma do service original
const validEncryptionKey = Buffer.from(
  "5ca95f9b8176faa6a2493fb069edeeae74b27044164b00862d100ba1d8ec57ec",
  "hex",
);

// Input validation schema
export const GetDecryptedKeyInputSchema = z.string().min(1, "Provider ID is required");

// Output validation schema
export const GetDecryptedKeyOutputSchema = z.object({
  apiKey: z.string(),
});

export type GetDecryptedKeyInput = z.infer<typeof GetDecryptedKeyInputSchema>;
export type GetDecryptedKeyOutput = z.infer<typeof GetDecryptedKeyOutputSchema>;

/**
 * Decrypt API key for secure storage (mesma lógica do LlmProviderService.decryptApiKey)
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

export async function getDecryptedApiKey(providerId: GetDecryptedKeyInput): Promise<GetDecryptedKeyOutput> {
  const db = getDatabase();
  
  const validatedProviderId = GetDecryptedKeyInputSchema.parse(providerId);

  // Find provider by ID (mesma lógica do LlmProviderService.getDecryptedApiKey)
  const [provider] = await db
    .select()
    .from(llmProvidersTable)
    .where(eq(llmProvidersTable.id, validatedProviderId))
    .limit(1);

  if (!provider) {
    throw new Error("Provider not found");
  }

  // Decrypt the API key
  const decryptedApiKey = decryptApiKey(provider.apiKey);

  return GetDecryptedKeyOutputSchema.parse({
    apiKey: decryptedApiKey
  });
}