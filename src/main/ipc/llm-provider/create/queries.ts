import crypto from "crypto";
import { z } from "zod";
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

// Input validation schema baseado em CreateProviderInput
export const CreateLlmProviderInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Provider name is required"),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Invalid URL").optional().nullable(),
  defaultModel: z.string().min(1, "Default model is required").default("gpt-3.5-turbo"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Output validation schema baseado em SelectLlmProvider
export const CreateLlmProviderOutputSchema = z.object({
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

export type CreateLlmProviderInput = z.infer<typeof CreateLlmProviderInputSchema>;
export type CreateLlmProviderOutput = z.infer<typeof CreateLlmProviderOutputSchema>;

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

export async function createLlmProvider(input: CreateLlmProviderInput): Promise<CreateLlmProviderOutput> {
  const db = getDatabase();
  
  const validatedInput = CreateLlmProviderInputSchema.parse(input);
  
  // Encriptar API key antes de armazenar
  const encryptedApiKey = encryptApiKey(validatedInput.apiKey);
  
  const [provider] = await db
    .insert(llmProvidersTable)
    .values({
      userId: validatedInput.userId,
      name: validatedInput.name,
      type: validatedInput.type,
      apiKey: encryptedApiKey,
      baseUrl: validatedInput.baseUrl,
      defaultModel: validatedInput.defaultModel,
      isDefault: validatedInput.isDefault,
      isActive: validatedInput.isActive,
    })
    .returning();

  if (!provider) {
    throw new Error("Failed to create LLM provider");
  }

  return CreateLlmProviderOutputSchema.parse(provider);
}