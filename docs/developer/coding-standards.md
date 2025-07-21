# 📋 Padrões de Codificação - Project Wiz

## 📋 Convenções de Nomenclatura

### Arquivos e Pastas (Padrão kebab-case)
- **kebab-case**: TODOS arquivos e pastas (`user-profile.tsx`, `use-user-data.ts`)
- **PascalCase**: APENAS nomes de componentes React dentro do arquivo (`UserProfile`)
- **camelCase**: Funções, variáveis e propriedades (`userData`, `handleClick`)
- **UPPER_SNAKE_CASE**: Constantes (`API_ENDPOINTS`)

### Sufixos Obrigatórios (com ponto)
- `.handler.ts` - IPC handlers no main
- `.service.ts` - Serviços de negócio
- `.store.ts` - Stores Zustand
- `.model.ts` - Schemas Drizzle (database)
- `.schema.ts` - Schemas Zod (validação)
- `.types.ts` - Definições de tipos
- `.api.ts` - Camadas de API/IPC
- `.hook.ts` - Custom hooks

### Prefixos para Hooks
- `use-` - Hooks React (`use-auth.hook.ts`, `use-user-data.hook.ts`)

### Componentes SEM sufixo
- `login-form.tsx` - Componente React (SEM sufixo adicional)
- `user-profile.tsx` - Componente React (SEM sufixo adicional)
- `dashboard-header.tsx` - Componente React (SEM sufixo adicional)

### Exemplos de Nomenclatura
```
✅ CORRETO:
- login-form.tsx (componente)
- use-auth.hook.ts (hook)
- auth.store.ts (store)
- user.model.ts (Drizzle)
- user.schema.ts (Zod)
- auth.api.ts (API)
- database.service.ts (service)
- auth.handler.ts (handler)

❌ ERRADO:
- LoginForm.tsx
- useAuth.ts
- authStore.ts
- login-form-component.tsx
- use-auth-hook.ts
- auth-store.ts
- userSchema.ts (ambíguo)
```

## 🔧 Padrões de Implementação

### 1. Componentes React (Function Declaration)

```typescript
// ✅ CORRETO: Function declaration, sem React.FC, sem import React
// login-form.tsx
interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

function LoginForm(props: LoginFormProps) {
  const { onSuccess, className } = props;
  const { login, isLoading, error } = useAuth();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Entrar na conta</CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Form content */}
        </form>
      </Form>
    </Card>
  );
}

export { LoginForm };

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
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

// user.schema.ts - Zod/Validação
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
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

// auth.api.ts - API Layer
export const authApi = {
  login: async (data: LoginFormData): Promise<User> => {
    return window.electronAPI.auth.login(data);
  },
  
  logout: async (): Promise<void> => {
    return window.electronAPI.auth.logout();
  },
  
  getCurrentUser: async (): Promise<User | null> => {
    return window.electronAPI.auth.getCurrentUser();
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
  
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));

// use-auth.hook.ts - Custom Hook
import { useMutation, useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { user, setUser, setLoading, setError, clearError } = useAuthStore();
  
  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: authApi.getCurrentUser,
    onSuccess: setUser,
    onError: (error) => setError(error.message)
  });
  
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      setUser(user);
      clearError();
    },
    onError: (error) => setError(error.message)
  });
  
  return {
    user: user || currentUser,
    isLoading: loginMutation.isLoading,
    error: useAuthStore((state) => state.error),
    login: loginMutation.mutate,
    logout: () => authApi.logout().then(() => setUser(null))
  };
}
```

### 4. IPC Communication Pattern

```typescript
// main/auth.handler.ts
import { ipcMain } from 'electron';
import { authService } from './auth.service';
import { LoginFormData } from '../../types/auth.types';

export function setupAuthHandlers() {
  ipcMain.handle('auth:login', async (_, data: LoginFormData) => {
    try {
      return await authService.login(data);
    } catch (error) {
      throw error;
    }
  });
  
  ipcMain.handle('auth:logout', async () => {
    try {
      return await authService.logout();
    } catch (error) {
      throw error;
    }
  });
  
  ipcMain.handle('auth:getCurrentUser', async () => {
    try {
      return await authService.getCurrentUser();
    } catch (error) {
      throw error;
    }
  });
}

// renderer/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

export const electronAPI = {
  auth: {
    login: (data: LoginFormData) => 
      ipcRenderer.invoke('auth:login', data),
    logout: () => 
      ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => 
      ipcRenderer.invoke('auth:getCurrentUser')
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

## 🎨 Padrões shadcn/ui

### Estrutura de Componentes UI
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
      
      <main className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export { AppLayout };
```

### Formulários com shadcn/ui Form
```typescript
// SEMPRE usar shadcn/ui Form components
// NUNCA usar register() diretamente nos inputs

// ✅ CORRETO:
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
use-auth-hook.ts
auth-store.ts
user-schema.ts

// ❌ ERRADO: Sufixos desnecessários em componentes
login-form-component.tsx
user-profile-component.tsx

// ❌ ERRADO: Nomes ambíguos
user.schema.ts // É Drizzle ou Zod?
userSchema.ts  // Não é kebab-case

// ✅ CORRETO: Sufixos com ponto e sem sufixos em componentes
use-auth.hook.ts
auth.store.ts
user.model.ts  // Claramente Drizzle
user.schema.ts // Claramente Zod
login-form.tsx // Componente sem sufixo
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
4. **Implementar API** → `feature.api.ts`
5. **Criar Store** → `feature.store.ts`
6. **Desenvolver Hook** → `use-feature.hook.ts`
7. **Construir Componente** → `feature-form.tsx` (sem sufixo)
8. **Integrar Handlers** → `feature.handler.ts` (main)

## 📝 Estrutura de Feature Completa

```
feature/
├── feature.types.ts         # Tipos TypeScript
├── feature.model.ts         # Schema Drizzle (database)
├── feature.schema.ts        # Schema Zod (validação)
├── feature.api.ts           # Comunicação IPC
├── feature.store.ts         # Estado Zustand
├── use-feature.hook.ts      # Hook customizado
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