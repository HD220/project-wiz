# Provider Registry Implementation Guide

This guide provides step-by-step implementation for creating a dynamic provider registry system in Project Wiz, leveraging the existing LLM provider infrastructure.

## Architecture Overview

The Provider Registry system builds on the existing `LlmProviderService` to create dynamic, user-configurable AI providers that can be used throughout the application without hardcoded dependencies.

### Current System Analysis

The project already has:

- `LlmProviderService` with encrypted API key storage
- User-specific provider configuration
- Provider validation and testing
- Database schema for provider management

## Implementation Steps

### Step 1: Core Registry Service

```typescript
// src/main/features/agent/ai-sdk/provider-registry.service.ts
import { LlmProviderService } from "../llm-provider/llm-provider.service";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

interface CachedProvider {
  instance: any;
  lastUsed: number;
  config: {
    id: string;
    name: string;
    type: string;
  };
}

export class ProviderRegistryService {
  private static cache = new Map<string, CachedProvider>();
  private static readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Get or create provider instance
   */
  static async getProvider(providerId: string) {
    // Check cache first
    const cached = this.cache.get(providerId);
    if (cached && Date.now() - cached.lastUsed < this.CACHE_TTL) {
      cached.lastUsed = Date.now();
      return cached.instance;
    }

    // Create new provider instance
    const instance = await this.createProvider(providerId);

    // Cache the instance
    const providerConfig = await LlmProviderService.findById(providerId);
    if (providerConfig) {
      this.cache.set(providerId, {
        instance,
        lastUsed: Date.now(),
        config: {
          id: providerId,
          name: providerConfig.name,
          type: providerConfig.type,
        },
      });
    }

    return instance;
  }

  /**
   * Create provider instance from database configuration
   */
  private static async createProvider(providerId: string) {
    const config = await LlmProviderService.findById(providerId);
    if (!config) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }

    if (!config.isActive) {
      throw new Error(`Provider ${config.name} is not active`);
    }

    const apiKey = await LlmProviderService.getDecryptedApiKey(providerId);

    switch (config.type) {
      case "openai":
        return createOpenAI({
          apiKey,
          baseURL: config.baseUrl || undefined,
        });

      case "anthropic":
        return createAnthropic({
          apiKey,
          baseURL: config.baseUrl || undefined,
        });

      case "deepseek":
      case "openai-compatible":
        return createOpenAICompatible({
          name: config.name.toLowerCase().replace(/\s+/g, "-"),
          baseURL: config.baseUrl || "https://api.deepseek.com/v1",
          apiKey,
        });

      default:
        throw new Error(`Unsupported provider type: ${config.type}`);
    }
  }

  /**
   * Validate provider connection
   */
  static async validateProvider(providerId: string): Promise<boolean> {
    try {
      const provider = await this.getProvider(providerId);
      // Perform a simple test call
      // Implementation depends on provider type
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear cache for specific provider
   */
  static clearProvider(providerId: string): void {
    this.cache.delete(providerId);
  }

  /**
   * Clear all cached providers
   */
  static clearAll(): void {
    this.cache.clear();
  }

  /**
   * Cleanup expired cache entries
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.lastUsed > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cached provider info
   */
  static getCachedProviders(): Array<{
    id: string;
    name: string;
    type: string;
    lastUsed: Date;
  }> {
    return Array.from(this.cache.entries()).map(([id, cached]) => ({
      id,
      name: cached.config.name,
      type: cached.config.type,
      lastUsed: new Date(cached.lastUsed),
    }));
  }
}
```

### Step 2: AI Generation Service

