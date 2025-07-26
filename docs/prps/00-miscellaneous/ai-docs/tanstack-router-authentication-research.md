# TanStack Router Authentication & Masked Routes - Comprehensive Research

⚠️ **PARTIALLY DEPRECATED - SOME PATTERNS NOT USED IN PROJECT WIZ**

**❌ IMPORTANT: Project Wiz does NOT use `useRouteContext` or router contexts. We use beforeLoad/loader for authentication checks only.**

This document provides comprehensive research on TanStack Router authentication patterns and masked routes based on the latest 2024/2025 documentation and community best practices.

## Table of Contents

1. [Authentication Patterns](#authentication-patterns)
2. [Masked Routes (Virtual/Layout Routes)](#masked-routes-virtuallayout-routes)
3. [Route Guards and Redirects](#route-guards-and-redirects)
4. [Authentication Hooks and Utilities](#authentication-hooks-and-utilities)
5. [Complete Implementation Examples](#complete-implementation-examples)
6. [Best Practices and Recommendations](#best-practices-and-recommendations)

## Authentication Patterns

### 1. Protected Routes Implementation

TanStack Router uses the `beforeLoad` function to implement route protection. This function runs before a route loads and is ideal for authentication checks.

#### Basic Protected Route Pattern

```typescript
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href, // Preserve intended destination
        },
      });
    }
  },
  component: DashboardComponent,
});
```

#### Layout-Based Route Protection

Create a parent route to protect multiple routes at once:

```typescript
// _authenticated.tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => <Outlet />, // Renders child routes
})
```

All routes in the `_authenticated` folder will inherit this protection:

```
routes/
├── __root.tsx
├── _authenticated.tsx          # Layout route with auth guard
├── _authenticated/
│   ├── dashboard.tsx           # Protected: /dashboard
│   ├── profile.tsx             # Protected: /profile
│   └── settings.tsx            # Protected: /settings
└── login.tsx                   # Public: /login
```

### 2. Authentication Guards with beforeLoad

The `beforeLoad` function is a powerful middleware that runs before route loading:

```typescript
export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context, location }) => {
    const { auth } = context;

    // Check authentication
    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    // Check authorization/permissions
    if (!auth.user?.roles.includes("admin")) {
      throw redirect({
        to: "/unauthorized",
      });
    }

    // Optional: Refresh token if needed
    await auth.validateSession();
  },
  component: AdminComponent,
});
```

### 3. Role-Based Access Control (RBAC)

Implement granular permission checks for different user roles:

```typescript
// Define role hierarchy
type UserRole = "user" | "admin" | "superadmin";

interface AuthUser {
  id: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
}

// Permission check utility
function hasPermission(user: AuthUser, requiredPermissions: string[]): boolean {
  return requiredPermissions.some((permission) =>
    user.permissions.includes(permission),
  );
}

// Role-based route protection
export const Route = createFileRoute("/admin/users")({
  beforeLoad: ({ context }) => {
    const { auth } = context;

    if (!auth.isAuthenticated) {
      throw redirect({ to: "/login" });
    }

    if (!hasPermission(auth.user, ["user.manage", "admin.access"])) {
      throw redirect({ to: "/access-denied" });
    }
  },
  component: UserManagementComponent,
});
```

### 4. Session Management and Validation

For desktop Electron apps (like this project), use database-based sessions:

```typescript
// Session validation in beforeLoad
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const { auth } = context;

    try {
      // Validate session token with main process
      const isValid = await window.api.auth.validateSession(auth.sessionToken);

      if (!isValid) {
        // Clear invalid session and redirect
        await auth.logout();
        throw redirect({ to: "/login" });
      }
    } catch (error) {
      // Handle network/API errors
      throw redirect({
        to: "/login",
        search: { error: "session-expired" },
      });
    }
  },
});
```

### 5. Login/Logout Flows with Redirects

#### Login Flow

```typescript
// Login route
export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect: search.redirect as string | undefined,
  }),
  component: LoginComponent,
});

function LoginComponent() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { auth } = useRouteContext({ from: "__root__" });

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await auth.login(credentials);

      // Redirect to intended destination or default
      navigate({
        to: redirect || "/dashboard",
        replace: true,
      });
    } catch (error) {
      // Handle login error
    }
  };

  // Rest of component...
}
```

#### Logout Flow

```typescript
function useLogout() {
  const navigate = useNavigate();
  const { auth } = useRouteContext({ from: "__root__" });

  return useCallback(async () => {
    try {
      await auth.logout();
      navigate({ to: "/login", replace: true });
    } catch (error) {
      // Handle logout error
    }
  }, [auth, navigate]);
}
```

### 6. Auth State Management in Router Context

Set up typed router context for authentication:

```typescript
// Define router context type
interface MyRouterContext {
  auth: {
    isAuthenticated: boolean
    user: AuthUser | null
    sessionToken: string | null
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => Promise<void>
    validateSession: () => Promise<boolean>
  }
}

// Create root route with context
export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

// App setup with auth provider
function InnerApp() {
  const auth = useAuth() // Your auth hook
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}
```

## Masked Routes (Virtual/Layout Routes)

### 1. Understanding Route Masking

Route masking allows you to display different URLs than what's actually being navigated to. This is useful for modals, overlays, or maintaining clean URLs.

```typescript
// Navigate to modal but mask URL
navigate({
  to: "/posts/$postId/modal",
  params: { postId: "123" },
  mask: {
    to: "/posts/$postId",
    params: { postId: "123" },
  },
});
```

### 2. Pathless Layout Routes

Pathless routes use underscore prefix and don't add to the URL path:

```typescript
// _layout.tsx - Pathless layout route
export const Route = createFileRoute('/_layout')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <div className="layout">
      <header>Header</header>
      <main>
        <Outlet /> {/* Renders child routes */}
      </main>
      <footer>Footer</footer>
    </div>
  )
}
```

Directory structure:

```
routes/
├── _layout.tsx                 # Pathless layout
├── _layout/
│   ├── home.tsx               # URL: /home
│   ├── about.tsx              # URL: /about
│   └── contact.tsx            # URL: /contact
```

### 3. Route Grouping and Layout Organization

#### Authentication-Based Grouping

```
routes/
├── __root.tsx
├── _auth/                     # Auth layout group
│   ├── route.tsx             # Auth layout component
│   ├── login.tsx             # /login
│   └── register.tsx          # /register
├── _authenticated/           # Protected layout group
│   ├── route.tsx            # Protected layout + guard
│   ├── dashboard.tsx        # /dashboard
│   └── profile.tsx          # /profile
└── index.tsx                # /
```

#### Feature-Based Grouping

```
routes/
├── _admin/
│   ├── route.tsx           # Admin layout + RBAC guard
│   ├── users.tsx          # /admin/users
│   └── settings.tsx       # /admin/settings
├── _user/
│   ├── route.tsx          # User layout
│   ├── profile.tsx        # /user/profile
│   └── preferences.tsx    # /user/preferences
```

### 4. File-Based Routing with Underscore Prefixes

#### Underscore Prefix Rules

- `_` prefix = Pathless layout route
- `_folder` = Route group/layout
- `-` prefix = Excluded from routing
- `()` folders = Grouping without affecting URL

#### Advanced File Structure

```
routes/
├── __root.tsx
├── _auth.tsx                  # Auth layout (pathless)
├── _auth/
│   ├── login.tsx             # /login
│   └── register.tsx          # /register
├── _authenticated.tsx         # Protected layout (pathless)
├── _authenticated/
│   ├── index.tsx             # /
│   ├── dashboard.tsx         # /dashboard
│   ├── _admin.tsx           # Admin sublayout (pathless)
│   ├── _admin/
│   │   ├── users.tsx        # /admin/users
│   │   └── settings.tsx     # /admin/settings
│   └── profile.tsx          # /profile
├── (marketing)/             # Grouping folder (no URL impact)
│   ├── about.tsx           # /about
│   └── pricing.tsx         # /pricing
└── -components/            # Excluded from routing
    └── shared-component.tsx
```

### 5. Route Hierarchy and Nesting Patterns

#### Nested Route Example

```typescript
// _authenticated/dashboard.tsx
export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardComponent,
});

// _authenticated/dashboard/analytics.tsx
export const Route = createFileRoute("/_authenticated/dashboard/analytics")({
  component: AnalyticsComponent,
});
```

URL structure:

- `/dashboard` → Dashboard component
- `/dashboard/analytics` → Dashboard layout + Analytics component

#### Non-Nested Routes

Use underscore suffix to break nesting:

```typescript
// _authenticated/modal_.tsx - Un-nested modal
export const Route = createFileRoute("/_authenticated/modal_")({
  component: ModalComponent,
});
```

## Route Guards and Redirects

### 1. redirect() Function Usage

The `redirect` function creates redirect responses:

```typescript
import { redirect } from "@tanstack/react-router";

// Basic redirect
throw redirect({ to: "/login" });

// Redirect with search params
throw redirect({
  to: "/login",
  search: {
    redirect: location.href,
    error: "session-expired",
  },
});

// Redirect with replace (don't add to history)
throw redirect({
  to: "/dashboard",
  replace: true,
});
```

### 2. Conditional Navigation

#### Complex Authentication Checks

```typescript
export const Route = createFileRoute("/sensitive-data")({
  beforeLoad: async ({ context, location }) => {
    const { auth } = context;

    // Multi-step authentication check
    if (!auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    // Check for 2FA requirement
    if (auth.user.requires2FA && !auth.user.is2FAVerified) {
      throw redirect({
        to: "/verify-2fa",
        search: { redirect: location.href },
      });
    }

    // Check subscription status
    if (!auth.user.hasActiveSubscription) {
      throw redirect({
        to: "/subscribe",
        search: { feature: "sensitive-data" },
      });
    }
  },
});
```

#### Time-Based Access Control

```typescript
export const Route = createFileRoute("/admin/maintenance")({
  beforeLoad: ({ context }) => {
    const { auth } = context;
    const now = new Date();
    const maintenanceWindow = {
      start: new Date("2024-01-01T02:00:00Z"),
      end: new Date("2024-01-01T04:00:00Z"),
    };

    // Only allow access during maintenance window
    if (now < maintenanceWindow.start || now > maintenanceWindow.end) {
      throw redirect({
        to: "/admin",
        search: { error: "maintenance-window-closed" },
      });
    }
  },
});
```

### 3. Preserving Intended Destination

Always capture the intended destination for post-login redirect:

```typescript
// Route guard
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          // Preserve full URL including search params and hash
          redirect: location.href,
        },
      });
    }
  },
});

// Login component
function LoginComponent() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();

  const handleSuccessfulLogin = () => {
    if (redirect) {
      // Navigate to original destination
      window.location.href = redirect;
    } else {
      navigate({ to: "/dashboard" });
    }
  };
}
```

### 4. Error Handling in Guards

#### Comprehensive Error Handling

```typescript
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context, location }) => {
    try {
      const { auth } = context;

      // Validate session
      const sessionValid = await auth.validateSession();
      if (!sessionValid) {
        throw new Error("SESSION_INVALID");
      }

      // Check permissions
      const hasAdminAccess = await auth.checkPermission("admin.access");
      if (!hasAdminAccess) {
        throw new Error("INSUFFICIENT_PERMISSIONS");
      }
    } catch (error) {
      // Handle different error types
      if (error.message === "SESSION_INVALID") {
        throw redirect({
          to: "/login",
          search: {
            redirect: location.href,
            error: "session-expired",
          },
        });
      }

      if (error.message === "INSUFFICIENT_PERMISSIONS") {
        throw redirect({
          to: "/access-denied",
          search: {
            returnTo: location.href,
          },
        });
      }

      // Network or other errors
      throw redirect({
        to: "/error",
        search: {
          type: "authentication-error",
          returnTo: location.href,
        },
      });
    }
  },
});
```

### 5. notFound() and Error Boundaries

#### Custom Not Found Handling

```typescript
import { notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params: { postId } }) => {
    const post = await getPost(postId)

    if (!post) {
      throw notFound()
    }

    return { post }
  },
  notFoundComponent: () => (
    <div className="not-found">
      <h1>Post Not Found</h1>
      <p>The requested post could not be found.</p>
      <Link to="/posts">← Back to Posts</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="error">
      <h1>Error Loading Post</h1>
      <p>{error.message}</p>
    </div>
  ),
})
```

## Authentication Hooks and Utilities

### 1. Best Practices for Auth Hooks

#### Comprehensive Auth Hook

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    sessionToken: null,
    isLoading: true,
    error: null,
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await window.api.auth.login(credentials);

      if (response.success) {
        setState({
          isAuthenticated: true,
          user: response.data.user,
          sessionToken: response.data.sessionToken,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await window.api.auth.logout(state.sessionToken);
    } finally {
      setState({
        isAuthenticated: false,
        user: null,
        sessionToken: null,
        isLoading: false,
        error: null,
      });
    }
  }, [state.sessionToken]);

  const validateSession = useCallback(async () => {
    if (!state.sessionToken) return false;

    try {
      const response = await window.api.auth.validateSession(
        state.sessionToken,
      );

      if (!response.success) {
        await logout();
        return false;
      }

      return true;
    } catch (error) {
      await logout();
      return false;
    }
  }, [state.sessionToken, logout]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await window.api.auth.getCurrentSession();

        if (response.success && response.data) {
          setState({
            isAuthenticated: true,
            user: response.data.user,
            sessionToken: response.data.sessionToken,
            isLoading: false,
            error: null,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message,
        }));
      }
    };

    initAuth();
  }, []);

  return {
    ...state,
    login,
    logout,
    validateSession,
  };
}
```

### 2. Integration with Auth Libraries

#### Auth0 Integration

```typescript
import { useAuth0 } from "@auth0/auth0-react";

export function useAuth0Router() {
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const login = useCallback(async () => {
    await loginWithRedirect();
  }, [loginWithRedirect]);

  const logoutWithRedirect = useCallback(() => {
    logout({ returnTo: window.location.origin });
  }, [logout]);

  const validateSession = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      setSessionToken(token);
      return true;
    } catch {
      return false;
    }
  }, [getAccessTokenSilently]);

  return {
    isAuthenticated,
    user,
    sessionToken,
    login,
    logout: logoutWithRedirect,
    validateSession,
  };
}
```

#### Firebase Auth Integration

```typescript
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase-config";

