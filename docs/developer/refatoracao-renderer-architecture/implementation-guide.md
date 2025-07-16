# Refatoração e Reorganização do Renderer - Guia de Implementação

## Visão Geral

Este guia fornece instruções detalhadas para implementar a refatoração completa do renderer, com exemplos práticos baseados na codebase atual e padrões arquiteturais aplicados.

## Estrutura da Nova Arquitetura

### Nova Organização de Pastas

```
src/renderer/
├── app/                     # 🆕 TanStack Router routes
│   ├── __root.tsx          # Root layout
│   ├── users/              # User domain routes
│   │   ├── _layout.tsx     # User layout with preload
│   │   ├── index.tsx       # User dashboard
│   │   ├── conversations/  # Conversation routes
│   │   └── settings/       # User settings
│   ├── projects/           # Project domain routes
│   │   ├── _layout.tsx     # Project layout with preload
│   │   ├── index.tsx       # Project list
│   │   ├── create.tsx      # Create project
│   │   └── $projectId/     # Project-specific routes
│   │       ├── _layout.tsx # Project detail layout
│   │       ├── dashboard.tsx # Project dashboard
│   │       ├── agents/     # Agent management
│   │       ├── channels/   # Channel management
│   │       ├── tasks.tsx   # Task management
│   │       └── docs.tsx    # Project documentation
│   └── agents/             # Agent domain routes (future)
├── domains/                # 🆕 Business domains
│   ├── users/              # User domain
│   │   ├── components/     # User-specific components
│   │   ├── hooks/          # User-specific hooks
│   │   ├── stores/         # User state management
│   │   └── services/       # User API services
│   ├── projects/           # Project domain
│   │   ├── components/     # Project-specific components
│   │   ├── hooks/          # Project-specific hooks
│   │   ├── stores/         # Project state management
│   │   └── services/       # Project API services
│   ├── agents/             # Agent domain
│   └── llm/                # LLM domain
├── shared/                 # 🆕 Shared code
│   ├── components/         # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Layout components
│   │   ├── forms/         # Form components
│   │   └── feedback/      # Loading, error, success
│   ├── hooks/             # Shared hooks
│   ├── services/          # Shared services
│   └── utils/             # Utility functions
├── providers/             # 🆕 Global providers
│   ├── query-provider.tsx # TanStack Query setup
│   ├── theme-provider.tsx # Theme management
│   └── error-provider.tsx # Error boundaries
└── main.tsx               # Entry point
```

## Padrões de Implementação

### 1. Padrão de Stores (Zustand Slim + TanStack Query)

#### Store Zustand para Estado Local (≤50 linhas)

```typescript
// domains/projects/stores/project.store.ts
import { create } from "zustand";
import { ProjectDto } from "@/shared/types";

interface ProjectState {
  selectedProject: ProjectDto | null;
  setSelectedProject: (project: ProjectDto | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
}));
```

#### Hooks TanStack Query para Backend (≤50 linhas por hook)

```typescript
// domains/projects/hooks/use-projects.hook.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/project.service";

export const useProjects = (filter?: ProjectFilterDto) => {
  return useQuery({
    queryKey: ["projects", filter],
    queryFn: () => projectService.list(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getById(projectId),
    enabled: !!projectId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
```

#### Serviços API Tipados (≤50 linhas por serviço)

```typescript
// domains/projects/services/project.service.ts
import { ProjectDto, CreateProjectDto, ProjectFilterDto } from "@/shared/types";

export const projectService = {
  async list(filter?: ProjectFilterDto): Promise<ProjectDto[]> {
    return window.electronIPC.projects.list(filter);
  },

  async getById(id: string): Promise<ProjectDto> {
    return window.electronIPC.projects.getById(id);
  },

  async create(data: CreateProjectDto): Promise<ProjectDto> {
    return window.electronIPC.projects.create(data);
  },

  async update(
    id: string,
    data: Partial<CreateProjectDto>,
  ): Promise<ProjectDto> {
    return window.electronIPC.projects.update(id, data);
  },

  async delete(id: string): Promise<void> {
    return window.electronIPC.projects.delete(id);
  },
};
```

