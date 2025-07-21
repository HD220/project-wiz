# 📋 **PLANO COMPLETO: Tela de Gerenciamento de Provedores LLM**

## 🔍 **1. ESCLARECIMENTOS SOLICITADOS**

### **Padrão `_authenticated`**

- **Função:** Pasta que agrupa todas as rotas autenticadas no TanStack Router
- **Funcionamento:** O arquivo `/_authenticated/route.tsx` usa `beforeLoad` para verificar autenticação via `useAuthStore`
- **Redirecionamento:** Se não autenticado, redireciona para `/auth/login`
- **Layout:** Aplica o layout principal com `RootSidebar` para todas as rotas filhas

### **Stores de Features Específicas**

- **Localização:** Dentro de cada feature (`src/renderer/features/llm-providers/stores/`)
- **Não usar:** Stores centralizadas em `/src/renderer/store/` para funcionalidades específicas
- **Usar centralizadas apenas para:** Estado global da aplicação (auth, theme, etc.)

---

## 🎨 **2. DESIGN E EXPERIÊNCIA DO USUÁRIO**

### **Navegação Principal**

- **Local:** Menu "Settings" na sidebar do usuário (já existe)
- **Ícone:** Cogwheel/Settings que ao clicar abre sheet lateral
- **Estrutura:** Sheet lateral direita com abas (Profile, AI Providers, Preferences)

### **Tela Principal - Lista de Provedores**

```
┌─────────────────────────────────────────┐
│ ⚙️ Settings                    × Close  │
├─────────────────────────────────────────┤
│ 👤 Profile    🤖 AI Providers    🎨 UI  │
├─────────────────────────────────────────┤
│                                         │
│ 🤖 AI Providers                        │
│ ─────────────────────────────────────── │
│                                         │
│ ┌─────────────────────┐ + Add Provider  │
│ │ 🔴 OpenAI          │                  │
│ │ GPT-4o • Default   │  ⚙️ Edit        │
│ │ ●●●●●●●●●● Active  │  🗑️ Delete      │
│ └─────────────────────┘                 │
│                                         │
│ ┌─────────────────────┐                 │
│ │ 🔷 DeepSeek        │                  │
│ │ DeepSeek-Coder     │  ⚙️ Edit        │
│ │ ●●●●●●●●●● Active  │  🗑️ Delete      │
│ └─────────────────────┘                 │
│                                         │
│ ┌─────────────────────┐                 │
│ │ ⚡ Anthropic       │                  │
│ │ Claude-3.5-Sonnet  │  ⚙️ Edit        │
│ │ ○○○○○○○○○○ Inactive│  🗑️ Delete      │
│ └─────────────────────┘                 │
└─────────────────────────────────────────┘
```

### **Modal Add/Edit Provider**

```
┌─────────────────────────────────────────┐
│ + Add New AI Provider          × Close  │
├─────────────────────────────────────────┤
│                                         │
│ Provider Type *                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔴 OpenAI                     ▼    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Display Name *                          │
│ ┌─────────────────────────────────────┐ │
│ │ My OpenAI Provider                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ API Key *                              │
│ ┌─────────────────────────────────────┐ │
│ │ sk-proj-...                  👁 🧪  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Default Model                           │
│ ┌─────────────────────────────────────┐ │
│ │ gpt-4o                        ▼    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [ ] Set as default provider             │
│ [✓] Enable this provider               │
│                                         │
│ ┌─────────────┐ ┌─────────────┐        │
│ │ 🧪 Test API │ │ 💾 Save     │        │
│ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────┘
```

### **Estados da Interface**

- **Loading:** Skeleton cards durante carregamento
- **Empty State:** Mensagem motivacional + CTA para adicionar primeiro provider
- **Success/Error:** Toast notifications para ações
- **Test API:** Loading spinner + success/error feedback inline

---

## 📁 **3. ESTRUTURA DE ARQUIVOS COMPLETA**

```
src/renderer/features/llm-providers/
├── components/
│   ├── provider-list.tsx          # Lista principal de provedores
│   ├── provider-card.tsx          # Card individual do provider
│   ├── provider-form.tsx          # Formulário add/edit
│   ├── provider-type-select.tsx   # Select de tipos de provider
│   ├── api-key-input.tsx         # Input especial para API keys
│   ├── test-api-button.tsx       # Botão de teste de API
│   └── empty-state.tsx           # Estado vazio
├── stores/
│   └── llm-providers-store.ts    # Store específica da feature
├── schemas/
│   └── provider-form.schema.ts   # Validação Zod dos formulários
└── types/
    └── provider.types.ts         # Types específicos da UI

src/renderer/app/_authenticated/user/
├── settings/
│   ├── route.tsx                 # Layout de settings
│   ├── index.tsx                 # Página principal settings
│   └── ai-providers.tsx         # Página específica AI providers
```

