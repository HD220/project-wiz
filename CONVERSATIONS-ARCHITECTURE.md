# Arquitetura de Conversas e Usuários

## 🎯 **Conceito Fundamental**

> **Agentes são usuários cidadãos de primeira classe**
>
> Seguindo o padrão Discord/Slack, onde bots aparecem como usuários normais na interface, mas com capacidades especializadas.

## 🏗️ **Arquitetura Implementada**

### **Separação de Responsabilidades**

#### **1. Tabela `users` - Identidade Universal**

```sql
users (
  id,           -- UUID primary key
  name,         -- Display name
  avatar,       -- Profile picture
  type,         -- "human" | "agent"
  created_at,
  updated_at
)
```

- **Humans**: Usuários reais com autenticação
- **Agents**: Entidades IA criadas por usuários
- **Princípio**: Todos que participam de conversas são "users"

#### **2. Tabela `agents` - Configuração IA**

```sql
agents (
  id,            -- UUID primary key
  user_id,       -- FK para users.id (1:1 relationship)
  owner_id,      -- FK para users.id (quem criou o agente)
  provider_id,   -- FK para llm_providers.id
  name,          -- Nome do agente
  role,          -- Papel/função
  backstory,     -- História de fundo
  goal,          -- Objetivo
  system_prompt, -- Prompt do sistema
  model_config,  -- JSON com configurações do modelo
  status,        -- "active" | "inactive" | "busy"
  created_at,
  updated_at
)
```

- **Propósito**: Configuração específica para IA (prompts, modelos, etc.)
- **Relação**: `agent.user_id` → `users.id` (1:1)
- **Ownership**: `agent.owner_id` → `users.id` (quem criou)

#### **3. Tabela `conversations` - Comunicação (LIMPA)**

```sql
conversations (
  id,           -- UUID primary key
  name,         -- Nome opcional da conversa
  description,  -- Descrição opcional
  type,         -- "dm" | "channel"
  created_at,
  updated_at
)
```

**⚠️ IMPORTANTE**:

- **REMOVIDO**: `agent_id` (era inconsistente)
- **Princípio**: Conversas não sabem o que é "agent"

#### **4. Tabela `conversation_participants` - Quem Participa**

```sql
conversation_participants (
  id,              -- UUID primary key
  conversation_id, -- FK para conversations.id
  participant_id,  -- FK para users.id (humans OU agents)
  created_at,
  updated_at
)
```

- **Universal**: `participant_id` sempre aponta para `users.id`
- **Transparente**: Sistema não distingue human vs agent

## 🔄 **Fluxos de Dados**

### **Fluxo: Criação de Agente**

```typescript
1. AgentService.create(input, ownerId)
2. ┌─ Criar entrada em users (type: "agent")
   └─ Criar entrada em agents (user_id: agentUser.id, owner_id: ownerId)
3. Resultado: Agente é usuário + configuração IA
```

### **Fluxo: Listar Usuários para Conversa**

```sql
-- UserService.listAvailableUsers(currentUserId)
SELECT u.id, u.name, u.avatar, u.type FROM users u
JOIN agents a ON u.id = a.user_id
WHERE a.owner_id = currentUserId  -- Meus agentes

UNION ALL

SELECT u.id, u.name, u.avatar, u.type FROM users u
WHERE u.type = 'human' AND u.id != currentUserId  -- Outros humanos
```

**Resultado**: Lista uniforme de "usuários" (meus agents + outros humans)

### **Fluxo: Criar Conversa**

```typescript
1. Frontend: User seleciona usuários da lista
2. ConversationService.create({
     participantIds: [currentUser.id, ...selectedUserIds],
     type: "dm"
   })
3. ┌─ Criar conversation (sem agent_id)
   └─ Adicionar todos como participants via users.id
4. Resultado: Conversa funciona igual para humans/agents
```

### **Fluxo: Autenticação (Humans Only)**

