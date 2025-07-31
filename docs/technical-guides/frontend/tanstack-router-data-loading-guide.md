# TanStack Router Data Loading Patterns - Comprehensive Guide

## 1. beforeLoad vs loader - When to Use Each

### Key Differences in Timing and Purpose

#### **beforeLoad Function**

- **Timing**: Runs sequentially from outermost to innermost route **before** any loaders
- **Purpose**: Context modification, authentication guards, redirects, and critical validation
- **Blocking Behavior**: Blocks ALL loaders from running - use carefully for lightweight operations only

```typescript
export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context, location }) => {
    // Authentication check
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    // Add user data to context for child routes
    const user = await context.auth.getCurrentUser();
    return {
      user,
      permissions: user.permissions,
    };
  },
});
```

#### **loader Function**

- **Timing**: Runs after beforeLoad completes, can run in parallel with other loaders
- **Purpose**: Data fetching, route-specific data requirements
- **Loading States**: Shows loading spinners and pending components

```typescript
export const Route = createFileRoute("/dashboard/projects")({
  loader: async ({ context, abortController }) => {
    // Fetch data with proper cancellation
    return await fetchProjects({
      userId: context.user.id,
      signal: abortController.signal,
    });
  },
});
```

### Use Cases for beforeLoad

#### 1. Authentication Guards

```typescript
beforeLoad: async ({ context, location }) => {
  const { isAuthenticated, user } = await context.auth.validate();

  if (!isAuthenticated) {
    throw redirect({
      to: "/auth/login",
      search: { redirect: location.href },
    });
  }

  return { user };
};
```

#### 2. Role-Based Access Control

```typescript
beforeLoad: async ({ context, params }) => {
  const user = context.user;
  const project = await getProject(params.projectId);

  if (!hasProjectAccess(user, project)) {
    throw notFound();
  }

  return { project };
};
```

#### 3. Context Enhancement

```typescript
beforeLoad: ({ context, params }) => {
  return {
    ...context,
    projectId: params.projectId,
    apiClient: createAPIClient({ projectId: params.projectId }),
  };
};
```

### Use Cases for loader

#### 1. Primary Data Fetching

```typescript
loader: async ({ context, deps, abortController }) => {
  const { data } = await context.apiClient.getProjects({
    signal: abortController.signal,
    ...deps,
  });

  return data;
};
```

#### 2. Parallel Data Loading

```typescript
loader: async ({ context, params }) => {
  const [project, members, settings] = await Promise.all([
    fetchProject(params.projectId),
    fetchProjectMembers(params.projectId),
    fetchProjectSettings(params.projectId),
  ]);

  return { project, members, settings };
};
```

#### 3. Conditional Data Loading

```typescript
loader: async ({ context, search }) => {
  const baseData = await fetchBaseData();

  if (search.includeAnalytics) {
    const analytics = await fetchAnalytics();
    return { ...baseData, analytics };
  }

  return baseData;
};
```

### Error Handling

#### beforeLoad Error Handling

```typescript
beforeLoad: async ({ context }) => {
  try {
    const session = await validateSession(context.sessionToken);
    return { session };
  } catch (error) {
    // Redirect to login on auth failure
    throw redirect({ to: "/login" });
  }
};
```

#### loader Error Handling

```typescript
loader: async ({ params }) => {
  try {
    return await fetchUserData(params.userId)
  } catch (error) {
    if (error.status === 404) {
      throw notFound()
    }
    throw error
  }
},
onError: ({ error }) => {
  console.error('Data loading failed:', error)
},
errorComponent: ({ error }) => <ErrorDisplay error={error} />
```

### Performance Implications

#### beforeLoad Performance

- **Sequential execution** - slow parent blocks all children
- **No loading indicators** - empty screen during execution
- **Best for**: Lightweight, critical operations (< 100ms)

#### loader Performance

- **Parallel execution** - multiple loaders can run simultaneously
- **Loading indicators** - shows pending components and spinners
- **Best for**: Data fetching operations that may take time

## 2. Data Loading Best Practices

### Structuring Loader Functions

#### Basic Loader Structure

```typescript
export const Route = createFileRoute("/projects/$projectId")({
  // Define dependencies for caching
  loaderDeps: ({ search }) => ({
    page: search.page,
    filter: search.filter,
  }),

  // Main loader function
  loader: async ({ context, params, deps, abortController }) => {
    const { page, filter } = deps;

    return await context.apiClient.getProjects({
      projectId: params.projectId,
      page,
      filter,
      signal: abortController.signal,
    });
  },

  // Cache configuration
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
});
```

