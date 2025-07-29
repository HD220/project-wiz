# Electron Architecture & Performance Guides

Advanced technical guides for implementing production-ready Electron applications with enterprise security, optimal performance, and modern development patterns.

## 🎯 Architecture Overview

Project Wiz implements a **production-ready Electron application** with enterprise-grade security, performance optimization, and advanced IPC communication patterns.

**Current Implementation**: Electron 35.1.4 with React 19, TypeScript 5.8.3, and production security configurations.

## 📊 Production Architecture Status

### **Electron Configuration**

- ✅ **Electron 35.1.4**: Latest stable with security updates
- ✅ **Custom Titlebar**: Frameless window with custom controls
- ✅ **Context Isolation**: Secure preload patterns implemented
- ✅ **Security Hardening**: Node integration disabled, CSP configured
- ✅ **IPC Type Safety**: Complete type-safe communication layer

### **Main Process Architecture**

- ✅ **Feature-Based Structure**: Service layer with handlers
- ✅ **Database Integration**: SQLite with WAL mode
- ✅ **Logging System**: Pino logger with structured logging
- ✅ **Error Handling**: Standardized IPC error patterns

## 🔍 Discovery Pathways

### **Problem-Solving Entry Points**

#### **"My app is slow or unresponsive"**

**→ Start Here**: [Node.js Async Patterns](./nodejs-async-patterns.md) - Performance optimization fundamentals

#### **"I need background processing"**

**→ Solution**: [Worker Threads Guide](./worker-threads-guide.md) - Threading patterns for heavy work

#### **"I want to understand Electron worker patterns"**

**→ Deep Dive**: [Electron Worker Threads](./electron-worker-threads-guide.md) - Desktop-specific threading

#### **"I need to compare worker solutions"**

**→ Research**: [Worker Pool Libraries Comparison](./worker-pool-libraries-comparison.md) - Third-party analysis

### **Integration Scenarios**

#### **Electron + AI Performance**

**🎯 Optimizing AI-powered desktop applications**

1. **[Async Patterns](./nodejs-async-patterns.md)** - Service layer optimization for AI
2. **[Worker Threads](./worker-threads-guide.md)** - Isolate AI processing from main thread
3. **[AI Queue Processing](../ai-integration/queue-patterns-implementation.md)** - Background AI workload management

#### **Electron + Frontend Performance**

**🎯 Building responsive desktop UI**

