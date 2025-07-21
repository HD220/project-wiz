# 🗂️ Estrutura de Pastas e Arquivos - Project Wiz

## 📋 Princípios de Organização

### **Regras Fundamentais:**

- **SEM pasta `shared`** - não criar abstrações desnecessárias
- **Componentes compartilhados** → `renderer/components/`
- **Recursos globais** → suas respectivas pastas em `renderer/`
- **Específico de feature** → dentro da própria feature
- **Organização por domínio** → features agrupadas por contexto de negócio

### **Nomenclatura de Arquivos:**

- **kebab-case** para todos os arquivos e pastas
- **Sufixos com ponto**: `.model.ts`, `.schema.ts`, `.service.ts`, `.handler.ts`, `.store.ts`, `.api.ts`, `.hook.ts`
- **Componentes SEM sufixo**: `login-form.tsx`, `user-profile.tsx`
- **Singular nos nomes**: `user.model.ts`, `agent.model.ts` (não plural)

## 🏗️ Estrutura Principal

```
src/
├── main/                           # Backend Electron
│   ├── database/                   # Configuração e migrações do banco
│   │   ├── connection.ts
│   │   ├── index.ts
│   │   └── migrations/
│   ├── types.ts                    # Tipos globais do backend
│   ├── utils/                      # Utilitários globais
│   │   └── logger.ts
│   ├── features/                   # Features organizadas por domínio
│   │   ├── auth/
│   │   ├── user/
│   │   ├── project/
│   │   ├── conversation/
│   │   ├── agent/
│   │   └── git/
│   └── main.ts                     # Entry point
│
└── renderer/                       # Frontend React
    ├── app/                        # TanStack Router
    ├── components/                 # Componentes compartilhados
    │   ├── layout/                 # Layouts compartilhados
    │   └── ui/                     # shadcn/ui components
    ├── features/                   # Features do frontend
    │   ├── auth/
    │   ├── user/
    │   ├── project/
    │   ├── llm-provider/
    │   └── app/                    # Componentes gerais da aplicação
    ├── hooks/                      # Hooks globais
    ├── lib/                        # Utilitários globais
    ├── contexts/                   # Contexts globais
    ├── store/                      # Store global
    ├── services/                   # Services globais
    └── locales/                    # Internacionalização
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
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
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
