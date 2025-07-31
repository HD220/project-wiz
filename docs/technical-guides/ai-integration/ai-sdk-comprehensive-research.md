# AI SDK Comprehensive Research & Implementation Guide

## Research Overview

This document contains extensive research on the Vercel AI SDK for implementation in Project Wiz, focusing on dynamic provider registration, user-configurable LLM providers, and simple integration patterns.

## AI SDK Core Capabilities

### Unified API Design

- **Single Interface**: Abstracts differences between 20+ providers (OpenAI, Anthropic, Google, Mistral, etc.)
- **Vendor Lock-in Prevention**: Easy switching between providers using the same API
- **Standardized Response Format**: Consistent handling across all providers

### Provider Support (2025)

- **OpenAI**: GPT-4, GPT-4.5, o3-mini, reasoning models, PDF input
- **Anthropic**: Claude 3.7 Sonnet, reasoning support, computer tools, PDF support
- **Google**: Gemini models with various capabilities
- **Community Providers**: 100+ models via OpenRouter
- **Self-hosted**: Ollama, custom deployments

## Current Project Architecture Analysis

### Existing LLM Provider Structure

Based on codebase analysis, the project already has:

```typescript
// Schema: src/main/agents/llm-providers/llm-providers.schema.ts
export type ProviderType = "openai" | "deepseek" | "anthropic";

export const llmProvidersTable = sqliteTable("llm_providers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").$type<ProviderType>().notNull(),
  apiKey: text("api_key").notNull(), // Encrypted storage
  baseUrl: text("base_url"),
  isDefault: integer("is_default", { mode: "boolean" }),
  isActive: integer("is_active", { mode: "boolean" }),
  // timestamps...
});
```

### Current Service Layer Features

The `LlmProviderService` already provides:

- ✅ **Encrypted API Key Storage**: AES-256-GCM encryption
- ✅ **Provider CRUD Operations**: Create, read, update, delete
- ✅ **API Key Testing**: Connectivity validation
- ✅ **Default Provider Management**: Per-user default selection
- ✅ **Security**: API key masking for UI display

## AI SDK Integration Architecture

### 1. Dynamic Provider Factory Pattern

```typescript
// src/main/agents/ai-sdk/dynamic-provider.service.ts
export class DynamicProviderService {
  /**
   * Creates provider based ONLY on user configuration
   * NO hardcoded data
   */
  static async createProvider(providerId: string) {
    const config = await LlmProviderService.findById(providerId);
    if (!config) throw new Error("Provider not found");

    const apiKey = await LlmProviderService.getDecryptedApiKey(providerId);

    // Auto-detect API type by URL/response - NO hardcoded types
    const apiType = await this.detectApiType(config.apiUrl, apiKey, config);

    switch (apiType) {
      case "openai-compatible":
        return this.createOpenAICompatible(config, apiKey);
      case "anthropic":
        return this.createAnthropic(config, apiKey);
      default:
        return this.createGeneric(config, apiKey);
    }
  }

  /**
   * Auto-detects API type - NO predefined mappings
   */
  private static async detectApiType(
    apiUrl: string,
    apiKey: string,
    config: any,
  ): Promise<string> {
    try {
      // Test OpenAI-compatible endpoint
      const modelsResponse = await fetch(`${apiUrl}/models`, {
        headers: this.buildHeaders(apiKey, config),
      });

      if (modelsResponse.ok) {
        const data = await modelsResponse.json();
        if (data.data && Array.isArray(data.data)) {
          return "openai-compatible";
        }
      }

      // Test Anthropic endpoint
      const anthropicResponse = await fetch(`${apiUrl}/messages`, {
        method: "POST",
        headers: this.buildHeaders(apiKey, config),
        body: JSON.stringify({
          model: "test",
          max_tokens: 1,
          messages: [{ role: "user", content: "test" }],
        }),
      });

      if (anthropicResponse.status === 400) {
        return "anthropic";
      }

      return "generic";
    } catch {
      return "generic";
    }
  }
}
```

### 2. AI SDK Service Layer

```typescript
// src/main/agents/ai-sdk/ai-sdk.service.ts
import { generateText, generateObject, streamText } from "ai";

export class AiSdkService {
  /**
   * Get configured provider instance
   */
  static async getProviderInstance(providerId: string) {
    const provider = await LlmProviderService.findById(providerId);
    if (!provider) throw new Error("Provider not found");

    const apiKey = await LlmProviderService.getDecryptedApiKey(providerId);

    return ProviderFactory.createProvider({
      type: provider.type,
      apiKey,
      baseUrl: provider.baseUrl,
    });
  }

  /**
   * Generate text using specified provider
   */
  static async generateText(params: {
    providerId: string;
    model: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    const provider = await this.getProviderInstance(params.providerId);
    const model = provider(params.model);

    return generateText({
      model,
      prompt: params.prompt,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
    });
  }

  /**
   * Stream text generation
   */
  static async streamText(params: {
    providerId: string;
    model: string;
    messages: Array<{ role: string; content: string }>;
  }) {
    const provider = await this.getProviderInstance(params.providerId);
    const model = provider(params.model);

    return streamText({
      model,
      messages: params.messages,
    });
  }

  /**
   * Generate structured objects
   */
  static async generateObject(params: {
    providerId: string;
    model: string;
    prompt: string;
    schema: any; // Zod schema
  }) {
    const provider = await this.getProviderInstance(params.providerId);
    const model = provider(params.model);

    return generateObject({
      model,
      prompt: params.prompt,
      schema: params.schema,
    });
  }
}
```

