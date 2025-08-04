import crypto from "crypto";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  llmProvidersTable, 
  type SelectLlmProvider 
} from "@/main/database/schemas/llm-provider.schema";

const { getDatabase } = createDatabaseConnection(true);

// Encryption key para armazenamento seguro de API keys (32 bytes para AES-256)
const validEncryptionKey = Buffer.from(
  "5ca95f9b8176faa6a2493fb069edeeae74b27044164b00862d100ba1d8ec57ec",
  "hex",
);

// Input validation schema
export const UpdateLlmProviderInputSchema = z.object({
  id: z.string().min(1, "Provider ID is required"),
  name: z.string().min(1, "Provider name is required").optional(),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]).optional(),
  apiKey: z.string().min(1, "API key is required").optional(),
  baseUrl: z.string().url("Invalid URL").optional().nullable(),
  defaultModel: z.string().min(1, "Default model is required").optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Output validation schema
export const UpdateLlmProviderOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string(),
  baseUrl: z.string().nullable(),
  defaultModel: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type UpdateLlmProviderInput = z.infer<typeof UpdateLlmProviderInputSchema>;
export type UpdateLlmProviderOutput = z.infer<typeof UpdateLlmProviderOutputSchema>;

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

export async function updateLlmProvider(input: UpdateLlmProviderInput): Promise<UpdateLlmProviderOutput> {
  const db = getDatabase();
  
  const validatedInput = UpdateLlmProviderInputSchema.parse(input);
  
  const { id, ...updates } = validatedInput;
  
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

  if (!provider) {
    throw new Error("Failed to update provider");
  }

  return UpdateLlmProviderOutputSchema.parse(provider);
}