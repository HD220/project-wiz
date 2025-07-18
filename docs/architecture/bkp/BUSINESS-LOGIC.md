# Project Wiz: Business Logic e Services

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17

---

## 🎯 Visão Geral da Camada de Negócio

A camada de **Business Logic** no Project Wiz é implementada através de **Services** que encapsulam as regras de negócio da aplicação. Cada service é responsável por:

1. **Validação de dados** - Usando Zod schemas
2. **Regras de negócio** - Lógica específica do domínio
3. **Orquestração** - Coordenação entre diferentes operações
4. **Persistência** - Interação com o banco de dados
5. **Events** - Publicação de eventos de domínio
6. **Error handling** - Tratamento específico de erros

---

## 🏗️ Arquitetura dos Services

### Padrão de Service

```typescript
// Padrão básico de um service
export class DomainService {
  /**
   * Operação principal do domínio
   * 1. Validação de entrada
   * 2. Verificação de regras de negócio
   * 3. Operação no banco de dados
   * 4. Publicação de eventos
   * 5. Retorno dos dados
   */
  static async mainOperation(input: InputType): Promise<OutputType> {
    // 1. Validação
    const validated = ValidationSchema.parse(input);

    // 2. Regras de negócio
    await this.validateBusinessRules(validated);

    // 3. Operação no banco
    const result = await this.persistData(validated);

    // 4. Eventos
    await this.publishEvents(result);

    // 5. Retorno
    return result;
  }

  private static async validateBusinessRules(
    data: ValidatedInput,
  ): Promise<void> {
    // Validações específicas do domínio
  }

  private static async persistData(data: ValidatedInput): Promise<OutputType> {
    // Operações no banco de dados
  }

  private static async publishEvents(data: OutputType): Promise<void> {
    // Publicação de eventos de domínio
  }
}
```

### Estrutura de Diretório

```
src/main/services/
├── auth-service.ts         # Autenticação e autorização
├── user-service.ts         # Gestão de usuários
├── agent-service.ts        # Lógica de agentes IA
├── project-service.ts      # Gestão de projetos
├── channel-service.ts      # Canais de comunicação
├── chat-service.ts         # Sistema de chat
├── forum-service.ts        # Fóruns de discussão
├── issue-service.ts        # Sistema de issues
├── git-service.ts          # Integração Git
└── llm-service.ts          # Integração com LLMs
```

---

## 👤 User Service

### Responsabilidades

- Gestão do perfil do usuário
- Configurações e preferências
- Histórico de atividades
- Relacionamentos com projetos

### Implementation

```typescript
// src/main/services/user-service.ts
import { eq } from "drizzle-orm";
import { db } from "../database/connection";
import { users } from "../database/schema";
import {
  UpdateUserSchema,
  type UpdateUserInput,
  type User,
} from "../../shared/types/user";

export class UserService {
  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(
    userId: string,
    input: UpdateUserInput,
  ): Promise<User> {
    // Validação
    const validated = UpdateUserSchema.parse(input);

    // Verificar se usuário existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      throw new NotFoundError("User", userId);
    }

    // Verificar unicidade de username/email se alterados
    if (validated.username && validated.username !== existingUser.username) {
      await this.validateUniqueUsername(validated.username);
    }

    if (validated.email && validated.email !== existingUser.email) {
      await this.validateUniqueEmail(validated.email);
    }

    // Atualizar no banco
    const updatedUser = {
      ...validated,
      updatedAt: new Date(),
    };

    await db.update(users).set(updatedUser).where(eq(users.id, userId));

    // Buscar usuário atualizado
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Publicar evento
    await this.publishUserUpdatedEvent(user!);

    return user!;
  }

  /**
   * Atualizar preferências do usuário
   */
  static async updatePreferences(
    userId: string,
    preferences: Record<string, any>,
  ): Promise<void> {
    await db
      .update(users)
      .set({
        preferences: JSON.stringify(preferences),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await this.publishUserPreferencesUpdatedEvent(userId, preferences);
  }

  /**
   * Buscar usuário por ID
   */
  static async findById(userId: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) return null;

    // Remover campos sensíveis
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Desativar conta do usuário
   */
  static async deactivateAccount(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await this.publishUserDeactivatedEvent(userId);
  }

  // Métodos privados de validação
  private static async validateUniqueUsername(username: string): Promise<void> {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existingUser) {
      throw new ValidationError("Username already exists");
    }
  }

  private static async validateUniqueEmail(email: string): Promise<void> {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new ValidationError("Email already exists");
    }
  }

  // Métodos de eventos
  private static async publishUserUpdatedEvent(user: User): Promise<void> {
    await EventBus.publish("user.updated", {
      userId: user.id,
      timestamp: new Date(),
    });
  }

  private static async publishUserPreferencesUpdatedEvent(
    userId: string,
    preferences: Record<string, any>,
  ): Promise<void> {
    await EventBus.publish("user.preferences.updated", {
      userId,
      preferences,
      timestamp: new Date(),
    });
  }

  private static async publishUserDeactivatedEvent(
    userId: string,
  ): Promise<void> {
    await EventBus.publish("user.deactivated", {
      userId,
      timestamp: new Date(),
    });
  }
}
```