```typescript
// src/main/features/agent/ai-sdk/ai-generation.service.ts
import { generateText, generateObject, streamText } from "ai";
import { ProviderRegistryService } from "./provider-registry.service";
import { z } from "zod";

export interface GenerateTextParams {
  providerId: string;
  model: string;
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface GenerateObjectParams<T> {
  providerId: string;
  model: string;
  prompt: string;
  schema: z.ZodSchema<T>;
  temperature?: number;
}

export interface StreamTextParams {
  providerId: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  systemPrompt?: string;
}

export class AiGenerationService {
  /**
   * Generate text using specified provider and model
   */
  static async generateText(
    params: GenerateTextParams,
  ): Promise<{ text: string; usage?: any }> {
    const provider = await ProviderRegistryService.getProvider(
      params.providerId,
    );
    const model = provider(params.model);

    const messages = params.messages || [
      { role: "user", content: params.prompt || "" },
    ];

    if (params.systemPrompt) {
      messages.unshift({ role: "system", content: params.systemPrompt });
    }

    const result = await generateText({
      model,
      messages,
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens || 2048,
    });

    return {
      text: result.text,
      usage: result.usage,
    };
  }

  /**
   * Generate structured object using specified provider and model
   */
  static async generateObject<T>(
    params: GenerateObjectParams<T>,
  ): Promise<{ object: T; usage?: any }> {
    const provider = await ProviderRegistryService.getProvider(
      params.providerId,
    );
    const model = provider(params.model);

    const result = await generateObject({
      model,
      prompt: params.prompt,
      schema: params.schema,
      temperature: params.temperature || 0.7,
    });

    return {
      object: result.object,
      usage: result.usage,
    };
  }

  /**
   * Stream text generation
   */
  static async streamText(params: StreamTextParams) {
    const provider = await ProviderRegistryService.getProvider(
      params.providerId,
    );
    const model = provider(params.model);

    const messages = [...params.messages];
    if (params.systemPrompt) {
      messages.unshift({ role: "system", content: params.systemPrompt });
    }

    return streamText({
      model,
      messages,
      temperature: params.temperature || 0.7,
    });
  }

  /**
   * Test provider connection with a simple generation
   */
  static async testProvider(
    providerId: string,
    model: string,
  ): Promise<boolean> {
    try {
      const result = await this.generateText({
        providerId,
        model,
        prompt: "Hello",
        maxTokens: 10,
      });
      return result.text.length > 0;
    } catch (error) {
      return false;
    }
  }
}
```

### Step 3: Model Discovery Service

