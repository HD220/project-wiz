# IPC Communication Patterns

This document outlines the **MANDATORY** Inter-Process Communication patterns between Electron's main and renderer processes in Project Wiz.

## 🚨 CRITICAL ARCHITECTURE RULES

### **MANDATORY:** Service & Handler Separation

- **Services** return data directly and throw errors
- **Handlers** do try/catch and return standardized `IpcResponse<T>`
- **NO ERROR WRAPPING** in services - let handlers handle errors

## Service Layer Pattern

### **MUST FOLLOW:** Service Implementation

```typescript
// ✅ CORRECT: Services return data directly, throw on error
export class AgentService {
  static async create(input: InsertAgent): Promise<SelectAgent> {
    const db = getDatabase();

    // Validate owner exists
    const owner = await UserService.getById(input.ownerId);
    if (!owner) {
      throw new Error(`Owner with ID ${input.ownerId} not found`);
    }

    const [newAgent] = await db.insert(agentsTable).values(input).returning();

    if (!newAgent) {
      throw new Error("Failed to create agent");
    }

    return newAgent; // Return data directly
  }

  static async list(filters: AgentFilters): Promise<SelectAgent[]> {
    const db = getDatabase();

    let query = db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.ownerId, filters.ownerId));

    if (filters.status) {
      query = query.where(eq(agentsTable.status, filters.status));
    }

    if (filters.search) {
      query = query.where(like(agentsTable.name, `%${filters.search}%`));
    }

    return await query
      .orderBy(desc(agentsTable.createdAt))
      .limit(filters.limit || 50);
  }

  static async getById(agentId: string): Promise<SelectAgent> {
    const db = getDatabase();

    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, agentId))
      .limit(1);

    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    return agent;
  }
}
```

## IPC Handler Pattern

### **MUST FOLLOW:** Handler Implementation

```typescript
// ✅ CORRECT: IPC handlers with standardized error handling
export function setupAgentHandlers(): void {
  ipcMain.handle(
    "agents:create",
    async (_, input: InsertAgent): Promise<IpcResponse<SelectAgent>> => {
      try {
        const result = await AgentService.create(input);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create agent",
        };
      }
    },
  );

  ipcMain.handle(
    "agents:list",
    async (_, filters: AgentFilters): Promise<IpcResponse<SelectAgent[]>> => {
      try {
        const result = await AgentService.list(filters);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to list agents",
        };
      }
    },
  );

  ipcMain.handle(
    "agents:get",
    async (_, agentId: string): Promise<IpcResponse<SelectAgent>> => {
      try {
        const result = await AgentService.getById(agentId);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to get agent",
        };
      }
    },
  );

  ipcMain.handle(
    "agents:update",
    async (
      _,
      agentId: string,
      input: Partial<InsertAgent>,
    ): Promise<IpcResponse<SelectAgent>> => {
      try {
        const result = await AgentService.update(agentId, input);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update agent",
        };
      }
    },
  );
}
```

## Type-Safe Preload Script

### **MANDATORY:** Typed API Exposure

```typescript
// ✅ CORRECT: Type-safe preload script with complete API surface
import { contextBridge, ipcRenderer } from "electron";
import type {
  IpcResponse,
  SelectAgent,
  InsertAgent,
  AgentFilters,
  SelectUser,
  InsertUser,
  LoginCredentials,
  SelectProject,
  InsertProject,
} from "../main/types";

const api = {
  // Agent operations
  agents: {
    create: (input: InsertAgent): Promise<IpcResponse<SelectAgent>> =>
      ipcRenderer.invoke("agents:create", input),
    list: (filters: AgentFilters): Promise<IpcResponse<SelectAgent[]>> =>
      ipcRenderer.invoke("agents:list", filters),
    get: (agentId: string): Promise<IpcResponse<SelectAgent>> =>
      ipcRenderer.invoke("agents:get", agentId),
    update: (
      agentId: string,
      input: Partial<InsertAgent>,
    ): Promise<IpcResponse<SelectAgent>> =>
      ipcRenderer.invoke("agents:update", agentId, input),
    delete: (agentId: string): Promise<IpcResponse<void>> =>
      ipcRenderer.invoke("agents:delete", agentId),
  },

  // Authentication operations
  auth: {
    login: (
      credentials: LoginCredentials,
    ): Promise<IpcResponse<{ user: SelectUser; token: string }>> =>
      ipcRenderer.invoke("auth:login", credentials),
    logout: (): Promise<IpcResponse<void>> => ipcRenderer.invoke("auth:logout"),
    getCurrentUser: (): Promise<IpcResponse<SelectUser>> =>
      ipcRenderer.invoke("auth:getCurrentUser"),
    register: (input: InsertUser): Promise<IpcResponse<SelectUser>> =>
      ipcRenderer.invoke("auth:register", input),
  },

  // Project operations
  projects: {
    create: (input: InsertProject): Promise<IpcResponse<SelectProject>> =>
      ipcRenderer.invoke("projects:create", input),
    list: (): Promise<IpcResponse<SelectProject[]>> =>
      ipcRenderer.invoke("projects:list"),
    get: (projectId: string): Promise<IpcResponse<SelectProject>> =>
      ipcRenderer.invoke("projects:get", projectId),
  },
} as const;

// Expose typed API to renderer
contextBridge.exposeInMainWorld("api", api);

// Type declaration for renderer process
declare global {
  interface Window {
    api: typeof api;
  }
}
```