---

## 🤖 Agent Service

### Responsabilidades

- Criação e configuração de agentes IA
- Gerenciamento do ciclo de vida dos agentes
- Atribuição de agentes a projetos
- Controle de status e disponibilidade

### Implementation

```typescript
// src/main/services/agent-service.ts
import { eq, and } from "drizzle-orm";
import { db } from "../database/connection";
import { agents, projectAgents } from "../database/schema";
import {
  CreateAgentSchema,
  type CreateAgentInput,
  type Agent,
} from "../../shared/types/agent";
import { AgentWorker } from "../workers/agent-worker";

export class AgentService {
  /**
   * Criar novo agente
   */
  static async create(
    input: CreateAgentInput,
    createdBy: string,
  ): Promise<Agent> {
    // Validação
    const validated = CreateAgentSchema.parse(input);

    // Verificar limites do usuário
    await this.validateAgentLimits(createdBy);

    // Validar configuração LLM
    await this.validateLLMConfiguration(validated);

    // Criar agente
    const newAgent = {
      id: generateId(),
      ...validated,
      systemPrompt:
        validated.systemPrompt || this.generateDefaultSystemPrompt(validated),
      status: "offline" as const,
      isGlobal: true,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(agents).values(newAgent);

    // Iniciar worker do agente
    await AgentWorker.start(newAgent.id);

    // Atualizar status para online
    await this.updateStatus(newAgent.id, "online");

    // Publicar evento
    await this.publishAgentCreatedEvent(newAgent);

    return { ...newAgent, status: "online" };
  }

  /**
   * Adicionar agente a projeto
   */
  static async addToProject(
    agentId: string,
    projectId: string,
    role: string = "developer",
    addedBy: string,
  ): Promise<void> {
    // Verificar se agente existe
    const agent = await this.findById(agentId);
    if (!agent) {
      throw new NotFoundError("Agent", agentId);
    }

    // Verificar se projeto existe
    const project = await ProjectService.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project", projectId);
    }

    // Verificar se já está no projeto
    const existing = await db.query.projectAgents.findFirst({
      where: and(
        eq(projectAgents.agentId, agentId),
        eq(projectAgents.projectId, projectId),
      ),
    });

    if (existing && existing.isActive) {
      throw new ValidationError("Agent already in project");
    }

    // Adicionar ao projeto
    if (existing) {
      // Reativar se existir mas estiver inativo
      await db
        .update(projectAgents)
        .set({
          isActive: true,
          role,
          addedBy,
          addedAt: new Date(),
          removedAt: null,
        })
        .where(
          and(
            eq(projectAgents.agentId, agentId),
            eq(projectAgents.projectId, projectId),
          ),
        );
    } else {
      // Criar novo relacionamento
      await db.insert(projectAgents).values({
        agentId,
        projectId,
        role,
        permissions: JSON.stringify(["read", "write"]),
        isActive: true,
        addedBy,
        addedAt: new Date(),
      });
    }

    // Notificar worker do agente sobre novo projeto
    await AgentWorker.notifyProjectAdded(agentId, projectId);

    // Publicar evento
    await this.publishAgentAddedToProjectEvent(agentId, projectId, role);
  }

  /**
   * Remover agente de projeto
   */
  static async removeFromProject(
    agentId: string,
    projectId: string,
  ): Promise<void> {
    await db
      .update(projectAgents)
      .set({
        isActive: false,
        removedAt: new Date(),
      })
      .where(
        and(
          eq(projectAgents.agentId, agentId),
          eq(projectAgents.projectId, projectId),
        ),
      );

    // Notificar worker
    await AgentWorker.notifyProjectRemoved(agentId, projectId);

    // Publicar evento
    await this.publishAgentRemovedFromProjectEvent(agentId, projectId);
  }

  /**
   * Atualizar status do agente
   */
  static async updateStatus(
    agentId: string,
    status: AgentStatus,
  ): Promise<void> {
    await db
      .update(agents)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));

    // Notificar worker se necessário
    if (status === "offline") {
      await AgentWorker.stop(agentId);
    } else if (status === "online") {
      await AgentWorker.start(agentId);
    }

    await this.publishAgentStatusChangedEvent(agentId, status);
  }

  /**
   * Buscar agentes globais do usuário
   */
  static async listGlobal(userId: string): Promise<Agent[]> {
    return await db.query.agents.findMany({
      where: and(eq(agents.createdBy, userId), eq(agents.isGlobal, true)),
      orderBy: [agents.createdAt],
    });
  }

  /**
   * Buscar agentes de um projeto
   */
  static async listByProject(projectId: string): Promise<Agent[]> {
    const projectAgentsList = await db.query.projectAgents.findMany({
      where: and(
        eq(projectAgents.projectId, projectId),
        eq(projectAgents.isActive, true),
      ),
      with: {
        agent: true,
      },
    });

    return projectAgentsList.map((pa) => pa.agent);
  }

  /**
   * Buscar agente por ID
   */
  static async findById(agentId: string): Promise<Agent | null> {
    return await db.query.agents.findFirst({
      where: eq(agents.id, agentId),
    });
  }

  // Métodos privados de validação
  private static async validateAgentLimits(userId: string): Promise<void> {
    const userAgents = await this.listGlobal(userId);

    // Limite máximo de agentes por usuário (configurável)
    const MAX_AGENTS_PER_USER = 10;

    if (userAgents.length >= MAX_AGENTS_PER_USER) {
      throw new ValidationError(
        `Maximum of ${MAX_AGENTS_PER_USER} agents per user`,
      );
    }
  }

  private static async validateLLMConfiguration(
    config: CreateAgentInput,
  ): Promise<void> {
    // Validar provider e modelo
    const validProviders = ["openai", "deepseek"];
    if (!validProviders.includes(config.llmProvider || "deepseek")) {
      throw new ValidationError("Invalid LLM provider");
    }

    // Validar temperatura
    if (
      config.temperature &&
      (config.temperature < 0 || config.temperature > 2)
    ) {
      throw new ValidationError("Temperature must be between 0 and 2");
    }

    // Validar maxTokens
    if (config.maxTokens && (config.maxTokens < 1 || config.maxTokens > 8000)) {
      throw new ValidationError("Max tokens must be between 1 and 8000");
    }
  }

  private static generateDefaultSystemPrompt(agent: CreateAgentInput): string {
    return `You are ${agent.name}, a ${agent.role} AI assistant.
    
