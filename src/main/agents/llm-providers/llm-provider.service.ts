import crypto from "crypto";

import { eq, and, desc, sql } from "drizzle-orm";

import { agentsTable } from "@/main/agents/agents.schema";
import type {
  CreateProviderInput,
  SelectLlmProvider,
} from "@/main/agents/llm-providers/llm-provider.types";
import { createProviderSchema } from "@/main/agents/llm-providers/llm-provider.types";
import { llmProvidersTable } from "@/main/agents/llm-providers/llm-providers.schema";
import { getDatabase } from "@/main/database/connection";

// Encryption configuration
const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env["ENCRYPTION_KEY"] || crypto.randomBytes(32);

export class LlmProviderService {
  /**
   * Convert SQLite timestamp to Date object
   */
  private static convertTimestampToDate(timestamp: any): Date {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === "number") {
      // SQLite timestamps are in seconds, JS Date expects milliseconds
      return new Date(timestamp * 1000);
    }
    if (typeof timestamp === "string") {
      return new Date(timestamp);
    }
    return new Date();
  }

  /**
   * Sanitize provider dates for consistent format
   */
  private static sanitizeDates(provider: SelectLlmProvider): SelectLlmProvider {
    return {
      ...provider,
      createdAt: this.convertTimestampToDate(provider.createdAt),
      updatedAt: this.convertTimestampToDate(provider.updatedAt),
    };
  }

  /**
   * Encrypt API key for secure storage
   */
  private static encryptApiKey(apiKey: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

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

      const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
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
  static async create(input: CreateProviderInput): Promise<SelectLlmProvider> {
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
        isDefault: validatedInput.isDefault,
        isActive: validatedInput.isActive,
      })
      .returning();

    if (!provider) {
      throw new Error("Failed to create LLM provider");
    }

    return this.sanitizeDates(provider);
  }

  /**
   * Sanitize provider for display (hide API keys)
   */
  private static sanitizeForDisplay(
    provider: SelectLlmProvider,
  ): SelectLlmProvider {
    return {
      ...this.sanitizeDates(provider),
      apiKey: "••••••••", // Mask API key for UI
    };
  }

  /**
   * Find all providers for a user (sorted newest first, API keys masked)
   */
  static async findByUserId(userId: string): Promise<SelectLlmProvider[]> {
    const db = getDatabase();

    const providers = await db
      .select()
      .from(llmProvidersTable)
      .where(eq(llmProvidersTable.userId, userId))
      .orderBy(desc(llmProvidersTable.createdAt));

    // Sanitize API keys for display
    return providers.map((provider) => this.sanitizeForDisplay(provider));
  }

  /**
   * Find a provider by ID
   */
  static async findById(id: string): Promise<SelectLlmProvider | null> {
    const db = getDatabase();

    const [provider] = await db
      .select()
      .from(llmProvidersTable)
      .where(eq(llmProvidersTable.id, id))
      .limit(1);

    return provider ? this.sanitizeDates(provider) : null;
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
  ): Promise<SelectLlmProvider> {
    const db = getDatabase();

    // If updating API key, encrypt it
    if (updates.apiKey) {
      updates.apiKey = this.encryptApiKey(updates.apiKey);
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

    return this.sanitizeDates(provider);
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
  static async getDefaultProvider(
    userId: string,
  ): Promise<SelectLlmProvider | null> {
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

    return provider ? this.sanitizeDates(provider) : null;
  }
}