#### Advanced Async/Await Patterns

##### Parallel Data Loading

```typescript
loader: async ({ context, params }) => {
  // Start all requests in parallel
  const projectPromise = fetchProject(params.projectId);
  const membersPromise = fetchMembers(params.projectId);
  const analyticsPromise = fetchAnalytics(params.projectId);

  // Wait for critical data first
  const project = await projectPromise;

  // Get remaining data
  const [members, analytics] = await Promise.all([
    membersPromise,
    analyticsPromise,
  ]);

  return { project, members, analytics };
};
```

##### Conditional and Dependent Loading

```typescript
loader: async ({ context, search, params }) => {
  // Load base data first
  const project = await fetchProject(params.projectId);

  // Conditionally load additional data
  const additionalData = await Promise.all([
    search.includeMembers ? fetchMembers(params.projectId) : null,
    search.includeAnalytics ? fetchAnalytics(params.projectId) : null,
    project.hasCustomFields ? fetchCustomFields(project.id) : null,
  ]);

  return {
    project,
    members: additionalData[0],
    analytics: additionalData[1],
    customFields: additionalData[2],
  };
};
```

### Error Boundaries and Error Handling

#### Route-Level Error Handling

```typescript
export const Route = createFileRoute('/projects/$projectId')({
  loader: async ({ params }) => {
    const project = await fetchProject(params.projectId)
    return project
  },

  // Handle loading errors
  onError: ({ error, retry }) => {
    if (error.status === 404) {
      // Don't retry for 404s
      return
    }

    // Log error and potentially retry
    console.error('Project loading failed:', error)

    // Optional: Automatic retry after delay
    setTimeout(() => retry(), 2000)
  },

  // Custom error component
  errorComponent: ({ error, retry }) => (
    <div className="error-container">
      <h2>Failed to load project</h2>
      <p>{error.message}</p>
      <button onClick={() => retry()}>
        Try Again
      </button>
    </div>
  ),
})
```

#### Global Error Boundaries

```typescript
// In route tree root
export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ({ error, reset }) => (
    <div className="global-error">
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <button onClick={reset}>Reset App</button>
    </div>
  ),
})
```

### Loading States and Suspense Integration

#### Pending Components

```typescript
export const Route = createFileRoute('/projects')({
  loader: ({ context }) => fetchProjects(context.user.id),

  // Loading component
  pendingComponent: () => (
    <div className="loading-container">
      <Spinner />
      <p>Loading projects...</p>
    </div>
  ),

  component: Projects,
})
```

#### Route-Level Loading Detection

```typescript
function ProjectsList() {
  const projects = Route.useLoaderData()
  const { isPending, isFetching } = Route.useMatch()

  return (
    <div>
      {isFetching && <div className="refetch-indicator">Updating...</div>}

      <div className={isPending ? 'loading' : ''}>
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
```

### Data Sharing Between Routes

#### Parent-Child Data Sharing

```typescript
// Parent route
export const Route = createFileRoute("/projects/$projectId")({
  loader: ({ params }) => fetchProject(params.projectId),
  component: ProjectLayout,
});

// Child route accessing parent data
export const ChildRoute = createFileRoute("/projects/$projectId/settings")({
  loader: ({ context }) => {
    // Access parent route data
    const project = context.parentLoaderData?.project;
    return fetchProjectSettings(project.id);
  },
  component: ProjectSettings,
});
```

#### Context-Based Data Sharing

```typescript
// Root route with context
export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await getCurrentUser();
    return {
      user,
      apiClient: createAPIClient(user.token),
    };
  },
});

// Child route using context
export const Route = createFileRoute("/dashboard")({
  loader: ({ context }) => {
    // Use shared API client
    return context.apiClient.getDashboardData();
  },
});
```

### Cache Management

#### Cache Configuration

```typescript
export const Route = createFileRoute("/projects")({
  loader: fetchProjects,

  // SWR configuration
  staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
  gcTime: 30 * 60 * 1000, // 30 minutes - cache cleanup

  // Disable caching for sensitive data
  // staleTime: Infinity,
});
```

#### Cache Invalidation

```typescript
// Manual cache invalidation
function ProjectActions() {
  const navigate = useNavigate()

  const updateProject = async (projectData) => {
    await updateProjectAPI(projectData)

    // Invalidate cache by navigating with replace
    await navigate({
      to: '/projects/$projectId',
      params: { projectId: projectData.id },
      replace: true,
      // Force reload
      search: (prev) => ({ ...prev, _timestamp: Date.now() }),
    })
  }

  return <ProjectForm onSubmit={updateProject} />
}
```

