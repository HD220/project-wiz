# 14. Plano de Implementação: Schema de Mensagens e Refatoração Users/Accounts

**Versão:** 1.0  
**Status:** Aprovado para Implementação  
**Data:** 2025-07-19  
**Atividade:** 3.1. Schema de Mensagens e Conversas

---

## 🎯 Objetivo

Implementar o sistema de mensagens e conversas (DMs) com arquitetura limpa e refatorar a estrutura de usuários para separar dados de identidade de dados de autenticação, seguindo os princípios KISS e DDD.

## 📋 Mudanças Estruturais Necessárias

### 1. Refatoração da Tabela Users (Breaking Change)

**Situação Atual:**

```typescript
// src/main/user/authentication/users.schema.ts
users {
  id, username, name, avatar, passwordHash, theme, createdAt, updatedAt
}
```

**Nova Estrutura:**

```typescript
// src/main/user/users.schema.ts (movido para raiz do bounded context)
users {
  id, name, avatar, type: "human" | "agent", createdAt, updatedAt
}
```

**Mudanças:**

- ❌ Remove `username` (vai para accounts)
- ❌ Remove `passwordHash` (vai para accounts)
- ❌ Remove `theme` (vai para user_preferences)
- ✅ Adiciona `type` para diferenciar humanos de agentes

### 2. Nova Tabela Accounts (Dados de Autenticação)

```typescript
// src/main/user/authentication/accounts.schema.ts
accounts {
  id,
  userId, // FK para users
  username, // movido de users
  passwordHash, // movido de users
  createdAt,
  updatedAt
}
```

### 3. Nova Tabela User Preferences (Configurações)

```typescript
// src/main/user/profile/user-preferences.schema.ts
user_preferences {
  id,
  userId, // FK para users
  theme: "dark" | "light" | "system",
  language,
  notifications,
  createdAt,
  updatedAt
}
```

### 4. Novo Bounded Context: Conversations

```typescript
// src/main/conversations/conversations.schema.ts
conversations {
  id,
  name, // "Chat com João", "Equipe Frontend"
  description,
  type: "dm", // futuramente pode ter "channel"
  createdAt,
  updatedAt
}

conversation_participants {
  id,
  conversationId, // FK para conversations
  participantId, // FK para users (humano OU agente)
  createdAt,
  updatedAt
}
```

```typescript
// src/main/conversations/messages.schema.ts
messages {
  id,
  conversationId, // FK para conversations
  authorId, // FK para users (humano OU agente)
  content,
  createdAt,
  updatedAt
}

llm_messages {
  id,
  messageId, // FK para messages
  role: "user" | "assistant" | "system" | "tool",
  toolCalls, // JSON string
  metadata, // JSON string
  createdAt,
  updatedAt
}
```

## 🗂️ Estrutura de Arquivos

```
src/main/
├── user/
│   ├── users.schema.ts (refatorado)
│   ├── authentication/
│   │   ├── accounts.schema.ts (novo)
│   │   ├── auth.service.ts (atualizar)
│   │   ├── auth.handlers.ts (atualizar)
│   │   └── auth.types.ts (atualizar)
│   └── profile/
│       ├── user-preferences.schema.ts (novo)
│       ├── profile.service.ts (atualizar)
│       └── profile.handlers.ts (atualizar)
├── conversations/ (novo bounded context)
│   ├── conversations.schema.ts
│   ├── messages.schema.ts
│   ├── conversation.service.ts
│   ├── message.service.ts
│   └── conversations.handlers.ts
└── agents/ (futuro)
    └── agents.schema.ts (dados específicos LLM)
```

## 🔧 Implementação Sequencial

### Fase 1: Preparação e Backup

1. **Backup do banco atual**

   ```bash
   cp src/main/database/dev.db src/main/database/dev.db.backup
   ```

2. **Identificar dependências**
   - AuthService usa users.passwordHash e users.theme
   - ProfileService usa users.theme
   - Todos os IPC handlers que referenciam users

### Fase 2: Refatoração Users + Accounts

#### 2.1 Criar Nova Estrutura Users

```typescript
// src/main/user/users.schema.ts (novo arquivo)
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  avatar: text("avatar"),
  type: text("type").$type<"human" | "agent">().notNull().default("human"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type UpdateUser = Partial<InsertUser> & { id: string };
```

#### 2.2 Criar Tabela Accounts

```typescript
// src/main/user/authentication/accounts.schema.ts
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersTable } from "@/main/user/users.schema";

export const accountsTable = sqliteTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type SelectAccount = typeof accountsTable.$inferSelect;
export type InsertAccount = typeof accountsTable.$inferInsert;
export type UpdateAccount = Partial<InsertAccount> & { id: string };
```

