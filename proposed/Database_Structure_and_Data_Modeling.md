# Estrutura do Banco de Dados / Modelagem de Dados

Este documento detalha a estrutura do banco de dados para o Sistema de Fábrica de Software Autônoma Local. Será utilizado um banco de dados **SQLite** devido à sua natureza leve, embutida e sem servidor, ideal para uma aplicação desktop. O **Drizzle ORM** será empregado para uma interação segura e tipada com o banco de dados.

## 1. Justificativa da Escolha do Banco de Dados

*   **SQLite:**
    *   **Leve e Embutido:** Não requer um servidor de banco de dados separado, simplificando a implantação e o gerenciamento para uma aplicação desktop.
    *   **Baseado em Arquivo:** O banco de dados é um único arquivo (`.db`), facilitando backup e portabilidade.
    *   **Confiabilidade:** Robusto e amplamente utilizado em aplicações embarcadas e desktop.
    *   **Desempenho:** Suficiente para as necessidades de persistência local do Project Wiz.

*   **Drizzle ORM:**
    *   **Tipagem Segura:** Oferece tipagem forte para consultas e esquemas, reduzindo erros em tempo de desenvolvimento.
    *   **Produtividade:** Facilita a interação com o banco de dados através de uma API fluente e intuitiva.
    *   **Migrações:** Suporte a migrações de esquema, permitindo evoluir a estrutura do banco de dados de forma controlada.

## 2. Diagrama de Entidade-Relacionamento (ERD) - Descrição Textual

Como não é possível gerar um diagrama visual, o ERD será descrito textualmente, listando as entidades (tabelas), seus atributos (colunas) e os relacionamentos entre elas.

### Entidades (Tabelas)

#### 2.1. `projects`

*   **Descrição:** Armazena informações sobre os projetos de software gerenciados pelo sistema.
*   **Atributos:**
    *   `id` (TEXT, PRIMARY KEY, UUID): Identificador único do projeto.
    *   `name` (TEXT, NOT NULL, UNIQUE): Nome do projeto (ex: "Meu Primeiro App").
    *   `description` (TEXT): Descrição detalhada do projeto.
    *   `local_path` (TEXT, NOT NULL): Caminho absoluto para o diretório local do projeto no sistema de arquivos.
    *   `remote_url` (TEXT): URL do repositório Git remoto associado (opcional).
    *   `created_at` (INTEGER, NOT NULL): Timestamp de criação do projeto.
    *   `updated_at` (INTEGER, NOT NULL): Timestamp da última atualização do projeto.

#### 2.2. `agents`

*   **Descrição:** Armazena informações sobre os agentes de IA configurados no sistema.
*   **Atributos:**
    *   `id` (TEXT, PRIMARY KEY, UUID): Identificador único do agente.
    *   `name` (TEXT, NOT NULL, UNIQUE): Nome do agente (ex: "DevAgent", "DocAgent").
    *   `role` (TEXT, NOT NULL): Papel do agente (ex: "Desenvolvedor", "Documentador", "QA").
    *   `profile` (TEXT): Breve descrição do perfil do agente.
    *   `backstory` (TEXT): História de fundo do agente para enriquecer a persona.
    *   `objective` (TEXT): Objetivo principal do agente.
    *   `description` (TEXT): Descrição geral do agente.
    *   `llm_model` (TEXT, NOT NULL): Modelo de LLM utilizado pelo agente (ex: "gpt-4o", "deepseek-coder").
    *   `config_json` (TEXT): Configurações específicas do agente em formato JSON (ex: temperatura, tokens máximos).
    *   `is_built_in` (INTEGER, NOT NULL, DEFAULT 0): Flag para indicar se o agente é um assistente built-in (0=false, 1=true). Apenas um agente deve ter este valor como 1.
    *   `created_at` (INTEGER, NOT NULL): Timestamp de criação do agente.
    *   `updated_at` (INTEGER, NOT NULL): Timestamp da última atualização do agente.

#### 2.3. `tasks`