#### Dependency-Based Caching

```typescript
export const Route = createFileRoute("/projects")({
  // Cache key depends on search params
  loaderDeps: ({ search }) => ({
    page: search.page || 1,
    filter: search.filter || "",
    sort: search.sort || "name",
  }),

  loader: ({ deps }) => {
    // Data is cached per unique combination of deps
    return fetchProjects(deps);
  },
});
```

## 3. Route Data Access

### useLoaderData Hook

#### Basic Usage with Type Safety

```typescript
// Route definition
export const Route = createFileRoute('/projects/$projectId')({
  loader: async ({ params }): Promise<Project> => {
    return await fetchProject(params.projectId)
  },
  component: ProjectDetails,
})

// Component usage
function ProjectDetails() {
  // Fully typed based on loader return type
  const project = Route.useLoaderData()

  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
    </div>
  )
}
```

#### Route.useLoaderData() Patterns

##### With Selectors

```typescript
function ProjectStats() {
  // Subscribe to specific data slice
  const stats = Route.useLoaderData({
    select: (data) => ({
      memberCount: data.members.length,
      taskCount: data.tasks.length,
      completedTasks: data.tasks.filter(t => t.completed).length,
    }),
  })

  return <StatsDisplay stats={stats} />
}
```

##### Cross-Route Data Access

```typescript
// Access data from different route
function ProjectBreadcrumb() {
  const project = getRouteApi('/projects/$projectId').useLoaderData()
  const projects = getRouteApi('/projects').useLoaderData()

  return (
    <nav>
      <Link to="/projects">All Projects ({projects.length})</Link>
      <span> / </span>
      <span>{project.name}</span>
    </nav>
  )
}
```

##### Strict vs Non-Strict Mode

```typescript
// Strict mode (recommended)
function ProjectDetails() {
  const project = useLoaderData({
    from: '/projects/$projectId'
  })

  return <ProjectView project={project} />
}

// Non-strict mode for shared components
function GenericLoader() {
  const data = useLoaderData({ strict: false })

  // Handle multiple possible data shapes
  if ('project' in data) {
    return <ProjectView project={data.project} />
  }
  if ('user' in data) {
    return <UserView user={data.user} />
  }

  return <div>Unknown data type</div>
}
```

### Type Safety with Loader Data

#### Explicit Return Types

```typescript
interface ProjectData {
  project: Project;
  members: User[];
  settings: ProjectSettings;
}

export const Route = createFileRoute("/projects/$projectId")({
  loader: async ({ params }): Promise<ProjectData> => {
    const [project, members, settings] = await Promise.all([
      fetchProject(params.projectId),
      fetchProjectMembers(params.projectId),
      fetchProjectSettings(params.projectId),
    ]);

    return { project, members, settings };
  },
});
```

#### Using RouteApi for Type Safety

```typescript
// Create typed route API
const projectRoute = getRouteApi('/projects/$projectId')

function ProjectMembersList() {
  // Type-safe access without importing Route
  const { members } = projectRoute.useLoaderData()

  return (
    <ul>
      {members.map(member => (
        <li key={member.id}>{member.name}</li>
      ))}
    </ul>
  )
}
```

### Data Invalidation Strategies

#### Time-Based Invalidation

```typescript
export const Route = createFileRoute('/projects')({
  loader: fetchProjects,
  staleTime: 5 * 60 * 1000, // 5 minutes

  component: () => {
    const projects = Route.useLoaderData()
    const { isLoading, isFetching } = Route.useMatch()

    return (
      <div>
        {isFetching && <RefreshIndicator />}
        <ProjectsList projects={projects} />
      </div>
    )
  },
})
```

#### Event-Based Invalidation

```typescript
function ProjectActions() {
  const navigate = useNavigate()
  const { projectId } = Route.useParams()

  const deleteProject = async () => {
    await deleteProjectAPI(projectId)

    // Navigate away and clear cache
    await navigate({
      to: '/projects',
      replace: true,
    })
  }

  const updateProject = async (data) => {
    await updateProjectAPI(projectId, data)

    // Force reload current route
    await navigate({
      to: '/projects/$projectId',
      params: { projectId },
      search: { _refresh: Date.now() },
      replace: true,
    })
  }

  return (
    <div>
      <button onClick={updateProject}>Update</button>
      <button onClick={deleteProject}>Delete</button>
    </div>
  )
}
```

