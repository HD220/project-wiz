import crypto from "crypto";

import { eq, and, desc, sql } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { agentsTable } from "@/main/features/agent/agent.model";
import { llmProvidersTable } from "@/main/features/agent/llm-provider/llm-provider.model";
import type {
  CreateProviderInput,
  LlmProvider,
} from "@/main/features/agent/llm-provider/llm-provider.types";
import { createProviderSchema } from "@/main/features/agent/llm-provider/llm-provider.types";

// Encryption configuration
const ENCRYPTION_KEY = process.env["ENCRYPTION_KEY"];

if (!ENCRYPTION_KEY) {
  console.error(
    "FATAL: ENCRYPTION_KEY environment variable is required for secure API key storage",
  );
  process.exit(1);
}

export class LlmProviderService {
  /**
   * Encrypt API key for secure storage
   */
  private static encryptApiKey(apiKey: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);

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
        ENCRYPTION_KEY,
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
   * Sanitize provider for display (hide API keys)
   */
  private static sanitizeForDisplay(provider: LlmProvider): LlmProvider {
    return {
      ...provider,
      apiKey: "••••••••", // Mask API key for UI
    };
  }

  /**
   * Find all providers for a user (sorted newest first, API keys masked)
   */
  static async findByUserId(userId: string): Promise<LlmProvider[]> {
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

  /**
   * Find default provider by user ID (alias for getDefaultProvider)
   */
  static async findDefaultByUserId(
    userId: string,
  ): Promise<LlmProvider | null> {
    return this.getDefaultProvider(userId);
  }

  /**
   * Test API key connectivity using simplified ping approach
   */
  static async testApiKey(
    type: "openai" | "deepseek" | "anthropic" | "google" | "custom",
    apiKey: string,
    baseUrl?: string,
  ): Promise<{ valid: boolean; message: string; model?: string }> {
    try {
      const baseUrls = {
        openai: "https://api.openai.com/v1",
        deepseek: "https://api.deepseek.com/v1",
        anthropic: "https://api.anthropic.com/v1",
        google: "https://generativelanguage.googleapis.com/v1beta",
      };

      // For anthropic, use different endpoint and headers
      if (type === "anthropic") {
        const url = `${baseUrl || baseUrls.anthropic}/messages`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            ["x-api-key"]: apiKey,
            ["Content-Type"]: "application/json",
            ["anthropic-version"]: "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 1,
            messages: [{ role: "user", content: "test" }],
          }),
        });

        if (response.status === 400) {
          // 400 means API key is valid but request is malformed (expected)
          return {
            valid: true,
            message: "Valid API key.",
            model: "claude-3-haiku-20240307",
          };
        }
      }

      // For OpenAI-compatible providers (including custom)
      const targetBaseUrl =
        baseUrl || baseUrls[type as keyof typeof baseUrls] || baseUrl;
      if (!targetBaseUrl) {
        return {
          valid: false,
          message: "Base URL is required for custom providers",
        };
      }

      const url = `${targetBaseUrl}/models`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ["Content-Type"]: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const modelCount = data.data?.length || 0;
        const firstModel = data.data?.[0]?.id;

        return {
          valid: true,
          message: `Valid API key. ${modelCount} models available.`,
          model: firstModel,
        };
      }

      const errorData = await response.json().catch(() => ({}));
      return {
        valid: false,
        message:
          errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }
}
