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

## 🔍 Discovery Pathways

### **Problem-Solving Entry Points**

#### **"I need to add AI features to my app"**

**→ Start Here**: [Vercel AI SDK Guide](./vercel-ai-sdk-guide.md) - Complete multi-provider implementation

#### **"I'm working with multiple AI providers"**

**→ Go To**: [Provider Patterns](./ai-sdk-provider-patterns.md) - Multi-provider architecture and encrypted storage

#### **"AI responses are too slow"**

**→ Solution**: [Queue Patterns](./queue-patterns-implementation.md) + [Worker Threads](../electron/worker-threads-guide.md)

#### **"I need custom AI provider implementation"**

**→ Deep Dive**: [Provider Registry Guide](./createProviderRegistry-implementation-guide.md) - Custom provider creation

#### **"I want to understand AI SDK design decisions"**

**→ Research**: [AI SDK Comprehensive Research](./ai-sdk-comprehensive-research.md) - Technical analysis

### **Integration Scenarios**

#### **AI + Frontend Integration**

**🎯 Building real-time AI conversation interfaces**

1. **[Data Loading Foundation](../frontend/tanstack-router-data-loading-guide.md)** - MANDATORY hierarchy patterns
2. **[AI SDK Streaming](./vercel-ai-sdk-guide.md#streaming-patterns)** - Real-time AI responses
3. **[State Management](../../developer/data-loading-patterns.md)** - AI conversation state via data loading hierarchy

#### **AI + Performance Optimization**

**🎯 Building high-performance AI features**

1. **[Queue Patterns](./queue-patterns-implementation.md)** - Background AI processing
2. **[Worker Threads](../electron/worker-threads-guide.md)** - Isolate AI computations
3. **[Async Patterns](../electron/nodejs-async-patterns.md)** - Optimize AI service layer

#### **AI + Database Integration**

**🎯 Persistent AI data with optimal performance**

1. **[Provider Patterns](./ai-sdk-provider-patterns.md)** - Encrypted storage patterns
2. **[Database Patterns](../../developer/database-patterns.md)** - AI data persistence
3. **[Memory Architecture](../../../src/main/features/agent/memory/)** - Advanced AI memory systems

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
  prompt: "Hello, world\!",
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

## 🔗 Related Documentation

### **Core Implementation**

- **[Database Patterns](../../developer/database-patterns.md)** - Data persistence for AI features
- **[Service Layer](../../developer/database-patterns.md#service-layer-pattern)** - Business logic separation
- **[Error Handling](../../developer/error-handling-patterns.md)** - AI-specific error patterns

### **Frontend Integration**

- **[Data Loading](../../developer/data-loading-patterns.md)** - Loading AI data in React
- **[IPC Communication](../../developer/ipc-communication-patterns.md)** - AI service communication
- **[Frontend Architecture](../frontend/README.md)** - React patterns for AI features

### **Performance & Background Processing**

- **[Electron Performance](../electron/README.md)** - AI performance optimization
- **[Worker Threads](../electron/worker-threads-guide.md)** - Background AI processing
- **[Async Patterns](../electron/nodejs-async-patterns.md)** - Service layer optimization

### **Strategic Planning Integration**

- **[PRP Methodology](../../prps/README.md)** - Plan complex AI feature implementations
- **[Active AI PRPs](../../prps/01-initials/README.md)** - Real AI implementation planning examples
- **[INLINE-FIRST Philosophy](../../developer/code-simplicity-principles.md)** - Apply simplicity to AI implementations

### **Architecture Context**

- **[Agent Service](../../../src/main/features/agent/)** - Complete agent implementation
- **[Memory System](../../../src/main/features/agent/memory/)** - Advanced memory architecture
- **[LLM Providers](../../../src/main/features/agent/llm-provider/)** - Provider management

## 🎯 Learning Path

### **Phase 1: Foundation** _(~30 min)_

1. **[Vercel AI SDK Guide](./vercel-ai-sdk-guide.md)** - Core SDK patterns
2. **[Provider Patterns](./ai-sdk-provider-patterns.md)** - Multi-provider architecture

3. **[Provider Registry](./createProviderRegistry-implementation-guide.md)** - Type-safe management
4. **[Queue Patterns](./queue-patterns-implementation.md)** - Background processing
5. **[Memory System](../../../src/main/features/agent/memory/)** - Advanced memory

### **Phase 3: Integration** _(~30 min)_

6. **[AI Research](./ai-sdk-comprehensive-research.md)** - Optimization techniques
7. **Practice Implementation** - Build AI features
8. **Cross-Domain Integration** - Combine with Frontend/Electron patterns

### **Phase 4: Production** _(~45 min)_

9. **[Security Implementation](./ai-sdk-provider-patterns.md#security-patterns)** - Production security
10. **[Performance Optimization](../electron/README.md)** - AI-specific performance
11. **[Testing Strategies](../../developer/README.md#testing-strategy)** - AI feature testing

**🎯 Success Criteria:** Can implement complete AI features with multi-provider support, encrypted storage, advanced memory integration, and cross-domain optimization.

---

## 🔍 Contextual Discovery Integration

### **When to Use This Documentation**

#### **From Developer Workflows**

- **Starting AI Feature**: Developer Guide → AI Integration Overview → Specific guides
- **Complex AI Planning**: [PRP Planning](../../prps/README.md) → AI Implementation guides
- **Performance Issues**: [Performance Optimization](../electron/README.md) → AI Queue Patterns

#### **From Technical Problems**

- **AI Response Latency**: Queue Patterns + Worker Threads + Async Patterns
- **Provider Management**: Provider Patterns → Provider Registry
- **Security Concerns**: Provider Patterns (encryption) + Security best practices

#### **From Cross-Domain Needs**

- **AI + UI**: Frontend guides + AI Streaming patterns
- **AI + Performance**: Electron guides + AI Queue processing
- **AI + Database**: Database patterns + AI Memory systems

### **Navigation Pathways**

- **[← Back to Technical Guides](../README.md)** - All technical implementation guides
- **[↑ Developer Guide](../../developer/README.md)** - Core development patterns
- **[⚡ Electron Guides](../electron/README.md)** - Performance and background processing
- **[🎨 Frontend Guides](../frontend/README.md)** - UI implementation for AI features

---

**💡 Next Steps:** Start with the [Vercel AI SDK Guide](./vercel-ai-sdk-guide.md) for core implementation patterns, then progress through provider management and advanced features based on your specific needs and integration requirements.
EOF < /dev/null