```typescript
-- AuthService filtra apenas type: "human"
SELECT account.*, user.* FROM accounts
JOIN users ON account.user_id = users.id
WHERE account.username = ? AND users.type = 'human'
```

**Segurança**: Apenas humans podem fazer login

## 🎨 **Interface do Usuário**

### **Princípios de UI**

- **Sem badges**: Agentes aparecem como usuários normais
- **Sem distinção visual**: Usuário não precisa saber que são agentes
- **Single source**: Uma lista única de usuários disponíveis
- **Natural**: Interface igual ao Discord/Slack

### **CreateConversationDialog**

```typescript
// Título genérico
<DialogTitle>Start New Conversation</DialogTitle>

// Lista unificada
availableUsers.map(user => (
  <UserItem key={user.id} user={user} />
  // Não distingue se é human ou agent
))

// Busca genérica
<Input placeholder="Search users..." />
```

## 📋 **Status de Implementação**

### ✅ **Completado**

1. **Database Schema**:
   - ❌ Removido `conversations.agent_id`
   - ✅ Mantido schema atual users/agents
   - ✅ Migration aplicada

2. **Backend - UserService**:
   - ✅ Query UNION ALL implementada
   - ✅ `listAvailableUsers()` com ownership
   - ✅ Handler IPC criado

3. **Backend - ConversationService**:
   - ✅ Removido métodos com referência a agents
   - ✅ Zero imports de agents table
   - ✅ Clean separation mantida

4. **Backend - AgentService**:
   - ✅ Cria user + agent em transação
   - ✅ Ownership via `owner_id`

5. **Backend - AuthService**:
   - ✅ Filtro `type: "human"` para login/sessões

### 🔄 **Pendente**

1. **Frontend - Route Loader**:
   - ❌ Ainda usa `api.agents.list()`
   - ✅ Deve usar `api.users.listAvailableUsers()`

2. **Frontend - CreateConversationDialog**:
   - ❌ Verificar se funciona com nova API
   - ❌ Incluir usuário atual nos participantIds

3. **Teste Completo**:
   - ❌ Criar conversa com agente
   - ❌ Verificar se aparece na lista
   - ❌ Testar envio de mensagens

## 🚀 **Próximos Passos**

### **Imediato**

1. Atualizar frontend route loader
2. Ajustar CreateConversationDialog
3. Testar fluxo end-to-end

### **Futuro (Integração LLM)**

```typescript
// Quando implementar respostas de agentes:
if (message.recipientType === "agent") {
  // AgentService detecta mensagem para agente
  // Gera resposta via LLM
  // Salva como message com author_id = agent.user_id
}
```

## 🎯 **Benefícios da Arquitetura**

### **✅ Simplicidade**

- Frontend não conhece "agents" - só "users"
- Uma API única para listar usuários
- Conversas funcionam igual para todos

### **✅ Extensibilidade**

- Base sólida para multi-usuário
- Agentes podem iniciar conversas
- Suporte a channels futuros

### **✅ Consistência**

- Todos são participants via users.id
- Sem confusão agents.id vs users.id
- Padrão Discord/Slack seguido

### **✅ Separação de Concerns**

- **UserService**: Identidade e listagem
- **AgentService**: Configuração IA
- **ConversationService**: Comunicação pura
- **AuthService**: Segurança (humans only)

## 📝 **Regras de Negócio**

### **Ownership**

- **Humans**: Criam e possuem agentes
- **Agents**: Pertencem ao usuário que os criou
- **Visibilidade**: Usuário vê apenas seus agentes + outros humans

### **Conversas**

- **Participantes**: Sempre via users.id (universal)
- **Tipos**: "dm" (1:1) ou "channel" (grupo)
- **Criação**: Frontend inclui usuário atual automaticamente

### **Segurança**

- **Login**: Apenas humans podem autenticar
- **Sessões**: Gerenciadas por AuthService
- **Dados**: Agentes são privados ao criador

---

**Resumo**: Arquitetura limpa onde agentes são usuários com superpoderes, mantendo simplicidade na interface e extensibilidade para o futuro.