export function useFirebaseAuth() {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({
        isAuthenticated: !!user,
        user,
        isLoading: false,
      });
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return { ...state, login, logout };
}
```

### 3. Token Management

#### Token Refresh Strategy

```typescript
export function useTokenManager() {
  const [tokens, setTokens] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: Date | null;
  }>({
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  });

  const isTokenExpired = useCallback(() => {
    if (!tokens.expiresAt) return true;
    return new Date() >= tokens.expiresAt;
  }, [tokens.expiresAt]);

  const refreshAccessToken = useCallback(async () => {
    if (!tokens.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await window.api.auth.refreshToken(tokens.refreshToken);

    if (response.success) {
      setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken || tokens.refreshToken,
        expiresAt: new Date(response.data.expiresAt),
      });

      return response.data.accessToken;
    } else {
      // Refresh failed, clear tokens
      setTokens({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      });
      throw new Error("Token refresh failed");
    }
  }, [tokens.refreshToken]);

  const getValidToken = useCallback(async () => {
    if (!isTokenExpired()) {
      return tokens.accessToken;
    }

    return await refreshAccessToken();
  }, [tokens.accessToken, isTokenExpired, refreshAccessToken]);

  return {
    tokens,
    setTokens,
    getValidToken,
    isTokenExpired,
    refreshAccessToken,
  };
}
```

### 4. Automatic Logout on Token Expiry

#### Auto-Logout Implementation

```typescript
export function useAutoLogout() {
  const { auth } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const checkSessionValidity = async () => {
      try {
        const isValid = await auth.validateSession();
        if (!isValid) {
          await auth.logout();
          navigate({ to: "/login", search: { error: "session-expired" } });
        }
      } catch (error) {
        await auth.logout();
        navigate({ to: "/login", search: { error: "session-error" } });
      }
    };

    // Check immediately
    checkSessionValidity();

    // Set up periodic checks
    const interval = setInterval(checkSessionValidity, 60000); // Every minute

    return () => clearInterval(interval);
  }, [auth, navigate]);
}
```

#### Inactivity-Based Logout

```typescript
export function useInactivityLogout(timeoutMinutes: number = 30) {
  const { auth } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(
      async () => {
        await auth.logout();
        navigate({
          to: "/login",
          search: { error: "session-timeout" },
        });
      },
      timeoutMinutes * 60 * 1000,
    );
  }, [auth, navigate, timeoutMinutes]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    // Activity events to monitor
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => resetTimeout();

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start timeout
    resetTimeout();

    return () => {
      // Cleanup
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [auth.isAuthenticated, resetTimeout]);
}
```

## Complete Implementation Examples

### 1. Complete Authentication Setup

#### Root Route with Context

```typescript
// __root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

