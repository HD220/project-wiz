# AI SDK Multi-Provider Architecture Patterns

## Overview

Project Wiz implements a **production-ready multi-provider architecture** using Vercel AI SDK v4 with encrypted storage, type-safe configuration, and automatic failover capabilities.

**Current Implementation**: Supports OpenAI, Anthropic, DeepSeek, and custom OpenAI-compatible providers with enterprise-grade security and management.

## Production Provider Implementation

### **Current Provider Support**

```typescript
// src/main/features/agent/llm-provider/llm-provider.types.ts
export type ProviderType =
  | "openai"
  | "anthropic"
  | "deepseek"
  | "google"
  | "custom";

export interface LlmProvider {
  id: string;
  userId: string;
  name: string;
  type: ProviderType;
  apiKey: string; // Encrypted in database
  baseUrl?: string | null;
  defaultModel: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### **LLM Service Provider Resolution**

The `LLMService` provides dynamic provider resolution with automatic encryption handling:

```typescript
// src/main/features/agent/llm-provider/llm.service.ts
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export class LLMService {
  static async getModel(
    userId: string,
    providerId?: string,
    modelName?: string,
  ) {
    // 1. Resolve provider configuration
    const provider = await this.getProviderConfig(userId, providerId);
    const apiKey = await LlmProviderService.getDecryptedApiKey(provider.id);
    const model = modelName || provider.defaultModel;

    // 2. Create model based on provider type
    switch (provider.type) {
      case "openai": {
        const openaiProvider = createOpenAI({
          apiKey,
          baseURL: provider.baseUrl || undefined,
        });
        return openaiProvider(model);
      }

      case "anthropic": {
        const anthropicProvider = createAnthropic({
          apiKey,
          baseURL: provider.baseUrl || undefined,
        });
        return anthropicProvider(model);
      }

      case "deepseek":
      case "google":
      case "custom":
      default: {
        // Use OpenAI-compatible for everything else
        const customProvider = createOpenAICompatible({
          name: provider.type,
          baseURL: provider.baseUrl || "https://api.openai.com/v1",
          apiKey,
        });
        return customProvider(model);
      }
    }
  }
}
```

## Provider Configuration Patterns

### **1. OpenAI Provider**

```typescript
// Database configuration for OpenAI provider
const openaiProvider = await LlmProviderService.create({
  userId: "user-123",
  name: "My OpenAI Provider",
  type: "openai",
  apiKey: "sk-...", // Automatically encrypted
  baseUrl: null, // Uses default OpenAI endpoint
  defaultModel: "gpt-4o",
  isDefault: true,
  isActive: true,
});

// Results in this model creation:
const model = createOpenAI({
  apiKey: decryptedKey,
  baseURL: provider.baseUrl || undefined, // Optional custom endpoint
});
```

### **2. Anthropic Provider**

```typescript
// Database configuration for Anthropic provider
const anthropicProvider = await LlmProviderService.create({
  userId: "user-123",
  name: "Claude Provider",
  type: "anthropic",
  apiKey: "sk-ant-...", // Automatically encrypted
  baseUrl: null, // Uses default Anthropic endpoint
  defaultModel: "claude-3-5-sonnet-20241022",
  isDefault: false,
  isActive: true,
});

// Results in this model creation:
const model = createAnthropic({
  apiKey: decryptedKey,
  baseURL: provider.baseUrl || undefined,
});
```

### **3. DeepSeek Provider (OpenAI-Compatible)**

```typescript
// Database configuration for DeepSeek
const deepseekProvider = await LlmProviderService.create({
  userId: "user-123",
  name: "DeepSeek Provider",
  type: "deepseek",
  apiKey: "sk-...", // Automatically encrypted
  baseUrl: "https://api.deepseek.com/v1", // Required for DeepSeek
  defaultModel: "deepseek-chat",
  isDefault: false,
  isActive: true,
});

// Results in this model creation:
const model = createOpenAICompatible({
  name: "deepseek",
  baseURL: "https://api.deepseek.com/v1",
  apiKey: decryptedKey,
});
```

### **4. Custom Provider (OpenAI-Compatible)**

```typescript
// Database configuration for custom provider
const customProvider = await LlmProviderService.create({
  userId: "user-123",
  name: "Local Ollama Server",
  type: "custom",
  apiKey: "optional-key", // Some local servers don't require keys
  baseUrl: "http://localhost:11434/v1",
  defaultModel: "llama3.1:8b",
  isDefault: false,
  isActive: true,
});

// Results in this model creation:
const model = createOpenAICompatible({
  name: "custom",
  baseURL: "http://localhost:11434/v1",
  apiKey: decryptedKey,
});
```

## Advanced Provider Management

### **Provider Service Operations**

```typescript
// src/main/features/agent/llm-provider/llm-provider.service.ts
export class LlmProviderService {
  /**
   * Create provider with automatic encryption
   */
  static async create(input: CreateProviderInput): Promise<LlmProvider> {
    const validatedInput = createProviderSchema.parse(input);
    const encryptedApiKey = this.encryptApiKey(validatedInput.apiKey);

    const [provider] = await db
      .insert(llmProvidersTable)
      .values({
        ...validatedInput,
        apiKey: encryptedApiKey, // Stored encrypted
      })
      .returning();

    return provider;
  }

