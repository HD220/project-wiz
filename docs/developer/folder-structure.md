# Folder Structure & File Organization - Project Wiz

**Current Implementation:** Feature-Based Architecture with 14 Database Tables + 50+ React Components

This structure represents the **actual sophisticated organization** of the Project Wiz codebase with **enterprise-grade feature separation**, **type-safe boundaries**, and **scalable architecture patterns**.

## 📋 Princípios de Organização

### **Regras Fundamentais:**

- **SEM pasta `shared`** - não criar abstrações desnecessárias
- **Componentes compartilhados** → `renderer/components/` following [design system patterns](../design/README.md)
- **Recursos globais** → suas respectivas pastas em `renderer/`
- **Específico de feature** → dentro da própria feature
- **Organização por domínio** → features agrupadas por contexto de negócio
- **Design token consistency** → [OKLCH color system](../design/design-tokens.md) used throughout structure

### **Nomenclatura de Arquivos:**

- **kebab-case** para todos os arquivos e pastas
- **Sufixos com ponto**: `.model.ts`, `.schema.ts`, `.service.ts`, `.handler.ts`, `.store.ts`, `.api.ts`, `.hook.ts`
- **Componentes SEM sufixo**: `login-form.tsx`, `user-profile.tsx`
- **Singular nos nomes**: `user.model.ts`, `agent.model.ts` (não plural)

## 🏗️ Estrutura Principal