interface MyRouterContext {
  auth: {
    isAuthenticated: boolean
    user: AuthUser | null
    sessionToken: string | null
    isLoading: boolean
    error: string | null
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => Promise<void>
    validateSession: () => Promise<boolean>
  }
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const { auth } = useRouteContext({ from: '__root__' })

  if (auth.isLoading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <>
      <div className="app">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  )
}
```

#### Auth Layout Routes

```typescript
// _auth.tsx - Public auth layout
export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    // Redirect authenticated users away from auth pages
    if (context.auth.isAuthenticated) {
      const redirectTo = location.search.redirect || '/dashboard'
      throw redirect({ to: redirectTo })
    }
  },
  component: AuthLayoutComponent,
})

function AuthLayoutComponent() {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome to App</h1>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

// _authenticated.tsx - Protected layout
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href }
      })
    }

    // Validate session on each protected route access
    const isValid = await context.auth.validateSession()
    if (!isValid) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
          error: 'session-expired'
        }
      })
    }
  },
  component: AuthenticatedLayoutComponent,
})

function AuthenticatedLayoutComponent() {
  const { auth } = useRouteContext({ from: '__root__' })

  return (
    <div className="authenticated-layout">
      <header className="app-header">
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
        </nav>
        <div className="user-menu">
          <span>Welcome, {auth.user?.name}</span>
          <button onClick={auth.logout}>Logout</button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
```

#### Route Files

```typescript
// _auth/login.tsx
export const Route = createFileRoute('/_auth/login')({
  validateSearch: (search) => ({
    redirect: search.redirect as string | undefined,
    error: search.error as string | undefined,
  }),
  component: LoginComponent,
})

function LoginComponent() {
  const { redirect, error } = Route.useSearch()
  const { auth } = useRouteContext({ from: '__root__' })
  const navigate = useNavigate()

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await auth.login(credentials)
      navigate({ to: redirect || '/dashboard', replace: true })
    } catch (error) {
      // Error handling
    }
  }

  return (
    <div className="login-form">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials(prev => ({
            ...prev,
            email: e.target.value
          }))}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({
            ...prev,
            password: e.target.value
          }))}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