### 3. Model Management Enhancement

Extend the current provider schema to include model information:

```typescript
// Add to llm-providers.schema.ts
export const llmModelsTable = sqliteTable("llm_models", {
  id: text("id").primaryKey(),
  providerId: text("provider_id").references(() => llmProvidersTable.id),
  modelId: text("model_id").notNull(), // e.g., "gpt-4", "claude-3-haiku"
  displayName: text("display_name").notNull(),
  capabilities: text("capabilities", { mode: "json" }), // JSON array
  contextLength: integer("context_length"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});
```

### 4. Provider Registry System

```typescript
// src/main/agents/ai-sdk/provider-registry.service.ts
export class ProviderRegistry {
  private static providers = new Map();

  /**
   * Register provider instance for reuse
   */
  static register(providerId: string, instance: any) {
    this.providers.set(providerId, {
      instance,
      lastUsed: Date.now(),
    });
  }

  /**
   * Get cached provider or create new one
   */
  static async get(providerId: string) {
    if (this.providers.has(providerId)) {
      const cached = this.providers.get(providerId);
      cached.lastUsed = Date.now();
      return cached.instance;
    }

    const instance = await AiSdkService.getProviderInstance(providerId);
    this.register(providerId, instance);
    return instance;
  }

  /**
   * Cleanup old instances
   */
  static cleanup() {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [key, value] of this.providers.entries()) {
      if (now - value.lastUsed > maxAge) {
        this.providers.delete(key);
      }
    }
  }
}
```

## Integration with Agent System

### Enhanced Agent Configuration

```typescript
// Update agents.schema.ts to include model selection
export const agentsTable = sqliteTable("agents", {
  // existing fields...
  providerId: text("provider_id").references(() => llmProvidersTable.id),
  modelId: text("model_id").notNull(), // specific model name
  temperature: real("temperature").default(0.7),
  maxTokens: integer("max_tokens").default(2048),
  systemPrompt: text("system_prompt"),
});
```

### Agent Conversation Service Integration

```typescript
// Update conversation service to use AI SDK
export class AgentChatService {
  static async sendMessage(params: {
    agentId: string;
    message: string;
    conversationId: string;
  }) {
    const agent = await AgentService.findById(params.agentId);
    if (!agent) throw new Error("Agent not found");

    // Use AI SDK for generation
    const result = await AiSdkService.generateText({
      providerId: agent.providerId,
      model: agent.modelId,
      prompt: this.buildPrompt(agent.systemPrompt, params.message),
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
    });

    // Save message and response
    await MessageService.create({
      conversationId: params.conversationId,
      role: "assistant",
      content: result.text,
      agentId: params.agentId,
    });

    return result;
  }
}
```

## Required Dependencies

```json
{
  "dependencies": {
    "ai": "^4.2.0",
    "@ai-sdk/openai": "^1.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "@ai-sdk/openai-compatible": "^1.0.0"
  }
}
```

## Implementation Steps

### Phase 1: Core AI SDK Integration

1. Install AI SDK dependencies
2. Create ProviderFactory service
3. Create AiSdkService for basic operations
4. Update existing agent chat to use AI SDK

### Phase 2: Enhanced Provider Management

1. Add model management table and service
2. Implement provider registry for caching
3. Add model discovery from provider APIs
4. Update UI to show available models

### Phase 3: Advanced Features

1. Add streaming support for real-time chat
2. Implement structured generation for agents
3. Add tool calling capabilities
4. Integrate with memory system

## Benefits of This Architecture

### 1. **Simplicity**

- Leverages existing provider management system
- Minimal changes to current codebase
- Clear separation of concerns

### 2. **Flexibility**

- Easy to add new providers
- User-configurable without code changes
- Runtime provider switching

### 3. **Performance**

- Provider instance caching
- Efficient connection reuse
- Lazy loading of providers

### 4. **Security**

- Maintains existing encryption
- API keys never exposed to frontend
- Secure provider validation

### 5. **Maintainability**

- Standardized AI SDK interface
- Type-safe throughout
- Easy testing and mocking

## Error Handling Strategy

```typescript
export class AiSdkError extends Error {
  constructor(
    message: string,
    public providerId: string,
    public originalError?: Error
  ) {
    super(message);
  }
}

// Wrap all AI SDK calls with proper error handling
static async safeGenerateText(params: GenerateTextParams) {
  try {
    return await this.generateText(params);
  } catch (error) {
    throw new AiSdkError(
      `Failed to generate text with provider ${params.providerId}`,
      params.providerId,
      error as Error
    );
  }
}
```

## Testing Strategy

```typescript
// Mock provider for testing
export const mockProvider = (responses: string[]) => {
  let callCount = 0;
  return {
    generateText: () =>
      Promise.resolve({
        text: responses[callCount++] || "Mock response",
      }),
  };
};

// Test service
describe("AiSdkService", () => {
  beforeEach(() => {
    ProviderRegistry.clear();
  });

  it("should generate text using configured provider", async () => {
    // Test implementation
  });
});
```

## Monitoring and Observability

```typescript
// Add usage tracking
export class AiSdkMetrics {
  static trackUsage(providerId: string, tokenCount: number, latency: number) {
    // Track provider usage statistics
  }

  static getProviderStats(providerId: string) {
    // Return usage metrics
  }
}
```

This architecture provides a solid foundation for integrating AI SDK while maintaining the simplicity and security of the existing system. The implementation can be done incrementally without breaking changes to the current codebase.
