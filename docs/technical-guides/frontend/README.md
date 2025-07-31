# Frontend Technical Guides

Advanced technical implementation guides for frontend development in Project Wiz using React 19, TanStack Router v1, and modern TypeScript patterns.

## 🎯 Architecture Overview

Project Wiz frontend implements a **sophisticated desktop-first architecture** with:

- **React 19.0.0** with concurrent features and automatic batching
- **TanStack Router v1.115.2** with file-based routing and advanced data loading
- **TanStack Query v5.83.0** for server state management and caching
- **shadcn/ui** with 48+ production-ready components
- **TypeScript 5.8.3** with strict configuration and full type safety
- **Discord-like Interface** with familiar interaction patterns

## 🚀 Quick Start for Frontend Development

### Prerequisites

- Understanding of React 19 concurrent features
- Knowledge of TanStack Router v1 file-based routing
- Familiarity with TypeScript strict mode patterns
- Experience with Electron renderer process development

### Current Implementation Status

- ✅ **Routing System**: Complete file-based routing with nested layouts
- ✅ **Authentication**: Context-based auth with session management
- ✅ **Data Loading**: beforeLoad/loader patterns with TanStack Query
- ✅ **Component System**: 48+ shadcn/ui components with custom extensions
- ✅ **State Management**: Hierarchical state with Router → Query → Local patterns
- ✅ **Internationalization**: LinguiJS with English/Portuguese support

## 🔍 Discovery Pathways

### **Problem-Solving Entry Points**

#### **"I need to implement authentication"**

**→ Start Here**: [Data Loading Patterns](../../developer/data-loading-patterns.md) - Session-based auth via beforeLoad/loader

#### **"My data loading is inconsistent"**

**→ Solution**: [Data Loading Guide](./tanstack-router-data-loading-guide.md) - MANDATORY hierarchy patterns

#### **"I need to share state between components"**

**→ Go To**: [Data Loading Patterns](../../developer/data-loading-patterns.md) - State management hierarchy

#### **"I want to understand authentication decisions"**

**→ Research**: [Archived Research](../../archive/deprecated-technical-guides/) - Historical authentication analysis

### **Integration Scenarios**

#### **Frontend + AI Integration**

**🎯 Building real-time AI conversation interfaces**

1. **[Data Loading Foundation](./tanstack-router-data-loading-guide.md)** - Establish proper data hierarchy
2. **[AI SDK Streaming](../ai-integration/vercel-ai-sdk-guide.md)** - Integrate AI streaming responses
3. **[State Management](../../developer/data-loading-patterns.md)** - AI conversation state via data hierarchy

#### **Frontend + Performance Optimization**

**🎯 Building high-performance desktop UI**

