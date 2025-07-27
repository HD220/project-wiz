# TanStack Router Authentication & Masked Routes - Comprehensive Guide

⚠️ **PARTIALLY DEPRECATED - SOME PATTERNS NOT USED IN PROJECT WIZ**

**❌ IMPORTANT: Project Wiz does NOT use `useRouteContext` or router contexts. We use beforeLoad/loader for authentication checks only.**

## 1. Authentication Patterns

### Protected Routes Implementation

#### Basic Authentication Guard

```typescript
// Root route with auth context
interface RouterContext {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
  };
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

// Protected route with beforeLoad guard
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    const { auth } = context;

    // Wait for auth to finish loading
    if (auth.isLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!auth.isAuthenticated || !auth.user) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }

    // Return enhanced context for child routes
    return {
      user: auth.user,
      permissions: auth.user.permissions,
    };
  },
  component: AuthenticatedLayout,
});
```

#### Session-Based Authentication (Desktop Apps)

```typescript
// Desktop app authentication service
class AuthService {
  static async validateSession(token: string): Promise<AuthResult> {
    try {
      const response = await window.api.auth.validateSession(token)

      if (!response.success) {
        throw new Error('Invalid session')
      }

      return {
        user: response.data.user,
        isAuthenticated: true,
        permissions: response.data.permissions,
      }
    } catch (error) {
      // Clear invalid session
      await this.logout()
      throw error
    }
  }

  static async logout(): Promise<void> {
    await window.api.auth.logout()
    // Clear any local auth state
  }
}

// Authentication provider with router context
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  })

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await window.api.auth.getStoredToken()

        if (token) {
          const authResult = await AuthService.validateSession(token)
          setAuth({
            ...authResult,
            token,
            isLoading: false,
          })
        } else {
          setAuth(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        setAuth({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null,
        })
      }
    }

    initAuth()
  }, [])

  return (
    <RouterProvider
      router={router}
      context={{ auth }}
    />
  )
}
```

### Role-Based Access Control (RBAC)

#### Permission-Based Route Guards

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
  permissions: string[];
}

// Admin-only route
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const { user } = context;

    if (!user || user.role !== "admin") {
      throw notFound();
    }

    return {
      adminUser: user,
    };
  },
  component: AdminDashboard,
});

// Permission-based route
export const Route = createFileRoute(
  "/_authenticated/projects/$projectId/settings",
)({
  beforeLoad: async ({ context, params }) => {
    const { user } = context;

    // Check if user has project management permission
    if (!user.permissions.includes("project:manage")) {
      throw redirect({
        to: "/projects/$projectId",
        params: { projectId: params.projectId },
      });
    }

    // Verify user has access to this specific project
    const hasProjectAccess = await window.api.projects.checkUserAccess(
      params.projectId,
      user.id,
    );

    if (!hasProjectAccess.success || !hasProjectAccess.data) {
      throw notFound();
    }

    return {
      projectId: params.projectId,
      canManageProject: true,
    };
  },
  component: ProjectSettings,
});
```

#### Granular Permission System

```typescript
// Permission utility functions
const permissions = {
  projects: {
    create: "project:create",
    read: "project:read",
    update: "project:update",
    delete: "project:delete",
    manage: "project:manage",
  },
  users: {
    create: "user:create",
    read: "user:read",
    update: "user:update",
    delete: "user:delete",
  },
} as const;

function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission);
}

