# Project Wiz: Sistema de Roteamento

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17

---

## 🎯 Visão Geral do Roteamento

O Project Wiz utiliza **TanStack Router** para um sistema de roteamento **type-safe, file-based e performático**. O roteamento é projetado para:

1. **Type Safety** - Rotas tipadas automaticamente
2. **File-based** - Convenção baseada em arquivos
3. **Nested Layouts** - Layouts aninhados eficientes
4. **Data Loading** - Carregamento de dados integrado
5. **Code Splitting** - Lazy loading automático
6. **Search Params** - Parâmetros de busca tipados

---

## 🗂️ Estrutura de Rotas

### Organização de Arquivos

```
src/renderer/app/
├── __root.tsx                    # Layout raiz da aplicação
├── index.tsx                     # Página inicial (dashboard)
├── login.tsx                     # Página de login
├── (user)/                       # User area routes
│   ├── route.tsx                # User area layout
│   ├── index.tsx                # Personal dashboard
│   ├── conversation/             # DM routes
│   │   └── $conversationId.tsx  # DM chat content
│   ├── new-conversation.tsx     # Create new DM
│   └── settings/                # Personal settings
│       ├── route.tsx            # Settings layout
│       ├── index.tsx            # General settings
│       ├── new-llm-provider.tsx # Add LLM provider
│       └── edit-llm-provider.$llmProviderId.tsx
├── agents/                      # Agents management routes
│   ├── index.tsx                # Agent list/dashboard
│   ├── create.tsx               # Create agent
│   ├── route.tsx                # Agent layout
│   └── [agent-id]/              # Specific agent
│       ├── index.tsx            # Agent overview
│       ├── settings.tsx         # Agent settings
│       └── jobs.tsx             # Agent jobs
├── create-project.tsx           # Create project
├── create-channel.tsx           # Create channel
└── project/                     # Project area routes
    ├── index.tsx                # Project list
    ├── create.tsx               # Create project
    ├── route.tsx                # Project layout (Discord-like)
    └── [project-id]/            # Specific project
        ├── index.tsx            # Project overview
        ├── chat/                # Channel routes
        │   ├── route.tsx        # Channel layout
        │   ├── index.tsx        # Channel list
        │   └── [channel-id]/
        │       └── index.tsx    # Channel chat
        ├── docs/                # Documentation routes
        │   └── index.tsx        # Documentation view
        ├── files/               # File explorer routes
        │   └── index.tsx        # File explorer
        ├── agents/              # Project agents
        │   └── index.tsx        # Agent list
        ├── tasks/               # Task management
        │   └── index.tsx        # Task kanban
        └── agent/               # Specific agent in project
            └── $agentId.tsx     # Agent detail view
```

---

## 🔧 Configuração do Router

### Router Setup

```typescript
// src/renderer/router.tsx
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { useAuth } from './hooks/use-auth';

// Create router instance
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // Será definido no provider
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Router provider component
export function AppRouter() {
  const auth = useAuth();

  return (
    <RouterProvider
      router={router}
      context={{ auth }}
    />
  );
}
```

### Root Layout

```typescript
// src/renderer/app/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DiscordLayout } from '../components/layout/discord-layout';
import { Toaster } from '../components/ui/sonner';
import { AuthGuard } from '../components/auth/auth-guard';
import type { AuthState } from '../hooks/use-auth';

interface RouterContext {
  auth: AuthState;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Não retry em erros de autenticação
        if (error.code === 'AUTHENTICATION_ERROR') {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <DiscordLayout>
          <Outlet />
        </DiscordLayout>
      </AuthGuard>

      <Toaster />

      {/* Development tools */}
      {import.meta.env.DEV && (
        <TanStackRouterDevtools />
      )}
    </QueryClientProvider>
  );
}
```

---

## 🏠 Rotas Principais

### Dashboard (Home)

```typescript
// src/renderer/app/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { useProjects } from '../hooks/use-projects';
import { ProjectCard } from '../components/project/project-card';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: DashboardPage,
  loader: async ({ context }) => {
    // Preload user projects
    const projects = await window.api.projects.findByUser(context.auth.user!.id);
    return { projects };
  },
});

function DashboardPage() {
  const { projects: initialProjects } = Route.useLoaderData();
  const { projects, createProject } = useProjects(initialProjects);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-discord-text-primary">
          Your Projects
        </h1>
        <Button onClick={() => createProject()}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

### Login Page

```typescript
// src/renderer/app/login.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '../components/auth/login-form';
import { AccountSwitcher } from '../components/auth/account-switcher';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: async ({ context }) => {
    // Redirect se já estiver logado
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/',
      });
    }
  },
});