#### 2.3 Criar Tabela User Preferences

```typescript
// src/main/user/profile/user-preferences.schema.ts
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersTable } from "@/main/user/users.schema";

export type Theme = "dark" | "light" | "system";

export const userPreferencesTable = sqliteTable("user_preferences", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  theme: text("theme").$type<Theme>().notNull().default("system"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type SelectUserPreferences = typeof userPreferencesTable.$inferSelect;
export type InsertUserPreferences = typeof userPreferencesTable.$inferInsert;
export type UpdateUserPreferences = Partial<InsertUserPreferences> & {
  id: string;
};
```

### Fase 3: Atualizar Services

#### 3.1 Atualizar AuthService

```typescript
// src/main/user/authentication/auth.service.ts
export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResult> {
    const db = getDatabase();

    // 1. Criar user
    const [user] = await db
      .insert(usersTable)
      .values({
        name: input.name,
        type: "human",
      })
      .returning();

    // 2. Criar account
    const [account] = await db
      .insert(accountsTable)
      .values({
        userId: user.id,
        username: input.username,
        passwordHash: await bcrypt.hash(input.password, 10),
      })
      .returning();

    // 3. Criar preferences
    await db.insert(userPreferencesTable).values({
      userId: user.id,
      theme: "system",
    });

    currentUserId = user.id;
    return { user };
  }

  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    const db = getDatabase();

    // Buscar por username na tabela accounts
    const [account] = await db
      .select({
        account: accountsTable,
        user: usersTable,
      })
      .from(accountsTable)
      .innerJoin(usersTable, eq(accountsTable.userId, usersTable.id))
      .where(eq(accountsTable.username, credentials.username))
      .limit(1);

    // Validar password...
    currentUserId = account.user.id;
    return { user: account.user };
  }
}
```

#### 3.2 Atualizar ProfileService

```typescript
// src/main/user/profile/profile.service.ts
export class ProfileService {
  static async getTheme(userId: string): Promise<Theme> {
    const db = getDatabase();

    const [preferences] = await db
      .select({ theme: userPreferencesTable.theme })
      .from(userPreferencesTable)
      .where(eq(userPreferencesTable.userId, userId))
      .limit(1);

    return preferences?.theme || "system";
  }

  static async updateTheme(userId: string, theme: Theme): Promise<void> {
    const db = getDatabase();

    await db
      .update(userPreferencesTable)
      .set({ theme, updatedAt: new Date() })
      .where(eq(userPreferencesTable.userId, userId));
  }
}
```

### Fase 4: Implementar Conversations

#### 4.1 Criar Schemas de Conversations

```typescript
// src/main/conversations/conversations.schema.ts
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersTable } from "@/main/user/users.schema";

export const conversationsTable = sqliteTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  description: text("description"),
  type: text("type").$type<"dm">().notNull().default("dm"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const conversationParticipantsTable = sqliteTable(
  "conversation_participants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversationsTable.id),
    participantId: text("participant_id")
      .notNull()
      .references(() => usersTable.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
);

export type SelectConversation = typeof conversationsTable.$inferSelect;
export type InsertConversation = typeof conversationsTable.$inferInsert;
export type SelectConversationParticipant =
  typeof conversationParticipantsTable.$inferSelect;
export type InsertConversationParticipant =
  typeof conversationParticipantsTable.$inferInsert;
```

```typescript
// src/main/conversations/messages.schema.ts
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { usersTable } from "@/main/user/users.schema";
import { conversationsTable } from "./conversations.schema";

export const messagesTable = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversationsTable.id),
  authorId: text("author_id")
    .notNull()
    .references(() => usersTable.id),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const llmMessagesTable = sqliteTable("llm_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  messageId: text("message_id")
    .notNull()
    .references(() => messagesTable.id),
  role: text("role")
    .$type<"user" | "assistant" | "system" | "tool">()
    .notNull(),
  toolCalls: text("tool_calls"), // JSON string
  metadata: text("metadata"), // JSON string
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type SelectMessage = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectLlmMessage = typeof llmMessagesTable.$inferSelect;
export type InsertLlmMessage = typeof llmMessagesTable.$inferInsert;
```

#### 4.2 Implementar Services

