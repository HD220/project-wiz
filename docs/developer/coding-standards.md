# Coding Standards - Project Wiz

**Current Implementation:** React 19.0.0 + TypeScript 5.8.3 + TanStack Router 1.115.2 + Drizzle ORM 0.44.2

These standards reflect the **actual patterns implemented** in the sophisticated Project Wiz codebase with **85+ service functions**, **14 database tables**, and **enterprise-grade architecture**.

## 📋 Convenções de Nomenclatura

### Arquivos e Pastas (Padrão kebab-case)

- **kebab-case**: TODOS arquivos e pastas (`user-profile.tsx`, `use-user-data.ts`)
- **PascalCase**: APENAS nomes de componentes React dentro do arquivo (`UserProfile`)
- **camelCase**: Funções, variáveis e propriedades (`userData`, `handleClick`)
- **UPPER_SNAKE_CASE**: Constantes (`API_ENDPOINTS`)

### Required File Suffixes (with dots)

- `.handler.ts` - IPC handlers in main process (10 handlers implemented)
- `.service.ts` - Business logic services (10 service classes with 85+ functions)
- `.model.ts` - Drizzle database schemas (14 tables with 62+ indexes)
- `.schema.ts` - Zod validation schemas (input validation)
- `.types.ts` - TypeScript type definitions
- `.hook.ts` - Custom React hooks (rare - prefer TanStack patterns)

### Hook Prefixes (RARELY USED)

- `use-` - React hooks (`use-auth.hook.ts`) - **AVOID: Use TanStack Router/Query instead**
- **Preferred:** TanStack Router `beforeLoad`/`loader` for data loading
- **Preferred:** TanStack Query `useQuery`/`useMutation` for server state

### React Components (NO suffix)

- `agent-form.tsx` - React component (NO additional suffix)
- `conversation-chat.tsx` - React component (NO additional suffix)
- `project-sidebar.tsx` - React component (NO additional suffix)
- **All components:** Function declarations with shadcn/ui integration

### Real Codebase Examples

```
✅ ACTUAL IMPLEMENTATION:
- agent-form.tsx (React component)
- agent.service.ts (AgentService with 15+ methods)
- agent.model.ts (Drizzle schema with indexes)
- agent.schema.ts (Zod validation schemas)
- agent.handler.ts (IPC handler with 10+ endpoints)
- agent.types.ts (TypeScript definitions)
- conversation-chat.tsx (Complex component)
- llm-provider.service.ts (Provider management)
- memory.service.ts (Agent memory system)
- auth.service.ts (Session management)

❌ AVOID:
- AgentForm.tsx (PascalCase files)
- useAuth.ts (missing .hook.ts suffix)
- agentStore.ts (camelCase files)
- agent-form-component.tsx (redundant suffix)
- agentSchema.ts (ambiguous - model or validation?)
```

## 🔧 Padrões de Implementação

### 1. React Components (Function Declaration Pattern)

```typescript
// ✅ ACTUAL IMPLEMENTATION: agent-form.tsx (from real codebase)
import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Settings, User, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { CreateAgentSchema } from "@/renderer/features/agent/agent.schema";
import type {
  SelectAgent,
  CreateAgentInput,
} from "@/renderer/features/agent/agent.types";

type FormData = z.infer<typeof CreateAgentSchema>;

interface AgentFormProps {
  initialData?: SelectAgent | null;
  providers?: LlmProvider[];
  onSubmit: (data: CreateAgentInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// ✅ CORRECT: Function declaration, NO React.FC, NO React import
export function AgentForm(props: AgentFormProps) {
  const { initialData, providers = [], onSubmit, onCancel, isLoading } = props;

  // Inline default provider selection (INLINE-FIRST principle)
  const defaultProvider = providers.find(p => p.isDefault) || providers[0];

  const form = useForm<FormData>({
    resolver: zodResolver(CreateAgentSchema),
    defaultValues: {
      name: initialData?.name || "",
      role: initialData?.role || "Software Engineer",
      backstory: initialData?.backstory || "",
      goal: initialData?.goal || "",
      providerId: initialData?.providerId || defaultProvider?.id || "",
      modelConfig: initialData?.modelConfig ?
        JSON.parse(initialData.modelConfig) : {
          model: "gpt-4",
          temperature: 0.7,
          maxTokens: 2000
        }
    }
  });

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data);
  };

  return (
    <ScrollArea className="h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 p-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="My AI Assistant" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Additional form fields... */}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Agent" : "Create Agent"}
            </Button>
          </div>
        </form>
      </Form>
    </ScrollArea>
  );
}

// ❌ ERRADO: React.FC e import React
import React from 'react'; // NÃO IMPORTAR

const LoginForm: React.FC<LoginFormProps> = ({ // NÃO USAR React.FC
  onSuccess,
  className
}) => {
  // ...
};
```

