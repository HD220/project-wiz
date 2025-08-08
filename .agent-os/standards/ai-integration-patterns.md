# AI Integration Patterns

## Context

AI integration patterns for project-wiz using Vercel AI SDK with multiple LLM providers.

## Provider Management Architecture

### Supported Providers
- **OpenAI**: GPT models (gpt-4, gpt-3.5-turbo, etc.)
- **Anthropic**: Claude models (claude-3-sonnet, claude-3-haiku, etc.)  
- **DeepSeek**: DeepSeek models for cost-effective operations

### Provider Configuration Pattern
```typescript
// src/shared/types/llm-provider.types.ts
export interface LLMProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'deepseek';
  apiKey: string; // Encrypted in database
  baseUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deactivatedAt?: Date;
}

// Zod schema for validation
export const LLMProviderSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(['openai', 'anthropic', 'deepseek']),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});
```

### Database Schema for Providers
```typescript
// src/main/schemas/llm-provider.schema.ts
export const llmProvidersTable = sqliteTable('llm_providers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'openai' | 'anthropic' | 'deepseek'
  apiKeyEncrypted: text('api_key_encrypted').notNull(), // AES-256-GCM encrypted
  baseUrl: text('base_url'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  deactivatedAt: integer('deactivated_at', { mode: 'timestamp' }),
  deactivatedBy: text('deactivated_by'),
});
```

## IPC Handler Patterns

### Provider Management Handlers
```typescript
// src/main/ipc/llm-provider/create/invoke.ts
const createProviderHandler = createIPCHandler({
  inputSchema: z.object({
    name: z.string().min(1),
    type: z.enum(['openai', 'anthropic', 'deepseek']),
    apiKey: z.string().min(1),
    baseUrl: z.string().url().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: LLMProviderSchema.optional(),
    error: z.string().optional(),
  }),
  handler: async (input) => {
    try {
      // Encrypt API key before storage
      const encryptedKey = encryptApiKey(input.apiKey);
      
      const provider = await db.insert(llmProvidersTable)
        .values({
          id: generateId(),
          name: input.name,
          type: input.type,
          apiKeyEncrypted: encryptedKey,
          baseUrl: input.baseUrl,
        })
        .returning();
        
      // Don't return encrypted key in response
      const { apiKeyEncrypted, ...safeProvider } = provider[0];
      
      return { success: true, data: safeProvider };
    } catch (error) {
      logger.error('Failed to create LLM provider', { error, input: { ...input, apiKey: '[REDACTED]' } });
      return { success: false, error: 'Failed to create provider' };
    }
  }
});
```

### Text Generation Handler
```typescript
// src/main/ipc/ai/generate-text/invoke.ts
const generateTextHandler = createIPCHandler({
  inputSchema: z.object({
    providerId: z.string(),
    prompt: z.string().min(1),
    model: z.string().optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().min(0).max(2).optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({
      text: z.string(),
      usage: z.object({
        promptTokens: z.number(),
        completionTokens: z.number(),
        totalTokens: z.number(),
      }).optional(),
    }).optional(),
    error: z.string().optional(),
  }),
  handler: async (input) => {
    try {
      // Get provider config
      const provider = await getActiveProvider(input.providerId);
      if (!provider) {
        return { success: false, error: 'Provider not found or inactive' };
      }
      
      // Decrypt API key
      const apiKey = decryptApiKey(provider.apiKeyEncrypted);
      
      // Initialize AI client based on provider type
      const aiClient = createAIClient(provider.type, {
        apiKey,
        baseUrl: provider.baseUrl,
      });
      
      // Generate text using Vercel AI SDK
      const result = await generateText({
        model: aiClient(input.model || getDefaultModel(provider.type)),
        prompt: input.prompt,
        maxTokens: input.maxTokens || 1000,
        temperature: input.temperature || 0.7,
      });
      
      return {
        success: true,
        data: {
          text: result.text,
          usage: result.usage,
        },
      };
    } catch (error) {
      logger.error('AI text generation failed', { 
        error, 
        providerId: input.providerId,
        // Never log the actual prompt for privacy
        promptLength: input.prompt.length,
      });
      return { success: false, error: 'Text generation failed' };
    }
  }
});
```

## Security Implementation

### API Key Encryption
```typescript
// src/main/services/encryption.service.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || generateEncryptionKey();
const ALGORITHM = 'aes-256-gcm';

export function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  
  cipher.setAAD(Buffer.from('api-key', 'utf8'));
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine iv, authTag, and encrypted data
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptApiKey(encryptedKey: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedKey.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAAD(Buffer.from('api-key', 'utf8'));
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Logging Security
```typescript
// Safe logging pattern for AI operations
const logAIOperation = (operation: string, data: any) => {
  const safeData = {
    ...data,
    apiKey: '[REDACTED]',
    prompt: data.prompt ? `[${data.prompt.length} chars]` : undefined,
    response: data.response ? `[${data.response.length} chars]` : undefined,
  };
  
  logger.info(`AI Operation: ${operation}`, safeData);
};
```

## AI Client Factory Pattern

### Provider Client Creation
```typescript
// src/main/services/ai-client.service.ts
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

export type ProviderType = 'openai' | 'anthropic' | 'deepseek';

export function createAIClient(type: ProviderType, config: { apiKey: string; baseUrl?: string }) {
  switch (type) {
    case 'openai':
      return openai({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });
      
    case 'anthropic':
      return anthropic({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
      });
      
    case 'deepseek':
      return openai({
        apiKey: config.apiKey,
        baseURL: config.baseUrl || 'https://api.deepseek.com/v1',
      });
      
    default:
      throw new Error(`Unsupported provider type: ${type}`);
  }
}