```typescript
// src/main/conversations/conversation.service.ts
import { getDatabase } from "@/main/database/connection";
import {
  conversationsTable,
  conversationParticipantsTable,
} from "./conversations.schema";
import type {
  SelectConversation,
  InsertConversation,
} from "./conversations.schema";

export interface CreateConversationInput
  extends Omit<InsertConversation, "id" | "createdAt" | "updatedAt"> {
  participantIds: string[];
}

export class ConversationService {
  static async create(
    input: CreateConversationInput,
  ): Promise<SelectConversation> {
    const db = getDatabase();

    const [conversation] = await db
      .insert(conversationsTable)
      .values({
        name: input.name,
        description: input.description,
        type: input.type,
      })
      .returning();

    // Adicionar participantes
    if (input.participantIds.length > 0) {
      await db.insert(conversationParticipantsTable).values(
        input.participantIds.map((participantId) => ({
          conversationId: conversation.id,
          participantId,
        })),
      );
    }

    return conversation;
  }

  static async findByParticipants(
    participantIds: string[],
  ): Promise<SelectConversation | null> {
    const db = getDatabase();

    // Buscar conversa existente entre os participantes
    // Query complexa para encontrar conversas com exatamente esses participantes
    // Implementação específica dependendo dos requisitos exatos

    return null; // Placeholder
  }

  static async getUserConversations(
    userId: string,
  ): Promise<SelectConversation[]> {
    const db = getDatabase();

    return await db
      .select({ conversation: conversationsTable })
      .from(conversationsTable)
      .innerJoin(
        conversationParticipantsTable,
        eq(conversationsTable.id, conversationParticipantsTable.conversationId),
      )
      .where(eq(conversationParticipantsTable.participantId, userId))
      .then((results) => results.map((r) => r.conversation));
  }
}
```

```typescript
// src/main/conversations/message.service.ts
import { getDatabase } from "@/main/database/connection";
import { messagesTable, llmMessagesTable } from "./messages.schema";
import type {
  SelectMessage,
  InsertMessage,
  InsertLlmMessage,
} from "./messages.schema";

export interface SendMessageInput
  extends Omit<InsertMessage, "id" | "createdAt" | "updatedAt"> {}

export interface SendLlmMessageInput {
  messageInput: SendMessageInput;
  llmData: Omit<
    InsertLlmMessage,
    "id" | "messageId" | "createdAt" | "updatedAt"
  >;
}

export class MessageService {
  static async send(input: SendMessageInput): Promise<SelectMessage> {
    const db = getDatabase();

    const [message] = await db.insert(messagesTable).values(input).returning();

    return message;
  }

  static async sendWithLlmData(
    input: SendLlmMessageInput,
  ): Promise<SelectMessage> {
    const db = getDatabase();

    // Inserir mensagem principal
    const [message] = await db
      .insert(messagesTable)
      .values(input.messageInput)
      .returning();

    // Inserir dados LLM associados
    await db.insert(llmMessagesTable).values({
      messageId: message.id,
      ...input.llmData,
    });

    return message;
  }

  static async getConversationMessages(
    conversationId: string,
  ): Promise<SelectMessage[]> {
    const db = getDatabase();

    return await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(asc(messagesTable.createdAt));
  }

  static async getMessageWithLlmData(messageId: string) {
    const db = getDatabase();

    const [result] = await db
      .select({
        message: messagesTable,
        llmMessage: llmMessagesTable,
      })
      .from(messagesTable)
      .leftJoin(
        llmMessagesTable,
        eq(messagesTable.id, llmMessagesTable.messageId),
      )
      .where(eq(messagesTable.id, messageId))
      .limit(1);

    return result;
  }
}
```

### Fase 5: Migração e Testes

#### 5.1 Gerar Migração

```bash
# Remover schema antigo primeiro
rm src/main/user/authentication/users.schema.ts

# Gerar migração
npm run db:generate

# Aplicar migração
npm run db:migrate
```

#### 5.2 Atualizar IPC Handlers

```typescript
// src/main/conversations/conversations.handlers.ts
import { ipcMain } from "electron";
import { ConversationService } from "./conversation.service";
import { MessageService } from "./message.service";
import type { IpcResponse } from "@/main/types";

export function setupConversationsHandlers(): void {
  ipcMain.handle(
    "conversations:create",
    async (_, input: CreateConversationInput): Promise<IpcResponse> => {
      try {
        const conversation = await ConversationService.create(input);
        return { success: true, data: conversation };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create conversation",
        };
      }
    },
  );

  ipcMain.handle(
    "conversations:getUserConversations",
    async (_, userId: string): Promise<IpcResponse> => {
      try {
        const conversations =
          await ConversationService.getUserConversations(userId);
        return { success: true, data: conversations };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get conversations",
        };
      }
    },
  );

  ipcMain.handle(
    "messages:send",
    async (_, input: SendMessageInput): Promise<IpcResponse> => {
      try {
        const message = await MessageService.send(input);
        return { success: true, data: message };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to send message",
        };
      }
    },
  );

  ipcMain.handle(
    "messages:getConversationMessages",
    async (_, conversationId: string): Promise<IpcResponse> => {
      try {
        const messages =
          await MessageService.getConversationMessages(conversationId);
        return { success: true, data: messages };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to get messages",
        };
      }
    },
  );
}
```

