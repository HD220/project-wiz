# useReactiveQuery - Exemplos de Uso

Este arquivo documenta exemplos práticos de como usar o hook `useReactiveQuery` para criar interfaces reativas no Project Wiz.

## Conceitos Básicos

O `useReactiveQuery` substitui o `useQuery` tradicional adicionando capacidades reativas automáticas. Quando eventos relevantes são emitidos no main process, o hook automaticamente invalida e refaz a query.

### Padrão de Eventos

- **Domain**: `messages`, `conversations`, `users`, `agents`, etc.
- **Action**: `sent`, `created`, `updated`, `typing-start`, etc.
- **Key**: Identificador específico do recurso (dmId, userId, etc.)

## Exemplos Práticos

### 1. Lista de Mensagens (Básico)

```typescript
import { useReactiveQuery } from "@/renderer/hooks/use-reactive-query.hook";

function ChatMessages({ dmId }: { dmId: string }) {
  const { data: messages, isLoading } = useReactiveQuery({
    domain: "messages",     // Escuta eventos "event:messages"
    key: dmId,             // Filtra apenas eventos onde data.key === dmId
    queryFn: () => window.api.dm.listMessages({ dmId }),
  });

  if (isLoading) return <div>Carregando mensagens...</div>;
  
  return (
    <div>
      {messages?.map(message => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
  );
}
```

**Reatividade**: Automaticamente recarrega quando:
- `emitEvent("messages", "sent", { key: dmId, ... })`
- `emitEvent("messages", "edited", { key: dmId, ... })`
- `emitEvent("messages", "deleted", { key: dmId, ... })`

### 2. Typing Indicators (Filtro por Action)

```typescript
function TypingIndicators({ dmId }: { dmId: string }) {
  const { data: typingUsers } = useReactiveQuery({
    domain: "messages",
    action: "typing-start",  // Apenas eventos de typing-start
    key: dmId,
    queryFn: () => getCurrentTypingUsers(dmId),
    queryOptions: {
      refetchInterval: false, // Reativo puro, sem polling
      staleTime: 0,          // Sempre considerado stale
    }
  });

  if (!typingUsers?.length) return null;

  return (
    <div className="typing-indicator">
      {typingUsers.map(user => `${user.name} está digitando...`).join(", ")}
    </div>
  );
}
```

**Reatividade**: Responde especificamente a:
- `emitEvent("messages", "typing-start", { key: dmId, userId: "..." })`

### 3. Lista de Conversas (Global)

```typescript
function ConversationsList() {
  const { data: conversations } = useReactiveQuery({
    domain: "conversations",  // Escuta todos eventos de conversations
    // Sem key = escuta eventos globais do domain
    queryFn: () => window.api.dm.list({ includeArchived: false }),
  });

  return (
    <div>
      {conversations?.map(conv => (
        <ConversationCard key={conv.id} conversation={conv} />
      ))}
    </div>
  );
}
```

**Reatividade**: Recarrega quando:
- `emitEvent("conversations", "created", { key: "any-dm-id", ... })`
- `emitEvent("conversations", "archived", { key: "any-dm-id" })`
- `emitEvent("conversations", "message-sent", { key: "any-dm-id", ... })`

### 4. Status de Usuários

```typescript
function UserStatusIndicator({ userId }: { userId: string }) {
  const { data: user } = useReactiveQuery({
    domain: "users",
    action: "status-changed",  // Apenas mudanças de status
    key: userId,
    queryFn: () => window.api.user.get({ userId }),
    queryOptions: {
      staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    }
  });

  return (
    <div className={`status-${user?.status}`}>
      {user?.name} - {user?.status}
    </div>
  );
}
```

### 5. Combinando Múltiplas Reatividades

```typescript
function ChatRoom({ dmId }: { dmId: string }) {
  // Mensagens do chat
  const messages = useReactiveQuery({
    domain: "messages",
    key: dmId,
    queryFn: () => window.api.dm.listMessages({ dmId }),
  });

  // Participantes do chat
  const participants = useReactiveQuery({
    domain: "conversations",
    action: "participant-added", // Reage a mudanças de participantes
    key: dmId,
    queryFn: () => window.api.dm.get({ dmId }).then(dm => dm.participants),
  });

  // Status de typing
  const typing = useReactiveQuery({
    domain: "messages",
    action: "typing-start",
    key: dmId,
    queryFn: () => getCurrentTypingUsers(dmId),
  });

  return (
    <div>
      <ParticipantsList participants={participants.data} />
      <MessagesList messages={messages.data} />
      <TypingIndicators users={typing.data} />
      <MessageInput dmId={dmId} />
    </div>
  );
}
```

## Hook Simplificado

Para casos básicos, use `useSimpleReactiveQuery`:

```typescript
function UsersList() {
  const { data: users } = useSimpleReactiveQuery(
    "users",
    () => window.api.user.list()
  );

  return <div>{/* render users */}</div>;
}
```

## Dicas de Performance

### 1. Use `staleTime` adequadamente
```typescript
// Para dados que mudam raramente
const agents = useReactiveQuery({
  domain: "agents",
  queryFn: () => window.api.agent.list(),
  queryOptions: {
    staleTime: 1000 * 60 * 10, // 10 minutos
  }
});
```

### 2. Filtre eventos específicos quando possível
```typescript
// ✅ Melhor - filtra apenas eventos relevantes
const newMessages = useReactiveQuery({
  domain: "messages",
  action: "sent", // Apenas mensagens novas
  key: dmId,
  queryFn: () => getUnreadMessages(dmId),
});

// ❌ Evitar - escuta todos eventos de messages
const newMessages = useReactiveQuery({
  domain: "messages",
  key: dmId,
  queryFn: () => getUnreadMessages(dmId),
});
```

### 3. Combine com React.memo para otimizar renders
```typescript
const ChatMessage = React.memo(({ message }: { message: Message }) => {
  return <div>{message.content}</div>;
});
```

## Debugging

Para debuggar eventos reativos, adicione logs:

```typescript
const messages = useReactiveQuery({
  domain: "messages",
  key: dmId,
  queryFn: () => {
    console.log(`Fetching messages for DM ${dmId}`);
    return window.api.dm.listMessages({ dmId });
  },
});
```

Os logs do hook aparecem automaticamente no console com prefix `use-reactive-query`.

## Migração de useQuery

Para migrar queries existentes:

```typescript
// ❌ Antes (useQuery tradicional)
const { data } = useQuery({
  queryKey: ["messages", dmId],
  queryFn: () => window.api.dm.listMessages({ dmId }),
});

// ✅ Depois (useReactiveQuery)
const { data } = useReactiveQuery({
  domain: "messages",
  key: dmId,
  queryFn: () => window.api.dm.listMessages({ dmId }),
});
```

A API é quase idêntica, apenas mudando `queryKey` para `domain`/`key`.