  /**
   * List providers with filtering and search
   */
  static async findByUserId(
    userId: string,
    filters: ProviderFilters = {},
  ): Promise<LlmProvider[]> {
    const conditions = [eq(llmProvidersTable.userId, userId)];

    // Apply filters inline (following INLINE-FIRST principles)
    if (!filters.showInactive) {
      conditions.push(eq(llmProvidersTable.isActive, true));
    }
    if (filters.type) {
      conditions.push(eq(llmProvidersTable.type, filters.type));
    }
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
   * Get default provider for user
   */
  static async getDefaultProvider(userId: string): Promise<LlmProvider | null> {
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
```

### **Multi-Provider Failover Pattern**

```typescript
export class LLMService {
  /**
   * Get model with automatic failover to backup providers
   */
  static async getModelWithFallback(userId: string) {
    try {
      // Try default provider first
      return await this.getModel(userId);
    } catch (error) {
      console.warn("Default provider failed, trying fallback");

      // Get all active providers for user
      const providers = await LlmProviderService.findByUserId(userId, {
        showInactive: false,
      });

      // Try each non-default provider
      for (const provider of providers.filter((p) => !p.isDefault)) {
        try {
          return await this.getModel(userId, provider.id);
        } catch (fallbackError) {
          console.warn(`Provider ${provider.name} failed:`, fallbackError);
          continue;
        }
      }

      throw new Error("No available providers");
    }
  }

  /**
   * Test provider connection
   */
  static async testProvider(providerId: string): Promise<boolean> {
    try {
      const provider = await LlmProviderService.findById(providerId);
      if (!provider) return false;

      const model = await this.getModel(provider.userId, providerId);

      // Simple test generation
      const { text } = await generateText({
        model,
        prompt: "Say 'test successful'",
        maxTokens: 10,
      });

      return text.toLowerCase().includes("test");
    } catch {
      return false;
    }
  }
}
```

## Security & Encryption Patterns

### **AES-256-GCM Encryption Implementation**

```typescript
// src/main/features/agent/llm-provider/llm-provider.service.ts
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
}
```

## Database Schema & Validation

### **Provider Table Schema**

```typescript
// src/main/features/agent/llm-provider/llm-provider.model.ts
export const llmProvidersTable = sqliteTable(
  "llm_providers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id),
    name: text("name").notNull(),
    type: text("type").$type<ProviderType>().notNull(),
    apiKey: text("api_key").notNull(), // Encrypted
    baseUrl: text("base_url"),
    defaultModel: text("default_model").notNull(),
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    // Soft deletion support
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),
    deactivatedBy: text("deactivated_by").references(() => usersTable.id),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    // Performance indexes
    userIdIdx: index("llm_providers_user_id_idx").on(table.userId),
    typeIdx: index("llm_providers_type_idx").on(table.type),
    isDefaultIdx: index("llm_providers_is_default_idx").on(table.isDefault),
    isActiveIdx: index("llm_providers_is_active_idx").on(table.isActive),
    createdAtIdx: index("llm_providers_created_at_idx").on(table.createdAt),
  }),
);
```

### **Zod Validation Schema**

```typescript
// src/main/features/agent/llm-provider/llm-provider.types.ts
export const createProviderSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
  type: z.enum(["openai", "anthropic", "deepseek", "google", "custom"]),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  defaultModel: z.string().min(1),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
```

## Usage Examples

### **Basic Provider Usage**

```typescript
// Create and use a provider
const provider = await LlmProviderService.create({
  userId: "user-123",
  name: "My OpenAI Provider",
  type: "openai",
  apiKey: "sk-...",
  defaultModel: "gpt-4o",
  isDefault: true,
});

// Generate text using the provider
const model = await LLMService.getModel("user-123", provider.id);
const { text } = await generateText({
  model,
  prompt: "Hello, world!",
});
```

### **Advanced Multi-Provider Setup**

```typescript
// Set up multiple providers for a user
const providers = await Promise.all([
  LlmProviderService.create({
    userId: "user-123",
    name: "Primary OpenAI",
    type: "openai",
    apiKey: "sk-...",
    defaultModel: "gpt-4o",
    isDefault: true,
  }),
  LlmProviderService.create({
    userId: "user-123",
    name: "Backup Claude",
    type: "anthropic",
    apiKey: "sk-ant-...",
    defaultModel: "claude-3-5-sonnet-20241022",
    isDefault: false,
  }),
  LlmProviderService.create({
    userId: "user-123",
    name: "Local DeepSeek",
    type: "deepseek",
    apiKey: "sk-...",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    isDefault: false,
  }),
]);

// Use with automatic failover
const model = await LLMService.getModelWithFallback("user-123");
```

## Related Implementation Files

### **Core Provider Files**

- `/src/main/features/agent/llm-provider/llm.service.ts` - Model access service
- `/src/main/features/agent/llm-provider/llm-provider.service.ts` - Provider management
- `/src/main/features/agent/llm-provider/llm-provider.model.ts` - Database schema
- `/src/main/features/agent/llm-provider/llm-provider.types.ts` - TypeScript definitions

### **Related Guides**

- [Vercel AI SDK Guide](./vercel-ai-sdk-guide.md) - Core SDK implementation
- [Provider Registry Guide](./createProviderRegistry-implementation-guide.md) - Management patterns
- [Queue Patterns](./queue-patterns-implementation.md) - Background processing

**🎯 Next Steps**: Explore [Provider Registry Implementation](./createProviderRegistry-implementation-guide.md) for advanced management patterns or [Vercel AI SDK Guide](./vercel-ai-sdk-guide.md) for core usage patterns.
