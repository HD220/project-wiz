# AI SDK Provider Patterns & Configuration Guide

## Provider Configuration Patterns

### OpenAI Provider Configuration

```typescript
import { createOpenAI } from "@ai-sdk/openai";

// Basic configuration
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to env var
  organization: "org-123", // optional
  project: "proj-456", // optional
});

// Custom configuration for proxy/alternative endpoints
const customOpenAI = createOpenAI({
  baseURL: "https://your-proxy.com/v1",
  apiKey: "your-key",
  compatibility: "compatible", // or 'strict'
});

// Model usage
const model = openai("gpt-4-turbo");
const response = await generateText({
  model,
  prompt: "Hello world",
});
```

### Anthropic Provider Configuration

```typescript
import { createAnthropic } from "@ai-sdk/anthropic";

// Basic configuration
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // defaults to env var
});

// Custom configuration
const customAnthropic = createAnthropic({
  baseURL: "https://custom-endpoint.com/v1",
  apiKey: "your-key",
  headers: {
    "Custom-Header": "value",
  },
});

// Model usage with reasoning
const model = anthropic("claude-3-haiku-20240307");
const response = await generateText({
  model,
  messages: [{ role: "user", content: "Explain quantum computing" }],
});
```

### OpenAI-Compatible Providers

```typescript
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// DeepSeek configuration
const deepseek = createOpenAICompatible({
  name: "deepseek",
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// Other compatible providers
const groq = createOpenAICompatible({
  name: "groq",
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const together = createOpenAICompatible({
  name: "together",
  baseURL: "https://api.together.xyz/v1",
  apiKey: process.env.TOGETHER_API_KEY,
});
```

## Dynamic Provider Registration Patterns

### Registry Pattern Implementation

```typescript
interface ProviderConfig {
  type: "openai" | "anthropic" | "openai-compatible";
  name: string;
  apiKey: string;
  baseURL?: string;
  organization?: string;
  headers?: Record<string, string>;
}

class DynamicProviderRegistry {
  private providers = new Map<string, any>();
  private configs = new Map<string, ProviderConfig>();

  register(id: string, config: ProviderConfig) {
    this.configs.set(id, config);

    // Create provider instance based on type
    let provider;
    switch (config.type) {
      case "openai":
        provider = createOpenAI({
          apiKey: config.apiKey,
          baseURL: config.baseURL,
          organization: config.organization,
        });
        break;

      case "anthropic":
        provider = createAnthropic({
          apiKey: config.apiKey,
          baseURL: config.baseURL,
          headers: config.headers,
        });
        break;

      case "openai-compatible":
        provider = createOpenAICompatible({
          name: config.name,
          baseURL: config.baseURL!,
          apiKey: config.apiKey,
        });
        break;

      default:
        throw new Error(`Unsupported provider type: ${config.type}`);
    }

    this.providers.set(id, provider);
  }

  get(id: string) {
    return this.providers.get(id);
  }

  list() {
    return Array.from(this.configs.entries()).map(([id, config]) => ({
      id,
      name: config.name,
      type: config.type,
    }));
  }

  remove(id: string) {
    this.providers.delete(id);
    this.configs.delete(id);
  }
}
```

### Model Selection Patterns

```typescript
interface ModelCapabilities {
  supportsImages: boolean;
  supportsTools: boolean;
  supportsStreaming: boolean;
  contextLength: number;
  reasoning: boolean;
}

interface ModelInfo {
  id: string;
  displayName: string;
  provider: string;
  capabilities: ModelCapabilities;
}

class ModelManager {
  private models = new Map<string, ModelInfo[]>();

  async discoverModels(providerId: string): Promise<ModelInfo[]> {
    const provider = registry.get(providerId);
    const config = registry.getConfig(providerId);

    // For OpenAI and compatible providers
    if (config.type === "openai" || config.type === "openai-compatible") {
      return this.discoverOpenAIModels(config);
    }

    // For Anthropic
    if (config.type === "anthropic") {
      return this.getAnthropicModels();
    }

    return [];
  }

  private async discoverOpenAIModels(
    config: ProviderConfig,
  ): Promise<ModelInfo[]> {
    try {
      const response = await fetch(
        `${config.baseURL || "https://api.openai.com/v1"}/models`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      return data.data.map((model: any) => ({
        id: model.id,
        displayName: model.id,
        provider: config.name,
        capabilities: this.inferCapabilities(model.id),
      }));
    } catch (error) {
      console.error("Failed to discover models:", error);
      return [];
    }
  }

  private getAnthropicModels(): ModelInfo[] {
    // Static list for Anthropic since they don't have a models endpoint
    return [
      {
        id: "claude-3-haiku-20240307",
        displayName: "Claude 3 Haiku",
        provider: "anthropic",
        capabilities: {
          supportsImages: true,
          supportsTools: true,
          supportsStreaming: true,
          contextLength: 200000,
          reasoning: false,
        },
      },
      {
        id: "claude-3-sonnet-20240229",
        displayName: "Claude 3 Sonnet",
        provider: "anthropic",
        capabilities: {
          supportsImages: true,
          supportsTools: true,
          supportsStreaming: true,
          contextLength: 200000,
          reasoning: false,
        },
      },
      {
        id: "claude-3-opus-20240229",
        displayName: "Claude 3 Opus",
        provider: "anthropic",
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

  private inferCapabilities(modelId: string): ModelCapabilities {
    // Basic capability inference based on model ID
    const isGPT4 = modelId.includes("gpt-4");
    const isReasoning = modelId.includes("o1") || modelId.includes("o3");

    return {
      supportsImages: isGPT4,
      supportsTools: !isReasoning, // reasoning models don't support tools
      supportsStreaming: true,
      contextLength: isGPT4 ? 128000 : 4096,
      reasoning: isReasoning,
    };
  }
}
```