export function getDefaultModel(type: ProviderType): string {
  switch (type) {
    case 'openai':
      return 'gpt-3.5-turbo';
    case 'anthropic':
      return 'claude-3-haiku-20240307';
    case 'deepseek':
      return 'deepseek-chat';
    default:
      throw new Error(`No default model for provider type: ${type}`);
  }
}
```

## Worker Process Integration

### Background AI Operations
```typescript
// src/main/services/worker-manager.service.ts
export class WorkerManager {
  private workers: Map<string, Worker> = new Map();
  
  async queueAITask(task: AITask): Promise<string> {
    const taskId = generateId();
    const worker = this.getAvailableWorker();
    
    worker.postMessage({
      type: 'AI_GENERATION',
      taskId,
      payload: task,
    });
    
    return taskId;
  }
  
  private getAvailableWorker(): Worker {
    // Load balancing logic for multiple workers
    // Return least busy worker
  }
}

// Worker process AI operation
// src/worker/ai-processor.ts
self.onmessage = async (event) => {
  const { type, taskId, payload } = event.data;
  
  if (type === 'AI_GENERATION') {
    try {
      const result = await processAIGeneration(payload);
      
      self.postMessage({
        type: 'AI_GENERATION_COMPLETE',
        taskId,
        result,
      });
    } catch (error) {
      self.postMessage({
        type: 'AI_GENERATION_ERROR',
        taskId,
        error: error.message,
      });
    }
  }
};
```

## Error Handling Patterns

### Provider-Specific Error Handling
```typescript
export class AIErrorHandler {
  static handle(error: any, providerType: ProviderType): AIError {
    switch (providerType) {
      case 'openai':
        return this.handleOpenAIError(error);
      case 'anthropic':
        return this.handleAnthropicError(error);
      case 'deepseek':
        return this.handleDeepSeekError(error);
      default:
        return { type: 'unknown', message: 'Unknown AI provider error' };
    }
  }
  
  private static handleOpenAIError(error: any): AIError {
    if (error.status === 401) {
      return { type: 'auth', message: 'Invalid API key' };
    }
    if (error.status === 429) {
      return { type: 'rate_limit', message: 'Rate limit exceeded' };
    }
    return { type: 'api', message: error.message || 'OpenAI API error' };
  }
  
  // Similar handlers for other providers...
}

interface AIError {
  type: 'auth' | 'rate_limit' | 'api' | 'network' | 'unknown';
  message: string;
  retryable?: boolean;
}
```

### Retry Logic with Exponential Backoff
```typescript
export async function retryAIOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry auth errors
      if (error.status === 401) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}
```

## Frontend Integration Patterns

### React Hook for AI Operations
```typescript
// src/renderer/hooks/use-ai-generation.hook.ts
export function useAIGeneration() {
  return useMutation({
    mutationFn: async (params: {
      providerId: string;
      prompt: string;
      model?: string;
    }) => {
      const result = await window.api.ai.generateText(params);
      
      if (!result.success) {
        throw new Error(result.error || 'AI generation failed');
      }
      
      return result.data;
    },
    onError: (error) => {
      toast.error(`AI generation failed: ${error.message}`);
    },
  });
}

// Usage in component
export function ChatInterface() {
  const generateText = useAIGeneration();
  
  const handleSubmit = (prompt: string) => {
    generateText.mutate({
      providerId: selectedProvider.id,
      prompt,
      model: 'gpt-3.5-turbo',
    });
  };
  
  return (
    <div>
      {/* Chat UI */}
      {generateText.isPending && <LoadingSpinner />}
      {generateText.error && <ErrorMessage error={generateText.error} />}
    </div>
  );
}
```

## Performance Optimization

### Streaming Responses
```typescript
// For long-form text generation
const streamTextHandler = createIPCHandler({
  // ... schemas
  handler: async (input) => {
    const provider = await getActiveProvider(input.providerId);
    const aiClient = createAIClient(provider.type, { /* config */ });
    
    const stream = await streamText({
      model: aiClient(input.model),
      prompt: input.prompt,
    });
    
    // Stream response back to renderer
    for await (const textPart of stream.textStream) {
      // Send incremental updates via event bus
      eventBus.emit('ai:text-stream', {
        taskId: input.taskId,
        text: textPart,
      });
    }
    
    return { success: true };
  }
});
```

### Caching Strategies
```typescript
// Cache frequent AI responses
const responseCache = new Map<string, { response: string; timestamp: number }>();

const getCachedResponse = (prompt: string): string | null => {
  const cached = responseCache.get(prompt);
  const MAX_AGE = 1000 * 60 * 60; // 1 hour
  
  if (cached && Date.now() - cached.timestamp < MAX_AGE) {
    return cached.response;
  }
  
  return null;
};
```

## Monitoring and Analytics

### Usage Tracking
```typescript
// Track AI usage for billing/monitoring
export const trackAIUsage = async (data: {
  providerId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cost?: number;
}) => {
  await db.insert(aiUsageTable).values({
    id: generateId(),
    providerId: data.providerId,
    model: data.model,
    promptTokens: data.promptTokens,
    completionTokens: data.completionTokens,
    totalTokens: data.promptTokens + data.completionTokens,
    estimatedCost: data.cost,
    timestamp: new Date(),
  });
};
```