function hasAnyPermission(user: User, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

function hasAllPermissions(user: User, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}

// Route with multiple permission requirements
export const Route = createFileRoute("/_authenticated/projects/new")({
  beforeLoad: async ({ context }) => {
    const { user } = context;

    if (!hasPermission(user, permissions.projects.create)) {
      throw redirect({
        to: "/projects",
        search: {
          error: "insufficient_permissions",
        },
      });
    }
  },
  component: CreateProject,
});
```

### Session Management and Validation

#### Automatic Session Validation

```typescript
// Session validation hook
function useSessionValidation() {
  const navigate = useNavigate()

  useEffect(() => {
    const validateSession = async () => {
      try {
        const result = await window.api.auth.validateCurrentSession()

        if (!result.success) {
          // Session expired, redirect to login
          navigate({
            to: '/auth/login',
            search: {
              reason: 'session_expired',
            },
          })
        }
      } catch (error) {
        console.error('Session validation failed:', error)
        // Handle validation error
      }
    }

    // Validate session every 5 minutes
    const interval = setInterval(validateSession, 5 * 60 * 1000)

    // Validate immediately
    validateSession()

    return () => clearInterval(interval)
  }, [navigate])
}

// Root layout with session validation
function AuthenticatedLayout() {
  useSessionValidation()

  return (
    <div className="authenticated-layout">
      <Header />
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

#### Session Refresh Strategy

```typescript
// Auto-refresh session token
function useTokenRefresh() {
  const { auth, setAuth } = useAuth();

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const refreshToken = async () => {
      try {
        const result = await window.api.auth.refreshToken();

        if (result.success) {
          setAuth((prev) => ({
            ...prev,
            token: result.data.token,
            user: result.data.user,
          }));
        }
      } catch (error) {
        // Handle refresh failure
        console.error("Token refresh failed:", error);
      }
    };

    // Refresh token 5 minutes before expiry
    const refreshInterval = 25 * 60 * 1000; // 25 minutes
    const interval = setInterval(refreshToken, refreshInterval);

    return () => clearInterval(interval);
  }, [auth.isAuthenticated, setAuth]);
}
```

### Login/Logout Flows with Redirects

#### Login Flow Implementation

```typescript
export const Route = createFileRoute('/auth/login')({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || '/dashboard',
    reason: search.reason as string,
  }),
  component: LoginPage,
})

function LoginPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await window.api.auth.login(credentials)

      if (!result.success) {
        setError(result.error || 'Login failed')
        return
      }

      // Success - navigate to intended destination
      await navigate({
        to: search.redirect || '/dashboard',
        replace: true,
      })
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      {search.reason === 'session_expired' && (
        <div className="alert alert-warning">
          Your session has expired. Please log in again.
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
      />
    </div>
  )
}
```

#### Logout Flow Implementation

```typescript
function useLogout() {
  const navigate = useNavigate();

  const logout = useCallback(
    async (reason?: "user" | "expired" | "error") => {
      try {
        // Clear server-side session
        await window.api.auth.logout();

        // Navigate to login with reason
        await navigate({
          to: "/auth/login",
          search: reason ? { reason } : undefined,
          replace: true,
        });
      } catch (error) {
        console.error("Logout failed:", error);
        // Force navigation even if logout fails
        await navigate({
          to: "/auth/login",
          search: { reason: "error" },
          replace: true,
        });
      }
    },
    [navigate],
  );

  return logout;
}

// Automatic logout on inactivity
function useInactivityLogout(timeoutMinutes: number = 30) {
  const logout = useLogout();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(
      () => {
        logout("expired");
      },
      timeoutMinutes * 60 * 1000,
    );
  }, [logout, timeoutMinutes]);

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => resetTimer();

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start timer
    resetTimer();

    return () => {
      // Cleanup
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);
}
```

## 2. Masked Routes (Virtual/Layout Routes)

### Understanding Route Masking

#### Pathless Layout Routes

```typescript
// File: /app/_authenticated/route.tsx
// Creates a layout without adding to URL path
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: AuthenticatedLayout,
});

// File: /app/_authenticated/user/route.tsx
// URL: /user (not /_authenticated/user)
export const Route = createFileRoute("/_authenticated/user")({
  component: UserLayout,
});

// File: /app/_authenticated/user/profile.tsx
// URL: /user/profile (not /_authenticated/user/profile)
export const Route = createFileRoute("/_authenticated/user/profile")({
  component: UserProfile,
});
```

#### Route Masking with Different URLs

```typescript
// File: /app/_authenticated/(dashboard)/index.tsx
// URL: / (root path with auth protection)
export const Route = createFileRoute("/_authenticated/(dashboard)/")({
  component: Dashboard,
});

// File: /app/_authenticated/(dashboard)/overview.tsx
// URL: /overview (clean URL, authenticated layout)
export const Route = createFileRoute("/_authenticated/(dashboard)/overview")({
  component: Overview,
});
```

### When to Use Masked Routes vs Regular Routes

#### Use Masked Routes When:

1. **Shared Layouts Without URL Pollution**

```typescript
// All admin routes share layout but don't need /admin prefix
// File: /app/_authenticated/_admin/route.tsx
export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: ({ context }) => {
    if (context.user.role !== "admin") {
      throw notFound();
    }
  },
  component: AdminLayout,
});

// File: /app/_authenticated/_admin/users.tsx
// URL: /users (not /admin/users)
export const Route = createFileRoute("/_authenticated/_admin/users")({
  component: UserManagement,
});
```

2. **Authentication Boundaries**

```typescript
// Public routes
// File: /app/(public)/about.tsx
// URL: /about
export const Route = createFileRoute("/(public)/about")({
  component: About,
});

// Authenticated routes
// File: /app/_authenticated/dashboard.tsx
// URL: /dashboard (with auth protection)
export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});
```

3. **Feature Grouping**

```typescript
// Group related features without affecting URLs
// File: /app/_authenticated/_features/route.tsx
export const Route = createFileRoute("/_authenticated/_features")({
  component: FeaturesLayout,
});

// File: /app/_authenticated/_features/projects.tsx
// URL: /projects (clean URL with features layout)
export const Route = createFileRoute("/_authenticated/_features/projects")({
  component: Projects,
});
```

#### Use Regular Routes When:

1. **URL Structure Matches Navigation**

```typescript
// File: /app/_authenticated/settings/profile.tsx
// URL: /settings/profile (clear hierarchical URL)
export const Route = createFileRoute("/_authenticated/settings/profile")({
  component: ProfileSettings,
});
```

2. **SEO and Bookmarking Matter**

```typescript
// File: /app/blog/post/$slug.tsx
// URL: /blog/post/my-article (descriptive URLs)
export const Route = createFileRoute("/blog/post/$slug")({
  component: BlogPost,
});
```

### Route Grouping and Layout Organization

#### Flat Organization with Route Groups

```typescript
// Directory structure:
// /app/
//   /_authenticated/
//     route.tsx         -> AuthenticatedLayout
//     dashboard.tsx     -> /dashboard
//     projects.tsx      -> /projects
//     settings.tsx      -> /settings
//   /(public)/
//     about.tsx         -> /about
//     contact.tsx       -> /contact
//   /auth/
//     login.tsx         -> /auth/login
//     register.tsx      -> /auth/register

// Benefits: Clean URLs, shared layouts, logical grouping
```

#### Nested Organization

```typescript
// Directory structure:
// /app/
//   /_authenticated/
//     route.tsx           -> AuthenticatedLayout
//     dashboard/
//       index.tsx         -> /dashboard
//       analytics.tsx     -> /dashboard/analytics
//     projects/
//       index.tsx         -> /projects
//       $projectId.tsx    -> /projects/123
//       new.tsx           -> /projects/new

// Benefits: Clear hierarchy, feature isolation, nested layouts
```

#### Mixed Organization Strategy

```typescript
// Directory structure:
// /app/
//   /_authenticated/
//     route.tsx                    -> Auth boundary
//     (dashboard)/
//       index.tsx                  -> /
//       overview.tsx               -> /overview
//     _admin/                      -> Admin boundary (pathless)
//       route.tsx                  -> AdminLayout
//       users.tsx                  -> /users
//       settings.tsx               -> /settings
//     projects/
//       route.tsx                  -> ProjectsLayout
//       index.tsx                  -> /projects
//       $projectId/
//         index.tsx                -> /projects/123
//         settings.tsx             -> /projects/123/settings

// Benefits: Flexible organization, multiple layout boundaries
```

### File-Based Routing with Underscore Prefixes

#### Route Exclusion Patterns

```typescript
// Exclude from routing with dash prefix
// File: /app/-components/header.tsx (not a route)
// File: /app/-utils/helpers.ts (not a route)

// Pathless routes with underscore
// File: /app/_layout/route.tsx (creates layout, no URL segment)

// Mixed patterns
// /app/
//   _authenticated/          -> Auth layout (pathless)
//     -components/          -> Shared components (excluded)
//       header.tsx
//       sidebar.tsx
//     (dashboard)/          -> Route group (pathless)
//       index.tsx           -> /
//       stats.tsx           -> /stats
//     projects/             -> Regular nested route
//       index.tsx           -> /projects
//       new.tsx             -> /projects/new
```

#### Advanced File Patterns

```typescript
// Splat routes for catch-all
// File: /app/docs/$.tsx
// Matches: /docs/anything/nested/here

// Optional segments
// File: /app/products/($category).tsx
// Matches: /products OR /products/electronics

// Multiple parameters
// File: /app/users/$userId/posts/$postId.tsx
// Matches: /users/123/posts/456

// Route groups with parameters
// File: /app/_authenticated/(workspace)/$workspaceId/projects.tsx
// URL: /workspace-123/projects (custom URL generation)
```

## 3. Route Guards and Redirects

### redirect() Function Usage

#### Basic Redirects

```typescript
// Simple redirect
export const Route = createFileRoute("/old-path")({
  beforeLoad: () => {
    throw redirect({ to: "/new-path" });
  },
});

// Conditional redirect with preserved search params
export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context, search }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: "/dashboard",
          ...search, // Preserve existing search params
        },
      });
    }
  },
});

// Redirect with parameters
export const Route = createFileRoute("/users/$userId")({
  beforeLoad: ({ context, params }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: `/users/${params.userId}`,
        },
      });
    }

    // Redirect to profile if accessing own user
    if (params.userId === context.auth.user.id) {
      throw redirect({
        to: "/profile",
        replace: true, // Don't add to history
      });
    }
  },
});
```

#### Complex Conditional Navigation

```typescript
export const Route = createFileRoute("/_authenticated/onboarding")({
  beforeLoad: ({ context }) => {
    const { user } = context;

    // Multi-step onboarding flow
    if (user.onboardingStep === "completed") {
      throw redirect({ to: "/dashboard" });
    }

    if (user.onboardingStep === "profile") {
      throw redirect({ to: "/onboarding/profile" });
    }

    if (user.onboardingStep === "preferences") {
      throw redirect({ to: "/onboarding/preferences" });
    }

    // Default to first step
    throw redirect({ to: "/onboarding/welcome" });
  },
});

// Subscription-based redirects
export const Route = createFileRoute("/_authenticated/_premium/$feature")({
  beforeLoad: ({ context, params }) => {
    const { user } = context;

    if (!user.subscription.isPremium) {
      throw redirect({
        to: "/subscription/upgrade",
        search: {
          feature: params.feature,
          reason: "premium_required",
        },
      });
    }

    if (user.subscription.isExpired) {
      throw redirect({
        to: "/subscription/renew",
        search: {
          feature: params.feature,
        },
      });
    }
  },
});
```

### Error Handling in Guards

#### Graceful Error Handling

```typescript
export const Route = createFileRoute('/_authenticated/projects/$projectId')({
  beforeLoad: async ({ context, params }) => {
    try {
      const project = await window.api.projects.get(params.projectId)

      if (!project.success) {
        if (project.error === 'NOT_FOUND') {
          throw notFound()
        }

        if (project.error === 'ACCESS_DENIED') {
          throw redirect({
            to: '/projects',
            search: {
              error: 'access_denied',
            },
          })
        }

        throw new Error(project.error)
      }

      return {
        project: project.data,
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          throw redirect({
            to: '/offline',
            search: {
              returnTo: `/projects/${params.projectId}`,
            },
          })
        }
      }

      // Re-throw other errors to be handled by error boundaries
      throw error
    }
  },

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

#### Error Recovery Patterns

```typescript
// Custom error types for better handling
class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

class AuthorizationError extends Error {
  constructor(
    message: string,
    public requiredPermission: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export const Route = createFileRoute("/_authenticated/admin/users")({
  beforeLoad: async ({ context }) => {
    try {
      // Check authentication
      if (!context.auth.isAuthenticated) {
        throw new AuthenticationError("Not authenticated", "UNAUTHENTICATED");
      }

      // Check authorization
      if (!context.auth.user.permissions.includes("admin:users")) {
        throw new AuthorizationError("Insufficient permissions", "admin:users");
      }

      return context;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw redirect({ to: "/auth/login" });
      }

      if (error instanceof AuthorizationError) {
        throw redirect({
          to: "/dashboard",
          search: {
            error: "insufficient_permissions",
            required: error.requiredPermission,
          },
        });
      }

      throw error;
    }
  },
});
```

### notFound() and Error Boundaries

#### Custom 404 Pages

```typescript
// Route-specific not found
export const Route = createFileRoute('/projects/$projectId')({
  beforeLoad: async ({ params }) => {
    const project = await fetchProject(params.projectId)

    if (!project) {
      throw notFound()
    }

    return { project }
  },

  notFoundComponent: () => (
    <div className="not-found">
      <h1>Project Not Found</h1>
      <p>The project you're looking for doesn't exist or has been deleted.</p>
      <Link to="/projects">← Back to Projects</Link>
    </div>
  ),
})

// Global not found handler
export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="global-not-found">
      <h1>Page Not Found</h1>
      <p>Sorry, we couldn't find the page you're looking for.</p>
      <Link to="/">Go Home</Link>
    </div>
  ),
})
```

#### Error Boundary Integration

```typescript
// Error boundary component
class RouteErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route error:', error, errorInfo)
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback
      return <Fallback error={this.state.error} />
    }

    return this.props.children
  }
}