Your expertise includes: ${agent.expertise?.join(", ") || "general software development"}.

Your role is to help with software development tasks including:
- Writing and reviewing code
- Suggesting improvements
- Debugging issues
- Documenting features
- Planning implementations

Always be helpful, professional, and focused on delivering high-quality solutions.`;
  }

  // Métodos de eventos
  private static async publishAgentCreatedEvent(agent: Agent): Promise<void> {
    await EventBus.publish("agent.created", {
      agentId: agent.id,
      name: agent.name,
      role: agent.role,
      createdBy: agent.createdBy,
      timestamp: new Date(),
    });
  }

  private static async publishAgentAddedToProjectEvent(
    agentId: string,
    projectId: string,
    role: string,
  ): Promise<void> {
    await EventBus.publish("agent.added_to_project", {
      agentId,
      projectId,
      role,
      timestamp: new Date(),
    });
  }

  private static async publishAgentRemovedFromProjectEvent(
    agentId: string,
    projectId: string,
  ): Promise<void> {
    await EventBus.publish("agent.removed_from_project", {
      agentId,
      projectId,
      timestamp: new Date(),
    });
  }

  private static async publishAgentStatusChangedEvent(
    agentId: string,
    status: AgentStatus,
  ): Promise<void> {
    await EventBus.publish("agent.status_changed", {
      agentId,
      status,
      timestamp: new Date(),
    });
  }
}
```