#### 5.3 Atualizar Registros

```typescript
// src/main/main.ts - adicionar novo handler
import { setupConversationsHandlers } from "./conversations/conversations.handlers";

app.whenReady().then(() => {
  setupAuthHandlers();
  setupProfileHandlers();
  setupProjectHandlers();
  setupConversationsHandlers(); // Novo
});
```

```typescript
// src/renderer/preload.ts - expor nova API
conversations: {
  create: (input: CreateConversationInput): Promise<IpcResponse> =>
    ipcRenderer.invoke("conversations:create", input),
  getUserConversations: (userId: string): Promise<IpcResponse> =>
    ipcRenderer.invoke("conversations:getUserConversations", userId),
},
messages: {
  send: (input: SendMessageInput): Promise<IpcResponse> =>
    ipcRenderer.invoke("messages:send", input),
  getConversationMessages: (conversationId: string): Promise<IpcResponse> =>
    ipcRenderer.invoke("messages:getConversationMessages", conversationId),
},
```

## 🔄 Migração de Dados Existentes

### Estratégia de Migração

1. **Backup Completo**

   ```bash
   cp src/main/database/dev.db src/main/database/dev.db.backup
   ```

2. **Migração Personalizada**
   - Criar script para migrar dados existentes da tabela `users` para as novas tabelas
   - Preservar IDs existentes para manter integridade referencial

3. **Validação Pós-Migração**
   - Verificar que todos os usuários foram migrados corretamente
   - Testar login com usuários existentes
   - Validar que preferências foram criadas com valores padrão

## 🚨 Riscos e Mitigações

### Riscos Identificados

1. **Breaking Change na Tabela Users**
   - **Risco:** AuthService para de funcionar
   - **Mitigação:** Implementação incremental, testes extensivos

2. **Complexidade da Migração**
   - **Risco:** Perda de dados durante migração
   - **Mitigação:** Backup completo, script de rollback

3. **Dependências em Cascade**
   - **Risco:** Quebrar funcionalidades existentes
   - **Mitigação:** Atualizar todos os services simultaneamente

### Plano de Rollback

1. Restaurar backup do banco de dados
2. Reverter alterações nos services
3. Executar testes de sanidade

## ✅ Checklist de Implementação

### Preparação

- [ ] Backup do banco de dados atual
- [ ] Documentar estado atual dos services
- [ ] Identificar todas as dependências da tabela users

### Schema Changes

- [ ] Criar `src/main/user/users.schema.ts` (refatorado)
- [ ] Criar `src/main/user/authentication/accounts.schema.ts`
- [ ] Criar `src/main/user/profile/user-preferences.schema.ts`
- [ ] Criar `src/main/conversations/conversations.schema.ts`
- [ ] Criar `src/main/conversations/messages.schema.ts`
- [ ] Remover `src/main/user/authentication/users.schema.ts` antigo

### Services Refactor

- [ ] Atualizar `AuthService` para usar accounts + users + user_preferences
- [ ] Atualizar `ProfileService` para usar user_preferences
- [ ] Criar `ConversationService`
- [ ] Criar `MessageService`
- [ ] Atualizar tipos em `auth.types.ts`

### IPC Handlers

- [ ] Atualizar `auth.handlers.ts`
- [ ] Atualizar `profile.handlers.ts`
- [ ] Criar `conversations.handlers.ts`
- [ ] Atualizar `preload.ts` com novas APIs
- [ ] Atualizar `window.d.ts` com tipagem completa

### Migration & Testing

- [ ] Gerar migração com `npm run db:generate`
- [ ] Aplicar migração com `npm run db:migrate`
- [ ] Testar registro de novo usuário
- [ ] Testar login com credenciais existentes
- [ ] Testar criação de conversa
- [ ] Testar envio de mensagem
- [ ] Verificar `npm run quality:check`

### Integration

- [ ] Atualizar `main.ts` para registrar novos handlers
- [ ] Executar testes completos do auth flow
- [ ] Verificar que não há regressões
- [ ] Documentar mudanças no CLAUDE.md

## 📚 Referências

- [3. Camada Backend - Data Layer](./03-camada-backend.md#4-data-layer-persistência-com-drizzle-orm)
- [6. Autenticação e Fluxos de Usuário](./06-autenticacao-e-fluxos-de-usuario.md)
- [8. Funcionalidade: Espaço Pessoal e DMs](./08-funcionalidade-espaco-pessoal-e-dms.md)
- [CLAUDE.md - Database Patterns](../CLAUDE.md#database-patterns)

---

**Próximos Passos:** Após implementação, prosseguir com a atividade 3.2 - Serviço de Mensagens do plano de desenvolvimento.