// Route with error boundary
export const Route = createFileRoute('/_authenticated/critical-feature')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user.permissions.includes('critical:access')) {
      throw new Error('Access denied to critical feature')
    }
  },

  component: () => (
    <RouteErrorBoundary fallback={CriticalFeatureError}>
      <CriticalFeature />
    </RouteErrorBoundary>
  ),

  errorComponent: ({ error, reset }) => (
    <CriticalFeatureError
      error={error}
      onReset={reset}
    />
  ),
})
```

## 4. Authentication Hooks and Utilities

### Best Practices for Auth Hooks

#### Centralized Auth Hook

```typescript
interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

function useAuth(): UseAuthReturn {
  const { auth } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const result = await window.api.auth.login(credentials);

        if (!result.success) {
          throw new Error(result.error);
        }

        // Auth state will be updated by the provider
        // Navigate to intended destination
        const redirectTo = new URLSearchParams(window.location.search).get(
          "redirect",
        );

        await navigate({
          to: redirectTo || "/dashboard",
          replace: true,
        });
      } catch (error) {
        throw error; // Re-throw for component error handling
      }
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    try {
      await window.api.auth.logout();

      await navigate({
        to: "/auth/login",
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
      // Force navigation even if logout fails
      await navigate({
        to: "/auth/login",
        replace: true,
      });
    }
  }, [navigate]);

  const hasPermission = useCallback(
    (permission: string) => {
      return auth.user?.permissions.includes(permission) ?? false;
    },
    [auth.user?.permissions],
  );

  const hasRole = useCallback(
    (role: string) => {
      return auth.user?.role === role;
    },
    [auth.user?.role],
  );

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    permissions: auth.user?.permissions ?? [],
    login,
    logout,
    hasPermission,
    hasRole,
  };
}
```

### Integration with Auth Libraries

#### Auth0 Integration Pattern

```typescript
// Auth0 + TanStack Router integration
function useAuth0Integration() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } =
    useAuth0();
  const navigate = useNavigate();

  // Convert Auth0 user to app user format
  const appUser = useMemo(() => {
    if (!user) return null;

    return {
      id: user.sub,
      name: user.name,
      email: user.email,
      role: user["https://app.com/role"] as string,
      permissions: user["https://app.com/permissions"] as string[],
    };
  }, [user]);

  const handleLogin = useCallback(async () => {
    const redirect = window.location.pathname + window.location.search;

    await loginWithRedirect({
      appState: {
        returnTo: redirect,
      },
    });
  }, [loginWithRedirect]);

  const handleLogout = useCallback(async () => {
    await logout({
      returnTo: window.location.origin + "/auth/login",
    });
  }, [logout]);

  return {
    user: appUser,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  };
}
```

#### Firebase Auth Integration

```typescript
function useFirebaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get custom claims for permissions
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const claims = idTokenResult.claims;

          const appUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            role: claims.role as string,
            permissions: claims.permissions as string[],
          };

          setAuthState({
            user: appUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error processing Firebase user:", error);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return unsubscribe;
  }, []);

  return authState;
}
```

### Token Management

#### Token Refresh Automation

```typescript
function useTokenManagement() {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!token || !refreshToken) return;

    const refreshTokens = async () => {
      try {
        const result = await window.api.auth.refreshTokens(refreshToken);

        if (result.success) {
          setToken(result.data.accessToken);
          setRefreshToken(result.data.refreshToken);
        } else {
          // Refresh failed, logout user
          setToken(null);
          setRefreshToken(null);
          navigate({ to: "/auth/login" });
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        setToken(null);
        setRefreshToken(null);
        navigate({ to: "/auth/login" });
      }
    };

    // Calculate refresh timing (refresh 5 minutes before expiry)
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    const expiryTime = tokenPayload.exp * 1000;
    const refreshTime = expiryTime - Date.now() - 5 * 60 * 1000;

    if (refreshTime > 0) {
      const timeout = setTimeout(refreshTokens, refreshTime);
      return () => clearTimeout(timeout);
    } else {
      // Token already expired, refresh immediately
      refreshTokens();
    }
  }, [token, refreshToken, navigate]);

  return { token, setToken, setRefreshToken };
}
```

#### Secure Token Storage (Desktop Apps)

```typescript
// Desktop-specific token management
class SecureTokenStorage {
  private static readonly TOKEN_KEY = "app_access_token";
  private static readonly REFRESH_KEY = "app_refresh_token";

