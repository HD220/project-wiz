# AI Integration Technical Guides

Advanced technical guides for implementing sophisticated AI features in Project Wiz using the Vercel AI SDK v4 and multi-provider architecture.

## 🎯 Architecture Overview

Project Wiz implements a **production-ready multi-provider AI system** with:

- **Vercel AI SDK v4** with OpenAI, Anthropic, and DeepSeek providers
- **Encrypted API key storage** with AES-256 encryption
- **Type-safe provider registry** with automatic failover
- **Advanced memory system** with importance scoring and relationships
- **Streaming conversation handling** with real-time updates

## 🚀 Quick Start for AI Integration

### Prerequisites

- Understanding of Vercel AI SDK v4 patterns
- Knowledge of TypeScript and async/await patterns
- Familiarity with React streaming components

### Current Implementation Status

- ✅ **Multi-provider support**: OpenAI, Anthropic, DeepSeek, Custom
- ✅ **Secure key management**: AES-256 encrypted storage
- ✅ **Memory system**: Advanced agent memory with persistence
- ✅ **Conversation handling**: Streaming with message persistence
- ✅ **Provider registry**: Type-safe configuration management

## 📚 Available Guides

### **Core AI Implementation** _(~60 min total)_

- **[Vercel AI SDK Guide](./vercel-ai-sdk-guide.md)** - Complete SDK v4 implementation patterns **(20 min)**
- **[Provider Patterns](./ai-sdk-provider-patterns.md)** - Multi-provider architecture and failover **(15 min)**
- **[Provider Registry Guide](./createProviderRegistry-implementation-guide.md)** - Type-safe provider management **(15 min)**
- **[Queue Patterns](./queue-patterns-implementation.md)** - Background processing and job management **(10 min)**

### **Advanced Features** _(~45 min total)_

- **[AI SDK Research](./ai-sdk-comprehensive-research.md)** - Advanced patterns and optimization techniques **(25 min)**
- **[Memory System Implementation](../../../src/main/features/agent/memory/)** - Agent memory architecture **(20 min)**

## 🏗️ Architecture Patterns

### **Service Layer Architecture**

```typescript
// Service Pattern: Direct return/throw
export class LLMService {
  static async getModel(userId: string, providerId?: string) {
    const provider = await this.getProviderConfig(userId, providerId);
    const apiKey = await LlmProviderService.getDecryptedApiKey(provider.id);

    switch (provider.type) {
      case "openai":
        return createOpenAI({ apiKey, baseURL: provider.baseUrl });
      case "anthropic":
        return createAnthropic({ apiKey });
      case "deepseek":
        return createOpenAICompatible({
          apiKey,
          baseURL: "https://api.deepseek.com/v1",
        });
      default:
        throw new Error(`Unsupported provider: ${provider.type}`);
    }
  }
}
```

### **Encrypted Storage Pattern**

```typescript
// AES-256-GCM encryption for API keys (production implementation)
export class LlmProviderService {
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

```typescript
// Advanced memory with importance scoring
export class MemoryService {
  static async storeMemory(
    agentId: string,
    content: string,
    importance: number,
  ) {
    const memory = await db
      .insert(memoriesTable)
      .values({
        agentId,
        content,
        importance,
        timestamp: new Date(),
        vectors: await this.generateEmbeddings(content),
      })
      .returning();
    return memory[0];
  }
}
```

## 🛡️ Security Patterns

### **API Key Encryption**

- AES-256-GCM encryption for all stored API keys with authentication
- Separate encryption key management with 32-byte keys
- Automatic decryption failure handling and key validation

### **Provider Validation**

- Schema validation for all provider configurations
- Type-safe provider interfaces
- Runtime configuration validation

### **Memory Security**

- Encrypted memory storage
- Access control based on agent permissions
- Audit trails for all memory operations

## 🚀 Implementation Examples

### **Basic Provider Setup**

```typescript
// Create new provider
const provider = await LlmProviderService.create({
  userId: "user-123",
  name: "My OpenAI Provider",
  type: "openai",
  apiKey: "sk-...", // Automatically encrypted
  defaultModel: "gpt-4o",
  isDefault: true,
});

// Use provider for generation
const model = await LLMService.getModel("user-123", provider.id);
const result = await generateText({
  model,
  prompt: "Hello, world!",
});
```

### **Advanced Memory Integration**

```typescript
// Store important conversation memory
await MemoryService.storeMemory(
  agentId,
  "User prefers TypeScript over JavaScript",
  8.5, // High importance score
);

// Retrieve relevant memories
const memories = await MemoryService.searchMemories(
  agentId,
  "programming preferences",
  { limit: 5, minImportance: 7.0 },
);
```

## 🔍 Related Documentation

### **Core Implementation**

- **[Database Patterns](../../developer/database-patterns.md)** - Data persistence for AI features
- **[Service Layer](../../developer/database-patterns.md#service-layer-pattern)** - Business logic separation
- **[Error Handling](../../developer/error-handling-patterns.md)** - AI-specific error patterns

### **Frontend Integration**

- **[Data Loading](../../developer/data-loading-patterns.md)** - Loading AI data in React
- **[IPC Communication](../../developer/ipc-communication-patterns.md)** - AI service communication
- **[Conversation Components](../frontend/README.md)** - UI for AI interactions

### **Architecture Context**

- **[Agent Service](../../../src/main/features/agent/)** - Complete agent implementation
- **[Memory System](../../../src/main/features/agent/memory/)** - Advanced memory architecture
- **[LLM Providers](../../../src/main/features/agent/llm-provider/)** - Provider management

## 🎯 Learning Path

### **Phase 1: Foundation** _(~30 min)_

1. **[Vercel AI SDK Guide](./vercel-ai-sdk-guide.md)** - Core SDK patterns
2. **[Provider Patterns](./ai-sdk-provider-patterns.md)** - Multi-provider architecture

### **Phase 2: Advanced** _(~45 min)_

3. **[Provider Registry](./createProviderRegistry-implementation-guide.md)** - Type-safe management
4. **[Queue Patterns](./queue-patterns-implementation.md)** - Background processing
5. **[Memory System](../../../src/main/features/agent/memory/)** - Advanced memory

### **Phase 3: Integration** _(~30 min)_

6. **[AI Research](./ai-sdk-comprehensive-research.md)** - Optimization techniques
7. **Practice Implementation** - Build AI features

**🎯 Success Criteria:** Can implement complete AI features with multi-provider support, encrypted storage, and advanced memory integration.

---

**💡 Next Steps:** Start with the [Vercel AI SDK Guide](./vercel-ai-sdk-guide.md) for core implementation patterns, then progress through provider management and advanced features.
