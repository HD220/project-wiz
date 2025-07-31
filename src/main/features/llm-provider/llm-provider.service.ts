import crypto from "crypto";

import { eq, and, desc, sql, like } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { agentsTable } from "@/main/features/agent/agent.model";

import { llmProvidersTable } from "./llm-provider.model";
import { createProviderSchema } from "./llm-provider.types";

import type {
  CreateProviderInput,
  LlmProvider,
  ProviderType,
} from "./llm-provider.types";
// import { getLogger } from "@/main/utils/logger";

// Filter interface for provider listing
interface ProviderFilters {
  type?: ProviderType;
  search?: string;
  showInactive?: boolean;
}

// Encryption key for API key storage (32 bytes for AES-256)
const validEncryptionKey = Buffer.from(
  "5ca95f9b8176faa6a2493fb069edeeae74b27044164b00862d100ba1d8ec57ec",
  "hex",
);

export class LlmProviderService {
  /**
   * Encrypt API key for secure storage
   */
  private static encryptApiKey(apiKey: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", validEncryptionKey, iv);

    let encrypted = cipher.update(apiKey, "utf8", "base64");
    encrypted += cipher.final("base64");

    const authTag = cipher.getAuthTag();

    // Combine IV, auth tag, and encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, "base64"),
    ]);
    return combined.toString("base64");
  }

  /**
   * Decrypt API key for use
   */
  private static decryptApiKey(encryptedData: string): string {
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
   * Create a new LLM provider
   */
  static async create(input: CreateProviderInput): Promise<LlmProvider> {
    // Validate input
    const validatedInput = createProviderSchema.parse(input);

    const db = getDatabase();

    // Encrypt API key before storage
    const encryptedApiKey = this.encryptApiKey(validatedInput.apiKey);

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

    return provider;
  }

  /**
   * Find all providers for a user (sorted newest first, API keys masked, with filtering)
   */
  static async findByUserId(
    userId: string,
    filters: ProviderFilters = {},
  ): Promise<LlmProvider[]> {
    const db = getDatabase();

    // Build where conditions inline following INLINE-FIRST principles
    const conditions = [eq(llmProvidersTable.userId, userId)];

    // Apply active/inactive filter inline
    if (!filters.showInactive) {
      conditions.push(eq(llmProvidersTable.isActive, true));
    }

    // Apply type filter inline
    if (filters.type) {
      conditions.push(eq(llmProvidersTable.type, filters.type));
    }

    // Apply search filter inline
    if (filters.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      conditions.push(like(llmProvidersTable.name, searchTerm));
    }

    const providers = await db
      .select()
      .from(llmProvidersTable)
      .where(and(...conditions))
      .orderBy(desc(llmProvidersTable.createdAt));

    // Sanitize API keys for display
    return providers.map((provider) => ({
      ...provider,
      apiKey: "••••••••", // Mask API key for UI
    }));
  }

  /**
   * Find a provider by ID
   */
  static async findById(id: string): Promise<LlmProvider | null> {
    const db = getDatabase();

    const [provider] = await db
      .select()
      .from(llmProvidersTable)
      .where(eq(llmProvidersTable.id, id))
      .limit(1);

    return provider || null;
  }

  /**
   * Get decrypted API key for a provider (for internal use)
   */
  static async getDecryptedApiKey(providerId: string): Promise<string> {
    const provider = await this.findById(providerId);

    if (!provider) {
      throw new Error("Provider not found");
    }

    return this.decryptApiKey(provider.apiKey);
  }

  /**
   * Update a provider
   */
  static async update(
    id: string,
    updates: Partial<CreateProviderInput>,
  ): Promise<LlmProvider> {
    const db = getDatabase();

    // If updating API key, encrypt it
    if (updates.apiKey) {
      updates.apiKey = this.encryptApiKey(updates.apiKey);
    }

    // If setting this provider as default, unset all other providers as default first
    if (updates.isDefault === true) {
      // Get the provider to find the userId
      const [currentProvider] = await db
        .select({ userId: llmProvidersTable.userId })
        .from(llmProvidersTable)
        .where(eq(llmProvidersTable.id, id))
        .limit(1);

      if (!currentProvider) {
        throw new Error("Provider not found");
      }

      // Unset all other providers as default for this user
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

    return provider;
  }

  /**
   * Delete a provider
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();

    // First check if any agents are using this provider
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
      .where(eq(llmProvidersTable.id, id));

    if (result.changes === 0) {
      throw new Error("Provider not found");
    }
  }

  /**
   * Set a provider as default for a user
   */
  static async setAsDefault(providerId: string, userId: string): Promise<void> {
    const db = getDatabase();

    // First, unset all other providers as default for this user
    await db
      .update(llmProvidersTable)
      .set({ isDefault: false })
      .where(eq(llmProvidersTable.userId, userId));

    // Then set this provider as default
    const result = await db
      .update(llmProvidersTable)
      .set({ isDefault: true })
      .where(eq(llmProvidersTable.id, providerId));

    if (result.changes === 0) {
      throw new Error("Provider not found");
    }
  }

  /**
   * Get default provider for a user
   */
  static async getDefaultProvider(userId: string): Promise<LlmProvider | null> {
    const db = getDatabase();

    const [provider] = await db
      .select()
      .from(llmProvidersTable)
      .where(
        and(
          eq(llmProvidersTable.userId, userId),
          eq(llmProvidersTable.isDefault, true),
          eq(llmProvidersTable.isActive, true),
        ),
      )
      .limit(1);

    return provider || null;
  }
}