function LoginPage() {
  const { needsAccountSelection } = useAuth();

  return (
    <div className="min-h-screen bg-discord-bg-primary flex items-center justify-center">
      <div className="w-full max-w-md">
        {needsAccountSelection ? (
          <AccountSwitcher />
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
}
```

---

## 📁 Rotas de Projeto

### Project Layout

```typescript
// src/renderer/app/project/[project-id]/layout.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useProject } from '../../../hooks/use-projects';
import { ProjectNotFound } from '../../../components/project/project-not-found';

export const Route = createFileRoute('/project/$projectId')({
  component: ProjectLayoutComponent,
  loader: async ({ params }) => {
    const project = await window.api.projects.findById(params.projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    return { project };
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Project not found') {
      return <ProjectNotFound />;
    }
    throw error;
  },
});

function ProjectLayoutComponent() {
  const { project } = Route.useLoaderData();
  const { selectProject } = useProject();

  // Selecionar projeto automaticamente
  useEffect(() => {
    selectProject(project);
  }, [project, selectProject]);

  return <Outlet />;
}
```

### Chat Channel Route

```typescript
// src/renderer/app/project/[project-id]/chat/[channel-id].tsx
import { createFileRoute } from '@tanstack/react-router';
import { ChatArea } from '../../../../components/chat/chat-area';
import { useMessages } from '../../../../hooks/use-messages';

interface ChannelParams {
  projectId: string;
  channelId: string;
}

export const Route = createFileRoute('/project/$projectId/chat/$channelId')({
  component: ChannelChatPage,
  loader: async ({ params }: { params: ChannelParams }) => {
    // Preload channel data and recent messages
    const [channel, messages] = await Promise.all([
      window.api.channels.findById(params.channelId),
      window.api.messages.listByChannel(params.channelId, { limit: 50 }),
    ]);

    if (!channel) {
      throw new Error('Channel not found');
    }

    return { channel, messages };
  },
});

function ChannelChatPage() {
  const { channel, messages: initialMessages } = Route.useLoaderData();
  const { channelId } = Route.useParams();

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="px-4 py-3 border-b border-discord-bg-tertiary">
        <div className="flex items-center space-x-2">
          <Hash className="w-5 h-5 text-discord-text-muted" />
          <h1 className="font-semibold text-discord-text-primary">
            {channel.name}
          </h1>
          {channel.description && (
            <>
              <div className="w-px h-4 bg-discord-text-muted" />
              <span className="text-sm text-discord-text-muted">
                {channel.description}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <ChatArea
        channelId={channelId}
        initialMessages={initialMessages}
      />
    </div>
  );
}
```

### Forum Topic Route

```typescript
// src/renderer/app/project/[project-id]/forum/[topic-id].tsx
import { createFileRoute } from '@tanstack/react-router';
import { TopicHeader } from '../../../../components/forum/topic-header';
import { TopicThread } from '../../../../components/forum/topic-thread';
import { PostComposer } from '../../../../components/forum/post-composer';

export const Route = createFileRoute('/project/$projectId/forum/$topicId')({
  component: ForumTopicPage,
  loader: async ({ params }) => {
    const [topic, posts] = await Promise.all([
      window.api.forum.findTopicById(params.topicId),
      window.api.forum.listPosts(params.topicId),
    ]);

    if (!topic) {
      throw new Error('Topic not found');
    }

    return { topic, posts };
  },
});

function ForumTopicPage() {
  const { topic, posts } = Route.useLoaderData();
  const { topicId } = Route.useParams();

  return (
    <div className="flex-1 flex flex-col">
      <TopicHeader topic={topic} />
      <TopicThread posts={posts} className="flex-1" />
      <PostComposer topicId={topicId} />
    </div>
  );
}
```

---

## 💬 Direct Messages Routes

### DM Conversation Route

```typescript
// src/renderer/app/direct-messages/[agent-id].tsx
import { createFileRoute } from '@tanstack/react-router';
import { DirectMessageChat } from '../../components/chat/direct-message-chat';

export const Route = createFileRoute('/direct-messages/$agentId')({
  component: DirectMessagePage,
  loader: async ({ params, context }) => {
    // Get or create DM conversation
    const conversationId = await window.api.messages.getOrCreateDMConversation(
      context.auth.user!.id,
      params.agentId
    );

    const [agent, messages] = await Promise.all([
      window.api.agents.findById(params.agentId),
      window.api.messages.listByDM(conversationId, { limit: 50 }),
    ]);

    if (!agent) {
      throw new Error('Agent not found');
    }

    return { agent, conversationId, messages };
  },
});

function DirectMessagePage() {
  const { agent, conversationId, messages } = Route.useLoaderData();

  return (
    <DirectMessageChat
      agent={agent}
      conversationId={conversationId}
      initialMessages={messages}
    />
  );
}
```

---

## ⚙️ Settings Routes

### Settings Index

```typescript
// src/renderer/app/settings/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { SettingsLayout } from '../../components/settings/settings-layout';
import { GeneralSettings } from '../../components/settings/general-settings';

export const Route = createFileRoute('/settings/')({
  component: GeneralSettingsPage,
});

function GeneralSettingsPage() {
  return (
    <SettingsLayout>
      <GeneralSettings />
    </SettingsLayout>
  );
}
```

---

## 🔐 Route Guards e Context

### Auth Guard Component

```typescript
// src/renderer/components/auth/auth-guard.tsx
import { useAuth } from '../../hooks/use-auth';
import { LoginPage } from '../../app/login';
import { LoadingSpinner } from '../ui/loading-spinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isFirstRun } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-discord-bg-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isFirstRun) {
    return <FirstRunSetup />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
```

### Route Context Hook

```typescript
// src/renderer/hooks/use-route-context.ts
import { useRouterState } from "@tanstack/react-router";

export function useRouteContext() {
  const routerState = useRouterState();
  const { projectId, channelId, agentId } = routerState.location.params;

  return {
    currentProject: projectId,
    currentChannel: channelId,
    currentAgent: agentId,
    isInProject: !!projectId,
    isInChat: !!channelId,
    isInDM: !!agentId,
  };
}
```

---

## 🚀 Performance e Otimizações

### Code Splitting Automático

```typescript
// Lazy loading automático por arquivo
const LazyComponent = lazy(() => import("./heavy-component"));

// Preload de rotas importantes
export const Route = createFileRoute("/important-route")({
  component: ImportantComponent,
  preload: true, // Preload automaticamente
});
```

### Search Params Tipados

```typescript
// Definir tipos para search params
interface ProjectSearchParams {
  tab?: "overview" | "files" | "settings";
  filter?: string;
}

export const Route = createFileRoute("/project/$projectId/")({
  component: ProjectPage,
  validateSearch: (search): ProjectSearchParams => ({
    tab: search.tab || "overview",
    filter: search.filter,
  }),
});

function ProjectPage() {
  const { tab, filter } = Route.useSearch();
  // tab e filter são tipados automaticamente
}
```

### Error Boundaries

```typescript
// Error boundary personalizada por rota
export const Route = createFileRoute('/project/$projectId/chat/$channelId')({
  component: ChannelPage,
  errorComponent: ({ error, reset }) => (
    <ChatErrorBoundary error={error} onRetry={reset} />
  ),
});
```

---

## 🎯 Benefícios do Sistema

### ✅ Type Safety

- **Parâmetros tipados** automaticamente
- **Search params** validados
- **Compile-time errors** para rotas inválidas
- **Intellisense completo** para navegação

### ✅ Performance

- **Code splitting** automático
- **Preloading** inteligente
- **Caching** de dados de rota
- **Lazy loading** de componentes

### ✅ Developer Experience

- **File-based routing** intuitivo
- **Hot reloading** preserva estado
- **DevTools** integradas
- **Error handling** robusto

### ✅ User Experience

- **Navigation** fluida
- **Loading states** automáticos
- **Error recovery** transparente
- **Deep linking** funcional

---

## 📈 Próximos Documentos

1. **AGENT-WORKERS.md** - Sistema de agentes background
2. **CODING-STANDARDS.md** - Padrões e convenções de código
3. **TESTING-STRATEGY.md** - Estratégia de testes

---

_Este sistema de roteamento foi projetado para ser type-safe, performático e developer-friendly, oferecendo uma navegação fluida e intuitiva._