```
src/
├── main/                           # Backend Electron (Main Process)
│   ├── constants/                  # Global constants
│   │   └── ai-defaults.ts         # AI model defaults
│   ├── database/                   # Database configuration & migrations
│   │   ├── connection.ts          # SQLite WAL configuration
│   │   ├── index.ts               # Database exports
│   │   └── migrations/            # Auto-generated Drizzle migrations
│   │       ├── 0000_mysterious_sway.sql
│   │       └── meta/
│   ├── types.ts                    # Global backend types (IpcResponse<T>)
│   ├── utils/                      # Shared utilities
│   │   ├── ipc-handler.ts         # Type-safe IPC wrapper
│   │   └── logger.ts              # Pino structured logging
│   ├── features/                   # Feature-based domain organization
│   │   ├── auth/                  # Authentication & sessions
│   │   │   ├── auth.handler.ts    # IPC endpoints (6 handlers)
│   │   │   ├── auth.model.ts      # User table schema
│   │   │   ├── auth.schema.ts     # Zod validation schemas
│   │   │   ├── auth.service.ts    # Business logic (12 methods)
│   │   │   ├── auth.types.ts      # TypeScript definitions
│   │   │   ├── session-manager.ts # Session management
│   │   │   └── user-sessions.model.ts # Session table schema
│   │   ├── user/                  # User management
│   │   │   ├── user.handler.ts    # User CRUD handlers
│   │   │   ├── user.model.ts      # Users table (with profile relation)
│   │   │   ├── user.service.ts    # User business logic
│   │   │   ├── user.types.ts      # User types
│   │   │   ├── profile.handler.ts # Profile management
│   │   │   ├── profile.model.ts   # Profiles table schema
│   │   │   └── profile.service.ts # Profile operations
│   │   ├── project/               # Project workspace management
│   │   │   ├── project.handler.ts # Project CRUD (8 handlers)
│   │   │   ├── project.model.ts   # Projects table with indexes
│   │   │   ├── project.service.ts # Project business logic (15 methods)
│   │   │   ├── project.schema.ts  # Project validation
│   │   │   └── project.types.ts   # Project types
│   │   ├── conversation/          # Chat & conversation system
│   │   │   ├── conversation.handler.ts  # Conversation handlers (10 endpoints)
│   │   │   ├── conversation.model.ts    # Conversations table
│   │   │   ├── conversation.service.ts  # Conversation logic (20 methods)
│   │   │   ├── conversation.types.ts    # Conversation types
│   │   │   ├── message.model.ts         # Messages table with FKs
│   │   │   └── message.service.ts       # Message operations
│   │   └── agent/                 # AI Agent management system
│   │       ├── agent.handler.ts   # Agent CRUD (12 handlers)
│   │       ├── agent.model.ts     # Agents table with soft deletion
│   │       ├── agent.service.ts   # Agent business logic (18 methods)
│   │       ├── agent.schema.ts    # Agent validation schemas
│   │       ├── agent.types.ts     # Agent type definitions
│   │       ├── llm-provider/      # LLM Provider sub-feature
│   │       │   ├── llm-provider.handler.ts # Provider management
│   │       │   ├── llm-provider.model.ts   # Providers table
│   │       │   ├── llm-provider.service.ts # Provider operations
│   │       │   ├── llm-provider.types.ts   # Provider types
│   │       │   └── llm.service.ts          # LLM integration logic
│   │       └── memory/            # Agent Memory sub-feature
│   │           ├── memory.handler.ts # Memory CRUD
│   │           ├── memory.model.ts   # Agent memories table
│   │           ├── memory.service.ts # Memory operations
│   │           └── memory.types.ts   # Memory types
│   └── main.ts                     # Application entry point
│
└── renderer/                       # Frontend React (Renderer Process)
    ├── app/                        # TanStack Router file-based routes
    │   ├── __root.tsx             # Root layout with auth context
    │   ├── auth/                   # Authentication routes
    │   │   ├── login.tsx          # Login page
    │   │   ├── register.tsx       # Registration page
    │   │   └── route.tsx          # Auth layout
    │   └── _authenticated/        # Protected routes
    │       ├── index.tsx          # Dashboard
    │       ├── route.tsx          # Auth guard + layout
    │       ├── user/              # User-specific features
    │       │   ├── index.tsx      # User dashboard
    │       │   ├── route.tsx      # User layout
    │       │   ├── agents/        # Agent management
    │       │   │   ├── index.tsx  # Agent list
    │       │   │   ├── route.tsx  # Agent layout with loader
    │       │   │   └── edit/      # Agent editing
    │       │   ├── dm/            # Direct messages
    │       │   │   └── $conversationId/
    │       │   │       ├── index.tsx # Chat interface
    │       │   │       └── route.tsx # Chat route with loader
    │       │   └── settings/      # User settings
    │       │       ├── index.tsx  # Settings dashboard
    │       │       ├── appearance.tsx # Theme settings
    │       │       └── llm-providers/ # Provider management
    │       └── project/           # Project workspaces
    │           └── $projectId/    # Dynamic project routes
    │               ├── index.tsx  # Project dashboard
    │               ├── route.tsx  # Project layout
    │               └── channel/   # Project channels
    │                   └── $channelId/
    │                       ├── index.tsx # Channel chat
    │                       └── route.tsx # Channel route
    ├── components/                 # Shared React components
    │   ├── layout/                # Application layouts
    │   │   └── titlebar.tsx       # Custom window titlebar
    │   ├── members/               # Member-related components
    │   │   └── member-sidebar.tsx # Member list sidebar
    │   ├── agent-status/          # Agent status components
    │   │   ├── agent-status.tsx   # Status indicator
    │   │   └── index.ts          # Barrel export
    │   ├── auth-button.tsx        # Authentication button
    │   ├── custom-link.tsx        # Router-aware link component
    │   └── ui/                    # shadcn/ui component library (48 components)
    │       ├── accordion.tsx      # Accordion component
    │       ├── alert-dialog.tsx   # Alert dialog
    │       ├── button.tsx         # Button variants
    │       ├── card.tsx           # Card components
    │       ├── dialog.tsx         # Modal dialogs
    │       ├── form.tsx           # Form components
    │       ├── input.tsx          # Input components
    │       ├── select.tsx         # Select dropdowns
    │       ├── sidebar.tsx        # Sidebar component
    │       ├── table.tsx          # Table components
    │       └── ... (40+ UI components from [design system](../design/README.md))
    ├── features/                   # Feature-specific frontend code
    │   ├── auth/                  # Authentication feature
    │   │   ├── auth.schema.ts     # Frontend auth validation
    │   │   └── components/        # Auth-specific components
    │   │       ├── auth-form.tsx  # Login/register form
    │   │       └── auth-layout.tsx # Auth page layout
    │   ├── agent/                 # Agent management feature
    │   │   ├── agent.schema.ts    # Agent validation schemas
    │   │   ├── agent.types.ts     # Frontend agent types
    │   │   ├── provider-constants.ts # Provider defaults
    │   │   ├── provider.schema.ts # Provider validation
    │   │   ├── provider.types.ts  # Provider types
    │   │   └── components/        # Agent-specific components
    │   │       ├── agent-card.tsx # Agent display card
    │   │       ├── agent-form.tsx # Agent creation/edit form
    │   │       ├── agent-list.tsx # Agent list with filtering
    │   │       ├── create-agent-dialog.tsx # Creation modal
    │   │       └── provider/      # Provider management
    │   │           ├── provider-card.tsx # Provider display
    │   │           ├── provider-form.tsx # Provider form
    │   │           ├── provider-list.tsx # Provider list
    │   │           └── edit-provider-*.tsx # Provider editing
    │   ├── conversation/          # Chat & conversation feature
    │   │   ├── message.types.ts   # Message type definitions
    │   │   ├── types.ts           # Conversation types
    │   │   └── components/        # Conversation components
    │   │       ├── conversation-chat.tsx  # Main chat interface
    │   │       ├── conversation-item.tsx  # Chat item display
    │   │       ├── conversation-list.tsx  # Chat list sidebar
    │   │       ├── message-bubble.tsx     # Individual message
    │   │       ├── message-input.tsx      # Message composition
    │   │       └── create-conversation-dialog.tsx
    │   ├── project/               # Project management feature
    │   │   ├── project.types.ts   # Project type definitions
    │   │   └── components/        # Project components
    │   │       ├── project-card.tsx # Project display card
    │   │       ├── project-form.tsx # Project creation form
    │   │       └── create-project-dialog.tsx
    │   ├── user/                  # User management feature
    │   │   ├── user.types.ts      # User type definitions
    │   │   └── components/        # User components
    │   │       └── user-status.tsx # User status indicator
    │   ├── layout/                # Layout-specific components
    │   │   └── components/        # Layout components
    │   │       ├── content-header.tsx # Page headers
    │   │       └── navigation/    # Navigation components
    │   │           ├── navigation-item.tsx # Nav menu items
    │   │           ├── sidebar-header.tsx  # Sidebar header
    │   │           └── sidebar-navigation.tsx # Main navigation
    │   └── app/                   # Application-wide components
    │       └── components/        # App-level components
    │           ├── activity-item.tsx # Activity feed item
    │           ├── project-sidebar.tsx # Project navigation
    │           ├── root-sidebar.tsx    # Main app sidebar
    │           ├── server-view.tsx     # Server/project view
    │           ├── sidebar-user-area.tsx # User area in sidebar
    │           ├── user-sidebar.tsx    # User-specific sidebar
    │           └── welcome-view.tsx    # Welcome screen
    ├── hooks/                      # Global React hooks
    │   ├── use-api-mutation.hook.ts # Generic API mutation hook
    │   ├── use-debounce.hook.ts     # Debounce utility hook
    │   └── use-mobile.ts            # Mobile detection hook
    ├── lib/                        # Utility libraries
    │   ├── logger.ts              # Frontend logging utility
    │   ├── route-loader.ts        # TanStack Router data loading
    │   ├── search-validation.ts   # Search parameter validation
    │   └── utils.ts               # General utilities (cn, etc.)
    ├── contexts/                   # React contexts
    │   └── auth.context.tsx       # Authentication context
    ├── constants/                  # Frontend constants
    │   └── ai-defaults.ts         # AI model defaults (shared)
    ├── locales/                    # Internationalization
    │   ├── en/                    # English translations
    │   │   ├── common.po         # Common translations
    │   │   ├── common.ts         # Compiled translations
    │   │   ├── glossary.po       # Glossary terms
    │   │   ├── glossary.ts       # Compiled glossary
    │   │   ├── validation.po     # Validation messages
    │   │   └── validation.ts     # Compiled validation
    │   └── pt-BR/                 # Portuguese translations
    │       └── ... (same structure)
    ├── globals.css                # Global styles
    ├── index.html                 # HTML template
    ├── main.tsx                   # React app entry point
    ├── preload.ts                 # Electron preload script
    ├── routeTree.gen.ts           # Auto-generated TanStack routes
    └── window.d.ts                # Window API type definitions
```