#### Manual Invalidation with External Libraries

```typescript
// With TanStack Query integration
function ProjectPage() {
  const queryClient = useQueryClient()
  const project = Route.useLoaderData()

  const invalidateProject = () => {
    queryClient.invalidateQueries({
      queryKey: ['project', project.id]
    })
  }

  return (
    <div>
      <ProjectDetails project={project} />
      <button onClick={invalidateProject}>
        Refresh Data
      </button>
    </div>
  )
}
```

## 4. Search Params and Validation

### validateSearch Function

#### Basic Search Validation

```typescript
interface ProjectsSearch {
  page: number;
  filter: string;
  sort: "name" | "created" | "updated";
  includeArchived: boolean;
}

export const Route = createFileRoute("/projects")({
  validateSearch: (search: Record<string, unknown>): ProjectsSearch => {
    return {
      page: Number(search.page) || 1,
      filter: (search.filter as string) || "",
      sort: (["name", "created", "updated"].includes(search.sort as string)
        ? search.sort
        : "name") as ProjectsSearch["sort"],
      includeArchived: Boolean(search.includeArchived),
    };
  },
});
```

#### Zod Schema Validation

```typescript
import { z } from "zod";

const projectsSearchSchema = z.object({
  page: z.number().int().positive().catch(1),
  limit: z.number().int().min(10).max(100).catch(20),
  filter: z.string().catch(""),
  sort: z.enum(["name", "created", "updated"]).catch("name"),
  tags: z.array(z.string()).catch([]),
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .optional(),
});

type ProjectsSearch = z.infer<typeof projectsSearchSchema>;

export const Route = createFileRoute("/projects")({
  validateSearch: (search) => projectsSearchSchema.parse(search),

  loaderDeps: ({ search }) => search,

  loader: ({ deps }) => {
    return fetchProjects({
      page: deps.page,
      limit: deps.limit,
      filter: deps.filter,
      sort: deps.sort,
      tags: deps.tags,
      dateRange: deps.dateRange,
    });
  },
});
```

### Type-Safe Search Params

#### Reading Search Params

```typescript
function ProjectsFilters() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const updateFilter = (newFilter: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        filter: newFilter,
        page: 1, // Reset to first page
      }),
    })
  }

  return (
    <div>
      <input
        value={search.filter}
        onChange={(e) => updateFilter(e.target.value)}
        placeholder="Filter projects..."
      />

      <select
        value={search.sort}
        onChange={(e) => navigate({
          search: (prev) => ({
            ...prev,
            sort: e.target.value as ProjectsSearch['sort'],
          }),
        })}
      >
        <option value="name">Name</option>
        <option value="created">Created Date</option>
        <option value="updated">Last Updated</option>
      </select>
    </div>
  )
}
```

#### Complex Search State Management

```typescript
const advancedSearchSchema = z.object({
  query: z.string().catch(''),
  filters: z.object({
    status: z.array(z.enum(['active', 'archived', 'draft'])).catch([]),
    owner: z.string().optional(),
    tags: z.array(z.string()).catch([]),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }).catch({}),
  sorting: z.object({
    field: z.enum(['name', 'created', 'updated', 'priority']).catch('name'),
    direction: z.enum(['asc', 'desc']).catch('asc'),
  }).catch({}),
  pagination: z.object({
    page: z.number().int().positive().catch(1),
    limit: z.number().int().min(10).max(100).catch(20),
  }).catch({}),
})

export const Route = createFileRoute('/projects/search')({
  validateSearch: (search) => advancedSearchSchema.parse(search),

  component: ProjectSearch,
})

function ProjectSearch() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const updateSearch = (updates: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...updates,
        // Reset pagination when filters change
        ...(updates.filters && { pagination: { ...prev.pagination, page: 1 } }),
      }),
    })
  }

  return (
    <div>
      <SearchForm
        value={search}
        onChange={updateSearch}
      />
      <ProjectResults search={search} />
    </div>
  )
}
```

### URL State Management

#### Preserving State Across Navigation

```typescript
// Middleware to retain search params
const retainSearchParams = [
  'filter',
  'sort',
  'view',
] as const

export const Route = createFileRoute('/projects')({
  validateSearch: projectsSearchSchema.parse,

  // Keep certain params when navigating away
  beforeLoad: ({ search, context }) => {
    context.retainedSearch = pick(search, retainSearchParams)
  },
})

// Child route inheriting search params
export const DetailRoute = createFileRoute('/projects/$projectId')({
  validateSearch: (search) => ({
    ...projectsSearchSchema.parse(search),
    tab: z.enum(['overview', 'members', 'settings']).catch('overview').parse(search.tab),
  }),

  component: () => {
    const search = Route.useSearch()

    return (
      <div>
        {/* Back link preserves search state */}
        <Link
          to="/projects"
          search={pick(search, retainSearchParams)}
        >
          ← Back to Projects
        </Link>

        <ProjectTabs activeTab={search.tab} />
      </div>
    )
  },
})
```

