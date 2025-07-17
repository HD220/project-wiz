# 🚀 Guia de Refatoração - Project Wiz

## ✅ **REFATORAÇÕES IMPLEMENTADAS**

### **1. Value Objects Consolidados**

- **Antes**: 10+ arquivos com classes para strings simples
- **Depois**: 1 arquivo `agent-values.ts` com tipos TypeScript + validação Zod
- **Resultado**: **-300 linhas de código**, muito mais simples

### **2. Entidade Agent Simplificada**

- **Antes**: Entidade com 3 Value Objects complexos
- **Depois**: Entidade limpa com validação na construção
- **Resultado**: **-80 linhas de código**, mais legível

### **3. Operações CRUD Consolidadas**

- **Antes**: 8 arquivos functions separados
- **Depois**: 1 arquivo `agent-operations.ts` com todas operações
- **Resultado**: **-200 linhas de código**, mais fácil de manter

### **4. Hooks Consolidados**

- **Antes**: 12 arquivos hooks fragmentados
- **Depois**: 1 arquivo `agents-hooks.ts` com todos hooks
- **Resultado**: **-400 linhas de código**, melhor DX

### **5. Formulário Consolidado**

- **Antes**: 8 componentes de field separados
- **Depois**: 1 componente `AgentForm` completo
- **Resultado**: **-250 linhas de código**, mais consistente

---

## 🎯 **PRÓXIMOS PASSOS RECOMENDADOS**

### **ALTA PRIORIDADE**

#### **1. Aplicar Mesmo Padrão aos Outros Domínios**

```bash
# Consolidar Projects
src/main/domains/projects/
├── project-operations.ts        # Todas operações CRUD
├── project-values.ts           # Value Objects consolidados
└── project.entity.ts           # Entidade simplificada

# Consolidar Users
src/main/domains/users/
├── user-operations.ts
├── user-values.ts
└── user.entity.ts

# Consolidar LLM
src/main/domains/llm/
├── llm-operations.ts
├── llm-values.ts
└── llm-provider.entity.ts
```

#### **2. Consolidar Componentes UI**

```bash
# Exemplo: Consolidar Dialog
src/renderer/components/ui/
├── dialog.tsx                  # Componente completo
└── dialog-parts.tsx           # Subcomponentes se necessário

# Ao invés de:
src/renderer/components/ui/dialog/
├── dialog-content.tsx
├── dialog-core.tsx
├── dialog-overlay.tsx
└── dialog-parts.tsx
```

#### **3. Consolidar Hooks por Domínio**

```bash
# Seguir padrão implementado
src/renderer/domains/projects/hooks/
└── projects-hooks.ts           # Todos hooks de projects

src/renderer/domains/users/hooks/
└── users-hooks.ts             # Todos hooks de users

src/renderer/domains/llm/hooks/
└── llm-hooks.ts               # Todos hooks de LLM
```

### **MÉDIA PRIORIDADE**

#### **4. Criar Utilitários CRUD Genéricos**

```typescript
// src/main/infrastructure/crud-generic.ts
export class GenericCRUD<T> {
  constructor(
    private table: any,
    private logger: Logger,
  ) {}

  async create(data: T): Promise<T> {
    /* ... */
  }
  async getById(id: string): Promise<T | null> {
    /* ... */
  }
  async getAll(): Promise<T[]> {
    /* ... */
  }
  async update(id: string, data: Partial<T>): Promise<T> {
    /* ... */
  }
  async delete(id: string): Promise<void> {
    /* ... */
  }
}
```

#### **5. Consolidar Schemas de Validação**

```typescript
// src/shared/schemas/
├── agent-schemas.ts
├── project-schemas.ts
├── user-schemas.ts
└── llm-schemas.ts
```

### **BAIXA PRIORIDADE**

#### **6. Consolidar Tipos Compartilhados**

```typescript
// src/shared/types/consolidated-types.ts
export type AgentTypes = {
  Agent: AgentEntityData;
  CreateAgent: CreateAgentData;
  UpdateAgent: UpdateAgentData;
};

export type ProjectTypes = {
  Project: ProjectEntityData;
  CreateProject: CreateProjectData;
  UpdateProject: UpdateProjectData;
};
```

---

## 📊 **IMPACTO ESPERADO**

### **Redução de Arquivos**

- **Antes**: 871 arquivos TS/TSX
- **Meta**: ~500 arquivos TS/TSX (redução de 42%)

### **Melhorias na DX**