### 2. Padrão de Componentes (Object Calisthenics)

#### Componente Container (≤50 linhas)

```typescript
// domains/projects/components/project-list.tsx
import { useProjects } from '../hooks/use-projects.hook';
import { ProjectCard } from './project-card';
import { ProjectListSkeleton } from './project-list-skeleton';
import { EmptyState } from '@/shared/components/feedback/empty-state';

interface ProjectListProps {
  filter?: ProjectFilterDto;
}

export function ProjectList({ filter }: ProjectListProps) {
  const { data: projects, isLoading, error } = useProjects(filter);

  if (isLoading) return <ProjectListSkeleton />;
  if (error) throw error;
  if (!projects?.length) return <EmptyState message="No projects found" />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

#### Componente Presentation (≤50 linhas)

```typescript
// domains/projects/components/project-card.tsx
import { ProjectDto } from '@/shared/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useNavigate } from '@tanstack/react-router';

interface ProjectCardProps {
  project: ProjectDto;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate({ to: '/projects/$projectId', params: { projectId: project.id } });
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {project.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {project.status}
          </span>
          <Button size="sm" onClick={handleOpen}>
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Hook Customizado Single-Purpose (≤50 linhas)

```typescript
// domains/projects/hooks/use-project-navigation.hook.ts
import { useNavigate } from "@tanstack/react-router";
import { ProjectDto } from "@/shared/types";

export const useProjectNavigation = () => {
  const navigate = useNavigate();

  const navigateToProject = (projectId: string) => {
    navigate({ to: "/projects/$projectId", params: { projectId } });
  };

  const navigateToProjectAgent = (projectId: string, agentId: string) => {
    navigate({
      to: "/projects/$projectId/agents/$agentId",
      params: { projectId, agentId },
    });
  };

  const navigateToProjectChannel = (projectId: string, channelId: string) => {
    navigate({
      to: "/projects/$projectId/channels/$channelId",
      params: { projectId, channelId },
    });
  };

  return {
    navigateToProject,
    navigateToProjectAgent,
    navigateToProjectChannel,
  };
};
```

### 3. Padrão de Migração Store por Store

#### Exemplo: Migração de channel-message.store.ts

**ANTES (343 linhas, violações Object Calisthenics):**

```typescript
// features/channel-messaging/stores/channel-message.store.ts
class ChannelMessageStore {
  private state: ChannelMessageStoreState = {
    messagesByChannel: Record<string, ChannelMessageDto[]>,
    isLoading: boolean,
    error: string | null,
    selectedMessage: ChannelMessageDto | null,
    isLoadingMore: boolean,
    hasMore: boolean,
    typingUsers: Record<string, string[]>,
  };

  // 38 linhas - violação Object Calisthenics
  loadMessagesByChannel = async (channelId: string, limit = 50, offset = 0) => {
    // Lógica complexa misturada
  };

  // 25 linhas - violação Object Calisthenics
  sendMessage = async (channelId: string, content: string) => {
    // Lógica complexa misturada
  };

  // Múltiplas responsabilidades
  // - Cache management
  // - Loading states
  // - Error handling
  // - Typing indicators
  // - Message selection
}
```

**DEPOIS (decomposição em arquivos especializados):**

```typescript
// domains/projects/stores/channel-message.store.ts (≤50 linhas)
import { create } from "zustand";
import { ChannelMessageDto } from "@/shared/types";

interface ChannelMessageState {
  selectedMessage: ChannelMessageDto | null;
  setSelectedMessage: (message: ChannelMessageDto | null) => void;
}

export const useChannelMessageStore = create<ChannelMessageState>((set) => ({
  selectedMessage: null,
  setSelectedMessage: (message) => set({ selectedMessage: message }),
}));

// domains/projects/stores/typing.store.ts (≤50 linhas)
interface TypingState {
  typingUsers: Record<string, string[]>;
  setTypingUsers: (channelId: string, users: string[]) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingUsers: {},
  setTypingUsers: (channelId, users) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [channelId]: users },
    })),
}));
```

```typescript
// domains/projects/hooks/use-channel-messages.hook.ts (≤50 linhas)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { channelMessageService } from "../services/channel-message.service";

export const useChannelMessages = (channelId: string) => {
  return useQuery({
    queryKey: ["channel-messages", channelId],
    queryFn: () => channelMessageService.list(channelId),
    enabled: !!channelId,
  });
};

export const useSendChannelMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: channelMessageService.create,
    onSuccess: (_, { channelId }) => {
      queryClient.invalidateQueries({
        queryKey: ["channel-messages", channelId],
      });
    },
  });
};
```

### 4. Padrão de Migração Componente por Componente

#### Exemplo: Migração de conversation-view.tsx

**ANTES (249 linhas, violações Object Calisthenics):**

```typescript
// features/direct-messages/components/conversation-view.tsx
export function ConversationView({ conversationId, conversation }) {
  // Múltiplas responsabilidades misturadas
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 15 linhas - violação Object Calisthenics
  useEffect(() => {
    // Lógica de scroll complexa
  }, [messages, isTyping]);

  // 15 linhas - violação Object Calisthenics
  const handleSend = async (e: React.FormEvent) => {
    // Lógica de envio complexa
  };

  // 200+ linhas de JSX complexo
  return (
    <div className="conversation-view">
      {/* JSX massivo */}
    </div>
  );
}
```

**DEPOIS (decomposição em micro-componentes):**

```typescript
// domains/users/components/conversation-view.tsx (≤50 linhas)
import { useConversation } from '../hooks/use-conversation.hook';
import { ConversationHeader } from './conversation-header';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { TypingIndicator } from './typing-indicator';
import { ConversationSkeleton } from './conversation-skeleton';

interface ConversationViewProps {
  conversationId: string;
}

export function ConversationView({ conversationId }: ConversationViewProps) {
  const { data: conversation, isLoading } = useConversation(conversationId);

  if (isLoading) return <ConversationSkeleton />;
  if (!conversation) return null;

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader conversation={conversation} />
      <MessageList conversationId={conversationId} />
      <TypingIndicator conversationId={conversationId} />
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
```

```typescript
// domains/users/components/message-list.tsx (≤50 linhas)
import { useMessages } from '../hooks/use-messages.hook';
import { useAutoScroll } from '../hooks/use-auto-scroll.hook';
import { MessageItem } from './message-item';
import { MessageListSkeleton } from './message-list-skeleton';

interface MessageListProps {
  conversationId: string;
}

export function MessageList({ conversationId }: MessageListProps) {
  const { data: messages, isLoading } = useMessages(conversationId);
  const { scrollRef } = useAutoScroll(messages);

  if (isLoading) return <MessageListSkeleton />;

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {messages?.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
```

```typescript
// domains/users/hooks/use-auto-scroll.hook.ts (≤50 linhas)
import { useEffect, useRef } from "react";
import { MessageDto } from "@/shared/types";

export const useAutoScroll = (messages?: MessageDto[]) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && messages) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return { scrollRef };
};
```

### 5. Padrão de Migração IPC

#### Migração de API Legacy para API Tipada

**ANTES (API Legacy):**

```typescript
// features/agent-management/hooks/use-agents.hook.ts
const loadAgents = async () => {
  try {
    const agents = await window.electronIPC.invoke("agent:list");
    setAgents(agents);
  } catch (error) {
    setError(error.message);
  }
};

const createAgent = async (data: CreateAgentDto) => {
  try {
    const agent = await window.electronIPC.invoke("agent:create", data);
    setAgents((prev) => [...prev, agent]);
  } catch (error) {
    setError(error.message);
  }
};
```

**DEPOIS (API Tipada + TanStack Query):**

```typescript
// domains/agents/hooks/use-agents.hook.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentService } from "../services/agent.service";

export const useAgents = () => {
  return useQuery({
    queryKey: ["agents"],
    queryFn: agentService.list,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: agentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
};
```

```typescript
// domains/agents/services/agent.service.ts
import { AgentDto, CreateAgentDto } from "@/shared/types";

export const agentService = {
  async list(): Promise<AgentDto[]> {
    return window.electronIPC.agents.list();
  },

  async create(data: CreateAgentDto): Promise<AgentDto> {
    return window.electronIPC.agents.create(data);
  },

  async getById(id: string): Promise<AgentDto> {
    return window.electronIPC.agents.getById(id);
  },

  async update(id: string, data: Partial<CreateAgentDto>): Promise<AgentDto> {
    return window.electronIPC.agents.update(id, data);
  },

  async delete(id: string): Promise<void> {
    return window.electronIPC.agents.delete(id);
  },
};
```

### 6. Padrão de Rotas com Preload

#### Implementação de Rotas por Domínio

```typescript
// app/users/_layout.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { UserSidebar } from '@/domains/users/components/user-sidebar';
import { userService } from '@/domains/users/services/user.service';

export const Route = createFileRoute('/users/_layout')({
  beforeLoad: async () => {
    // Preload user data
    return {
      user: await userService.getCurrent(),
    };
  },
  component: UserLayout,
});

function UserLayout() {
  const { user } = Route.useLoaderData();

  return (
    <div className="flex h-screen">
      <UserSidebar user={user} />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
```

```typescript
// app/projects/$projectId/_layout.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ProjectSidebar } from '@/domains/projects/components/project-sidebar';
import { projectService } from '@/domains/projects/services/project.service';

export const Route = createFileRoute('/projects/$projectId/_layout')({
  beforeLoad: async ({ params }) => {
    // Preload project data
    const project = await projectService.getById(params.projectId);
    const channels = await projectService.getChannels(params.projectId);
    const agents = await projectService.getAgents(params.projectId);

    return { project, channels, agents };
  },
  component: ProjectLayout,
});

function ProjectLayout() {
  const { project, channels, agents } = Route.useLoaderData();

  return (
    <div className="flex h-screen">
      <ProjectSidebar
        project={project}
        channels={channels}
        agents={agents}
      />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
```

## Implementação Passo a Passo

### Fase 1: Setup da Infraestrutura

#### 1.1 Configurar TanStack Query

```typescript
// providers/query-provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 3,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### 1.2 Criar Estrutura de Domínios

```bash
# Criar estrutura de pastas
mkdir -p src/renderer/domains/{users,projects,agents,llm}
mkdir -p src/renderer/domains/{users,projects,agents,llm}/{components,hooks,stores,services}
mkdir -p src/renderer/shared/{components,hooks,services,utils}
mkdir -p src/renderer/providers
```

#### 1.3 Atualizar main.tsx

```typescript
// main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryProvider } from './providers/query-provider';
import { ThemeProvider } from './providers/theme-provider';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryProvider>
  </React.StrictMode>
);
```

### Fase 2: Migração de Stores Críticos

#### 2.1 Migrar project.store.ts

```typescript
// domains/projects/stores/project.store.ts
import { create } from "zustand";
import { ProjectDto } from "@/shared/types";

interface ProjectState {
  selectedProject: ProjectDto | null;
  setSelectedProject: (project: ProjectDto | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
}));
```

#### 2.2 Criar hooks TanStack Query

```typescript
// domains/projects/hooks/use-projects.hook.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/project.service";

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: projectService.list,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
```

#### 2.3 Atualizar componentes

```typescript
// domains/projects/components/project-list.tsx
import { useProjects } from '../hooks/use-projects.hook';
import { ProjectCard } from './project-card';