#### Search Param Best Practices

##### Debounced Search Updates

```typescript
function ProjectSearchInput() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const [localQuery, setLocalQuery] = useState(search.query)

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== search.query) {
        navigate({
          search: (prev) => ({
            ...prev,
            query: localQuery,
            page: 1, // Reset pagination
          }),
        })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localQuery, search.query, navigate])

  return (
    <input
      value={localQuery}
      onChange={(e) => setLocalQuery(e.target.value)}
      placeholder="Search projects..."
    />
  )
}
```

##### Default Values and Fallbacks

```typescript
const searchSchema = z.object({
  query: z.string().default(""),
  status: z.enum(["all", "active", "archived"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(10).max(100).default(20),
});

export const Route = createFileRoute("/projects")({
  validateSearch: searchSchema.parse,

  // Provide fallback search when none exists
  search: {
    middlewares: [
      // Ensure defaults are in URL
      ({ search, next }) => {
        const parsed = searchSchema.parse(search);
        return next(parsed);
      },
    ],
  },
});
```

##### URL Serialization for Complex Types

```typescript
// Custom serialization for complex search params
const dateRangeSearchSchema = z.object({
  dateRange: z.object({
    start: z.string().transform(val => new Date(val)),
    end: z.string().transform(val => new Date(val)),
  }).optional(),
  tags: z.string().transform(val => val.split(',')).default(''),
})

function ProjectFilters() {
  const search = Route.useSearch()
  const navigate = useNavigate()

  const updateDateRange = (start: Date, end: Date) => {
    navigate({
      search: (prev) => ({
        ...prev,
        dateRange: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
      }),
    })
  }

  const updateTags = (tags: string[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        tags: tags.join(','),
      }),
    })
  }

  return (
    <div>
      <DateRangePicker
        value={search.dateRange}
        onChange={(start, end) => updateDateRange(start, end)}
      />

      <TagSelector
        value={search.tags}
        onChange={updateTags}
      />
    </div>
  )
}
```

## Advanced Patterns

### Deferred Data Loading

```typescript
export const Route = createFileRoute('/dashboard')({
  loader: async () => {
    // Critical data loaded synchronously
    const user = await fetchCurrentUser()

    // Non-critical data deferred
    const analyticsPromise = fetchAnalytics()
    const notificationsPromise = fetchNotifications()

    return {
      user,
      deferredAnalytics: analyticsPromise,
      deferredNotifications: notificationsPromise,
    }
  },

  component: Dashboard,
})

function Dashboard() {
  const { user, deferredAnalytics, deferredNotifications } = Route.useLoaderData()

  return (
    <div>
      {/* Immediate render */}
      <UserProfile user={user} />

      {/* Progressive loading */}
      <Suspense fallback={<AnalyticsLoader />}>
        <Await promise={deferredAnalytics}>
          {(analytics) => <AnalyticsDashboard data={analytics} />}
        </Await>
      </Suspense>

      <Suspense fallback={<NotificationsLoader />}>
        <Await promise={deferredNotifications}>
          {(notifications) => <NotificationsList items={notifications} />}
        </Await>
      </Suspense>
    </div>
  )
}
```

### Integration with TanStack Query

```typescript
const projectQueryOptions = (projectId: string) => ({
  queryKey: ['project', projectId],
  queryFn: () => fetchProject(projectId),
})

export const Route = createFileRoute('/projects/$projectId')({
  loader: ({ params, context: { queryClient } }) => {
    // Prefetch data
    return queryClient.ensureQueryData(projectQueryOptions(params.projectId))
  },

  component: () => {
    const params = Route.useParams()
    const initialData = Route.useLoaderData()

    // Use query with prefetched data
    const { data: project, isLoading } = useQuery({
      ...projectQueryOptions(params.projectId),
      initialData,
    })

    if (isLoading) return <ProjectLoader />

    return <ProjectDetails project={project} />
  },
})
```

This comprehensive guide covers all the essential TanStack Router data loading patterns for 2024, providing type-safe, performant, and maintainable approaches to data fetching and state management in React applications.
