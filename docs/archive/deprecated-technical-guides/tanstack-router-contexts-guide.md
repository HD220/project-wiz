# TanStack Router Context: Comprehensive Research

**📋 ARCHIVED DOCUMENT**

- **Archived Date**: 2025-07-29
- **Superseded By**: [Data Loading Patterns](../../developer/data-loading-patterns.md) - TanStack Router/Query integration
- **Archive Reason**: Pattern not used in Project Wiz - uses data loading hierarchy instead of router contexts
- **Historical Context**: Comprehensive TanStack Router context research preserved for technical reference

---

⚠️ **DEPRECATED - DO NOT USE IN PROJECT WIZ**

This documentation is for reference only. **Project Wiz does NOT use router contexts or `useRouteContext`**.

Based on my research of the latest TanStack Router documentation and examples, here's a comprehensive guide to router contexts covering all aspects you requested.

**❌ IMPORTANT: This pattern is NOT used in Project Wiz. Use the data loading hierarchy from `/docs/developer/data-loading-patterns.md` instead.**

## 1. Router Context Creation and Usage

### Creating Router Context with createRootRouteWithContext

Router context in TanStack Router is created using `createRootRouteWithContext`, which provides a type-safe way to define context that flows through your entire routing hierarchy.

**Basic Setup:**

```typescript
interface MyRouterContext {
  user: User | null;
  queryClient: QueryClient;
  auth: {
    isAuthenticated: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
  };
}

const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: App,
});
```

### Providing Context Data to the Router

Context data is provided when creating the router instance:

```typescript
const router = createRouter({
  routeTree,
  context: {
    user: null,
    queryClient: new QueryClient(),
    auth: {
      isAuthenticated: false,
      login: async () => {
        /* implementation */
      },
      logout: async () => {
        /* implementation */
      },
    },
  },
});
```

**Dynamic Context with React Hooks:**

```typescript
function InnerApp() {
  const auth = useAuth(); // Custom auth hook
  const user = useUser();
  const queryClient = useQueryClient();

  return (
    <RouterProvider
      router={router}
      context={{
        auth,
        user,
        queryClient
      }}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <InnerApp />
      </QueryClientProvider>
    </AuthProvider>
  );
}
```

### Consuming Context in Components

**Using useRouteContext Hook:**

```typescript
import { useRouteContext } from '@tanstack/react-router';

function UserProfile() {
  // Get full context
  const context = useRouteContext({ from: '/' });
  const { user, auth } = context;

  // Select specific values
  const user = useRouteContext({
    from: '/',
    select: (context) => context.user
  });

  return (
    <div>
      {user ? `Welcome, ${user.name}` : 'Please log in'}
    </div>
  );
}
```

**Pre-bound Route API for Better Performance:**

```typescript
import { getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/dashboard');

export function Dashboard() {
  const context = routeApi.useRouteContext();
  const { user, auth } = context;

  if (!auth.isAuthenticated) {
    return <LoginPrompt />;
  }

  return <DashboardContent user={user} />;
}
```

### Type Safety with Router Contexts

TanStack Router provides strict type inference for contexts:

```typescript
// Strict mode - recommended for type safety
const context = useRouteContext({ from: "/dashboard" });
// ^ MyRouterContext is inferred

// Non-strict mode - looser types
const context = useRouteContext({ strict: false });
// ^ Generic context type

// With selector - type is inferred from return value
const userName = useRouteContext({
  from: "/",
  select: (context) => context.user?.name,
});
// ^ string | undefined
```

### Best Practices for Router Context Data Structure

**1. Organize by Domain:**

```typescript
interface RouterContext {
  // Authentication domain
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    permissions: Permission[];
  };

  // Data fetching domain
  api: {
    queryClient: QueryClient;
    httpClient: AxiosInstance;
  };

  // App configuration domain
  config: {
    theme: Theme;
    locale: string;
    featureFlags: FeatureFlags;
  };

  // Navigation helpers
  navigation: {
    breadcrumbs: BreadcrumbItem[];
    currentSection: string;
  };
}
```

**2. Include Service Injection:**

```typescript
interface RouterContext {
  // Services for dependency injection
  services: {
    userService: UserService;
    projectService: ProjectService;
    notificationService: NotificationService;
  };

  // Utility functions
  utils: {
    formatDate: (date: Date) => string;
    validateForm: <T>(data: T, schema: Schema) => ValidationResult;
  };
}
```

## 2. Router Context vs React Context

### When to Use Router Context vs React Context

**Use Router Context when:**

- Data is tied to specific routes or navigation state
- You need route-specific dependency injection
- Building breadcrumbs, meta tags, or route-aware features
- Authentication state affects routing behavior
- You want hierarchical context modification

**Use React Context when:**

- Data is truly global and not route-specific
- Simple state sharing without routing concerns
- Third-party component integration
- Theme or localization that doesn't depend on routes

### Performance Implications

**Router Context Performance:**

- Built-in structural sharing minimizes re-renders
- Context changes only affect matching routes
- Type-safe selections reduce unnecessary updates
- Automatic optimization through route matching