export function ProjectList() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Fase 3: Migração de Componentes

#### 3.1 Identificar componentes monolíticos

```bash
# Procurar componentes grandes
find src/renderer/features -name "*.tsx" -exec wc -l {} \; | sort -n | tail -10
```

#### 3.2 Decompor conversation-view.tsx

```typescript
// domains/users/components/conversation-view.tsx
import { ConversationHeader } from './conversation-header';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

export function ConversationView({ conversationId }: { conversationId: string }) {
  return (
    <div className="flex flex-col h-full">
      <ConversationHeader conversationId={conversationId} />
      <MessageList conversationId={conversationId} />
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
```

### Fase 4: Padronização IPC

#### 4.1 Migrar todos os calls para API tipada

```typescript
// Antes
const agents = await window.electronIPC.invoke("agent:list");

// Depois
const agents = await window.electronIPC.agents.list();
```

#### 4.2 Implementar error handling padronizado

```typescript
// shared/hooks/use-error-handler.hook.ts
import { useCallback } from "react";
import { toast } from "sonner";

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown) => {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    toast.error(message);
  }, []);

  return { handleError };
};
```

### Fase 5: Migração de Rotas

#### 5.1 Reorganizar rotas por domínio

```typescript
// app/projects/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { ProjectList } from '@/domains/projects/components/project-list';

export const Route = createFileRoute('/projects/')({
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Projects</h1>
      <ProjectList />
    </div>
  );
}
```

