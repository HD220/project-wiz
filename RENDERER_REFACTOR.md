# Renderer Architecture Refactoring Plan

## 🎯 Objective

Simplify the renderer architecture by reducing cognitive load, eliminating unnecessary abstractions, and following a clear data loading hierarchy. The goal is to create a more maintainable and performant frontend while preserving all existing functionality.

## 🏗️ New Architecture Principles

### 1. **Data Loading Priority Hierarchy**

1. **TanStack Router beforeLoad/loader** (Highest Priority)
   - Use for initial page data that needs to be available before component renders
   - Direct `window.api` usage (already fully typed via preload.ts)
   - Best performance with route-level preloading
   - Automatic loading states handled by router

2. **TanStack Query** (Second Priority)
   - Use for mutations and reactive data that needs caching/synchronization
   - Direct `window.api` usage in queryFn/mutationFn
   - For data that changes frequently or needs optimistic updates

3. **Router Context** (Third Priority)
   - Share data loaded in routes with child components
   - Eliminate prop drilling
   - Context provides type-safe access to route data

4. **Custom Hooks** (Last Resort)
   - Only for specific behaviors that cannot be handled by above patterns
   - Avoid combining multiple concerns in one hook
   - Focus on single responsibility

### 2. **State Management Philosophy**

- **Eliminate unnecessary Zustand stores** - Most UI state should be local React state
- **Keep stores only for exceptional global state** - Cases where components in multiple routes need synchronized state
- **Use URL params for filters** - Shareable, bookmarkable, and naturally persistent
- **Local state for UI interactions** - Modals, forms, temporary selections

### 3. **Architecture Simplification**

- **Remove API wrapper classes** - They add no value over direct `window.api` usage
- **Minimize abstraction levels** - Reduce component → hook → API → window.api chains
- **Move logic to main process when possible** - Keep renderer lightweight
- **Direct window.api usage** - It's already typed and secure via preload

### 4. **Type System Improvements**

- **Remove inline typing** - Define proper interfaces and types
- **Improve type consistency** - Standardize type definitions
- **Avoid '!' and '?' operators** - Use proper null handling and type guards
- **Move shared types to main process** - Single source of truth

## 📁 Files to be Removed (15 files)

### API Classes (6 files) - Unnecessary abstraction

```
❌ src/renderer/features/agent/agent.api.ts
❌ src/renderer/features/user/user.api.ts
❌ src/renderer/features/llm-provider/llm-provider.api.ts
❌ src/renderer/features/project/project.api.ts
❌ src/renderer/features/conversation/api/conversation.api.ts
❌ src/renderer/features/conversation/api/message.api.ts
```

### Zustand Stores (4 files) - Replace with router context or local state

```
❌ src/renderer/features/agent/agent-ui.store.ts → URL params for filters
❌ src/renderer/features/conversation/store/conversation-ui.store.ts → Local state
❌ src/renderer/features/llm-provider/llm-provider.store.ts → Local state
❌ src/renderer/features/project/project-ui.store.ts → URL params for filters
```

### Complex Hooks (5 files) - Replace with route loading and simple queries

```
❌ src/renderer/features/agent/use-agent.hook.ts → Route beforeLoad + local state
❌ src/renderer/features/project/use-project.hook.ts → Route beforeLoad + local state
❌ src/renderer/features/user/use-user.hook.ts → Router context
❌ src/renderer/features/conversation/hooks/use-conversations.ts → Route beforeLoad
❌ src/renderer/features/conversation/hooks/use-create-conversation.ts → Simple mutation
```

## 🔄 New Implementation Patterns

### Pattern 1: Route-Level Data Loading

```typescript
// ✅ BEFORE: Complex hook with multiple concerns
const { agents, isLoading, error, filters, setFilters } = useAgent();

// ✅ AFTER: Simple route loading with context
export const Route = createFileRoute("/_authenticated/user/agents/")({
  validateSearch: (search) => AgentFiltersSchema.parse(search),
  beforeLoad: async ({ search }) => {
    const response = await window.api.agents.list(search);
    if (!response.success) throw new Error(response.error);
    return { agents: response.data };
  },
  component: AgentsPage,
});

function AgentsPage() {
  const { agents } = useRouteContext({ from: "/_authenticated/user/agents/" });
  const { search } = useSearch({ from: "/_authenticated/user/agents/" });
  // Component is simple and focused
}
```

### Pattern 2: Simple Mutations with TanStack Query

```typescript
// ✅ BEFORE: Complex API class wrapper
const response = await AgentAPI.create(input);

// ✅ AFTER: Direct window.api usage
const createAgent = useMutation({
  mutationFn: (data: CreateAgentInput) => window.api.agents.create(data),
  onSuccess: () => {
    router.invalidate(); // Refresh route data
    navigate({ to: "/agents" });
  },
});
```

### Pattern 3: Local State for UI

```typescript
// ✅ BEFORE: Global Zustand store for local UI
const { selectedAgent, setSelectedAgent } = useAgentStore();

// ✅ AFTER: Local React state
const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
```

### Pattern 4: URL Params for Filters

```typescript
// ✅ BEFORE: Store-based filters
const { filters, setFilters } = useAgentFiltersStore();

// ✅ AFTER: URL-based filters
const { search, status } = useSearch({ from: "/_authenticated/user/agents/" });
const navigate = useNavigate({ from: "/_authenticated/user/agents/" });

const updateFilters = (newFilters) => {
  navigate({ search: { ...search, ...newFilters } });
};
```

## 📊 Expected Benefits

### Performance Improvements

- **Faster initial page loads** - Route preloading eliminates loading spinners
- **Better caching** - TanStack Query handles intelligent caching
- **Reduced re-renders** - Less complex state dependencies

### Developer Experience

- **-40% renderer code** - Significant reduction in file count
- **Simpler debugging** - Clear data flow without multiple abstraction layers
- **Better TypeScript** - Direct window.api usage with full typing
- **Consistent patterns** - Same approach across all features

### Maintainability

- **Single data loading pattern** - Easy to understand and follow
- **Reduced cognitive load** - Less mental overhead when working with code
- **Better separation of concerns** - Route loading, UI state, and mutations clearly separated
- **Easier testing** - Simpler components with fewer dependencies

## 🚀 Implementation Strategy

### Phase 1: Documentation and Guidelines

1. ✅ Create this refactoring document
2. ⏳ Update CLAUDE.md with new patterns
3. ⏳ Document migration examples

### Phase 2: Architecture Refactoring

1. ⏳ Implement route loading for one feature (agents)
2. ⏳ Remove API classes and stores for that feature
3. ⏳ Test and validate the new pattern
4. ⏳ Apply pattern to remaining features

### Phase 3: Cleanup and Polish

1. ⏳ Remove unused files and dependencies
2. ⏳ Update imports throughout codebase
3. ⏳ Final testing and quality assurance

## 💡 Key Success Metrics

- **Reduced file count** - Target: -15 files (-40% of current abstractions)
- **Simplified imports** - No more deep import chains
- **Better performance** - Eliminate loading states for initial page data
- **Consistent patterns** - Same approach across all features
- **Improved type safety** - Better TypeScript coverage without '!' operators

This refactoring will result in a significantly simpler, more performant, and more maintainable renderer architecture while preserving all existing functionality.