## 🎯 Estrutura de Feature (Backend)

### **Padrão para `main/features/[feature-name]/`:**

```
features/auth/
├── auth.types.ts              # Tipos TypeScript específicos
├── auth.model.ts              # Schema Drizzle (database)
├── auth.schema.ts             # Schema Zod (validações)
├── auth.service.ts            # Lógica de negócio
└── auth.handler.ts            # IPC handlers
```

### **Exemplo Completo - Feature Auth:**

```typescript
// auth.types.ts - Tipos específicos da feature
export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// auth.model.ts - Schema Drizzle
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const authSessionsTable = sqliteTable("auth_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  token: text("token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

export type SelectAuthSession = typeof authSessionsTable.$inferSelect;
export type InsertAuthSession = typeof authSessionsTable.$inferInsert;

// auth.schema.ts - Schema Zod para validações
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// auth.service.ts - Lógica de negócio
export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Implementação da lógica
  }

  static async logout(): Promise<void> {
    // Implementação da lógica
  }
}

// auth.handler.ts - IPC handlers
export function setupAuthHandlers() {
  ipcMain.handle("auth:login", async (_, data) => {
    return await AuthService.login(data);
  });
}
```

## 🎨 Estrutura de Feature (Frontend)

### **Padrão para `renderer/features/[feature-name]/`:**