#### 5.2 Implementar preload

```typescript
// app/projects/$projectId/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { projectService } from "@/domains/projects/services/project.service";

export const Route = createFileRoute("/projects/$projectId/")({
  beforeLoad: async ({ params }) => {
    const project = await projectService.getById(params.projectId);
    return { project };
  },
  component: ProjectDetailPage,
});
```

## Checklist de Implementação

### ✅ Infraestrutura

- [ ] TanStack Query configurado
- [ ] Estrutura de domínios criada
- [ ] Providers implementados
- [ ] main.tsx atualizado

### ✅ Migração de Stores

- [ ] project.store.ts migrado
- [ ] conversation.store.ts migrado
- [ ] llm-provider.store.ts migrado
- [ ] channel-message.store.ts migrado

### ✅ Migração de Componentes

- [ ] conversation-view.tsx decomposto
- [ ] project-list.tsx simplificado
- [ ] agent-dashboard.tsx refatorado
- [ ] Componentes ≤50 linhas

### ✅ Padronização IPC

- [ ] API legacy eliminada
- [ ] API tipada implementada
- [ ] Error handling padronizado
- [ ] Validação de entrada

### ✅ Migração de Rotas

- [ ] Rotas organizadas por domínio
- [ ] Preload implementado
- [ ] Code splitting configurado
- [ ] Layouts otimizados

