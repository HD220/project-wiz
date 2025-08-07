import * as crypto from "crypto";

import { eq, and, desc, like, sql, isNull } from "drizzle-orm";

import { agentsTable } from "@/main/schemas/agent.schema";
import {
  llmProvidersTable,
  type SelectLlmProvider,
  type InsertLlmProvider,
  type UpdateLlmProvider,
  type ProviderType,
} from "@/main/schemas/llm-provider.schema";

import { createDatabaseConnection } from "@/shared/config/database";

const { getDatabase } = createDatabaseConnection(true);

// Encryption key for API key storage (32 bytes for AES-256)
const validEncryptionKey = Buffer.from(
  "5ca95f9b8176faa6a2493fb069edeeae74b27044164b00862d100ba1d8ec57ec",
  "hex",
);

/**
 * Encrypt API key for secure storage
 */
function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", validEncryptionKey, iv);

  let encrypted = cipher.update(apiKey, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Combine IV, auth tag and encrypted data
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, "base64"),
  ]);
  return combined.toString("base64");
}

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

/**
 * Find LLM provider by ID with ownership validation
 */
export async function findLlmProvider(
  id: string,
  ownerId: string,
): Promise<SelectLlmProvider | null> {
  const db = getDatabase();

  const [provider] = await db
    .select()
    .from(llmProvidersTable)
    .where(
      and(eq(llmProvidersTable.id, id), eq(llmProvidersTable.ownerId, ownerId)),
    )
    .limit(1);

  return provider || null;
}

/**
 * Find LLM provider by ID without ownership validation (for system operations)
 */
export async function findLlmProviderById(
  id: string,
): Promise<SelectLlmProvider | null> {
  const db = getDatabase();

  const [provider] = await db
    .select()
    .from(llmProvidersTable)
    .where(eq(llmProvidersTable.id, id))
    .limit(1);

  return provider || null;
}

/**
 * Create new LLM provider with encrypted API key
 */
export async function createLlmProvider(
  data: InsertLlmProvider,
): Promise<SelectLlmProvider> {
  const db = getDatabase();

  // Encrypt API key before storing
  const encryptedApiKey = encryptApiKey(data.apiKey);

  const [provider] = await db
    .insert(llmProvidersTable)
    .values({
      ...data,
      apiKey: encryptedApiKey,
    })
    .returning();

  if (!provider) {
    throw new Error(
      `Failed to create LLM provider "${data.name}" of type "${data.type}"`,
    );
  }

  return provider;
}

/**
 * Update LLM provider with ownership validation
 */
export async function updateLlmProvider(
  data: UpdateLlmProvider & { ownerId: string },
): Promise<SelectLlmProvider | null> {
  const db = getDatabase();

  const { ownerId, ...updates } = data; // Remove ownerId from updates using destructuring

  // If updating API key, encrypt it
  if (updates.apiKey) {
    updates.apiKey = encryptApiKey(updates.apiKey);
  }

  // If setting this provider as default, remove default from all others first
  if (updates.isDefault === true) {
    await db
      .update(llmProvidersTable)
      .set({ isDefault: false })
      .where(eq(llmProvidersTable.ownerId, data.ownerId));
  }

  const [provider] = await db
    .update(llmProvidersTable)
    .set({
      ...updates,
      updatedAt: sql`(strftime('%s', 'now'))`,
    })
    .where(
      and(
        eq(llmProvidersTable.id, data.id),
        eq(llmProvidersTable.ownerId, data.ownerId),
      ),
    )
    .returning();

  return provider || null;
}

/**
 * List LLM providers with filters and ownership validation
 */
export async function listLlmProviders(filters: {
  ownerId: string;
  type?: ProviderType;
  search?: string;
  showInactive?: boolean;
}): Promise<SelectLlmProvider[]> {
  const db = getDatabase();

  const conditions = [eq(llmProvidersTable.ownerId, filters.ownerId)];

  // Apply active/inactive filter
  if (!filters.showInactive) {
    conditions.push(isNull(llmProvidersTable.deactivatedAt));
  }

  // Apply type filter
  if (filters.type) {
    conditions.push(eq(llmProvidersTable.type, filters.type));
  }

  // Apply search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = `%${filters.search.trim()}%`;
    conditions.push(like(llmProvidersTable.name, searchTerm));
  }

  const providers = await db
    .select()
    .from(llmProvidersTable)
    .where(and(...conditions))
    .orderBy(desc(llmProvidersTable.createdAt));

  return providers;
}

