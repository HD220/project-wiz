---
template_type: "architecture"
complexity: "medium"
primary_agent: "solution-architect"
estimated_time: "1-2 hours"
related_patterns:
  - "docs/developer/ipc-communication-patterns.md"
  - "docs/developer/code-simplicity-principles.md"
  - "docs/developer/data-loading-patterns.md"
---

# IPC Communication Architecture: [IPC_FEATURE_NAME]

**Date:** [DATE]  
**Version:** [VERSION]  
**Status:** [Draft/In Review/Approved/Implemented]  
**Authors:** [AUTHOR_NAME], Claude Code  
**IPC Type:** Electron Main ↔ Renderer Process Communication

## Executive Summary

### IPC Communication Overview

[Describe the IPC communication being designed - new feature endpoints, security enhancements, data flow optimizations, etc.]

### Key IPC Components

- [Component 1: Service layer methods]
- [Component 2: IPC handler endpoints]
- [Component 3: Frontend integration points]

### Success Criteria

- [Success criterion 1: Performance targets]
- [Success criterion 2: Security requirements]
- [Success criterion 3: Type safety goals]

## Context and Requirements

### Business Context

[Explain the business need for this IPC communication and how it supports Project Wiz's desktop application functionality.]

### IPC Scope

**In Scope:**

- [Feature/operation 1 requiring IPC]
- [Data transfer 2 between processes]
- [Security enhancement 3]

**Out of Scope:**

- [Feature 1 handled by existing IPC]
- [Operation 2 for future consideration]
- [Enhancement 3 handled by other mechanisms]

### Project Wiz IPC Context

[Explain how this IPC communication fits within Project Wiz's architecture:]

- **Electron Security Model:** [contextIsolation: true, nodeIntegration: false compliance]
- **INLINE-FIRST Impact:** [How IPC code follows inline-first principles]
- **Type Safety:** [TypeScript end-to-end type safety requirements]
- **Data Loading Integration:** [How this supports TanStack Router/Query patterns]

## Current IPC Analysis

### Existing IPC Structure

[Analyze current IPC patterns and identify areas for improvement or extension:]

```typescript
// Current IPC structure
export const api = {
  [existingFeature]: {
    [operation1]: (input: Type1) => Promise<IpcResponse<Result1>>,
    [operation2]: (input: Type2) => Promise<IpcResponse<Result2>>,
  },
  // ... other features
};
```

### Current Limitations

- [Performance limitation 1 with metrics]
- [Security gap 2 with impact]
- [Type safety issue 3 with examples]
- [Error handling inconsistency 4]

### Security Analysis

```typescript
// Current security configuration
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false, // ✅ Correct
    contextIsolation: true, // ✅ Correct
    enableRemoteModule: false, // ✅ Correct
    preload: path.join(__dirname, "preload.js"),
  },
});
```

## Proposed IPC Architecture

### Service Layer Design

```typescript
// Service layer following Project Wiz INLINE-FIRST patterns
export class [FeatureName]Service {
  static async [operationName](input: [InputType]): Promise<[ReturnType]> {
    const db = getDatabase();

    // INLINE-FIRST: Validation + business logic + database operation
    const validated = [ValidationSchema].parse(input);

    // Permission check (inline if < 15 lines)
    const currentUser = sessionCache.get();
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    if (validated.ownerId !== currentUser.id && !currentUser.isAdmin) {
      throw new Error('Permission denied');
    }

    // Business logic (inline)
    const [entity] = await db
      .select()
      .from([tableName])
      .where(
        and(
          eq([tableName].id, validated.entityId),
          eq([tableName].ownerId, currentUser.id)
        )
      )
      .limit(1);

    if (!entity) {
      throw new Error('[EntityName] not found or access denied');
    }

    // Perform operation
    const result = await this.performOperation(entity, validated);

    // Audit logging (inline)
    logger.info('[OperationName] completed', {
      userId: currentUser.id,
      entityId: validated.entityId,
      operation: '[operationName]',
    });

    return result;
  }

  private static async performOperation(
    entity: [EntityType],
    input: [InputType]
  ): Promise<[ReturnType]> {
    // Complex operation logic (extracted only if > 20 lines)
    const db = getDatabase();

    return await db.transaction((tx) => {
      // Multi-step operation
      const updatedResults = tx
        .update([tableName])
        .set({
          [field]: input.[field],
          updatedAt: new Date(),
        })
        .where(eq([tableName].id, entity.id))
        .returning()
        .all();
      
      const [updated] = updatedResults;

      // Related operations
      tx.insert([relatedTable]).values({
        parentId: entity.id,
        action: '[operationName]',
        timestamp: new Date(),
      }).run();

      return updated;
    });
  }
}
```

### IPC Handler Implementation

```typescript
// IPC handlers following Project Wiz patterns
export function setup[FeatureName]Handlers(): void {
  // Main operation handler
  ipcMain.handle(
    '[feature]:[operation]',
    async (_, input: [InputType]): Promise<IpcResponse<[ReturnType]>> => {
      try {
        const result = await [FeatureName]Service.[operationName](input);
        return { success: true, data: result };
      } catch (error) {
        // Structured error handling
        const errorMessage = error instanceof Error
          ? error.message
          : '[Default error message]';

        // Log error for debugging
        logger.error('[Feature] [operation] failed', {
          error: errorMessage,
          input
        });

        return { success: false, error: errorMessage };
      }
    },
  );

  // List/query operation
  ipcMain.handle(
    '[feature]:list',
    async (_, filters: [FilterType]): Promise<IpcResponse<[ReturnType][]>> => {
      try {
        const results = await [FeatureName]Service.list(filters);
        return { success: true, data: results };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to list [feature]',
        };
      }
    },
  );

  // Batch operation handler (if needed)
  ipcMain.handle(
    '[feature]:batch-[operation]',
    async (_, requests: [BatchInputType][]): Promise<IpcResponse<[BatchResultType][]>> => {
      try {
        const results = await Promise.allSettled(
          requests.map(request => [FeatureName]Service.[operationName](request))
        );

        const batchResults: [BatchResultType][] = results.map((result, index) => ({
          index,
          success: result.status === 'fulfilled',
          data: result.status === 'fulfilled' ? result.value : undefined,
          error: result.status === 'rejected' ? result.reason.message : undefined,
        }));

        return { success: true, data: batchResults };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Batch operation failed',
        };
      }
    },
  );

  // Real-time data handler (if needed)
  ipcMain.handle(
    '[feature]:subscribe',
    async (event, subscriptionParams: [SubscriptionType]): Promise<IpcResponse<string>> => {
      try {
        const subscriptionId = crypto.randomUUID();

        // Setup real-time subscription
        [FeatureName]SubscriptionManager.subscribe(
          subscriptionId,
          subscriptionParams,
          (data) => {
            event.sender.send('[feature]:data-update', {
              subscriptionId,
              data,
            });
          }
        );

        return { success: true, data: subscriptionId };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Subscription failed',
        };
      }
    },
  );
}

// Handler cleanup
export function cleanup[FeatureName]Handlers(): void {
  ipcMain.removeAllListeners('[feature]:[operation]');
  ipcMain.removeAllListeners('[feature]:list');
  ipcMain.removeAllListeners('[feature]:batch-[operation]');
  ipcMain.removeAllListeners('[feature]:subscribe');
}
```

### Type-Safe Preload Script

```typescript
// Preload script with complete type safety
import { contextBridge, ipcRenderer } from 'electron';
import type {
  IpcResponse,
  [InputType],
  [ReturnType],
  [FilterType],
  [BatchInputType],
  [BatchResultType],
  [SubscriptionType],
} from '../main/types';

// API definition with full type safety
const [featureName]Api = {
  // Main operations
  [operationName]: (input: [InputType]): Promise<IpcResponse<[ReturnType]>> =>
    ipcRenderer.invoke('[feature]:[operation]', input),

  // Query operations
  list: (filters: [FilterType]): Promise<IpcResponse<[ReturnType][]>> =>
    ipcRenderer.invoke('[feature]:list', filters),

  // Batch operations
  batch[OperationName]: (requests: [BatchInputType][]): Promise<IpcResponse<[BatchResultType][]>> =>
    ipcRenderer.invoke('[feature]:batch-[operation]', requests),

  // Real-time subscriptions
  subscribe: (params: [SubscriptionType]): Promise<IpcResponse<string>> =>
    ipcRenderer.invoke('[feature]:subscribe', params),

  unsubscribe: (subscriptionId: string): Promise<IpcResponse<void>> =>
    ipcRenderer.invoke('[feature]:unsubscribe', subscriptionId),

  // Event listeners for real-time updates
  onDataUpdate: (callback: (data: { subscriptionId: string; data: any }) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on('[feature]:data-update', listener);

    // Return cleanup function
    return () => ipcRenderer.removeListener('[feature]:data-update', listener);
  },
} as const;

// Expose to renderer with proper typing
const api = {
  // ... existing API
  [featureName]: [featureName]Api,
} as const;

contextBridge.exposeInMainWorld('api', api);

// Type declaration for renderer process
declare global {
  interface Window {
    api: typeof api;
  }
}
```

### Security Implementation

```typescript
// Security validation in IPC handlers
export class IpcSecurityValidator {
  static validateSession(requiredPermissions: string[] = []): (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => void {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        // Session validation
        const currentUser = sessionCache.get();
        if (!currentUser) {
          throw new Error('Authentication required');
        }

        // Permission validation
        if (requiredPermissions.length > 0) {
          const hasPermission = requiredPermissions.some(permission =>
            currentUser.permissions.includes(permission)
          );

          if (!hasPermission) {
            throw new Error(`Insufficient permissions. Required: ${requiredPermissions.join(', ')}`);
          }
        }

        // Rate limiting (simple implementation)
        const rateLimitKey = `${currentUser.id}:${propertyKey}`;
        await IpcRateLimiter.checkLimit(rateLimitKey);

        return originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }
}

// Usage in service methods
export class [FeatureName]Service {
  @IpcSecurityValidator.validateSession(['[feature]:read'])
  static async [operationName](input: [InputType]): Promise<[ReturnType]> {
    // Service implementation
  }

  @IpcSecurityValidator.validateSession(['[feature]:write', '[feature]:admin'])
  static async [sensitiveOperation](input: [SensitiveInputType]): Promise<[ReturnType]> {
    // Sensitive operation implementation
  }
}
```

## Frontend Integration

### TanStack Router Integration

```typescript
// Route loader integration with IPC
export const Route = createFileRoute('/_authenticated/[feature]/')({
  validateSearch: (search) => [FeatureName]FiltersSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps }) => {
    // Load initial data via IPC
    return await loadApiData(
      () => window.api.[featureName].list(deps.search),
      'Failed to load [feature] data'
    );
  },
  component: [FeatureName]Page,
});

// Component with IPC integration
export function [FeatureName]Page() {
  const data = Route.useLoaderData();
  const { search } = Route.useSearch();
  const navigate = Route.useNavigate();

  // Real-time updates
  useEffect(() => {
    if (search.realTime) {
      const cleanup = window.api.[featureName].onDataUpdate((update) => {
        // Handle real-time updates
        queryClient.setQueryData(['[feature]', 'list', search], (oldData) => {
          // Update logic based on subscription data
          return updateDataWithRealTimeChanges(oldData, update.data);
        });
      });

      return cleanup;
    }
  }, [search.realTime]);

  return (
    <div className="space-y-4">
      {/* Component implementation */}
    </div>
  );
}
```

### TanStack Query Integration

```typescript
// Custom hooks for IPC operations
export function use[FeatureName]() {
  return {
    // Query operations
    list: (filters: [FilterType]) => useQuery({
      queryKey: ['[feature]', 'list', filters],
      queryFn: () => loadApiData(
        () => window.api.[featureName].list(filters),
        'Failed to load [feature] list'
      ),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

    // Single item query
    get: (id: string) => useQuery({
      queryKey: ['[feature]', id],
      queryFn: () => loadApiData(
        () => window.api.[featureName].get(id),
        `Failed to load [feature] ${id}`
      ),
      enabled: !!id,
    }),

    // Mutation operations
    create: useMutation({
      mutationFn: (input: [InputType]) => loadApiData(
        () => window.api.[featureName].create(input),
        'Failed to create [feature]'
      ),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['[feature]'] });
        toast.success('[Feature] created successfully');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),

    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Partial<[InputType]> }) =>
        loadApiData(
          () => window.api.[featureName].update(id, input),
          `Failed to update [feature]`
        ),
      onSuccess: (data, variables) => {
        // Optimistic update
        queryClient.setQueryData(['[feature]', variables.id], data);
        queryClient.invalidateQueries({ queryKey: ['[feature]', 'list'] });
        toast.success('[Feature] updated successfully');
      },
    }),

    delete: useMutation({
      mutationFn: (id: string) => loadApiData(
        () => window.api.[featureName].delete(id),
        `Failed to delete [feature]`
      ),
      onSuccess: (_, deletedId) => {
        queryClient.removeQueries({ queryKey: ['[feature]', deletedId] });
        queryClient.invalidateQueries({ queryKey: ['[feature]', 'list'] });
        toast.success('[Feature] deleted successfully');
      },
    }),

    // Batch operations
    batchOperation: useMutation({
      mutationFn: (requests: [BatchInputType][]) => loadApiData(
        () => window.api.[featureName].batch[OperationName](requests),
        'Batch operation failed'
      ),
      onSuccess: (results) => {
        const successCount = results.filter(r => r.success).length;
        const errorCount = results.filter(r => !r.success).length;

        if (errorCount === 0) {
          toast.success(`All ${successCount} operations completed successfully`);
        } else {
          toast.warning(`${successCount} succeeded, ${errorCount} failed`);
        }

        queryClient.invalidateQueries({ queryKey: ['[feature]'] });
      },
    }),
  };
}

// Component usage
export function [FeatureName]Component() {
  const { list, create, update, delete: deleteItem } = use[FeatureName]();

  // Get data from router loader (highest priority)
  const initialData = Route.useLoaderData();

  // Query with initial data
  const { data: items, isLoading } = list(
    { /* filters */ },
    { initialData }
  );

  // Mutation handlers (INLINE-FIRST)
  const handleCreate = async (formData: [InputType]) => {
    try {
      await create.mutateAsync(formData);
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error already handled by mutation onError
      console.error('Create failed:', error);
    }
  };

  const handleUpdate = async (id: string, formData: Partial<[InputType]>) => {
    try {
      await update.mutateAsync({ id, input: formData });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteItem.mutateAsync(id);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    // Component JSX with proper loading states and error handling
    <div className="space-y-4">
      {/* Implementation */}
    </div>
  );
}
```

## Performance Optimization

### IPC Performance Patterns

```typescript
// Batch operations for performance
export class [FeatureName]BatchService {
  private static batchQueue: [InputType][] = [];
  private static batchTimeout: NodeJS.Timeout | null = null;

  static async queueOperation(input: [InputType]): Promise<[ReturnType]> {
    return new Promise((resolve, reject) => {
      // Add to batch queue
      this.batchQueue.push({
        ...input,
        resolve,
        reject,
      } as any);

      // Process batch after short delay
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, 100); // 100ms batch window
    });
  }

  private static async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0);
    this.batchTimeout = null;

    try {
      const results = await Promise.allSettled(
        batch.map(item => [FeatureName]Service.[operationName](item))
      );

      results.forEach((result, index) => {
        const item = batch[index] as any;

        if (result.status === 'fulfilled') {
          item.resolve(result.value);
        } else {
          item.reject(result.reason);
        }
      });
    } catch (error) {
      // Reject all items in batch
      batch.forEach((item: any) => item.reject(error));
    }
  }
}
```

### Caching Strategy

```typescript
// IPC response caching for performance
export class IpcCacheManager {
  private static cache = new Map<string, {
    data: any;
    timestamp: number;
    ttl: number;
  }>();

  static set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  static get(key: string): any | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  static invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  static clear(): void {
    this.cache.clear();
  }
}

// Usage in IPC handlers
ipcMain.handle('[feature]:list', async (_, filters: [FilterType]) => {
  const cacheKey = `[feature]:list:${JSON.stringify(filters)}`;

  // Check cache first
  const cached = IpcCacheManager.get(cacheKey);
  if (cached) {
    return { success: true, data: cached };
  }

  try {
    const results = await [FeatureName]Service.list(filters);

    // Cache results
    IpcCacheManager.set(cacheKey, results, 2 * 60 * 1000); // 2 minutes

    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list [feature]',
    };
  }
});
```

## Error Handling and Resilience

### Comprehensive Error Handling

```typescript
// Error types for IPC communication
export type IpcErrorType =
  | 'validation_error'
  | 'permission_error'
  | 'not_found_error'
  | 'conflict_error'
  | 'rate_limit_error'
  | 'service_error'
  | 'network_error';

export class IpcError extends Error {
  constructor(
    public type: IpcErrorType,
    message: string,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'IpcError';
  }
}

// Error handling in service layer
export class [FeatureName]Service {
  static async [operationName](input: [InputType]): Promise<[ReturnType]> {
    try {
      // Validation
      const validated = [ValidationSchema].parse(input);

      // Implementation
      const result = await this.performOperation(validated);

      return result;
    } catch (error) {
      // Map errors to IpcError types
      if (error instanceof z.ZodError) {
        throw new IpcError(
          'validation_error',
          'Invalid input data',
          'VALIDATION_FAILED',
          { validationErrors: error.errors }
        );
      }

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new IpcError('not_found_error', error.message);
        }

        if (error.message.includes('permission')) {
          throw new IpcError('permission_error', error.message);
        }

        if (error.message.includes('already exists')) {
          throw new IpcError('conflict_error', error.message);
        }
      }

      // Default to service error
      throw new IpcError(
        'service_error',
        error instanceof Error ? error.message : 'Unknown service error'
      );
    }
  }
}

// Error handling in IPC handlers
ipcMain.handle('[feature]:[operation]', async (_, input: [InputType]) => {
  try {
    const result = await [FeatureName]Service.[operationName](input);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof IpcError) {
      return {
        success: false,
        error: error.message,
        errorType: error.type,
        errorCode: error.code,
        details: error.details,
      };
    }

    // Log unexpected errors
    logger.error('Unexpected IPC error', { error, input });

    return {
      success: false,
      error: 'Internal server error',
      errorType: 'service_error' as IpcErrorType,
    };
  }
});
```

### Retry and Circuit Breaker Patterns

```typescript
// Retry mechanism for IPC operations
export class IpcRetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // Don't retry on certain error types
        if (error instanceof IpcError) {
          if (
            [
              "validation_error",
              "permission_error",
              "not_found_error",
            ].includes(error.type)
          ) {
            throw error;
          }
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Exponential backoff
        const delay = delayMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

// Usage in frontend
export async function loadApiDataWithRetry<T>(
  apiCall: () => Promise<IpcResponse<T>>,
  errorMessage?: string,
): Promise<T> {
  return await IpcRetryManager.withRetry(async () => {
    return await loadApiData(apiCall, errorMessage);
  });
}
```

## Testing Strategy

### Unit Testing IPC Handlers

```typescript
// Mock setup for IPC testing
export class IpcTestUtils {
  static createMockIpcMain() {
    const handlers = new Map<string, Function>();

    return {
      handle: jest.fn((channel: string, handler: Function) => {
        handlers.set(channel, handler);
      }),
      invoke: jest.fn(async (channel: string, ...args: any[]) => {
        const handler = handlers.get(channel);
        if (!handler) {
          throw new Error(`No handler for channel: ${channel}`);
        }
        return await handler({}, ...args);
      }),
      removeAllListeners: jest.fn(),
    };
  }
}

describe('[FeatureName] IPC Handlers', () => {
  let mockIpcMain: any;

  beforeEach(() => {
    mockIpcMain = IpcTestUtils.createMockIpcMain();
    (global as any).ipcMain = mockIpcMain;

    // Setup handlers
    setup[FeatureName]Handlers();
  });

  afterEach(() => {
    cleanup[FeatureName]Handlers();
  });

  describe('[feature]:[operation]', () => {
    it('should handle successful operation', async () => {
      const input = { /* test input */ };
      const expectedOutput = { /* expected output */ };

      // Mock service method
      jest.spyOn([FeatureName]Service, '[operationName]')
        .mockResolvedValueOnce(expectedOutput);

      const response = await mockIpcMain.invoke('[feature]:[operation]', input);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(expectedOutput);
      expect([FeatureName]Service.[operationName]).toHaveBeenCalledWith(input);
    });

    it('should handle service errors', async () => {
      const input = { /* test input */ };
      const error = new Error('Service error');

      jest.spyOn([FeatureName]Service, '[operationName]')
        .mockRejectedValueOnce(error);

      const response = await mockIpcMain.invoke('[feature]:[operation]', input);

      expect(response.success).toBe(false);
      expect(response.error).toBe('Service error');
    });

    it('should handle validation errors', async () => {
      const invalidInput = { /* invalid test input */ };

      const response = await mockIpcMain.invoke('[feature]:[operation]', invalidInput);

      expect(response.success).toBe(false);
      expect(response.error).toContain('validation');
    });
  });
});
```

### Integration Testing

```typescript
// End-to-end IPC testing
describe("[FeatureName] IPC Integration", () => {
  let testDb: BetterSQLite3Database;

  beforeEach(async () => {
    testDb = await setupTestDatabase();
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup test data
  });

  it("should complete full IPC workflow", async () => {
    // Test complete workflow from frontend to database
    const input = {
      /* realistic test input */
    };

    // Simulate IPC call
    const response = await ipcRenderer.invoke("[feature]:[operation]", input);

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();

    // Verify database changes
    const dbResult = await testDb
      .select()
      .from([tableName])
      .where(eq([tableName].id, response.data.id));

    expect(dbResult).toHaveLength(1);
    expect(dbResult[0]).toMatchObject(input);
  });
});
```

### Performance Testing

```typescript
// IPC performance testing
describe("[FeatureName] IPC Performance", () => {
  it("should handle concurrent requests efficiently", async () => {
    const concurrentRequests = 50;
    const requests = Array.from({ length: concurrentRequests }, (_, i) => ({
      /* test input with index */
      index: i,
    }));

    const startTime = Date.now();

    const results = await Promise.all(
      requests.map((request) =>
        ipcRenderer.invoke("[feature]:[operation]", request),
      ),
    );

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / concurrentRequests;

    // Performance assertions
    expect(results).toHaveLength(concurrentRequests);
    expect(results.every((r) => r.success)).toBe(true);
    expect(avgTime).toBeLessThan(100); // < 100ms average per request
    expect(totalTime).toBeLessThan(5000); // < 5s total for all requests
  });
});
```

## Implementation Checklist

### Pre-Implementation

- [ ] IPC requirements clearly defined
- [ ] Security requirements identified
- [ ] Performance targets established
- [ ] Error handling scenarios mapped
- [ ] Type safety requirements documented

### Implementation Phase 1: Service Layer

- [ ] Service methods implemented following INLINE-FIRST
- [ ] Input validation with Zod schemas
- [ ] Permission checking implemented
- [ ] Error handling standardized
- [ ] Unit tests written and passing

### Implementation Phase 2: IPC Handlers

- [ ] IPC handlers implemented with proper error wrapping
- [ ] Type-safe preload script updated
- [ ] Security validation in place
- [ ] Logging and monitoring added
- [ ] Integration tests written and passing

### Implementation Phase 3: Frontend Integration

- [ ] TanStack Router loaders updated
- [ ] TanStack Query hooks implemented
- [ ] Component integration completed
- [ ] Error handling and loading states implemented
- [ ] End-to-end tests written and passing

### Implementation Phase 4: Performance & Security

- [ ] Performance optimization implemented
- [ ] Caching strategy applied where appropriate
- [ ] Rate limiting configured
- [ ] Security audit completed
- [ ] Performance tests passing

### Post-Implementation

- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Team training completed

## References

### Project Wiz Documentation

- [IPC Communication Patterns](../../developer/ipc-communication-patterns.md)
- [Code Simplicity Principles](../../developer/code-simplicity-principles.md)
- [Data Loading Patterns](../../developer/data-loading-patterns.md)
- [Error Handling Patterns](../../developer/error-handling-patterns.md)

### Electron Documentation

- [IPC (Inter-Process Communication)](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)

### Related Architectural Documents

- [Security architecture specifications]
- [Performance requirements documents]
- [Related ADRs affecting IPC communication]

---

## Template Usage Notes

**For Claude Code Agents:**

1. Replace all `[PLACEHOLDER]` text with IPC-specific content
2. Include actual service methods and type definitions from Project Wiz
3. Reference specific security requirements and constraints
4. Ensure all patterns follow Project Wiz IPC guidelines
5. Test IPC communication thoroughly with both unit and integration tests

**File Naming Convention:** `ipc-[feature-name].md`  
**Location:** Save completed IPC designs in `docs/architecture/ipc/`