## Validação

### Testes de Funcionalidade

- [ ] Navegação entre rotas funciona
- [ ] Operações CRUD funcionam
- [ ] IPC communication funciona
- [ ] Error handling funciona

### Testes de Performance

- [ ] Carregamento inicial ≤ estado atual
- [ ] Navegação rápida entre rotas
- [ ] Memory usage otimizado
- [ ] Bundle size reduzido

### Testes de Qualidade

- [ ] Zero erros TypeScript
- [ ] Zero violações ESLint
- [ ] Object Calisthenics aplicado
- [ ] Code review aprovado

## Troubleshooting

### Problemas Comuns

**Erro de tipos IPC:**

```typescript
// Verificar se API está exposta no preload
console.log(window.electronIPC.agents); // Deve estar definido
```

**Erro de Query Client:**

```typescript
// Verificar se QueryProvider está no nível correto
// Deve estar acima de qualquer componente que use useQuery
```

**Erro de navegação:**

```typescript
// Verificar se rotas estão registradas corretamente
// Verificar se routeTree.gen.ts está atualizado
```

### Debugging

```typescript
// Adicionar logging para debug
export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      console.log("Fetching projects...");
      const result = await projectService.list();
      console.log("Projects fetched:", result);
      return result;
    },
  });
};
```

## Conclusão

Este guia fornece uma roadmap completa para implementar a refatoração do renderer seguindo Object Calisthenics e padrões de Clean Code. A migração deve ser feita incrementalmente, validando cada etapa antes de prosseguir.
