# Vercel AI SDK v4 Implementation Guide

## Overview

Project Wiz implements a **production-ready AI integration** using Vercel AI SDK v4 with enterprise-grade patterns including multi-provider support, encrypted storage, and advanced memory systems.

**Current Implementation**: AI SDK v4.3.16 with TypeScript strict mode, supporting OpenAI, Anthropic, DeepSeek, and custom providers.

## Current Architecture

### **Production Dependencies**

```json
{
  "@ai-sdk/anthropic": "^1.2.12",
  "@ai-sdk/openai": "^1.3.23",
  "@ai-sdk/openai-compatible": "^0.2.16",
  "ai": "^4.3.16"
}
```

### **Provider Implementation Status**

- ✅ **OpenAI**: Complete with custom baseURL support
- ✅ **Anthropic**: Full Claude integration
- ✅ **DeepSeek**: OpenAI-compatible implementation
- ✅ **Custom Providers**: Generic OpenAI-compatible pattern

## Current Production Implementation

### **LLM Service Architecture**

The `LLMService` provides type-safe, encrypted model access across providers:

```typescript
// src/main/features/agent/llm-provider/llm.service.ts
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export class LLMService {
  /**
   * Get configured model for user with automatic provider resolution
   */
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

### **Encrypted Provider Management**

API keys are encrypted using AES-256-GCM before storage:

```typescript
// src/main/features/agent/llm-provider/llm-provider.service.ts
export class LlmProviderService {
  /**
   * Create provider with encrypted API key storage
   */
  static async create(input: CreateProviderInput): Promise<LlmProvider> {
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
        apiKey: encryptedApiKey, // Stored encrypted
        baseUrl: validatedInput.baseUrl,
        defaultModel: validatedInput.defaultModel,
        isDefault: validatedInput.isDefault,
        isActive: validatedInput.isActive,
      })
      .returning();

    return provider;
  }

  /**
   * AES-256-GCM encryption implementation
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
}
```

### **Memory System Integration**

Advanced memory system with importance scoring:

```typescript
// src/main/features/agent/memory/memory.model.ts
export const agentMemoriesTable = sqliteTable("agent_memories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  agentId: text("agent_id")
    .notNull()
    .references(() => agentsTable.id),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  content: text("content").notNull(),
  summary: text("summary"), // Brief summary for quick retrieval
  type: text("type").$type<MemoryType>().notNull().default("conversation"),
  importance: text("importance")
    .$type<MemoryImportance>()
    .notNull()
    .default("medium"),
  importanceScore: real("importance_score").notNull().default(0.5), // 0.0 to 1.0
  accessCount: integer("access_count").notNull().default(0),
  keywords: text("keywords"), // JSON array for search
  metadata: text("metadata"), // JSON object for additional context
  // ... timestamps and soft deletion fields
});
```

## Production Usage Patterns

### **1. Text Generation in Agent Service**

```typescript
// src/main/features/agent/agent.service.ts
import { generateText } from "ai";

export class AgentService {
  static async generateResponse(
    agentId: string,
    userId: string,
    message: string,
  ): Promise<string> {
    // Get configured model for user
    const model = await LLMService.getModel(userId);
    const agent = await this.findById(agentId);

    const { text } = await generateText({
      model,
      system: agent.instructions,
      prompt: message,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return text;
  }
}
```

### **2. Conversation Context Management**

```typescript
// Real conversation handling with message history
const messages = conversation.messages.map((msg) => ({
  role: msg.senderType === "user" ? ("user" as const) : ("assistant" as const),
  content: msg.content,
}));

const { text } = await generateText({
  model: await LLMService.getModel(userId, providerId),
  messages: [
    { role: "system", content: agent.instructions },
    ...messages,
    { role: "user", content: newMessage },
  ],
});
```

### **3. Multi-Provider Failover**

```typescript
export class LLMService {
  static async getModelWithFallback(userId: string) {
    try {
      // Try default provider first
      return await this.getModel(userId);
    } catch (error) {
      console.warn("Default provider failed, trying fallback");

      // Get all active providers for user
      const providers = await LlmProviderService.findByUserId(userId);
      const fallbackProvider = providers.find(
        (p) => !p.isDefault && p.isActive,
      );

      if (fallbackProvider) {
        return await this.getModel(userId, fallbackProvider.id);
      }

      throw new Error("No available providers");
    }
  }
}
```

## Enterprise Security Patterns

### **1. API Key Protection**

- Keys encrypted with AES-256-GCM before database storage
- Decryption only happens in main process for API calls
- No keys exposed to renderer process or logs

### **2. Provider Validation**

```typescript
// Zod schema validation for all provider inputs
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
```

### **3. Error Handling Pattern**

```typescript
// Standardized error handling across all AI operations
try {
  const result = await generateText({ model, prompt });
  return { success: true, data: result.text };
} catch (error) {
  const errorMessage =
    error instanceof Error ? error.message : "AI generation failed";
  logger.error("ai-generation", { error: errorMessage, userId, agentId });
  return { success: false, error: errorMessage };
}
```

## Current Integration Architecture

The current implementation spans multiple service layers:

### **Main Process Services**

- **`LLMService`**: Provider-agnostic model access
- **`LlmProviderService`**: Encrypted provider management
- **`AgentService`**: AI agent orchestration
- **`MemoryService`**: Advanced memory system

### **Database Layer**

- **`llmProvidersTable`**: Encrypted provider configurations
- **`agentMemoriesTable`**: Advanced memory with importance scoring
- **`agentsTable`**: Agent configurations and instructions

### **IPC Communication**

- Type-safe handlers for all AI operations
- Automatic error handling and logging
- Standardized response patterns

## Advanced Implementation Examples

### **1. Agent with Memory Integration**

```typescript
export class AgentService {
  static async generateWithMemory(
    agentId: string,
    userId: string,
    message: string,
  ) {
    // Retrieve relevant memories
    const memories = await MemoryService.searchMemories(agentId, message, {
      limit: 5,
      minImportance: 7.0,
    });

    // Build context from memories
    const memoryContext = memories.map((m) => m.content).join("\n");

    const model = await LLMService.getModel(userId);
    const agent = await this.findById(agentId);

    const { text } = await generateText({
      model,
      system: `${agent.instructions}\n\nRelevant memories:\n${memoryContext}`,
      prompt: message,
    });

    // Store new memory
    await MemoryService.storeMemory(agentId, text, 6.0);

    return text;
  }
}
```

### **2. Streaming Implementation**

```typescript
// For future streaming implementation
import { streamText } from "ai";

export class ConversationService {
  static async streamResponse(userId: string, message: string) {
    const model = await LLMService.getModel(userId);

    const stream = await streamText({
      model,
      prompt: message,
    });

    // Handle stream in main process, send chunks via IPC
    for await (const chunk of stream.textStream) {
      // Send chunk to renderer via IPC
      mainWindow.webContents.send("ai-stream-chunk", chunk);
    }
  }
}
```

## Implementation References

### **Core Files**

- `/src/main/features/agent/llm-provider/llm.service.ts` - Model access service
- `/src/main/features/agent/llm-provider/llm-provider.service.ts` - Provider management
- `/src/main/features/agent/memory/memory.service.ts` - Memory system
- `/src/main/features/agent/agent.service.ts` - Agent orchestration

### **Database Models**

- `/src/main/features/agent/llm-provider/llm-provider.model.ts` - Provider schema
- `/src/main/features/agent/memory/memory.model.ts` - Memory schema
- `/src/main/features/agent/agent.model.ts` - Agent schema

### **Related Guides**

- [Provider Patterns](./ai-sdk-provider-patterns.md) - Multi-provider architecture
- [Provider Registry](./createProviderRegistry-implementation-guide.md) - Management patterns
- [Queue Patterns](./queue-patterns-implementation.md) - Background processing

**🎯 Next Steps**: Explore [Provider Patterns](./ai-sdk-provider-patterns.md) for multi-provider implementation or [Memory System](../../../src/main/features/agent/memory/) for advanced memory patterns.