---

## 📁 Project Service

### Responsabilidades

- Criação e gestão de projetos
- Configuração de repositórios Git
- Gerenciamento de membros (usuários e agentes)
- Configurações e permissões do projeto

### Implementation

```typescript
// src/main/services/project-service.ts
import { eq, and } from "drizzle-orm";
import { db } from "../database/connection";
import { projects, channels, projectAgents } from "../database/schema";
import {
  CreateProjectSchema,
  type CreateProjectInput,
  type Project,
} from "../../shared/types/project";
import { GitService } from "./git-service";

export class ProjectService {
  /**
   * Criar novo projeto
   */
  static async create(
    input: CreateProjectInput,
    ownerId: string,
  ): Promise<Project> {
    // Validação
    const validated = CreateProjectSchema.parse(input);

    // Verificar limites do usuário
    await this.validateProjectLimits(ownerId);

    // Validar nome único
    await this.validateUniqueName(validated.name, ownerId);

    // Criar projeto
    const newProject = {
      id: generateId(),
      ...validated,
      status: "active" as const,
      visibility: "private" as const,
      settings: JSON.stringify({}),
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(projects).values(newProject);

    // Criar canal padrão
    await this.createDefaultChannels(newProject.id, ownerId);

    // Configurar Git se URL fornecida
    if (validated.gitUrl) {
      try {
        await GitService.cloneRepository(newProject.id, validated.gitUrl);
      } catch (error) {
        // Log error mas não falha a criação do projeto
        console.error("Failed to clone repository:", error);
      }
    } else {
      // Inicializar repositório vazio
      await GitService.initRepository(newProject.id);
    }

    // Publicar evento
    await this.publishProjectCreatedEvent(newProject);

    return newProject;
  }

  /**
   * Buscar projeto por ID
   */
  static async findById(projectId: string): Promise<Project | null> {
    return await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });
  }

  /**
   * Buscar projetos do usuário
   */
  static async findByUser(userId: string): Promise<Project[]> {
    return await db.query.projects.findMany({
      where: and(eq(projects.ownerId, userId), eq(projects.status, "active")),
      orderBy: [projects.updatedAt],
    });
  }

  /**
   * Atualizar projeto
   */
  static async update(
    projectId: string,
    input: UpdateProjectInput,
    userId: string,
  ): Promise<Project> {
    // Validação
    const validated = UpdateProjectSchema.parse(input);

    // Verificar permissões
    await this.validateProjectPermissions(projectId, userId, "admin");

    // Validar nome único se alterado
    if (validated.name) {
      await this.validateUniqueName(validated.name, userId, projectId);
    }

    // Atualizar projeto
    const updatedProject = {
      ...validated,
      updatedAt: new Date(),
    };

    await db
      .update(projects)
      .set(updatedProject)
      .where(eq(projects.id, projectId));

    // Buscar projeto atualizado
    const project = await this.findById(projectId);

    // Publicar evento
    await this.publishProjectUpdatedEvent(project!);

    return project!;
  }

  /**
   * Arquivar projeto
   */
  static async archive(projectId: string, userId: string): Promise<void> {
    // Verificar permissões
    await this.validateProjectPermissions(projectId, userId, "owner");

    await db
      .update(projects)
      .set({
        status: "archived",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // Parar todos os agentes do projeto
    const projectAgentsList = await AgentService.listByProject(projectId);
    for (const agent of projectAgentsList) {
      await AgentService.removeFromProject(agent.id, projectId);
    }

    await this.publishProjectArchivedEvent(projectId);
  }

  /**
   * Deletar projeto
   */
  static async delete(projectId: string, userId: string): Promise<void> {
    // Verificar permissões
    await this.validateProjectPermissions(projectId, userId, "owner");

    // Soft delete
    await db
      .update(projects)
      .set({
        status: "deleted",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    await this.publishProjectDeletedEvent(projectId);
  }

  // Métodos privados
  private static async validateProjectLimits(userId: string): Promise<void> {
    const userProjects = await this.findByUser(userId);

    // Limite máximo de projetos por usuário
    const MAX_PROJECTS_PER_USER = 50;

    if (userProjects.length >= MAX_PROJECTS_PER_USER) {
      throw new ValidationError(
        `Maximum of ${MAX_PROJECTS_PER_USER} projects per user`,
      );
    }
  }

  private static async validateUniqueName(
    name: string,
    userId: string,
    excludeProjectId?: string,
  ): Promise<void> {
    const existing = await db.query.projects.findFirst({
      where: and(
        eq(projects.ownerId, userId),
        eq(projects.name, name),
        excludeProjectId ? ne(projects.id, excludeProjectId) : undefined,
      ),
    });

    if (existing) {
      throw new ValidationError("Project name already exists");
    }
  }

  private static async validateProjectPermissions(
    projectId: string,
    userId: string,
    requiredLevel: "owner" | "admin" | "member" | "viewer",
  ): Promise<void> {
    const project = await this.findById(projectId);

    if (!project) {
      throw new NotFoundError("Project", projectId);
    }

    // Owner sempre tem permissão
    if (project.ownerId === userId) {
      return;
    }

    // TODO: Implementar sistema de permissões mais granular
    // Por enquanto, apenas owner pode fazer alterações
    if (requiredLevel === "owner") {
      throw new AuthorizationError(
        "Only project owner can perform this action",
      );
    }
  }

  private static async createDefaultChannels(
    projectId: string,
    createdBy: string,
  ): Promise<void> {
    const defaultChannels = [
      { name: "general", description: "General discussion", position: 0 },
      {
        name: "development",
        description: "Development discussion",
        position: 1,
      },
      { name: "random", description: "Random conversations", position: 2 },
    ];

    for (const channel of defaultChannels) {
      await db.insert(channels).values({
        id: generateId(),
        projectId,
        ...channel,
        type: "text",
        isPrivate: false,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // Métodos de eventos
  private static async publishProjectCreatedEvent(
    project: Project,
  ): Promise<void> {
    await EventBus.publish("project.created", {
      projectId: project.id,
      name: project.name,
      ownerId: project.ownerId,
      timestamp: new Date(),
    });
  }

  private static async publishProjectUpdatedEvent(
    project: Project,
  ): Promise<void> {
    await EventBus.publish("project.updated", {
      projectId: project.id,
      name: project.name,
      timestamp: new Date(),
    });
  }

  private static async publishProjectArchivedEvent(
    projectId: string,
  ): Promise<void> {
    await EventBus.publish("project.archived", {
      projectId,
      timestamp: new Date(),
    });
  }

  private static async publishProjectDeletedEvent(
    projectId: string,
  ): Promise<void> {
    await EventBus.publish("project.deleted", {
      projectId,
      timestamp: new Date(),
    });
  }
}
```

