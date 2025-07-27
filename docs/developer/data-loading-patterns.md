# Data Loading Patterns

This document outlines the **MANDATORY** data loading hierarchy and patterns used in Project Wiz.

## 🚨 CRITICAL HIERARCHY - MUST FOLLOW IN ORDER

### 1. TanStack Router beforeLoad/loader (HIGHEST PRIORITY)

**MUST USE FOR:** Initial page data, route guards, data that must be available before render

```typescript
// ✅ CORRECT: Route loader with direct window.api
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

// ✅ CORRECT: beforeLoad for route guards
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const response = await window.api.auth.getCurrentUser();
    if (!response.success) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      });
    }
    return { user: response.data };
  },
});
```

**BENEFITS:**

- Data available before component render
- No loading states needed in components
- Best performance with route-level preloading
- Eliminates flash of loading content

### 2. TanStack Query (SECOND PRIORITY)

**MUST USE FOR:** Mutations, reactive data, data that changes frequently

```typescript
// ✅ CORRECT: Mutations with optimistic updates
const createAgent = useMutation({
  mutationFn: (data: CreateAgentInput) => window.api.agents.create(data),
  onSuccess: () => {
    router.invalidate(); // Refresh route data
    toast.success("Agent created successfully");
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// ✅ CORRECT: For frequently changing data
const useConversationMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ["conversation", conversationId, "messages"],
    queryFn: () => window.api.conversations.getMessages(conversationId),
    refetchInterval: 5000, // Real-time updates
  });
};
```

### 3. Local React State (THIRD PRIORITY)

**MUST USE FOR:** Component-specific UI state, form state, modal states

```typescript
// ✅ CORRECT: Local state for UI interactions
function AgentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form handling and validation inline
  const handleSubmit = async (data: CreateAgentInput) => {
    setIsLoading(true);
    try {
      await window.api.agents.create(data);
      router.invalidate();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form implementation */}
    </form>
  );
}
```

### 4. Custom Hooks (FOURTH PRIORITY)

**ONLY USE WHEN:** Above patterns cannot handle the use case, focus on single responsibility

```typescript
// ✅ CORRECT: Focused single-purpose hook
function useAgentStatus(agentId: string) {
  return useQuery({
    queryKey: ["agent", agentId, "status"],
    queryFn: () => window.api.agents.getStatus(agentId),
    refetchInterval: 2000,
  });
}

// ❌ WRONG: Complex hook mixing multiple concerns
function useAgent() {
  // 50+ lines mixing queries, stores, filters, etc.
  // Split into focused hooks or use route loading
}
```

## ❌ PROHIBITED PATTERNS

### NEVER Use These Patterns:

```typescript
// ❌ NEVER: useEffect for data loading
useEffect(() => {
  window.api.users.get(userId).then(setUser);
}, [userId]);

// ❌ NEVER: API wrapper classes
class AgentAPI {
  static async list() {
    return window.api.agents.list();
  }
}

// ❌ NEVER: localStorage for data
localStorage.setItem("userData", JSON.stringify(user));

// ❌ NEVER: window.api directly in component bodies
function Component() {
  const [data, setData] = useState(null);
  window.api.getData().then(setData); // WRONG!
}

// ❌ NEVER: Zustand for simple UI state
const useAgentStore = create((set) => ({
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
}));
```

## ✅ ALLOWED window.api Usage

**ONLY THESE LOCATIONS:**

1. **Route beforeLoad/loader functions**
2. **TanStack Query queryFn/mutationFn**
3. **Custom hook query functions** (last resort)

```typescript
// ✅ ALLOWED: Route loader
loader: async () => {
  return await loadApiData(() => window.api.agents.list());
};

// ✅ ALLOWED: TanStack Query
queryFn: () => window.api.agents.get(agentId);

// ✅ ALLOWED: Custom hook (last resort)
function useAgentData(agentId: string) {
  return useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => window.api.agents.get(agentId),
  });
}
```

## URL State Management

**MUST USE URL PARAMS FOR:** Filters, search states, pagination (shareable, bookmarkable)

```typescript
// ✅ CORRECT: URL-based filters
const { search } = useSearch({ from: "/_authenticated/user/agents/" });
const navigate = useNavigate({ from: "/_authenticated/user/agents/" });

// Update filters via URL
const updateFilter = (newFilter: string) => {
  navigate({ search: { ...search, filter: newFilter } });
};

// ✅ CORRECT: Search schema validation
const AgentFiltersSchema = z.object({
  status: z.enum(["active", "inactive"]).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
});
```

## Error Handling Patterns

```typescript
// ✅ CORRECT: loadApiData utility for consistent error handling
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

// ✅ CORRECT: Usage in routes
loader: async ({ deps }) => {
  return await loadApiData(
    () => window.api.agents.list(deps.search),
    "Failed to load agents",
  );
};
```

## State Priority Order

1. **TanStack Router beforeLoad/loader** - Initial page data loading
2. **URL Parameters** - Filters, search, pagination (ONLY for actual search/filters)
3. **Local React State** - Simple UI state (modals, forms, toggles)
4. **TanStack Query** - Server state, mutations, caching
5. **Zustand** - **EXCEPTIONAL** global state only

**CRITICAL NOTES:**

- **NEVER use `useRouteContext`** - This is NOT part of our patterns
- **`search` parameter** should ONLY be used for actual URL-based search/filtering, NOT for every Link
- **AVOID:** Creating stores for simple UI state that could be local React state or URL parameters

---

## 🔗 Related Documentation

### **📖 Essential Context**

- **[Code Simplicity Principles](./code-simplicity-principles.md)** - INLINE-FIRST philosophy **(10 min)**
- **[IPC Communication](./ipc-communication-patterns.md)** - How `window.api` calls work **(15 min)**
- **[Database Patterns](./database-patterns.md)** - Backend data that gets loaded **(15 min)**

### **🏗️ Frontend Implementation**

- **[Coding Standards](./coding-standards.md)** - React component patterns **(10 min)**
- **[Error Handling](./error-handling-patterns.md)** - Frontend error management **(15 min)**
- **[Folder Structure](./folder-structure.md)** - Where to place components and hooks **(5 min)**

### **⚡ Advanced Topics**

- **[Technical Guides](../technical-guides/)** - Performance optimization and AI integration
- **[Architecture Documentation](./architecture/)** - System design decisions

### **🔙 Navigation**

- **[← Back to Developer Guide](./README.md)**
- **[↑ Main Documentation](../README.md)**
- **[🔍 Search & Glossary](../glossary-and-search.md)** - Find specific patterns

### **🎯 Implementation Flow**

1. **Start Here** - Learn the hierarchy and patterns
2. **Next:** [IPC Communication](./ipc-communication-patterns.md) - Understand `window.api`
3. **Then:** [Database Patterns](./database-patterns.md) - See backend data sources
4. **Finally:** [Coding Standards](./coding-standards.md) - Apply in React components

**💡 Remember:** This hierarchy is MANDATORY. Always check if a higher-priority pattern can handle your use case before creating custom solutions.