- ✅ **Mais fácil encontrar código**: Menos arquivos para navegar
- ✅ **Mais fácil manter**: Menos duplicação
- ✅ **Mais fácil testar**: Menos mocking necessário
- ✅ **Mais fácil entender**: Código relacionado junto

### **Redução de Complexidade**

- ✅ **Menos abstrações**: Value Objects desnecessários removidos
- ✅ **Menos layers**: Operações diretas
- ✅ **Melhor tipagem**: TypeScript nativo ao invés de classes

---

## 🔧 **COMO CONTINUAR**

### **1. Script de Refatoração**

```bash
#!/bin/bash
# Aplicar refatoração em todos os domínios

# Projects
echo "Refatorando Projects..."
# Consolidar functions em project-operations.ts
# Consolidar value objects em project-values.ts
# Simplificar project.entity.ts

# Users
echo "Refatorando Users..."
# Mesmo padrão...

# LLM
echo "Refatorando LLM..."
# Mesmo padrão...
```

### **2. Testes de Regressão**

```bash
# Antes de cada refatoração
npm test
npm run type-check
npm run lint

# Depois de cada refatoração
npm test
npm run type-check
npm run lint
```

### **3. Validação de Funcionalidade**

```bash
# Testar que tudo funciona
npm run dev
# Testar cada feature manualmente
```

---

## 🎨 **PADRÕES ESTABELECIDOS**

### **Value Objects**

```typescript
// ✅ NOVO PADRÃO
export const NameSchema = z.string().min(2).max(100);
export type Name = z.infer<typeof NameSchema>;

// ❌ PADRÃO ANTIGO
export class Name {
  constructor(private value: string) {
    /* ... */
  }
  getValue(): string {
    return this.value;
  }
}
```

### **Operações CRUD**

```typescript
// ✅ NOVO PADRÃO
// domain-operations.ts
export async function createEntity(data: CreateData): Promise<Entity> {
  /* ... */
}
export async function getEntityById(id: string): Promise<Entity | null> {
  /* ... */
}
export async function getAllEntities(): Promise<Entity[]> {
  /* ... */
}
export async function updateEntity(
  id: string,
  data: UpdateData,
): Promise<Entity> {
  /* ... */
}
export async function deleteEntity(id: string): Promise<void> {
  /* ... */
}

// ❌ PADRÃO ANTIGO
// domain-create.functions.ts
// domain-update.functions.ts
// domain-delete.functions.ts
// domain-query.functions.ts
```

### **Hooks**

```typescript
// ✅ NOVO PADRÃO
// domain-hooks.ts
export function useEntities() {
  /* ... */
}
export function useEntity(id: string) {
  /* ... */
}
export function useCreateEntity() {
  /* ... */
}
export function useUpdateEntity() {
  /* ... */
}
export function useDeleteEntity() {
  /* ... */
}
export function useEntityManagement() {
  /* tudo combinado */
}

// ❌ PADRÃO ANTIGO
// use-entities.hook.ts
// use-entity.hook.ts
// use-entity-mutations.hook.ts
// use-entity-queries.hook.ts
```

### **Formulários**

```typescript
// ✅ NOVO PADRÃO
// EntityForm.tsx
export function EntityForm({ form, onSubmit, isLoading }: Props) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Todos os campos aqui */}
      </form>
    </Form>
  );
}

// ❌ PADRÃO ANTIGO
// entity-form-name-field.tsx
// entity-form-description-field.tsx
// entity-form-submit-button.tsx
```

---

## 🚨 **CUIDADOS IMPORTANTES**

### **1. Não Quebrar Funcionalidade**

- Sempre testar antes e depois
- Manter interfaces públicas iguais
- Fazer refatoração incremental

### **2. Atualizar Importações**

```typescript
// Atualizar todos os imports dos arquivos movidos/consolidados
// Usar ferramenta de Find & Replace no VS Code
```

### **3. Manter Testes Funcionando**

```typescript
// Atualizar mocks e imports nos testes
// Manter comportamento exato dos métodos
```

### **4. Documentar Mudanças**

```typescript
// Atualizar CLAUDE.md após refatoração
// Atualizar README.md se necessário
```

---

## 🎯 **OBJETIVO FINAL**

- **Código mais limpo e legível**
- **Menos arquivos para navegar**
- **Melhor experiência de desenvolvimento**
- **Mais fácil onboarding para novos devs**
- **Menos bugs por complexidade desnecessária**

---

**Continue aplicando esses padrões aos outros domínios e você terá um codebase muito mais maintível e produtivo!** 🚀