*   **Descrição:** Armazena as tarefas atribuídas aos agentes ou ao projeto.
*   **Atributos:**
    *   `id` (TEXT, PRIMARY KEY, UUID): Identificador único da tarefa.
    *   `project_id` (TEXT, NOT NULL): Foreign Key para `projects.id`.
    *   `assigned_agent_id` (TEXT): Foreign Key para `agents.id` (opcional, se a tarefa for atribuída a um agente específico).
    *   `title` (TEXT, NOT NULL): Título da tarefa.
    *   `description` (TEXT): Descrição detalhada da tarefa.
    *   `status` (TEXT, NOT NULL): Status da tarefa (ex: "pending", "in_progress", "completed", "failed").
    *   `priority` (TEXT, NOT NULL): Prioridade da tarefa (ex: "low", "medium", "high", "critical").
    *   `type` (TEXT, NOT NULL): Tipo da tarefa (ex: "feature", "bug", "refactor", "documentation").
    *   `due_date` (INTEGER): Data de vencimento da tarefa (opcional).
    *   `created_at` (INTEGER, NOT NULL): Timestamp de criação da tarefa.
    *   `updated_at` (INTEGER, NOT NULL): Timestamp da última atualização da tarefa.

#### 2.4. `messages`

*   **Descrição:** Armazena todas as mensagens trocadas nos canais de comunicação e mensagens diretas.
*   **Atributos:**
    *   `id` (TEXT, PRIMARY KEY, UUID): Identificador único da mensagem.
    *   `project_id` (TEXT, NOT NULL): Foreign Key para `projects.id`.
    *   `sender_id` (TEXT, NOT NULL): Identificador do remetente (pode ser `user_id` ou `agent_id`).
    *   `sender_type` (TEXT, NOT NULL): Tipo do remetente ("user" ou "agent").
    *   `channel_id` (TEXT, NOT NULL): Identificador do canal ou conversa (UUID).
    *   `content` (TEXT, NOT NULL): Conteúdo da mensagem.
    *   `timestamp` (INTEGER, NOT NULL): Timestamp de envio da mensagem.
    *   `is_read` (INTEGER, NOT NULL, DEFAULT 0): Flag para indicar se a mensagem foi lida (0=false, 1=true).

#### 2.5. `channels`

*   **Descrição:** Armazena informações sobre os canais de comunicação dentro de cada projeto.
*   **Atributos:**
    *   `id` (TEXT, PRIMARY KEY, UUID): Identificador único do canal.
    *   `project_id` (TEXT, NOT NULL): Foreign Key para `projects.id`.
    *   `name` (TEXT, NOT NULL): Nome do canal (ex: "general", "development", "bugs").
    *   `type` (TEXT, NOT NULL): Tipo do canal ("text", "direct_message").
    *   `created_at` (INTEGER, NOT NULL): Timestamp de criação do canal.
    *   `updated_at` (INTEGER, NOT NULL): Timestamp da última atualização do canal.

#### 2.6. `issues`

*   **Descrição:** Armazena informações sobre os issues (bugs, tarefas, melhorias) do projeto.
*   **Atributos:**
    *   `id` (TEXT, PRIMARY KEY, UUID): Identificador único do issue.
    *   `project_id` (TEXT, NOT NULL): Foreign Key para `projects.id`.
    *   `title` (TEXT, NOT NULL): Título do issue.
    *   `description` (TEXT): Descrição detalhada do issue.
    *   `status` (TEXT, NOT NULL): Status do issue (ex: "open", "in_progress", "resolved", "closed").
    *   `priority` (TEXT, NOT NULL): Prioridade do issue (ex: "low", "medium", "high").
    *   `assigned_to_agent_id` (TEXT): Foreign Key para `agents.id` (opcional).
    *   `created_by_user_id` (TEXT): Identificador do usuário que criou o issue (opcional, para futuras extensões).
    *   `created_at` (INTEGER, NOT NULL): Timestamp de criação do issue.
    *   `updated_at` (INTEGER, NOT NULL): Timestamp da última atualização do issue.

#### 2.7. `sprints`

*   **Descrição:** Armazena informações sobre os sprints do projeto.
*   **Atributos:**
    *   `id` (TEXT, PRIMARY KEY, UUID): Identificador único do sprint.
    *   `project_id` (TEXT, NOT NULL): Foreign Key para `projects.id`.
    *   `name` (TEXT, NOT NULL): Nome do sprint (ex: "Sprint 1").
    *   `start_date` (INTEGER, NOT NULL): Data de início do sprint.
    *   `end_date` (INTEGER, NOT NULL): Data de término do sprint.
    *   `status` (TEXT, NOT NULL): Status do sprint (ex: "planned", "active", "completed").
    *   `created_at` (INTEGER, NOT NULL): Timestamp de criação do sprint.
    *   `updated_at` (INTEGER, NOT NULL): Timestamp da última atualização do sprint.