## Usage Patterns

### Text Generation

```typescript
async function generateText(
  providerId: string,
  modelId: string,
  prompt: string,
) {
  const provider = registry.get(providerId);
  const model = provider(modelId);

  const { text } = await generateText({
    model,
    prompt,
    temperature: 0.7,
    maxTokens: 2048,
  });

  return text;
}
```

### Streaming Generation

```typescript
async function* streamText(
  providerId: string,
  modelId: string,
  messages: any[],
) {
  const provider = registry.get(providerId);
  const model = provider(modelId);

  const { textStream } = await streamText({
    model,
    messages,
  });

  for await (const delta of textStream) {
    yield delta;
  }
}
```

### Object Generation

```typescript
import { z } from "zod";

const RecipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  cookingTime: z.number(),
});

async function generateRecipe(providerId: string, modelId: string) {
  const provider = registry.get(providerId);
  const model = provider(modelId);

  const { object } = await generateObject({
    model,
    schema: RecipeSchema,
    prompt: "Generate a simple pasta recipe",
  });

  return object;
}
```

### Tool Calling

```typescript
import { z } from "zod";

const weatherTool = {
  description: "Get weather information",
  parameters: z.object({
    location: z.string().describe("The city name"),
  }),
  execute: async ({ location }: { location: string }) => {
    // Implement weather API call
    return `Weather in ${location}: 22°C, sunny`;
  },
};

async function chatWithTools(
  providerId: string,
  modelId: string,
  message: string,
) {
  const provider = registry.get(providerId);
  const model = provider(modelId);

  const { text } = await generateText({
    model,
    messages: [{ role: "user", content: message }],
    tools: { weather: weatherTool },
  });

  return text;
}
```

## Error Handling Patterns

### Provider-Specific Error Handling

```typescript
class ProviderError extends Error {
  constructor(
    message: string,
    public providerId: string,
    public code?: string,
    public retryable: boolean = false,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

async function safeGenerateText(params: any) {
  try {
    return await generateText(params);
  } catch (error: any) {
    // OpenAI errors
    if (error.message?.includes("insufficient_quota")) {
      throw new ProviderError(
        "API quota exceeded",
        params.providerId,
        "quota_exceeded",
        false,
      );
    }

    // Rate limit errors
    if (error.status === 429) {
      throw new ProviderError(
        "Rate limit exceeded",
        params.providerId,
        "rate_limit",
        true,
      );
    }

    // Generic error
    throw new ProviderError(
      error.message || "Generation failed",
      params.providerId,
      "unknown",
      false,
    );
  }
}
```

### Retry Logic

```typescript
async function generateWithRetry(
  params: any,
  maxRetries: number = 3,
  delay: number = 1000,
) {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await safeGenerateText(params);
    } catch (error) {
      lastError = error as Error;

      if (error instanceof ProviderError && !error.retryable) {
        throw error; // Don't retry non-retryable errors
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError!;
}
```

## Configuration Management

### Environment-Based Configuration

```typescript
interface ProviderEnvironmentConfig {
  [key: string]: {
    type: string;
    apiKey: string;
    baseURL?: string;
  };
}

function loadProvidersFromEnvironment(): ProviderEnvironmentConfig {
  return {
    openai: {
      type: "openai",
      apiKey: process.env.OPENAI_API_KEY!,
      baseURL: process.env.OPENAI_BASE_URL,
    },
    anthropic: {
      type: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY!,
      baseURL: process.env.ANTHROPIC_BASE_URL,
    },
    deepseek: {
      type: "openai-compatible",
      apiKey: process.env.DEEPSEEK_API_KEY!,
      baseURL: "https://api.deepseek.com/v1",
    },
  };
}
```

### Database-Driven Configuration

```typescript
async function loadProvidersFromDatabase(userId: string) {
  const providers = await LlmProviderService.findByUserId(userId);

  for (const provider of providers) {
    if (!provider.isActive) continue;

    const apiKey = await LlmProviderService.getDecryptedApiKey(provider.id);

    registry.register(provider.id, {
      type: provider.type as any,
      name: provider.name,
      apiKey,
      baseURL: provider.baseUrl || undefined,
    });
  }
}
```

This comprehensive guide provides all the patterns needed to implement dynamic AI SDK provider management in your Project Wiz application.