  static async storeTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      // Use Electron's secure storage
      await window.api.storage.setSecure(this.TOKEN_KEY, accessToken);
      await window.api.storage.setSecure(this.REFRESH_KEY, refreshToken);
    } catch (error) {
      console.error("Failed to store tokens:", error);
      throw error;
    }
  }

  static async getAccessToken(): Promise<string | null> {
    try {
      const result = await window.api.storage.getSecure(this.TOKEN_KEY);
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Failed to retrieve access token:", error);
      return null;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      const result = await window.api.storage.getSecure(this.REFRESH_KEY);
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Failed to retrieve refresh token:", error);
      return null;
    }
  }

  static async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        window.api.storage.removeSecure(this.TOKEN_KEY),
        window.api.storage.removeSecure(this.REFRESH_KEY),
      ]);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}
```

### Automatic Logout on Token Expiry

#### Token Expiry Detection

```typescript
function useTokenExpiryMonitoring() {
  const logout = useLogout();

  useEffect(() => {
    const checkTokenExpiry = async () => {
      const token = await SecureTokenStorage.getAccessToken();

      if (token && SecureTokenStorage.isTokenExpired(token)) {
        // Try to refresh token first
        const refreshToken = await SecureTokenStorage.getRefreshToken();

        if (refreshToken && !SecureTokenStorage.isTokenExpired(refreshToken)) {
          try {
            const result = await window.api.auth.refreshTokens(refreshToken);

            if (result.success) {
              await SecureTokenStorage.storeTokens(
                result.data.accessToken,
                result.data.refreshToken,
              );
              return;
            }
          } catch (error) {
            console.error("Token refresh failed:", error);
          }
        }

        // Refresh failed or refresh token expired, logout user
        await logout("expired");
      }
    };

    // Check token expiry every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    // Check immediately
    checkTokenExpiry();

    return () => clearInterval(interval);
  }, [logout]);
}
```

This comprehensive guide provides practical, production-ready patterns for implementing authentication and masked routes with TanStack Router, specifically tailored for desktop Electron applications with database-based session management.