```typescript
// src/main/features/agent/ai-sdk/model-discovery.service.ts
import { LlmProviderService } from "../llm-provider/llm-provider.service";

export interface ModelInfo {
  id: string;
  displayName: string;
  providerId: string;
  providerName: string;
  capabilities: {
    supportsImages: boolean;
    supportsTools: boolean;
    supportsStreaming: boolean;
    contextLength: number;
    reasoning: boolean;
  };
}

export class ModelDiscoveryService {
  /**
   * Get available models for a provider
   */
  static async getProviderModels(providerId: string): Promise<ModelInfo[]> {
    const provider = await LlmProviderService.findById(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    switch (provider.type) {
      case "openai":
        return this.getOpenAIModels(provider);
      case "anthropic":
        return this.getAnthropicModels(provider);
      case "deepseek":
        return this.getDeepSeekModels(provider);
      default:
        return this.getGenericModels(provider);
    }
  }

  /**
   * Get all available models for user
   */
  static async getAllUserModels(userId: string): Promise<ModelInfo[]> {
    const providers = await LlmProviderService.findByUserId(userId);
    const activeProviders = providers.filter((p) => p.isActive);

    const modelPromises = activeProviders.map((provider) =>
      this.getProviderModels(provider.id),
    );

    const modelArrays = await Promise.all(modelPromises);
    return modelArrays.flat();
  }

  private static async getOpenAIModels(provider: any): Promise<ModelInfo[]> {
    try {
      // Try to fetch models from API
      const apiKey = await LlmProviderService.getDecryptedApiKey(provider.id);
      const baseURL = provider.baseUrl || "https://api.openai.com/v1";

      const response = await fetch(`${baseURL}/models`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.map((model: any) => ({
          id: model.id,
          displayName: model.id,
          providerId: provider.id,
          providerName: provider.name,
          capabilities: this.inferOpenAICapabilities(model.id),
        }));
      }
    } catch (error) {
      // Fallback to static list
    }

    // Static fallback
    return [
      {
        id: "gpt-4o",
        displayName: "GPT-4o",
        providerId: provider.id,
        providerName: provider.name,
        capabilities: {
          supportsImages: true,
          supportsTools: true,
          supportsStreaming: true,
          contextLength: 128000,
          reasoning: false,
        },
      },
      {
        id: "gpt-4-turbo",
        displayName: "GPT-4 Turbo",
        providerId: provider.id,
        providerName: provider.name,
        capabilities: {
          supportsImages: true,
          supportsTools: true,
          supportsStreaming: true,
          contextLength: 128000,
          reasoning: false,
        },
      },
    ];
  }

  private static getAnthropicModels(provider: any): ModelInfo[] {
    return [
      {
        id: "claude-3-5-sonnet-20241022",
        displayName: "Claude 3.5 Sonnet",
        providerId: provider.id,
        providerName: provider.name,
        capabilities: {
          supportsImages: true,
          supportsTools: true,
          supportsStreaming: true,
          contextLength: 200000,
          reasoning: false,
        },
      },
      {
        id: "claude-3-haiku-20240307",
        displayName: "Claude 3 Haiku",
        providerId: provider.id,
        providerName: provider.name,
        capabilities: {
          supportsImages: true,
          supportsTools: true,
          supportsStreaming: true,
          contextLength: 200000,
          reasoning: false,
        },
      },
    ];
  }

  private static getDeepSeekModels(provider: any): ModelInfo[] {
    return [
      {
        id: "deepseek-chat",
        displayName: "DeepSeek Chat",
        providerId: provider.id,
        providerName: provider.name,
        capabilities: {
          supportsImages: false,
          supportsTools: true,
          supportsStreaming: true,
          contextLength: 32000,
          reasoning: false,
        },
      },
      {
        id: "deepseek-coder",
        displayName: "DeepSeek Coder",
        providerId: provider.id,
        providerName: provider.name,
        capabilities: {
          supportsImages: false,
          supportsTools: true,
          supportsStreaming: true,
          contextLength: 16000,
          reasoning: false,
        },
      },
    ];
  }

  private static getGenericModels(provider: any): ModelInfo[] {
    return [
      {
        id: "default",
        displayName: "Default Model",
        providerId: provider.id,
        providerName: provider.name,
        capabilities: {
          supportsImages: false,
          supportsTools: false,
          supportsStreaming: true,
          contextLength: 4096,
          reasoning: false,
        },
      },
    ];
  }

  private static inferOpenAICapabilities(modelId: string) {
    const isGPT4 = modelId.includes("gpt-4");
    const isReasoning = modelId.includes("o1") || modelId.includes("o3");

    return {
      supportsImages: isGPT4 && !isReasoning,
      supportsTools: !isReasoning,
      supportsStreaming: true,
      contextLength: isGPT4 ? 128000 : 4096,
      reasoning: isReasoning,
    };
  }
}
```

### Step 4: Integration with Agent System

```typescript
// Update existing agent service to use new AI generation
// src/main/features/agent/agent.service.ts (addition)

import { AiGenerationService } from "./ai-sdk/ai-generation.service";

export class AgentService {
  // ... existing methods

  /**
   * Generate response using agent's configured provider and model
   */
  static async generateResponse(params: {
    agentId: string;
    message: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  }): Promise<{ text: string; usage?: any }> {
    const agent = await this.getById(params.agentId);

    if (!agent.providerId || !agent.model) {
      throw new Error("Agent must have a configured provider and model");
    }

    const messages = params.conversationHistory || [];
    messages.push({ role: "user", content: params.message });

    return AiGenerationService.generateText({
      providerId: agent.providerId,
      model: agent.model,
      messages,
      systemPrompt: agent.systemPrompt || undefined,
      temperature: agent.temperature || 0.7,
      maxTokens: agent.maxTokens || 2048,
    });
  }

  /**
   * Test agent's provider configuration
   */
  static async testAgentProvider(agentId: string): Promise<boolean> {
    const agent = await this.getById(agentId);

    if (!agent.providerId || !agent.model) {
      return false;
    }

    return AiGenerationService.testProvider(agent.providerId, agent.model);
  }
}
```

### Step 5: Error Handling and Monitoring

