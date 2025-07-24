# Error Handling Patterns & Generic Helpers

This document defines standardized error handling patterns using generic helpers that maintain type safety while reducing boilerplate code.

## Problem Statement

Current inconsistencies in error handling:

- Manual try/catch blocks in IPC handlers with inconsistent logging
- Mixed frontend error handling patterns (some check `response.success`, others don't)
- Inconsistent toast notifications for user feedback
- Repetitive boilerplate code across handlers and components

## Solution: Generic Helpers

Generic wrappers that enforce consistent patterns while maintaining full type inference and compatibility with existing code.

---

## Main Process Helpers

### 1. Generic IPC Handler Wrapper

**File**: `src/main/utils/ipc-handler.ts`

```typescript
import { ipcMain } from "electron";
import { getLogger } from "./logger";
import { IpcResponse } from "../types";

/**
 * Creates a type-safe IPC handler with automatic error handling and logging
 * @param channel - IPC channel name
 * @param handler - Service function to wrap
 * @returns Configured IPC handler
 */
export function createIpcHandler<TArgs extends any[], TReturn>(
  channel: string,
  handler: (...args: TArgs) => Promise<TReturn>,
): void {
  const logger = getLogger("ipc");

  ipcMain.handle(
    channel,
    async (_, ...args: TArgs): Promise<IpcResponse<TReturn>> => {
      try {
        const result = await handler(...args);
        return { success: true, data: result };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : `${channel} failed`;

        logger.error(channel, {
          error: errorMessage,
          args: args.length > 0 ? args : undefined,
          stack: error instanceof Error ? error.stack : undefined,
        });

        return { success: false, error: errorMessage };
      }
    },
  );
}

/**
 * Alternative: Generic error handler for existing handlers
 */
export function handleIpcError(
  channel: string,
  error: unknown,
  context?: Record<string, unknown>,
): IpcResponse<never> {
  const logger = getLogger("ipc");
  const errorMessage =
    error instanceof Error ? error.message : `${channel} failed`;

  logger.error(channel, {
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });

  return { success: false, error: errorMessage };
}
```

### 2. Usage Examples - IPC Handlers

```typescript
// ✅ NEW: Using createIpcHandler (Recommended for new handlers)
import { createIpcHandler } from "../utils/ipc-handler";
import { LlmProviderService } from "./llm-provider.service";

// Automatic type inference: args = [string], return = void
createIpcHandler("llmProviders:delete", (id: string) =>
  LlmProviderService.delete(id),
);

// Multiple arguments with perfect typing
createIpcHandler("llmProviders:update", (id: string, updates: UpdateInput) =>
  LlmProviderService.update(id, updates),
);

// No arguments
createIpcHandler("llmProviders:list", () => LlmProviderService.list());

// ✅ EXISTING: Using handleIpcError (For migrating existing handlers)
ipcMain.handle(
  "llmProviders:create",
  async (_, input: CreateInput): Promise<IpcResponse<LlmProvider>> => {
    try {
      const result = await LlmProviderService.create(input);
      return { success: true, data: result };
    } catch (error) {
      return handleIpcError("llmProviders:create", error, { input });
    }
  },
);
```

---

## Renderer Process Helpers

### 1. Generic API Mutation Hook

**File**: `src/renderer/lib/api-mutation.ts`

```typescript
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { IpcResponse } from "../../main/types";

export interface ApiMutationOptions<TArgs, TReturn> {
  /** Success toast message */
  successMessage?: string;
  /** Error toast message (fallback if API doesn't provide one) */
  errorMessage?: string;
  /** Whether to invalidate router data on success */
  invalidateRouter?: boolean;
  /** Custom success handler */
  onSuccess?: (data: TReturn) => void;
  /** Custom error handler */
  onError?: (error: string) => void;
}

/**
 * Generic hook for API mutations with automatic success/error handling
 */
export function useApiMutation<TArgs, TReturn>(
  mutationFn: (args: TArgs) => Promise<IpcResponse<TReturn>>,
  options: ApiMutationOptions<TArgs, TReturn> = {},
): UseMutationResult<IpcResponse<TReturn>, Error, TArgs> {
  const router = useRouter();

  return useMutation({
    mutationFn,
    onSuccess: (response) => {
      if (response.success) {
        // Success handling
        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        if (options.invalidateRouter !== false) {
          router.invalidate();
        }

        options.onSuccess?.(response.data!);
      } else {
        // Error handling
        const errorMsg =
          response.error || options.errorMessage || "Operation failed";
        toast.error(errorMsg);
        options.onError?.(errorMsg);
      }
    },
    onError: (error) => {
      // Network/system errors
      const errorMsg = options.errorMessage || "An unexpected error occurred";
      toast.error(errorMsg);
      options.onError?.(errorMsg);
    },
  });
}

/**
 * Specialized hook for simple CRUD operations
 */
export function useCrudMutation<TEntity>(
  operation: "create" | "update" | "delete",
  mutationFn: (args: any) => Promise<IpcResponse<TEntity | void>>,
  entityName: string,
) {
  const messages = {
    create: {
      success: `${entityName} created successfully`,
      error: `Failed to create ${entityName.toLowerCase()}`,
    },
    update: {
      success: `${entityName} updated successfully`,
      error: `Failed to update ${entityName.toLowerCase()}`,
    },
    delete: {
      success: `${entityName} deleted successfully`,
      error: `Failed to delete ${entityName.toLowerCase()}`,
    },
  };

  return useApiMutation(mutationFn, {
    successMessage: messages[operation].success,
    errorMessage: messages[operation].error,
    invalidateRouter: true,
  });
}
```

### 2. Route Loader Helper

**File**: `src/renderer/lib/route-loader.ts`

```typescript
import { IpcResponse } from "../../main/types";

/**
 * Unwraps IpcResponse in route loaders with proper error handling
 */
export async function loadApiData<T>(
  apiCall: () => Promise<IpcResponse<T>>,
  errorMessage?: string,
): Promise<T> {
  const response = await apiCall();

  if (!response.success) {
    throw new Error(response.error || errorMessage || "Failed to load data");
  }

  return response.data!;
}

/**
 * Load multiple API calls in parallel
 */
export async function loadApiDataParallel<
  T extends Record<string, any>,
>(calls: { [K in keyof T]: () => Promise<IpcResponse<T[K]>> }): Promise<T> {
  const entries = Object.entries(calls) as [
    keyof T,
    () => Promise<IpcResponse<T[keyof T]>>,
  ][];

  const results = await Promise.all(
    entries.map(async ([key, apiCall]) => {
      const data = await loadApiData(apiCall, `Failed to load ${String(key)}`);
      return [key, data] as const;
    }),
  );

  return Object.fromEntries(results) as T;
}
```

---

## Usage Examples - Frontend

### 1. Component Mutations

```typescript
import { useApiMutation, useCrudMutation } from "@/lib/api-mutation";

function AgentForm() {
  // ✅ Generic approach
  const createAgent = useApiMutation(
    (data: CreateAgentInput) => window.api.agents.create(data),
    {
      successMessage: "Agent created successfully",
      errorMessage: "Failed to create agent",
      onSuccess: () => router.navigate({ to: "/agents" }),
    },
  );

  // ✅ CRUD shorthand
  const deleteAgent = useCrudMutation(
    "delete",
    (id: string) => window.api.agents.delete(id),
    "Agent",
  );

  // Usage
  const handleCreate = (data: CreateAgentInput) => {
    createAgent.mutate(data);
  };

  const handleDelete = (id: string) => {
    deleteAgent.mutate(id);
  };
}
```

### 2. Route Loaders

```typescript
import { loadApiData, loadApiDataParallel } from "@/lib/route-loader";

// ✅ Single API call
export const Route = createFileRoute("/agents/$agentId/edit")({
  loader: async ({ params }) => {
    const agent = await loadApiData(
      () => window.api.agents.findById(params.agentId),
      "Agent not found",
    );
    return { agent };
  },
});

// ✅ Multiple API calls in parallel
export const Route = createFileRoute("/agents/new")({
  loader: async ({ context }) => {
    return await loadApiDataParallel({
      providers: () => window.api.llmProviders.list(context.auth.user.id),
      models: () => window.api.models.list(),
    });
  },
});
```

---

## Migration Strategy

### Phase 1: Add Helpers (Non-breaking)

1. Create helper files
2. Document patterns (this file)
3. Use helpers for new features

### Phase 2: Gradual Migration

1. Migrate high-traffic handlers first
2. Update frontend components using consistent patterns
3. Monitor logs for improved error visibility

### Phase 3: Enforce Standards (Optional)

1. Add code templates/snippets
2. Update development guidelines
3. Code review checklist

---

## Type Safety Benefits

### 1. Automatic Type Inference

```typescript
// ✅ Handler args and return types automatically inferred
createIpcHandler(
  "agents:create",
  (input: CreateAgentInput) => AgentService.create(input), // Returns Promise<SelectAgent>
);
// Result: IPC handler typed as (_, input: CreateAgentInput) => Promise<IpcResponse<SelectAgent>>

// ✅ Frontend mutation automatically typed
const mutation = useApiMutation((id: string) => window.api.agents.delete(id));
// mutation.mutate expects string, success callback gets void
```

### 2. Compile-time Error Detection

```typescript
// ❌ TypeScript error: Argument type mismatch
createIpcHandler(
  "agents:create",
  (wrongType: number) => AgentService.create(wrongType), // Error: number not assignable to CreateAgentInput
);

// ❌ TypeScript error: Missing success check in custom handler
const response = await window.api.agents.create(data);
// With helper: automatic success/error handling
// Without helper: must manually check response.success
```

---

## Performance Considerations

- **Zero runtime overhead**: Helpers are compile-time abstractions
- **Tree shaking**: Unused helper functions are eliminated
- **Memory efficient**: No additional closures or context
- **Logging overhead**: Minimal (only on errors)

---

## Best Practices

### 1. When to Use Each Helper

| Pattern               | Use Case                              |
| --------------------- | ------------------------------------- |
| `createIpcHandler`    | New IPC handlers (preferred)          |
| `handleIpcError`      | Migrating existing handlers           |
| `useApiMutation`      | Complex mutations with custom logic   |
| `useCrudMutation`     | Simple CRUD operations                |
| `loadApiData`         | Route loaders with single API call    |
| `loadApiDataParallel` | Route loaders with multiple API calls |

### 2. Error Message Guidelines

```typescript
// ✅ GOOD: Informative, actionable messages
throw new Error(
  "Cannot delete provider: It is currently being used by agents. Please reassign or delete the agents first.",
);

// ❌ BAD: Generic, unhelpful messages
throw new Error("Operation failed");

// ✅ GOOD: Context-specific fallbacks
errorMessage: "Failed to delete provider";

// ❌ BAD: Generic fallbacks
errorMessage: "Error";
```

### 3. Logging Context

```typescript
// ✅ GOOD: Include relevant context
return handleIpcError("agents:update", error, {
  agentId: id,
  updateFields: Object.keys(updates),
});

// ❌ BAD: No context
return handleIpcError("agents:update", error);
```

---

## Troubleshooting

### Common Issues

1. **Type inference not working**
   - Ensure service methods have proper return types
   - Check that TypeScript strict mode is enabled

2. **Toasts not appearing**
   - Verify Sonner toaster is included in root component
   - Check toast configuration in main.tsx

3. **Router invalidation not working**
   - Ensure route uses TanStack Router loaders
   - Check that invalidateRouter option is not disabled

### Debugging

```typescript
// Add temporary logging to debug mutations
const mutation = useApiMutation((data) => window.api.agents.create(data), {
  onSuccess: (data) => console.log("Success:", data),
  onError: (error) => console.error("Error:", error),
});
```