1. **[React 19 Patterns](./README.md#performance-optimization)** - Leverage concurrent features
2. **[TanStack Query Optimization](./tanstack-router-data-loading-guide.md#performance-patterns)** - Efficient data caching
3. **[Electron Performance](../electron/README.md)** - Desktop-specific optimizations

#### **Frontend + Design System Integration**

**🎯 Implementing consistent UI with shadcn/ui**

1. **[Component Guidelines](../../design/component-design-guidelines.md)** - shadcn/ui usage patterns
2. **[Design Tokens](../../design/design-tokens.md)** - Theming and styling
3. **[Compound Components](../../design/compound-components-guide.md)** - Advanced UI patterns

## 📚 Available Guides

### **Core Frontend Patterns** _(~60 min total)_

- **[TanStack Router Data Loading Guide](./tanstack-router-data-loading-guide.md)** - Complete data loading hierarchy and patterns **(20 min)**
- **[Authentication Patterns](../../developer/data-loading-patterns.md)** - Session-based auth via beforeLoad/loader **(15 min)**
- **[Legacy Research](../../archive/deprecated-technical-guides/)** - Historical context and authentication research (archived)

### **Component Architecture** _(~45 min total)_

- **[shadcn/ui Integration](../../design/component-design-guidelines.md)** - Component usage and customization **(15 min)**
- **[Compound Components](../../design/compound-components-guide.md)** - Advanced component patterns **(15 min)**
- **[Form Patterns](../../developer/coding-standards.md#form-patterns)** - Form handling and validation **(15 min)**

## 🏗️ Architecture Patterns

### **Data Loading Hierarchy (MANDATORY)**

```typescript
// 1. TanStack Router beforeLoad/loader (HIGHEST PRIORITY)
export const Route = createFileRoute('/_authenticated/agents/')({
  beforeLoad: async ({ context }) => {
    // Auth checks and global data
    if (\!context.auth.user) throw redirect({ to: '/auth/login' });
    return { user: context.auth.user };
  },
  loader: async () => {
    // Page-specific data loading
    return await loadApiData(() => window.api.agents.list());
  }
});

// 2. TanStack Query (server state, mutations)
function AgentList() {
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => window.api.agents.list()
  });
  return <div>{/* render agents */}</div>;
}

// 3. Local React State (UI state only)
function AgentCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  return <div>{/* local UI state */}</div>;
}
```

### **Type-Safe IPC Communication**

```typescript
// Preload: Type-safe window.api exposure
contextBridge.exposeInMainWorld("api", {
  agents: {
    list: (): Promise<IpcResponse<Agent[]>> =>
      ipcRenderer.invoke("agents:list"),
    create: (input: CreateAgentInput): Promise<IpcResponse<Agent>> =>
      ipcRenderer.invoke("agents:create", input),
  },
});

// React Component: Direct window.api usage
function CreateAgent() {
  const mutation = useMutation({
    mutationFn: (input: CreateAgentInput) => window.api.agents.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["agents"] }),
  });
}
```

### **Component Architecture Pattern**

```typescript
// Function declarations with props destructuring
export function AgentCard({
  agent,
  onEdit,
  className,
  ...props
}: AgentCardProps) {
  return (
    <Card className={cn("agent-card", className)} {...props}>
      <CardHeader>
        <CardTitle>{agent.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{agent.description}</p>
      </CardContent>
    </Card>
  );
}

// Compound component pattern for complex UIs
export function AgentList({ children, ...props }: AgentListProps) {
  return <div className="agent-list" {...props}>{children}</div>;
}

AgentList.Item = AgentCard;
AgentList.Empty = AgentEmptyState;
AgentList.Loading = AgentSkeleton;
```

### **Authentication Context Pattern**

```typescript
// Context-based authentication
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate session on app start
    window.api.auth.validateSession()
      .then(response => {
        if (response.success) setUser(response.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Route protection with beforeLoad
export const AuthenticatedRoute = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (\!context.auth.user) {
      throw redirect({ to: '/auth/login' });
    }
  }
});
```

## 🛡️ Security & Performance Patterns

### **Secure IPC Usage**

```typescript
// ✅ CORRECT: Direct window.api calls
const result = await window.api.agents.create(agentData);

// ❌ WRONG: Never use localStorage in Electron
localStorage.setItem("user", JSON.stringify(user));

// ❌ WRONG: Never useEffect for data loading
useEffect(() => {
  window.api.getData().then(setData);
}, []);
```

### **Performance Optimization**

```typescript
// React 19 automatic batching
function OptimizedComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  // These are automatically batched in React 19
  const handleClick = () => {
    setCount((c) => c + 1);
    setName("Updated");
  };
}

// TanStack Query optimization
const agents = useQuery({
  queryKey: ["agents", filters],
  queryFn: () => window.api.agents.list(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

## 🚀 Implementation Examples

### **Complete Route Implementation**

```typescript
// File: /src/renderer/app/_authenticated/agents/index.tsx
export const Route = createFileRoute('/_authenticated/agents/')({
  beforeLoad: async ({ context }) => {
    if (\!context.auth.user) throw redirect({ to: '/auth/login' });
  },
  loader: async () => {
    const agents = await loadApiData(() => window.api.agents.list());
    return { agents };
  }
});

export default function AgentsPage() {
  const { agents } = Route.useLoaderData();
  const [searchTerm, setSearchTerm] = useState('');

  const createMutation = useMutation({
    mutationFn: window.api.agents.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success('Agent created successfully');
    }
  });

  return (
    <div className="agents-page">
      <AgentList>
        {agents.map(agent => (
          <AgentList.Item
            key={agent.id}
            agent={agent}
            onEdit={handleEdit}
          />
        ))}
      </AgentList>
    </div>
  );
}
```

### **Advanced Form Pattern**

```typescript
// Form with validation and mutation
export function CreateAgentForm({ onSuccess }: CreateAgentFormProps) {
  const form = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: '',
      description: '',
      role: 'assistant'
    }
  });

  const mutation = useMutation({
    mutationFn: window.api.agents.create,
    onSuccess: (response) => {
      if (response.success) {
        onSuccess?.(response.data);
        form.reset();
      } else {
        toast.error(response.error);
      }
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(mutation.mutate)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Agent
        </Button>
      </form>
    </Form>
  );
}
```

## 🔗 Related Documentation

### **Core Implementation**

- **[Data Loading Patterns](../../developer/data-loading-patterns.md)** - MANDATORY hierarchy for data loading **(15 min)**
- **[Coding Standards](../../developer/coding-standards.md)** - React component standards **(10 min)**
- **[IPC Communication](../../developer/ipc-communication-patterns.md)** - Frontend-backend communication **(15 min)**

### **Design System Integration**

- **[Component Guidelines](../../design/component-design-guidelines.md)** - shadcn/ui usage patterns **(15 min)**
- **[Design Tokens](../../design/design-tokens.md)** - Styling and theming **(10 min)**
- **[Compound Components](../../design/compound-components-guide.md)** - Advanced UI patterns **(20 min)**

### **Cross-Domain Integration**

- **[AI Integration](../ai-integration/README.md)** - AI features in React components
- **[Electron Performance](../electron/README.md)** - Desktop optimization patterns
- **[Database Patterns](../../developer/database-patterns.md)** - Data persistence for frontend features

### **Strategic Planning Integration**

- **[PRP Methodology](../../prps/README.md)** - Plan complex frontend implementations
- **[Active Frontend PRPs](../../prps/01-initials/README.md)** - Real frontend planning examples
- **[INLINE-FIRST Philosophy](../../developer/code-simplicity-principles.md)** - Apply simplicity to frontend complexity

### **Architecture Context**

- **[Developer Guide](../../developer/README.md)** - Complete development documentation
- **[User Flows](../../user/user-flows.md)** - UI requirements from user perspective
- **[Design System](../../design/README.md)** - Complete design implementation

## 🎯 Learning Path

### **Phase 1: Foundation** _(~45 min)_

1. **[Data Loading Guide](./tanstack-router-data-loading-guide.md)** - Core data patterns
2. **[Authentication Patterns](../../developer/data-loading-patterns.md)** - Auth via beforeLoad/loader
3. **[State Management](../../developer/data-loading-patterns.md)** - Data hierarchy and state patterns

### **Phase 2: Components** _(~40 min)_

4. **[Component Guidelines](../../design/component-design-guidelines.md)** - shadcn/ui patterns
5. **[Coding Standards](../../developer/coding-standards.md)** - React best practices
6. **[Compound Components](../../design/compound-components-guide.md)** - Advanced patterns

### **Phase 3: Integration** _(~45 min)_

7. **[IPC Communication](../../developer/ipc-communication-patterns.md)** - Electron integration
8. **[AI Integration](../ai-integration/README.md)** - AI features in UI
9. **[Performance Optimization](../electron/README.md)** - Desktop performance

### **Phase 4: Advanced** _(~30 min)_

10. **[Archived Research](../../archive/deprecated-technical-guides/)** - Historical authentication design decisions
11. **Practice Implementation** - Build complete features

**🎯 Success Criteria:** Can implement complete features following the data loading hierarchy, authentication patterns, component architecture, and cross-domain integration requirements.

---

## 🔍 Contextual Discovery Integration

### **When to Use This Documentation**

#### **From Developer Workflows**

- **Starting Frontend Feature**: Developer Guide → Frontend Architecture → Specific patterns
- **Complex UI Planning**: [PRP Planning](../../prps/README.md) → Frontend Implementation guides
- **Authentication Issues**: [Data Loading Patterns](../../developer/data-loading-patterns.md) → Session management

#### **From Technical Problems**

- **Data Loading Confusion**: [MANDATORY hierarchy](./tanstack-router-data-loading-guide.md)
- **State Management Issues**: [Data Loading Patterns](../../developer/data-loading-patterns.md)
- **Component Architecture**: [Component guidelines](../../design/component-design-guidelines.md)

#### **From Cross-Domain Needs**

- **Frontend + AI**: AI integration patterns + Frontend streaming
- **Frontend + Performance**: React 19 optimization + Electron performance
- **Frontend + Design**: Component patterns + Design system implementation

### **Navigation Pathways**

- **[← Back to Technical Guides](../README.md)** - All technical implementation guides
- **[↑ Developer Guide](../../developer/README.md)** - Core development patterns
- **[🤖 AI Integration](../ai-integration/README.md)** - AI features for frontend
- **[⚡ Electron Guides](../electron/README.md)** - Desktop performance and architecture

---

**💡 Next Steps:** Start with the [Data Loading Guide](./tanstack-router-data-loading-guide.md) to understand the foundation patterns, then progress through authentication and component architecture based on your specific implementation needs.
EOF < /dev/null