```typescript
// Optimized context selection
const userName = useRouteContext({
  from: "/profile",
  select: (context) => context.user?.name, // Only re-renders when name changes
});
```

**React Context Performance Issues:**

- All consumers re-render when any context value changes
- Requires manual optimization with React.memo and useCallback
- Can cause performance bottlenecks in large applications

```typescript
// React Context - potential performance issue
const { user, theme, notifications } = useContext(AppContext);
// ^ Re-renders when any of these change, even if component only needs user
```

### Scope and Accessibility Differences

**Router Context Scope:**

- Available to all components within matching routes
- Automatically filtered by route hierarchy
- Can be modified at each route level

**React Context Scope:**

- Available to all components within Provider boundary
- Global scope without route awareness
- Static unless manually updated

### Integration Patterns

**Combining Both Approaches:**

```typescript
// Global React Context for truly global state
const ThemeContext = createContext<ThemeContextType>();

// Router Context for route-aware data
interface RouterContext {
  auth: AuthState;
  route: RouteData;
}

function App() {
  const theme = useTheme(); // From React Context

  return (
    <ThemeProvider value={theme}>
      <RouterProvider
        router={router}
        context={{
          auth: useAuth(),
          route: useRouteData()
        }}
      />
    </ThemeProvider>
  );
}
```

## Practical Examples and Code Patterns

### Authentication Example

```typescript
// 1. Define auth context
interface AuthRouterContext {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    permissions: string[];
    login: (credentials: LoginCredentials) => Promise<AuthResult>;
    logout: () => Promise<void>;
  };
}

// 2. Create root route with context
const rootRoute = createRootRouteWithContext<AuthRouterContext>()({
  component: RootLayout,
});

// 3. Protected route implementation
export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href
        }
      });
    }
  },
  loader: ({ context }) => {
    return {
      user: context.auth.user,
      dashboardData: fetchDashboardData(context.auth.user.id)
    };
  },
  component: Dashboard
});

// 4. Use context in components
function Dashboard() {
  const { auth } = useRouteContext({ from: '/' });

  return (
    <div>
      <h1>Welcome, {auth.user?.name}</h1>
      <UserMenu user={auth.user} onLogout={auth.logout} />
    </div>
  );
}
```

### Dependency Injection Example

```typescript
// Service injection pattern
interface ServiceContext {
  services: {
    apiClient: ApiClient;
    eventBus: EventBus;
    logger: Logger;
  };
  config: AppConfig;
}

const rootRoute = createRootRouteWithContext<ServiceContext>()({
  component: App,
});

// Route with injected services
export const Route = createFileRoute('/projects/$projectId')({
  beforeLoad: ({ context, params }) => {
    const { services } = context;

    return {
      project: services.apiClient.getProject(params.projectId),
      events: services.eventBus.subscribe(`project:${params.projectId}`)
    };
  },
  component: ProjectView
});

function ProjectView() {
  const { services } = useRouteContext({ from: '/' });
  const { project } = Route.useLoaderData();

  const handleSave = async (data: ProjectData) => {
    await services.apiClient.updateProject(project.id, data);
    services.eventBus.emit('project:updated', project.id);
    services.logger.info('Project updated', { projectId: project.id });
  };

  return <ProjectForm project={project} onSave={handleSave} />;
}
```

### Dynamic Breadcrumb Example

```typescript
// Breadcrumb context
interface BreadcrumbContext {
  breadcrumbs: BreadcrumbItem[];
  addBreadcrumb: (item: BreadcrumbItem) => void;
}

// Route that adds to breadcrumbs
export const Route = createFileRoute('/projects/$projectId/tasks/$taskId')({
  beforeLoad: async ({ context, params }) => {
    const project = await fetchProject(params.projectId);
    const task = await fetchTask(params.taskId);

    return {
      ...context,
      breadcrumbs: [
        ...context.breadcrumbs,
        { label: project.name, href: `/projects/${project.id}` },
        { label: task.title, href: `/projects/${project.id}/tasks/${task.id}` }
      ]
    };
  },
  component: TaskDetail
});

function Breadcrumbs() {
  const { breadcrumbs } = useRouteContext({
    from: '/',
    select: (context) => ({ breadcrumbs: context.breadcrumbs })
  });

  return (
    <nav>
      {breadcrumbs.map((crumb, index) => (
        <Link key={index} to={crumb.href}>
          {crumb.label}
        </Link>
      ))}
    </nav>
  );
}
```

## Key Takeaways

1. **Type Safety First**: Always define your router context interface for full type inference
2. **Performance Optimization**: Use the `select` option in `useRouteContext` to prevent unnecessary re-renders
3. **Hierarchical Design**: Leverage route hierarchy to build up context progressively
4. **Service Injection**: Use router context for dependency injection rather than prop drilling
5. **Authentication Integration**: Router context is ideal for auth state that affects routing
6. **Choose Appropriately**: Use router context for route-aware data, React context for truly global state

TanStack Router's context system provides a powerful, type-safe way to manage application state and dependencies that's deeply integrated with your routing structure, making it particularly well-suited for complex applications requiring sophisticated state management and navigation patterns.