/**
 * Get default LLM provider for user
 */
export async function getDefaultLlmProvider(
  ownerId: string,
): Promise<SelectLlmProvider | null> {
  const db = getDatabase();

  const [provider] = await db
    .select()
    .from(llmProvidersTable)
    .where(
      and(
        eq(llmProvidersTable.ownerId, ownerId),
        eq(llmProvidersTable.isDefault, true),
        isNull(llmProvidersTable.deactivatedAt),
      ),
    )
    .limit(1);

  return provider || null;
}

/**
 * Set LLM provider as default for user
 */
export async function setDefaultLlmProvider(
  providerId: string,
  ownerId: string,
): Promise<void> {
  const db = getDatabase();

  // First, remove default from all other providers for this user
  await db
    .update(llmProvidersTable)
    .set({ isDefault: false })
    .where(eq(llmProvidersTable.ownerId, ownerId));

  // Then set this provider as default
  const result = await db
    .update(llmProvidersTable)
    .set({ isDefault: true })
    .where(
      and(
        eq(llmProvidersTable.id, providerId),
        eq(llmProvidersTable.ownerId, ownerId),
      ),
    );

  if (result.changes === 0) {
    throw new Error("Provider not found or access denied");
  }
}

/**
 * Get decrypted API key for LLM provider with ownership validation
 */
export async function getDecryptedApiKey(
  providerId: string,
  ownerId: string,
): Promise<string> {
  const db = getDatabase();

  const [provider] = await db
    .select()
    .from(llmProvidersTable)
    .where(
      and(
        eq(llmProvidersTable.id, providerId),
        eq(llmProvidersTable.ownerId, ownerId),
      ),
    )
    .limit(1);

  if (!provider) {
    throw new Error(`LLM provider not found or access denied: ${providerId}`);
  }

  // Decrypt the API key
  return decryptApiKey(provider.apiKey);
}

/**
 * Soft delete LLM provider with ownership validation and dependency check
 */
export async function inactivateLlmProvider(
  id: string,
  ownerId: string,
): Promise<SelectLlmProvider | null> {
  const db = getDatabase();

  // First verify ownership
  const provider = await findLlmProvider(id, ownerId);
  if (!provider) {
    throw new Error("Provider not found or access denied");
  }

  // Check if any agent is using this provider
  const [agentUsingProvider] = await db
    .select({ id: agentsTable.id })
    .from(agentsTable)
    .where(eq(agentsTable.providerId, id))
    .limit(1);

  if (agentUsingProvider) {
    throw new Error(
      "Cannot deactivate provider: It is currently being used by one or more agents. Please delete or reassign the agents first.",
    );
  }

  const [updatedProvider] = await db
    .update(llmProvidersTable)
    .set({
      deactivatedAt: new Date(),
      updatedAt: sql`(strftime('%s', 'now'))`,
    })
    .where(
      and(eq(llmProvidersTable.id, id), eq(llmProvidersTable.ownerId, ownerId)),
    )
    .returning();

  return updatedProvider || null;
}

/**
 * Hard delete LLM provider (for testing or admin operations)
 */
export async function deleteLlmProvider(
  id: string,
  ownerId: string,
): Promise<boolean> {
  const db = getDatabase();

  // First verify ownership
  const provider = await findLlmProvider(id, ownerId);
  if (!provider) {
    throw new Error("Provider not found or access denied");
  }

  // Check if any agent is using this provider
  const [agentUsingProvider] = await db
    .select({ id: agentsTable.id })
    .from(agentsTable)
    .where(eq(agentsTable.providerId, id))
    .limit(1);

  if (agentUsingProvider) {
    throw new Error(
      "Cannot delete provider: It is currently being used by one or more agents. Please delete or reassign the agents first.",
    );
  }

  const result = await db
    .delete(llmProvidersTable)
    .where(
      and(eq(llmProvidersTable.id, id), eq(llmProvidersTable.ownerId, ownerId)),
    );

  return result.changes > 0;
}
