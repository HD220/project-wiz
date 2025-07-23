# 🔍 Análise da Arquitetura de Conversas - Problemas e Soluções

## 📊 **Estado Atual da Confusão**

### **1. Conceito Arquitetural (Conforme Usuário)**

```
┌─────────────────┐    ┌─────────────────┐
│   users table   │    │  agents table   │
│                 │    │                 │
│ id: uuid        │◄───┤ userId: uuid    │ (FK)
│ name: string    │    │ id: uuid        │
│ type: "agent"   │    │ name: string    │
│ ...             │    │ role: string    │
└─────────────────┘    │ ...             │
                       └─────────────────┘

CONCEITO: Agente = Entrada em AMBAS as tabelas
- users: Para interação/conversas
- agents: Para autonomia/IA
```

### **2. Relações de Database**

```sql
-- conversations
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  agentId TEXT REFERENCES agents(id), -- Para agent_chat
  ...
);

-- conversation_participants
CREATE TABLE conversation_participants (
  conversationId TEXT REFERENCES conversations(id),
  participantId TEXT REFERENCES users(id), -- ⚠️ IMPORTANTE: Referencia USERS
  ...
);

-- agents
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES users(id), -- ⚠️ IMPORTANTE: Agent vinculado a User
  ...
);
```

## 🚨 **Problemas Identificados**

### **Problema 1: Mapeamento Incorreto**

```typescript
// ❌ ATUAL (ERRADO):
const availableUsers = agents.map((agent) => ({
  id: agent.id, // ← ERRO: Este é agents.id
  name: agent.name,
  // ...
}));

// ✅ DEVERIA SER:
const availableUsers = agents.map((agent) => ({
  id: agent.userId, // ← CORRETO: Este referencia users.id
  name: agent.name,
  // ...
}));
```

### **Problema 2: Tipos Conflitantes**

```typescript
// Frontend: /renderer/features/conversation/types.ts
export interface CreateConversationInput {
  participantIds: string[];
  // ...
}

// Backend: /main/features/conversation/conversation.types.ts
export type CreateConversationInput = Omit<InsertConversation, ...> & {
  participantIds: string[];
};

// ⚠️ PROBLEMA: Tipos diferentes entre frontend/backend
```

### **Problema 3: Fluxo de Criação Confuso**

```typescript
// O que acontece quando usuário seleciona "agente" para conversar:

1. Interface mostra: agents.name (da tabela agents)
2. Usuário seleciona: agents.id ← PROBLEMA AQUI
3. Sistema passa: participantIds = [agents.id]
4. Database espera: participantIds = [users.id]
5. FK Constraint: FALHA! agents.id ≠ users.id
```

## 🤔 **Questões em Aberto**

### **Questão 1: Criação de Users para Agents**

- Quando um `agent` é criado, um `user` correspondente é criado automaticamente?
- Ou existe processo manual/separado?
- Como garantir sincronização agent ↔ user?

### **Questão 2: Dados Mostrados na Interface**

- Nome mostrado vem de `agents.name` ou `users.name`?
- Avatar vem de onde? (agents não tem avatar, users têm?)
- Como resolver diferenças de dados?

### **Questão 3: Tipos de Conversa**

```typescript
type ConversationType = "dm" | "agent_chat";

// "dm": Conversa direta user ↔ user
// "agent_chat": Conversa user ↔ agent

// Como distinguir quando usar cada tipo?
// Usar `agentId` field ou apenas participants?
```

## 💡 **Soluções Propostas**

### **Solução 1: Fluxo Agent → User Automático**

```typescript
// Quando criar agente, criar user automaticamente:
class AgentService {
  static async create(
    input: CreateAgentInput,
    ownerId: string,
  ): Promise<SelectAgent> {
    return await db.transaction(async (tx) => {
      // 1. Criar user para o agente
      const [agentUser] = await tx
        .insert(usersTable)
        .values({
          name: input.name,
          type: "agent",
          // outros campos...
        })
        .returning();

      // 2. Criar agente referenciando o user
      const [agent] = await tx
        .insert(agentsTable)
        .values({
          ...input,
          userId: agentUser.id, // ← Vinculação
        })
        .returning();

      return agent;
    });
  }
}
```

### **Solução 2: Query Unificada para Interface**

```typescript
// Buscar agentes JOINed com users:
const agentsWithUsers = await db
  .select({
    agentId: agentsTable.id,
    userId: agentsTable.userId,
    name: usersTable.name, // ← Nome do user
    type: usersTable.type,
    status: agentsTable.status,
    // ...
  })
  .from(agentsTable)
  .innerJoin(usersTable, eq(agentsTable.userId, usersTable.id))
  .where(eq(usersTable.type, "agent"));

// Mapear para interface:
const availableUsers = agentsWithUsers.map((item) => ({
  id: item.userId, // ← CORRETO: users.id para participantId
  name: item.name, // ← Vem do users.name
  agentId: item.agentId, // ← Manter referência do agent
  type: "agent",
}));
```

### **Solução 3: Padronizar Tipos**

```typescript
// ✅ Usar APENAS tipos do backend:
// Remove: /renderer/features/conversation/types.ts CreateConversationInput
// Importa: /main/features/conversation/conversation.types.ts CreateConversationInput

import type { CreateConversationInput } from "@/main/features/conversation/conversation.types";
```

### **Solução 4: Determinar Tipo de Conversa**

```typescript
function handleCreateConversation() {
  const conversationData: CreateConversationInput = {
    participantIds: selectedUserIds, // users.id (não agents.id)
    type: "dm", // Para conversas diretas user↔agent
    name: null,
    // agentId: seria usado apenas para "agent_chat" tipo especial
  };
}
```

## 🎯 **Arquitetura Final Recomendada**

### **1. Fluxo de Criação de Agente**

```
1. User cria Agent → AgentService.create()
2. Sistema cria User automaticamente (type: "agent")
3. Agent.userId → User.id (FK vinculação)
4. Interface lista: Agent JOIN User data
```

### **2. Fluxo de Criação de Conversa**

```
1. Interface mostra: Agents (JOIN Users para nome/dados)
2. User seleciona: Agents (visualmente)
3. Sistema mapeia: Agents.userId → participantIds
4. Database salva: conversation_participants.participantId = Users.id ✅
```

### **3. Estrutura de Dados Unificada**

```typescript
// Tipo unificado para interface:
interface AgentUser {
  userId: string; // users.id (para participantId)
  agentId: string; // agents.id (para referência)
  name: string; // users.name
  type: "agent"; // users.type
  status: AgentStatus; // agents.status
}
```

## ✅ **Próximos Passos**

1. **Confirmar fluxo Agent → User**: Como funciona criação automática?
2. **Implementar query unificada**: Agent JOIN User
3. **Corrigir mapeamentos**: agent.userId → participantId
4. **Padronizar tipos**: Remover duplicações
5. **Testar fluxo completo**: Criar → Listar → Chat

## ❓ **Perguntas para Usuário**

1. **Criação automática**: Agente criado automaticamente cria user correspondente?
2. **Sincronização**: Como manter agent.name ↔ users.name sincronizados?
3. **Avatar**: Agentes têm avatar? Onde armazenar?
4. **Nome de exibição**: Usar agents.name ou users.name na interface?
