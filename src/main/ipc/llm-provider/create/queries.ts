import * as crypto from "crypto";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  llmProvidersTable, 
  type SelectLlmProvider, 
  type InsertLlmProvider 
} from "@/main/database/schemas/llm-provider.schema";

const { getDatabase } = createDatabaseConnection(true);

// Encryption key para armazenamento seguro de API keys (32 bytes para AES-256)
const validEncryptionKey = Buffer.from(
  "5ca95f9b8176faa6a2493fb069edeeae74b27044164b00862d100ba1d8ec57ec",
  "hex",
);

// Função para encriptar API key (replicando do LlmProviderService)
function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", validEncryptionKey, iv);

  let encrypted = cipher.update(apiKey, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Combinar IV, auth tag e dados encriptados
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, "base64"),
  ]);
  return combined.toString("base64");
}

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function createLlmProvider(data: InsertLlmProvider): Promise<SelectLlmProvider> {
  const db = getDatabase();
  
  // Encriptar API key antes de armazenar
  const encryptedApiKey = encryptApiKey(data.apiKey);
  
  const [provider] = await db
    .insert(llmProvidersTable)
    .values({
      ...data,
      apiKey: encryptedApiKey,
    })
    .returning();

  if (!provider) {
    throw new Error(`Failed to create LLM provider "${data.name}" of type "${data.type}"`);
  }

  return provider;
}