## Renderer Usage Patterns

### **MUST USE:** loadApiData Utility

```typescript
// ✅ CORRECT: Consistent error handling utility
export async function loadApiData<T>(
  apiCall: () => Promise<IpcResponse<T>>,
  errorMessage?: string,
): Promise<T> {
  const response = await apiCall();

  if (!response.success) {
    throw new Error(errorMessage || response.error);
  }

  return response.data;
}

// ✅ CORRECT: Usage in TanStack Router
export const Route = createFileRoute("/_authenticated/user/agents/")({
  validateSearch: (search) => AgentFiltersSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps }) => {
    return await loadApiData(
      () => window.api.agents.list(deps.search),
      "Failed to load agents",
    );
  },
  component: AgentsPage,
});

// ✅ CORRECT: Usage in TanStack Query mutations
const createAgent = useMutation({
  mutationFn: async (data: CreateAgentInput) => {
    return await loadApiData(
      () => window.api.agents.create(data),
      "Failed to create agent",
    );
  },
  onSuccess: () => {
    router.invalidate();
    toast.success("Agent created successfully");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

## Authentication Patterns

### **MANDATORY:** Session-Based Auth for Desktop

```typescript
// ✅ CORRECT: Main process session management
const sessionCache = {
  currentUser: null as AuthenticatedUser | null,

  set(user: AuthenticatedUser | null): void {
    this.currentUser = user;
  },

  get(): AuthenticatedUser | null {
    return this.currentUser;
  },

  clear(): void {
    this.currentUser = null;
  },

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  },
};

// Auth service with database sessions
export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{
    user: SelectUser;
    token: string;
  }> {
    const db = getDatabase();

    // 1. Verify credentials
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, credentials.username))
      .limit(1);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // 2. Create session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(userSessionsTable).values({
      userId: user.id,
      token: sessionToken,
      expiresAt,
    });

    // 3. Cache session
    const userWithoutPassword = { ...user, password: undefined };
    sessionCache.set(userWithoutPassword);

    return { user: userWithoutPassword, token: sessionToken };
  }

  static async getCurrentUser(): Promise<SelectUser> {
    // Check cache first
    const cachedUser = sessionCache.get();
    if (cachedUser) {
      return cachedUser;
    }

    throw new Error("No authenticated user");
  }
}
```

## Error Handling Standards

### **MANDATORY:** Consistent Error Messages

```typescript
// ✅ CORRECT: Descriptive error messages
export class ConversationService {
  static async create(input: InsertConversation): Promise<SelectConversation> {
    const db = getDatabase();

    // Validate project exists and user has access
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, input.projectId),
          eq(projectsTable.ownerId, input.ownerId),
        ),
      )
      .limit(1);

    if (!project) {
      throw new Error(
        `Project with ID ${input.projectId} not found or access denied`,
      );
    }

    const [conversation] = await db
      .insert(conversationsTable)
      .values(input)
      .returning();

    if (!conversation) {
      throw new Error("Failed to create conversation - database insert failed");
    }

    return conversation;
  }
}
```

## Security Patterns

### **MANDATORY:** Secure IPC Configuration

```typescript
// ✅ CORRECT: Secure Electron configuration
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // CRITICAL: Disable node in renderer
      contextIsolation: true, // CRITICAL: Enable context isolation
      enableRemoteModule: false, // CRITICAL: Disable remote module
      preload: path.join(__dirname, "preload.js"),
    },
  });
};

// Preload script security
contextBridge.exposeInMainWorld("api", {
  // Only expose what's needed, nothing more
  agents: {
    create: (input: InsertAgent) => ipcRenderer.invoke("agents:create", input),
    // ... other safe operations
  },
});
```

## Performance Patterns

### **MUST USE:** Efficient Queries

```typescript
// ✅ CORRECT: Optimized queries with pagination
export class MessageService {
  static async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<SelectMessage[]> {
    const db = getDatabase();

    return await db
      .select({
        id: messagesTable.id,
        content: messagesTable.content,
        senderId: messagesTable.senderId,
        createdAt: messagesTable.createdAt,
        sender: {
          id: usersTable.id,
          username: usersTable.username,
        },
      })
      .from(messagesTable)
      .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit)
      .offset(offset);
  }
}
```

## Testing Patterns

### **MUST FOLLOW:** Service Testing

```typescript
// ✅ CORRECT: Service layer testing
describe("AgentService", () => {
  beforeEach(async () => {
    // Setup test database
    await migrate(testDb, { migrationsFolder: "./migrations" });
  });

  afterEach(async () => {
    // Clean up
    await testDb.delete(agentsTable);
  });

  it("should create agent successfully", async () => {
    const input: InsertAgent = {
      name: "Test Agent",
      model: "gpt-4",
      ownerId: "user-1",
      providerId: "provider-1",
    };

    const result = await AgentService.create(input);

    expect(result).toMatchObject({
      name: "Test Agent",
      model: "gpt-4",
      ownerId: "user-1",
    });
    expect(result.id).toBeDefined();
  });

  it("should throw error when owner not found", async () => {
    const input: InsertAgent = {
      name: "Test Agent",
      model: "gpt-4",
      ownerId: "nonexistent",
      providerId: "provider-1",
    };

    await expect(AgentService.create(input)).rejects.toThrow(
      "Owner with ID nonexistent not found",
    );
  });
});
```