1. **[Electron Performance](./README.md#performance-patterns)** - Desktop-specific optimizations
2. **[Frontend Performance](../frontend/README.md#performance-optimization)** - React 19 optimization
3. **[IPC Optimization](../../developer/ipc-communication-patterns.md)** - Efficient main-renderer communication

#### **Electron + Database Performance**

**🎯 Optimal data persistence in desktop apps**

1. **[Database Performance](../../developer/database-patterns.md#performance-patterns)** - SQLite optimization
2. **[Async Patterns](./nodejs-async-patterns.md)** - Non-blocking database operations
3. **[Worker Pool Solutions](./worker-pool-libraries-comparison.md)** - Database work distribution

## 📚 Available Guides

### **Core Electron Implementation** _(~45 min total)_

- **[Electron Worker Threads](./electron-worker-threads-guide.md)** - Background processing patterns **(15 min)**
- **[Node.js Async Patterns](./nodejs-async-patterns.md)** - Performance optimization **(15 min)**
- **[Worker Threads Guide](./worker-threads-guide.md)** - Threading implementation **(15 min)**

### **Advanced Implementation** _(~30 min total)_

- **[Worker Pool Libraries](./worker-pool-libraries-comparison.md)** - Third-party solutions analysis **(15 min)**
- **[Performance Benchmarks](../../../src/main/)** - Production metrics **(15 min)**

## 🏗️ Current Architecture Patterns

### **Main Process Structure**

```typescript
// src/main/main.ts
import { app, BrowserWindow, ipcMain } from "electron";

// Feature-based handler setup
import { setupAgentHandlers } from "@/main/features/agent/agent.handler";
import { setupLlmProviderHandlers } from "@/main/features/agent/llm-provider/llm-provider.handler";
import { setupConversationsHandlers } from "@/main/features/conversation/conversation.handler";
import { setupAuthHandlers } from "@/main/features/auth/auth.handler";

// Security configuration
const mainWindow = new BrowserWindow({
  height: 800,
  width: 1200,
  webPreferences: {
    preload: path.join(__dirname, "preload.js"),
    nodeIntegration: false, // Security: Disable node integration
    contextIsolation: true, // Security: Enable context isolation
  },
  frame: false, // Custom titlebar
  show: false, // Don't show until ready
});
```

### **Type-Safe IPC Communication**

```typescript
// src/main/utils/ipc-handler.ts
export function createIpcHandler<TArgs extends unknown[], TReturn>(
  channel: string,
  handler: (...args: TArgs) => Promise<TReturn>,
): void {
  ipcMain.handle(
    channel,
    async (_, ...args: TArgs): Promise<IpcResponse<TReturn>> => {
      try {
        const result = await handler(...args);
        return { success: true, data: result };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : `${channel} failed`;
        logger.error(channel, { error: errorMessage, args });
        return { success: false, error: errorMessage };
      }
    },
  );
}

// Usage example:
createIpcHandler("agents:create", (input: CreateAgentInput) =>
  AgentService.create(input),
);
```

### **Service Layer Pattern**

```typescript
// Service Pattern: Direct return/throw
export class AgentService {
  static async create(input: CreateAgentInput): Promise<Agent> {
    const validatedInput = createAgentSchema.parse(input);
    const [agent] = await db
      .insert(agentsTable)
      .values(validatedInput)
      .returning();

    if (\!agent) {
      throw new Error("Failed to create agent");
    }

    return agent;
  }
}

// Handler Pattern: Try/catch with IpcResponse
export function setupAgentHandlers() {
  createIpcHandler("agents:create", AgentService.create);
  createIpcHandler("agents:list", AgentService.findByUserId);
  createIpcHandler("agents:delete", AgentService.delete);
}
```

### **Database Integration Pattern**

```typescript
// src/main/database/connection.ts
import Database from "better-sqlite3";

const db = new Database(databasePath, {
  verbose: logger.debug.bind(logger),
});

// Performance optimizations
db.pragma("journal_mode = WAL"); // Write-Ahead Logging
db.pragma("synchronous = NORMAL"); // Balance safety/performance
db.pragma("cache_size = 1000000"); // 1GB cache
db.pragma("foreign_keys = ON"); // Enforce foreign keys
db.pragma("temp_store = MEMORY"); // Temp tables in memory

export function getDatabase() {
  return drizzle(db, { schema });
}
```

## 🛡️ Security Implementation

### **Preload Security Pattern**

```typescript
// src/renderer/preload.ts
import { contextBridge, ipcRenderer } from "electron";

// Expose only necessary APIs
contextBridge.exposeInMainWorld("api", {
  // Type-safe API exposure
  agents: {
    create: (input: CreateAgentInput) =>
      ipcRenderer.invoke("agents:create", input),
    list: (userId: string) => ipcRenderer.invoke("agents:list", userId),
    delete: (id: string) => ipcRenderer.invoke("agents:delete", id),
  },

  // No direct access to Node.js APIs
  // No exposure of sensitive operations
});
```

### **Content Security Policy**

```html
<\!-- src/renderer/index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https:;
"
/>
```

## ⚡ Performance Patterns

### **Database Query Optimization**

```typescript
// Indexed queries with composite indexes
const agents = await db
  .select()
  .from(agentsTable)
  .where(and(eq(agentsTable.userId, userId), eq(agentsTable.isActive, true)))
  .orderBy(desc(agentsTable.createdAt));

// Composite index in schema:
agentUserActiveCreatedIdx: index("agents_user_active_created_idx").on(
  table.userId,
  table.isActive,
  table.createdAt,
);
```

### **Memory Management**

```typescript
// Proper cleanup patterns
app.on("window-all-closed", () => {
  // Close database connections
  if (process.platform \!== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Cleanup resources
  db.close();
});
```

## 🔧 Build & Development Configuration

### **Vite Configuration**

```typescript
// vite.main.config.mts
export default defineConfig({
  build: {
    lib: {
      entry: "src/main/main.ts",
      formats: ["cjs"],
      fileName: () => "[name].js",
    },
    rollupOptions: {
      external: ["electron", "better-sqlite3", /^@ai-sdk\//],
    },
  },
  plugins: [tsconfigPaths()],
});
```

### **Forge Configuration**

```typescript
// forge.config.cts
export const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: "./assets/icon",
    extraResource: ["./assets"],
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
  ],
};
```

## 🚀 Implementation Examples

### **Complete Feature Handler Setup**

```typescript
// src/main/features/agent/agent.handler.ts
export function setupAgentHandlers() {
  // CRUD operations with type safety
  createIpcHandler("agents:create", AgentService.create);
  createIpcHandler("agents:list", AgentService.findByUserId);
  createIpcHandler("agents:findById", AgentService.findById);
  createIpcHandler("agents:update", AgentService.update);
  createIpcHandler("agents:delete", AgentService.delete);

  // Custom operations
  createIpcHandler(
    "agents:generateResponse",
    async (agentId: string, message: string) => {
      return AgentService.generateResponse(agentId, message);
    },
  );
}
```

### **Error Handling Pattern**

```typescript
// Centralized error handling in service layer
export class AgentService {
  static async findById(id: string): Promise<Agent> {
    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, id))
      .limit(1);

    if (\!agent) {
      throw new Error(`Agent with id ${id} not found`);
    }

    return agent;
  }
}

// Automatic error handling in IPC layer
// createIpcHandler converts thrown errors to IpcResponse<never>
```

## 🔗 Related Documentation

### **Core Implementation**

- **[IPC Communication Patterns](../../developer/ipc-communication-patterns.md)** - Main ↔ Renderer communication **(15 min)**
- **[Database Patterns](../../developer/database-patterns.md)** - SQLite optimization and patterns **(15 min)**
- **[Error Handling](../../developer/error-handling-patterns.md)** - Electron-specific error management **(15 min)**

### **Cross-Domain Integration**

- **[AI Integration](../ai-integration/README.md)** - AI features in Electron applications
- **[Frontend Performance](../frontend/README.md)** - React optimization for desktop
- **[Service Layer Patterns](../../developer/database-patterns.md#service-layer-pattern)** - Business logic organization

### **Strategic Planning Integration**

- **[PRP Methodology](../../prps/README.md)** - Plan complex Electron implementations
- **[Active Electron PRPs](../../prps/01-initials/README.md)** - Real Electron planning examples
- **[INLINE-FIRST Philosophy](../../developer/code-simplicity-principles.md)** - Apply simplicity to Electron complexity

### **Architecture Context**

- **[Developer Guide](../../developer/README.md)** - Complete development patterns
- **[Design System](../../design/README.md)** - UI implementation for desktop
- **[User Flows](../../user/user-flows.md)** - Desktop user experience requirements

## 🎯 Learning Path

### **Phase 1: Foundation** _(~30 min)_

1. **[Node.js Async Patterns](./nodejs-async-patterns.md)** - Service layer optimization
2. **[IPC Communication](../../developer/ipc-communication-patterns.md)** - Main-renderer communication

### **Phase 2: Performance** _(~45 min)_

3. **[Worker Threads Guide](./worker-threads-guide.md)** - Background processing
4. **[Electron Worker Threads](./electron-worker-threads-guide.md)** - Desktop-specific patterns
5. **[Database Performance](../../developer/database-patterns.md#performance-patterns)** - SQLite optimization

### **Phase 3: Advanced** _(~30 min)_

6. **[Worker Pool Comparison](./worker-pool-libraries-comparison.md)** - Third-party solutions
7. **[Security Patterns](#security-implementation)** - Production security
8. **Cross-Domain Integration** - Combine with AI/Frontend patterns

### **Phase 4: Production** _(~30 min)_

9. **[Build Configuration](#build--development-configuration)** - Production builds
10. **[Memory Management](#memory-management)** - Resource optimization
11. **Practice Implementation** - Build complete features

**🎯 Success Criteria:** Can implement production-ready Electron applications with optimal performance, security hardening, and cross-domain integration capabilities.

---

## 🔍 Contextual Discovery Integration

### **When to Use This Documentation**

#### **From Developer Workflows**

- **Starting Electron Feature**: Developer Guide → Electron Architecture → Specific patterns
- **Complex Desktop Planning**: [PRP Planning](../../prps/README.md) → Electron Implementation guides

#### **From Technical Problems**

- **App Responsiveness**: [Async Patterns](./nodejs-async-patterns.md) + [Worker Threads](./worker-threads-guide.md)
- **Background Processing**: [Worker patterns](./worker-threads-guide.md) + Integration guides
- **Security Concerns**: [Security implementation](#security-implementation) + Best practices

#### **From Cross-Domain Needs**

- **Electron + AI**: AI performance patterns + Worker thread isolation
- **Electron + Frontend**: Desktop UI optimization + React performance
- **Electron + Database**: SQLite optimization + Async patterns

### **Navigation Pathways**

- **[← Back to Technical Guides](../README.md)** - All technical implementation guides
- **[↑ Developer Guide](../../developer/README.md)** - Core development patterns
- **[🤖 AI Integration](../ai-integration/README.md)** - AI features for desktop apps
- **[🎨 Frontend Guides](../frontend/README.md)** - React patterns for Electron

---

## 📋 Related Implementation Files

### **Core Electron Files**

- `/src/main/main.ts` - Main process entry point
- `/src/main/utils/ipc-handler.ts` - Type-safe IPC utilities
- `/src/main/database/connection.ts` - Database configuration
- `/src/renderer/preload.ts` - Secure preload script

### **Configuration Files**

- `/vite.main.config.mts` - Main process build configuration
- `/vite.renderer.config.mts` - Renderer process build configuration
- `/forge.config.cts` - Electron Forge packaging configuration

**💡 Next Steps**: Explore [Worker Threads Guide](./worker-threads-guide.md) for background processing or [Async Patterns](./nodejs-async-patterns.md) for performance optimization based on your specific needs.
EOF < /dev/null