// _authenticated/dashboard.tsx
export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardComponent,
})

function DashboardComponent() {
  const { auth } = useRouteContext({ from: '__root__' })

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome back, {auth.user?.name}!</p>
    </div>
  )
}
```

### 2. Router Setup

```typescript
// router.ts
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // Will be provided by AuthProvider
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
```

### 3. App Component

```typescript
// App.tsx
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { useAuth } from './hooks/useAuth'

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}

export default App
```

## Best Practices and Recommendations

### 1. Security Best Practices

- **Never store sensitive data in localStorage** - Use secure session management
- **Always validate sessions** on sensitive route access
- **Implement proper token refresh** strategies
- **Use HTTPS** for all authentication endpoints
- **Implement CSRF protection** for state-changing operations

### 2. Performance Considerations

- **Minimize beforeLoad complexity** - Keep authentication checks fast
- **Cache authentication state** appropriately
- **Avoid unnecessary re-validations** - Balance security with performance
- **Use React.memo** for authentication components that don't change often

### 3. User Experience

- **Always preserve intended destination** after login
- **Provide clear error messages** for authentication failures
- **Implement loading states** during authentication checks
- **Handle session expiry gracefully** with user notifications

### 4. Error Handling

- **Handle network failures** in authentication checks
- **Provide fallback routes** for authorization failures
- **Log authentication events** for security monitoring
- **Implement proper error boundaries** around auth components

### 5. Testing Strategies

- **Mock authentication state** in tests
- **Test both authenticated and unauthenticated flows**
- **Verify redirect behavior** works correctly
- **Test session expiry scenarios**

### 6. TypeScript Integration

- **Use strict typing** for authentication context
- **Define proper interfaces** for user and session data
- **Leverage TanStack Router's type safety** for route parameters
- **Create utility types** for common authentication patterns

This comprehensive guide provides everything needed to implement robust authentication and routing patterns with TanStack Router in modern React applications.