### 2. Models vs Schemas (Separação Clara)

```typescript
// user.model.ts - Drizzle/Database
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

// user.schema.ts - Zod/Validação
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

### 3. Feature Structure Pattern

```typescript
// auth.types.ts - Types da feature
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// auth.store.ts - Store Zustand
import { create } from "zustand";

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

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

// use-auth.hook.ts - Custom Hook
import { useMutation, useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { user, setUser, setLoading, setError, clearError } = useAuthStore();

  const { data: currentUser } = useQuery({
    queryKey: ["auth", "currentUser"],
    queryFn: authApi.getCurrentUser,
    onSuccess: setUser,
    onError: (error) => setError(error.message),
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      setUser(user);
      clearError();
    },
    onError: (error) => setError(error.message),
  });

  return {
    user: user || currentUser,
    isLoading: loginMutation.isLoading,
    error: useAuthStore((state) => state.error),
    login: loginMutation.mutate,
    logout: () => authApi.logout().then(() => setUser(null)),
  };
}
```

### 4. IPC Communication Pattern

```typescript
// main/auth.handler.ts
import { ipcMain } from "electron";
import { authService } from "./auth.service";
import { LoginFormData } from "../../types/auth.types";

export function setupAuthHandlers() {
  ipcMain.handle("auth:login", async (_, data: LoginFormData) => {
    try {
      return await authService.login(data);
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle("auth:logout", async () => {
    try {
      return await authService.logout();
    } catch (error) {
      throw error;
    }
  });

  ipcMain.handle("auth:getCurrentUser", async () => {
    try {
      return await authService.getCurrentUser();
    } catch (error) {
      throw error;
    }
  });
}

// renderer/preload.ts
import { contextBridge, ipcRenderer } from "electron";

export const electronAPI = {
  auth: {
    login: (data: LoginFormData) => ipcRenderer.invoke("auth:login", data),
    logout: () => ipcRenderer.invoke("auth:logout"),
    getCurrentUser: () => ipcRenderer.invoke("auth:getCurrentUser"),
  },
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
```

## 🎨 Padrões shadcn/ui

### Estrutura de Componentes UI

Follows the [design system specification](../design/README.md) with 48 production-ready components:

```typescript
// SEMPRE usar componentes shadcn/ui, NUNCA import React
// dashboard-header.tsx
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/renderer/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/renderer/components/ui/form';
import { Alert, AlertDescription } from '@/renderer/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/renderer/components/ui/dialog';

// SEMPRE usar a função cn() para classes CSS
import { cn } from '@/renderer/lib/utils';

// Use design tokens from the design system
import { OKLCH_COLORS, SPACING_TOKENS } from '../design/design-tokens.md';

interface DashboardHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

function DashboardHeader(props: DashboardHeaderProps) {
  const { className, children, ...restProps } = props;

  return (
    <div className={cn("default-classes", className)} {...restProps}>
      {children}
    </div>
  );
}

export { DashboardHeader };
```

### Componentes de Layout

Implements [design system layout patterns](../design/layout-and-spacing.md) with design tokens:

```typescript
// app-layout.tsx - Layout usando shadcn/ui e function declaration
import { Card, CardContent } from '@/renderer/components/ui/card';
import { cn } from '@/renderer/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

function AppLayout(props: AppLayoutProps) {
  const { children, className } = props;

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <header className="border-b">
        {/* Header content */}
      </header>

      <main className="container mx-auto p-[var(--spacing-layout-md)]">
        <Card>
          <CardContent className="p-[var(--spacing-component-lg)]">
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export { AppLayout };
```

See [design tokens documentation](../design/design-tokens.md#spacing-system-8px-grid) for spacing token usage.

### Formulários com shadcn/ui Form

Follows [component design guidelines](../design/component-design-guidelines.md#form-components) for form implementation:

```typescript
// SEMPRE usar shadcn/ui Form components
// NUNCA usar register() diretamente nos inputs

// ✅ CORRETO: Using design system form patterns
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input {...field} placeholder="placeholder" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// ❌ ERRADO:
<input {...register('fieldName')} />
```

Refer to [design system form patterns](../design/component-design-guidelines.md#form-components-12-components) for complete form component usage.

## 🚫 Anti-Padrões - O que NUNCA fazer

### ❌ Componentes Incorretos

```typescript
// ❌ ERRADO: React.FC e import React
import React from 'react';

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  className
}) => {
  return <div>...</div>;
};

// ❌ ERRADO: Arrow function export
export const LoginForm = (props: LoginFormProps) => {
  return <div>...</div>;
};

// ❌ ERRADO: Sufixo desnecessário
// login-form-component.tsx

// ✅ CORRETO: Function declaration, sem React import, sem sufixo
// login-form.tsx
interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

function LoginForm(props: LoginFormProps) {
  const { onSuccess, className } = props;
  return <div>...</div>;
}

export { LoginForm };
```

### ❌ Nomenclatura Incorreta

```typescript
// ❌ ERRADO: Sufixos com hífen
use - auth - hook.ts;
auth - store.ts;
user - schema.ts;

// ❌ ERRADO: Sufixos desnecessários em componentes
login - form - component.tsx;
user - profile - component.tsx;

// ❌ ERRADO: Nomes ambíguos
user.schema.ts; // É Drizzle ou Zod?
userSchema.ts; // Não é kebab-case

// ✅ CORRETO: Sufixos com ponto e sem sufixos em componentes
use - auth.hook.ts;
auth.store.ts;
user.model.ts; // Claramente Drizzle
user.schema.ts; // Claramente Zod
login - form.tsx; // Componente sem sufixo
```

### ❌ Usar HTML nativo em vez do shadcn/ui

```typescript
// ❌ ERRADO: Usar elementos HTML básicos
<button onClick={handleClick}>Click</button>
<input type="text" onChange={handleChange} />
<div className="card">Content</div>

// ✅ CORRETO: Usar componentes shadcn/ui
<Button onClick={handleClick}>Click</Button>
<Input type="text" onChange={handleChange} />
<Card><CardContent>Content</CardContent></Card>
```

### ❌ Estrutura de Arquivos Incorreta

```typescript
// ❌ ERRADO: Misturar concerns em um arquivo
// user-dashboard.tsx
const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lógica de API diretamente no componente
  const login = async (data) => {
    setLoading(true);
    try {
      const result = await window.electronAPI.auth.login(data);
      setUser(result);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <form>
      <input type="email" name="email" />
      <button type="submit">Login</button>
    </form>
  );
};

// ✅ CORRETO: Separação clara de concerns
// user.types.ts - tipos
// user.schema.ts - validação Zod
// user.model.ts - modelo Drizzle
// auth.api.ts - comunicação
// use-auth.hook.ts - lógica
// user-dashboard.tsx - apresentação
```

## ✅ Checklist para Desenvolvimento

### Componentes React:

- [ ] Usar `function ComponentName(props: PropsType)`
- [ ] NÃO importar React
- [ ] NÃO usar `React.FC<>`
- [ ] Exportar com `export { ComponentName }`
- [ ] Arquivo SEM sufixo (ex: `login-form.tsx`)
- [ ] Usar apenas componentes shadcn/ui

### Arquivos e Nomenclatura:

- [ ] Arquivos em kebab-case
- [ ] Sufixos com PONTO: `.model.ts`, `.schema.ts`, `.hook.ts`
- [ ] `.model.ts` para Drizzle schemas
- [ ] `.schema.ts` para Zod schemas
- [ ] Prefixos `use-` para hooks
- [ ] Componentes sem sufixo adicional

### Estrutura:

- [ ] Separar tipos, schemas, API, store e hooks
- [ ] Validar dados com Zod
- [ ] Usar TanStack Query para cache
- [ ] Implementar tratamento de erro
- [ ] Estados de loading adequados

## 🔄 Fluxo de Desenvolvimento

1. **Definir Tipos** → `feature.types.ts`
2. **Criar Model** → `feature.model.ts` (Drizzle)
3. **Criar Schema** → `feature.schema.ts` (Zod)
4. **Construir Componente** → `feature-form.tsx` (sem sufixo)
5. **Integrar Handlers** → `feature.handler.ts` (main)

## 📝 Estrutura de Feature Completa

```
feature/
├── feature.types.ts         # Tipos TypeScript
├── feature.model.ts         # Schema Drizzle (database)
├── feature.schema.ts        # Schema Zod (validação)
├── feature-form.tsx         # Componente React (sem sufixo)
└── feature.handler.ts       # IPC Handler (main)
```

Esta estrutura garante:

- **Clareza**: Models vs Schemas bem definidos
- **Consistência**: Function components sem React import
- **Nomenclatura**: Sufixos com ponto, componentes sem sufixo
- **Manutenibilidade**: Código organizado e previsível
- **Type Safety**: TypeScript + Zod
- **Performance**: TanStack Query + Zustand
- **UI Consistency**: shadcn/ui em toda interface
