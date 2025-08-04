import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
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

export async function updateLlmProvider(id: string, data: Partial<InsertLlmProvider>): Promise<SelectLlmProvider | null> {
  const db = getDatabase();
  
  const updates = { ...data };
  
  // Se está atualizando API key, encriptar
  if (updates.apiKey) {
    updates.apiKey = encryptApiKey(updates.apiKey);
  }

  // Se está definindo este provider como padrão, remover padrão de todos os outros primeiro
  if (updates.isDefault === true) {
    // Buscar o provider para encontrar o userId
    const [currentProvider] = await db
      .select({ userId: llmProvidersTable.userId })
      .from(llmProvidersTable)
      .where(eq(llmProvidersTable.id, id))
      .limit(1);

    if (!currentProvider) {
      throw new Error("Provider not found");
    }

    // Remover padrão de todos os outros providers deste usuário
    await db
      .update(llmProvidersTable)
      .set({ isDefault: false })
      .where(eq(llmProvidersTable.userId, currentProvider.userId));
  }

  const [provider] = await db
    .update(llmProvidersTable)
    .set({
      ...updates,
      updatedAt: sql`(strftime('%s', 'now'))`,
    })
    .where(eq(llmProvidersTable.id, id))
    .returning();

  return provider || null;
}