#### 2.8. `sprint_issues` (Tabela de Junção)

*   **Descrição:** Relaciona issues a sprints.
*   **Atributos:**
    *   `sprint_id` (TEXT, PRIMARY KEY, Foreign Key para `sprints.id`)
    *   `issue_id` (TEXT, PRIMARY KEY, Foreign Key para `issues.id`)

### Relacionamentos

*   `projects` 1 -- N `tasks` (Um projeto pode ter muitas tarefas)
*   `projects` 1 -- N `messages` (Um projeto pode ter muitas mensagens)
*   `projects` 1 -- N `channels` (Um projeto pode ter muitos canais)
*   `projects` 1 -- N `issues` (Um projeto pode ter muitos issues)
*   `projects` 1 -- N `sprints` (Um projeto pode ter muitos sprints)
*   `agents` 1 -- N `tasks` (Um agente pode ser atribuído a muitas tarefas)
*   `agents` 1 -- N `issues` (Um agente pode ser atribuído a muitos issues)
*   `channels` 1 -- N `messages` (Um canal pode ter muitas mensagens)
*   `sprints` N -- M `issues` (Um sprint pode ter muitos issues, e um issue pode estar em muitos sprints - via `sprint_issues`)

## 3. Esquema do Banco de Dados (Exemplo Drizzle ORM)

```typescript
// src/main/persistence/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull().unique(),
  description: text('description'),
  localPath: text('local_path').notNull(),
  remoteUrl: text('remote_url'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull().unique(),
  description: text('description'),
  llmModel: text('llm_model').notNull(),
  configJson: text('config_json'), // JSON string
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  assignedAgentId: text('assigned_agent_id').references(() => agents.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull(), // e.g., 'pending', 'in_progress', 'completed', 'failed'
  priority: text('priority').notNull(), // e.g., 'low', 'medium', 'high', 'critical'
  type: text('type').notNull(), // e.g., 'feature', 'bug', 'refactor', 'documentation'
  dueDate: integer('due_date'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  senderId: text('sender_id').notNull(), // User ID or Agent ID
  senderType: text('sender_type').notNull(), // 'user' or 'agent'
  channelId: text('channel_id').notNull(), // UUID for channel or direct message conversation
  content: text('content').notNull(),
  timestamp: integer('timestamp').notNull(),
  isRead: integer('is_read').notNull().default(0), // 0 for false, 1 for true
});

export const channels = sqliteTable('channels', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'text' or 'direct_message'
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const issues = sqliteTable('issues', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull(), // e.g., 'open', 'in_progress', 'resolved', 'closed'
  priority: text('priority').notNull(), // e.g., 'low', 'medium', 'high'
  assignedToAgentId: text('assigned_to_agent_id').references(() => agents.id),
  createdByUserId: text('created_by_user_id'), // Optional, for future user management
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const sprints = sqliteTable('sprints', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  startDate: integer('start_date').notNull(),
  endDate: integer('end_date').notNull(),
  status: text('status').notNull(), // e.g., 'planned', 'active', 'completed'
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const sprintIssues = sqliteTable('sprint_issues', {
  sprintId: text('sprint_id').notNull().references(() => sprints.id),
  issueId: text('issue_id').notNull().references(() => issues.id),
});
```

## 4. Considerações sobre Persistência

*   **UUIDs:** Todos os IDs serão UUIDs (Universally Unique Identifiers) para garantir unicidade global e facilitar a distribuição futura, se necessário.
*   **Timestamps:** `created_at` e `updated_at` serão armazenados como inteiros (Unix timestamps) para facilitar a ordenação e manipulação.
*   **JSON para Configurações:** Campos como `config_json` em `agents` permitirão armazenar configurações flexíveis em formato JSON.
*   **Migrações:** Qualquer alteração no esquema DEVE ser acompanhada por uma nova migração do Drizzle ORM para garantir a compatibilidade e a evolução controlada do banco de dados.
*   **Transações:** Operações que envolvem múltiplas inserções/atualizações DEVE ser encapsuladas em transações para garantir a atomicidade e a consistência dos dados.