---

## 🔗 **4. ROTEAMENTO E NAVEGAÇÃO**

### **Rotas Criadas**

```typescript
// Nova rota: /user/settings
/_authenticated/ersu /
  settings /
  route.tsx /
  // Nova rota: /user/settings/ai-providers
  _authenticated /
  user /
  settings /
  ai -
  providers.tsx /
    // Nova rota raiz de settings: /user/settings/
    _authenticated /
    user /
    settings /
    index.tsx;
```

### **Integração com Sidebar**

- **Modificar:** `sidebar-navigation.tsx`
- **Ação:** Settings abre Sheet lateral com abas
- **Navegação:** Interna no sheet entre Profile, AI Providers, UI Preferences

---

## 🏗️ **5. COMPONENTES ESPECÍFICOS DETALHADOS**

### **ProviderCard Component**

```typescript
interface ProviderCardProps {
  provider: SelectLLMProvider;
  isDefault?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleDefault: (id: string) => void;
}
```

### **ProviderForm Component**

```typescript
interface ProviderFormProps {
  provider?: SelectLLMProvider; // undefined = create mode
  onSubmit: (data: ProviderFormData) => Promise<void>;
  onCancel: () => void;
}
```

### **APIKeyInput Component**

- **Funcionalidades:** Masking automático, toggle visibility, test button integrado
- **Segurança:** Nunca mostra API key completa, apenas últimos 4 dígitos

---

## 🛠️ **6. STORE E ESTADO**

### **LLM Providers Store**

```typescript
// src/renderer/features/llm-providers/stores/llm-providers-store.ts
interface LLMProvidersState {
  providers: SelectLLMProvider[];
  defaultProvider: SelectLLMProvider | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  testingProvider: string | null;

  // Actions
  loadProviders: () => Promise<void>;
  createProvider: (data: CreateProviderInput) => Promise<void>;
  updateProvider: (id: string, data: UpdateProviderInput) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  setDefaultProvider: (id: string) => Promise<void>;
  testProvider: (data: TestProviderInput) => Promise<boolean>;
}
```

### **Form Schema**

```typescript
// src/renderer/features/llm-providers/schemas/provider-form.schema.ts
export const providerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string().min(1, "API Key is required"),
  baseUrl: z.string().url().optional(),
  defaultModel: z.string().min(1, "Default model is required"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
```

---

## 🚀 **7. FLUXO DE IMPLEMENTAÇÃO**

### **Fase 1: Base Structure**

1. Criar estrutura de pastas e arquivos
2. Setup da store de LLM providers
3. Criar schemas de validação
4. Types específicos da UI

### **Fase 2: UI Components**

1. ProviderCard component
2. ProviderForm component (modal)
3. APIKeyInput component especializado
4. TestAPI functionality

### **Fase 3: Integration**

1. Settings Sheet modal
2. Routing setup
3. Navigation integration
4. Error handling e loading states

### **Fase 4: Polish**

1. Empty states e skeleton loading
2. Toast notifications
3. Confirmação de delete
4. Accessibility e keyboard navigation

---

## 🎯 **8. ASPECTOS TÉCNICOS IMPORTANTES**

### **Segurança**

- API keys sempre mascaradas na UI
- Teste de conectividade sem exposição de credentials
- Validação rigorosa de inputs

### **UX/Performance**

- Loading states em todas as operações
- Feedback imediato para testes de API
- Formulários com validação em tempo real
- Confirmação antes de deletar

### **Padrões do Projeto**

- Shadcn/ui components consistentes
- Discord-like visual style
- TanStack Router navigation
- Zustand state management
- React Hook Form + Zod validation

---

## 📋 **9. BACKEND JÁ IMPLEMENTADO**

### **Database Schema**

- **Tabela:** `llm_providers` com campos completos
- **Relacionamento:** Vinculado ao usuário via `userId`
- **Segurança:** API keys criptografadas com AES-256-GCM

### **Service Layer**

- **CRUD completo:** Create, Read, Update, Delete
- **Funcionalidades:** Criptografia, teste de conectividade, provider padrão
- **Validação:** Schemas Zod para input validation

### **IPC Handlers**

- **API completa:** Todas as operações expostas via IPC
- **Endpoints:** create, list, getById, update, delete, setDefault, testApiKey

### **Frontend API**

- **Disponível:** `window.api.llmProviders.*` pronto para uso
- **Type-safe:** Interface TypeScript completa

---

Este plano mantém total consistência com os padrões estabelecidos no projeto e oferece uma experiência de usuário completa e intuitiva para gerenciamento de provedores LLM.