---

## 💬 Chat Service

### Responsabilidades

- Processamento de mensagens
- Análise de intenções com IA
- Roteamento para agentes apropriados
- Geração de respostas automáticas

### Implementation

```typescript
// src/main/services/chat-service.ts
import { eq, and, desc } from "drizzle-orm";
import { db } from "../database/connection";
import { messages, dmConversations, channels } from "../database/schema";
import {
  SendMessageSchema,
  type SendMessageInput,
  type Message,
} from "../../shared/types/message";
import { LLMService } from "./llm-service";
import { AgentWorker } from "../workers/agent-worker";

export class ChatService {
  /**
   * Enviar mensagem
   */
  static async sendMessage(
    input: SendMessageInput,
    authorId: string,
  ): Promise<Message> {
    // Validação
    const validated = SendMessageSchema.parse(input);

    // Verificar se é canal ou DM
    if (validated.channelId) {
      await this.validateChannelAccess(validated.channelId, authorId);
    } else if (validated.dmConversationId) {
      await this.validateDMAccess(validated.dmConversationId, authorId);
    } else {
      throw new ValidationError(
        "Either channelId or dmConversationId must be provided",
      );
    }

    // Criar mensagem
    const newMessage = {
      id: generateId(),
      ...validated,
      authorId,
      authorType: "user" as const,
      createdAt: new Date(),
    };

    await db.insert(messages).values(newMessage);

    // Atualizar última mensagem na conversa DM
    if (validated.dmConversationId) {
      await this.updateDMLastMessage(validated.dmConversationId);
    }

    // Processar mensagem para possíveis ações
    await this.processMessageForActions(newMessage);

    // Publicar evento
    await this.publishMessageSentEvent(newMessage);

    return newMessage;
  }

  /**
   * Processar mensagem de agente
   */
  static async sendAgentMessage(
    agentId: string,
    content: string,
    channelId?: string,
    dmConversationId?: string,
    messageType: MessageType = "text",
  ): Promise<Message> {
    const newMessage = {
      id: generateId(),
      content,
      channelId,
      dmConversationId,
      authorId: agentId,
      authorType: "agent" as const,
      messageType,
      createdAt: new Date(),
    };

    await db.insert(messages).values(newMessage);

    // Atualizar DM se necessário
    if (dmConversationId) {
      await this.updateDMLastMessage(dmConversationId);
    }

    await this.publishMessageSentEvent(newMessage);

    return newMessage;
  }

  /**
   * Listar mensagens de canal
   */
  static async listByChannel(
    channelId: string,
    options: { limit?: number; before?: string } = {},
  ): Promise<Message[]> {
    const { limit = 50, before } = options;

    let query = db.query.messages.findMany({
      where: and(
        eq(messages.channelId, channelId),
        before ? lt(messages.createdAt, new Date(before)) : undefined,
      ),
      orderBy: [desc(messages.createdAt)],
      limit,
    });

    const messagesList = await query;

    // Retornar em ordem cronológica
    return messagesList.reverse();
  }

  /**
   * Listar mensagens de DM
   */
  static async listByDM(
    conversationId: string,
    options: { limit?: number; before?: string } = {},
  ): Promise<Message[]> {
    const { limit = 50, before } = options;

    const messagesList = await db.query.messages.findMany({
      where: and(
        eq(messages.dmConversationId, conversationId),
        before ? lt(messages.createdAt, new Date(before)) : undefined,
      ),
      orderBy: [desc(messages.createdAt)],
      limit,
    });

    return messagesList.reverse();
  }

  /**
   * Criar ou buscar conversa DM
   */
  static async getOrCreateDMConversation(
    userId: string,
    agentId: string,
  ): Promise<string> {
    // Buscar conversa existente
    const existing = await db.query.dmConversations.findFirst({
      where: and(
        eq(dmConversations.userId, userId),
        eq(dmConversations.agentId, agentId),
        eq(dmConversations.isActive, true),
      ),
    });

    if (existing) {
      return existing.id;
    }

    // Criar nova conversa
    const newConversation = {
      id: generateId(),
      userId,
      agentId,
      isActive: true,
      isPinned: false,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(dmConversations).values(newConversation);

    return newConversation.id;
  }

  // Métodos privados
  private static async validateChannelAccess(
    channelId: string,
    userId: string,
  ): Promise<void> {
    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
      with: {
        project: true,
      },
    });

    if (!channel) {
      throw new NotFoundError("Channel", channelId);
    }

    // Verificar se usuário tem acesso ao projeto
    if (channel.project.ownerId !== userId) {
      // TODO: Implementar verificação de membros do projeto
      throw new AuthorizationError("No access to this channel");
    }
  }

  private static async validateDMAccess(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const conversation = await db.query.dmConversations.findFirst({
      where: eq(dmConversations.id, conversationId),
    });

    if (!conversation) {
      throw new NotFoundError("DM Conversation", conversationId);
    }

    if (conversation.userId !== userId) {
      throw new AuthorizationError("No access to this conversation");
    }
  }

  private static async updateDMLastMessage(
    conversationId: string,
  ): Promise<void> {
    await db
      .update(dmConversations)
      .set({
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(dmConversations.id, conversationId));
  }

  private static async processMessageForActions(
    message: Message,
  ): Promise<void> {
    // Análise de intenção com IA
    try {
      const intent = await LLMService.analyzeIntent(message.content);

      if (intent.requiresAgent && intent.targetAgentId) {
        // Enviar para agente específico
        await AgentWorker.processMessage(intent.targetAgentId, message);
      } else if (intent.requiresAgent && message.channelId) {
        // Buscar agente apropriado no projeto
        const channel = await db.query.channels.findFirst({
          where: eq(channels.id, message.channelId),
        });

        if (channel) {
          const projectAgentsList = await AgentService.listByProject(
            channel.projectId,
          );
          const appropriateAgent = this.selectAppropriateAgent(
            projectAgentsList,
            intent,
          );

          if (appropriateAgent) {
            await AgentWorker.processMessage(appropriateAgent.id, message);
          }
        }
      }
    } catch (error) {
      console.error("Failed to process message for actions:", error);
      // Não falhar o envio da mensagem se análise de intenção falhar
    }
  }

  private static selectAppropriateAgent(
    agents: Agent[],
    intent: IntentAnalysis,
  ): Agent | null {
    // Lógica simples de seleção de agente baseada em expertise
    for (const agent of agents) {
      if (
        intent.categories.some((category) => agent.expertise.includes(category))
      ) {
        return agent;
      }
    }

    // Fallback para primeiro agente disponível
    return agents.find((agent) => agent.status === "online") || null;
  }

  // Métodos de eventos
  private static async publishMessageSentEvent(
    message: Message,
  ): Promise<void> {
    await EventBus.publish("message.sent", {
      messageId: message.id,
      channelId: message.channelId,
      dmConversationId: message.dmConversationId,
      authorId: message.authorId,
      authorType: message.authorType,
      content: message.content,
      timestamp: message.createdAt,
    });
  }
}
```

---

## 🎯 Benefícios da Arquitetura

### ✅ Separation of Concerns

- **Single Responsibility** - Cada service tem responsabilidade específica
- **Domain Isolation** - Lógica de negócio isolada por domínio
- **Clear Boundaries** - Interfaces bem definidas entre services

### ✅ Testability

- **Unit Testing** - Services podem ser testados isoladamente
- **Mocking** - Dependencies claramente definidas
- **Business Logic Testing** - Regras de negócio testáveis

### ✅ Maintainability

- **Centralized Logic** - Regras de negócio centralizadas
- **Consistent Patterns** - Padrões aplicados consistentemente
- **Easy Refactoring** - Mudanças localizadas em services

### ✅ Scalability

- **Modular Design** - Fácil adição de novos services
- **Event-Driven** - Comunicação assíncrona entre services
- **Performance** - Operações otimizadas por domínio

---

## 📈 Próximos Documentos

1. **COMPONENT-LIBRARY.md** - Sistema de design e componentes UI
2. **AGENT-WORKERS.md** - Sistema de agentes background
3. **CODING-STANDARDS.md** - Padrões e convenções de código

---

_Esta camada de business logic foi projetada para ser robusta, testável e escalável, encapsulando todas as regras de negócio do Project Wiz._