```
features/auth/
├── auth.types.ts              # Tipos específicos do frontend
├── auth.schema.ts             # Schemas Zod para formulários
├── auth.api.ts                # Comunicação IPC
├── auth.store.ts              # Store Zustand
├── use-auth.hook.ts           # Hook customizado
└── components/                # Componentes específicos da feature
    ├── auth-card.tsx
    ├── auth-layout.tsx
    ├── login-form.tsx
    └── register-form.tsx
```

### **Exemplo Completo - Feature Auth Frontend:**

```typescript
// auth.types.ts - Tipos específicos do frontend
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// auth.schema.ts - Schemas para formulários
import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// auth.api.ts - Comunicação IPC
export const authApi = {
  login: async (data: LoginFormData): Promise<User> => {
    return window.electronAPI.auth.login(data);
  },

  logout: async (): Promise<void> => {
    return window.electronAPI.auth.logout();
  }
};

// auth.store.ts - Store Zustand
import { create } from 'zustand';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user) => set({
    user,
    isAuthenticated: !!user
  }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));

// use-auth.hook.ts - Hook customizado
export function useAuth() {
  const store = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      store.setUser(user);
      store.clearError();
    },
    onError: (error) => {
      store.setError(error.message);
    }
  });

  return {
    ...store,
    login: loginMutation.mutate,
    isLoading: loginMutation.isLoading
  };
}

// components/login-form.tsx - Componente
interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

function LoginForm(props: LoginFormProps) {
  const { onSuccess, className } = props;
  const { login, isLoading, error } = useAuth();

  // Implementação do componente...

  return (
    <Card className={className}>
      {/* JSX do componente */}
    </Card>
  );
}

export { LoginForm };
```

## 📁 Organização de Componentes

### **Componentes Compartilhados:**

```
renderer/components/
├── auth-button.tsx            # Botão de auth genérico
├── custom-link.tsx            # Link customizado
├── layout/                    # Layouts compartilhados
│   └── titlebar.tsx          # Barra de título do Electron
└── ui/                       # shadcn/ui components
    ├── button.tsx
    ├── input.tsx
    ├── card.tsx
    └── ...
```

### **Componentes de Feature:**

```
renderer/features/auth/components/
├── auth-card.tsx             # Card de autenticação
├── auth-layout.tsx           # Layout específico de auth
├── login-form.tsx            # Formulário de login
└── register-form.tsx         # Formulário de registro
```