```typescript
// src/main/features/agent/ai-sdk/ai-error-handler.service.ts

export class AiSdkError extends Error {
  constructor(
    message: string,
    public providerId: string,
    public modelId: string,
    public code?: string,
    public retryable: boolean = false,
    public originalError?: Error,
  ) {
    super(message);
    this.name = "AiSdkError";
  }
}

export class AiErrorHandlerService {
  /**
   * Wrap AI generation calls with error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    providerId: string,
    modelId: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      // Provider-specific error handling
      if (error.message?.includes("insufficient_quota")) {
        throw new AiSdkError(
          "API quota exceeded for provider",
          providerId,
          modelId,
          "quota_exceeded",
          false,
          error,
        );
      }

      if (error.status === 429) {
        throw new AiSdkError(
          "Rate limit exceeded",
          providerId,
          modelId,
          "rate_limit",
          true,
          error,
        );
      }

      if (error.status === 401) {
        throw new AiSdkError(
          "Invalid API key or authentication failed",
          providerId,
          modelId,
          "auth_failed",
          false,
          error,
        );
      }

      // Generic error
      throw new AiSdkError(
        error.message || "AI generation failed",
        providerId,
        modelId,
        "unknown",
        false,
        error,
      );
    }
  }

  /**
   * Retry logic for retryable errors
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    providerId: string,
    modelId: string,
    maxRetries: number = 3,
    delayMs: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.withErrorHandling(operation, providerId, modelId);
      } catch (error) {
        lastError = error as Error;

        if (error instanceof AiSdkError && !error.retryable) {
          throw error; // Don't retry non-retryable errors
        }

        if (attempt < maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayMs * attempt),
          );
        }
      }
    }

    throw lastError!;
  }
}
```

### Step 6: Usage in Conversation Service

```typescript
// Update conversation service to use new AI generation
// src/main/features/conversation/conversation.service.ts (addition)

import { AgentService } from "../agent/agent.service";
import { AiErrorHandlerService } from "../agent/ai-sdk/ai-error-handler.service";

export class ConversationService {
  // ... existing methods

  /**
   * Process message with AI agent
   */
  static async processMessageWithAgent(params: {
    conversationId: string;
    agentId: string;
    userMessage: string;
  }): Promise<{ messageId: string; response: string }> {
    const conversation = await this.getById(params.conversationId);
    const agent = await AgentService.getById(params.agentId);

    // Get recent conversation history
    const history = await MessageService.getRecentHistory(
      params.conversationId,
      20, // last 20 messages
    );

    // Generate AI response with error handling and retry
    const result = await AiErrorHandlerService.withRetry(
      () =>
        AgentService.generateResponse({
          agentId: params.agentId,
          message: params.userMessage,
          conversationHistory: history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      agent.providerId!,
      agent.model!,
      3, // max retries
      2000, // 2 second delay
    );

    // Save AI response
    const message = await MessageService.create({
      conversationId: params.conversationId,
      senderId: params.agentId,
      role: "assistant",
      content: result.text,
      metadata: {
        usage: result.usage,
        providerId: agent.providerId,
        model: agent.model,
      },
    });

    return {
      messageId: message.id,
      response: result.text,
    };
  }
}
```

## Testing the Implementation

```typescript
// tests/provider-registry.test.ts
import { ProviderRegistryService } from "../src/main/features/agent/ai-sdk/provider-registry.service";
import { AiGenerationService } from "../src/main/features/agent/ai-sdk/ai-generation.service";

describe("Provider Registry", () => {
  beforeEach(() => {
    ProviderRegistryService.clearAll();
  });

  it("should cache provider instances", async () => {
    const providerId = "test-provider-1";

    const provider1 = await ProviderRegistryService.getProvider(providerId);
    const provider2 = await ProviderRegistryService.getProvider(providerId);

    expect(provider1).toBe(provider2); // Same instance
  });

  it("should generate text using cached provider", async () => {
    const result = await AiGenerationService.generateText({
      providerId: "test-provider-1",
      model: "gpt-4",
      prompt: "Hello, world!",
    });

    expect(result.text).toBeDefined();
    expect(result.text.length).toBeGreaterThan(0);
  });
});
```

## Integration Steps

1. **Install Dependencies**:

   ```bash
   npm install ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/openai-compatible
   ```

2. **Create Service Files**: Copy the service implementations above

3. **Update Agent Schema**: Add `model`, `temperature`, `maxTokens`, and `systemPrompt` fields

4. **Update Database**: Run migrations if schema changes are needed

5. **Test Integration**: Start with a simple test provider and model

6. **Update UI**: Modify agent configuration forms to include model selection

This implementation provides a robust, cacheable, and extensible provider registry system that integrates seamlessly with the existing Project Wiz architecture.