## 🌐 Recursos Globais

### **Hooks Globais:**

```
renderer/hooks/
└── use-mobile.ts             # Hook para detectar mobile
```

### **Contextos Globais:**

```
renderer/contexts/
└── theme-context.tsx         # Context de tema
```

### **Store Global:**

```
renderer/store/
└── auth.store.ts            # Store de autenticação global (se necessário)
```

### **Utilitários Globais:**

```
renderer/lib/
└── utils.ts                 # Utilitários do shadcn/ui e gerais
```

## 🚫 Anti-Padrões - O que NÃO fazer

### ❌ Pasta Shared

```
// ERRADO: Criar pasta shared
src/shared/
src/renderer/shared/
src/main/shared/

// CORRETO: Recursos globais em suas respectivas pastas
src/renderer/components/
src/renderer/hooks/
src/renderer/lib/
```

### ❌ Componentes Misturados

```
// ERRADO: Componente específico fora da feature
renderer/components/login-form.tsx

// CORRETO: Componente dentro da feature
renderer/features/auth/components/login-form.tsx
```

### ❌ Nomenclatura Inconsistente

```
// ERRADO: Mistura de padrões
user-schema.ts  (ambíguo)
authStore.ts    (não é kebab-case)
UseAuth.ts      (não é kebab-case)

// CORRETO: Padrão consistente
user.model.ts   (Drizzle)
user.schema.ts  (Zod)
auth.store.ts   (Store)
use-auth.hook.ts (Hook)
```

## ✅ Checklist de Organização

### Para cada Feature:

- [ ] **Backend:** Criar pasta em `main/features/[feature]/`
- [ ] **Frontend:** Criar pasta em `renderer/features/[feature]/`
- [ ] **Tipos:** Definir em `[feature].types.ts`
- [ ] **Database:** Schema Drizzle em `[feature].model.ts`
- [ ] **Validação:** Schema Zod em `[feature].schema.ts`
- [ ] **Lógica:** Service em `[feature].service.ts`
- [ ] **IPC:** Handler em `[feature].handler.ts`
- [ ] **API:** Comunicação em `[feature].api.ts`
- [ ] **Estado:** Store em `[feature].store.ts`
- [ ] **Hook:** Lógica customizada em `use-[feature].hook.ts`
- [ ] **Componentes:** Pasta `components/` dentro da feature

### Para Recursos Globais:

- [ ] **Componentes compartilhados** → `renderer/components/`
- [ ] **Hooks globais** → `renderer/hooks/`
- [ ] **Contextos globais** → `renderer/contexts/`
- [ ] **Store global** → `renderer/store/`
- [ ] **Utilitários globais** → `renderer/lib/`

## 🔄 Fluxo de Desenvolvimento

### Criando uma Nova Feature:

1. **Backend:**
   - Criar `main/features/[feature]/`
   - Implementar `[feature].model.ts` (Drizzle)
   - Implementar `[feature].schema.ts` (Zod validations)
   - Implementar `[feature].service.ts` (business logic)
   - Implementar `[feature].handler.ts` (IPC)

2. **Frontend:**
   - Criar `renderer/features/[feature]/`
   - Implementar `[feature].types.ts`
   - Implementar `[feature].schema.ts` (form validations)
   - Implementar `[feature].api.ts` (IPC communication)
   - Implementar `[feature].store.ts` (state management)
   - Implementar `use-[feature].hook.ts` (custom logic)
   - Criar `components/` com componentes específicos

3. **Integração:**
   - Registrar handlers no `main.ts`
   - Expor APIs no `preload.ts`
   - Integrar no roteamento (`app/`)

Esta estrutura garante:

- **Organização clara** por domínio de negócio
- **Separação de responsabilidades** bem definida
- **Reutilização** de componentes e lógica
- **Manutenibilidade** e escalabilidade
- **Consistência** em todo o projeto
- **Design system integration** - [48 shadcn/ui components](../design/README.md) with [OKLCH design tokens](../design/design-tokens.md)
- **Visual consistency** - [Discord-like interface patterns](../design/visual-design-principles.md) implemented through folder structure
