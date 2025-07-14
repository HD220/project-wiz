# Guia de Arquitetura e Práticas - Project Wiz

**Data de Criação:** 2025-07-14  
**Última Atualização:** 2025-07-14  
**Status:** Oficial  
**Aplicabilidade:** Obrigatória para todo desenvolvimento

---

## Visão Geral

Este documento define a **arquitetura oficial** e **práticas obrigatórias** para o desenvolvimento do Project Wiz. Todos os desenvolvedores (humanos e LLMs) devem seguir rigorosamente estas diretrizes.

### Princípios Fundamentais

1. **Simplicidade Acima de Tudo**: Evitar over-engineering e complexidade desnecessária
2. **Domain-First**: Modelar o domínio antes da tecnologia
3. **Object Calisthenics**: Código limpo através de restrições disciplinadas
4. **Infraestrutura Transparente**: Acesso direto aos recursos sem camadas intermediárias
5. **Fail Fast**: Detectar e reportar erros o mais cedo possível

---

# Arquitetura de Domínios

## Estrutura Oficial

```
src/main/
├── domains/                    # 🎯 Domínios de Negócio (NOVA ESTRUTURA)
│   ├── projects/              # Container de colaboração
│   │   ├── entities/
│   │   │   ├── project.entity.ts
│   │   │   ├── channel.entity.ts
│   │   │   └── project-message.entity.ts
│   │   ├── value-objects/
│   │   │   ├── project-name.vo.ts
│   │   │   ├── project-identity.vo.ts
│   │   │   └── workspace-path.vo.ts
│   │   ├── functions/
│   │   │   ├── create-project.function.ts
│   │   │   ├── find-projects.function.ts
│   │   │   ├── update-project.function.ts
│   │   │   └── delete-project.function.ts
│   │   └── types/
│   │       └── project.types.ts
│   ├── agents/                # Workers autônomos
│   │   ├── entities/
│   │   │   ├── agent.entity.ts
│   │   │   ├── agent-worker.entity.ts
│   │   │   └── agent-queue.entity.ts
│   │   ├── value-objects/
│   │   │   ├── agent-name.vo.ts
│   │   │   ├── agent-role.vo.ts
│   │   │   └── agent-status.vo.ts
│   │   ├── functions/
│   │   │   ├── create-agent.function.ts
│   │   │   ├── start-agent.function.ts
│   │   │   ├── stop-agent.function.ts
│   │   │   └── queue-task.function.ts
│   │   └── types/
│   │       └── agent.types.ts
│   ├── users/                 # Espaço pessoal
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── direct-message.entity.ts
│   │   │   └── user-preferences.entity.ts
│   │   ├── value-objects/
│   │   │   ├── user-identity.vo.ts
│   │   │   ├── user-email.vo.ts
│   │   │   └── user-settings.vo.ts
│   │   ├── functions/
│   │   │   ├── create-user.function.ts
│   │   │   ├── send-direct-message.function.ts
│   │   │   └── update-preferences.function.ts
│   │   └── types/
│   │       └── user.types.ts
│   └── llm/                   # Infraestrutura LLM
│       ├── entities/
│       │   ├── llm-provider.entity.ts
│       │   └── model-config.entity.ts
│       ├── value-objects/
│       │   ├── temperature.vo.ts
│       │   ├── max-tokens.vo.ts
│       │   └── api-key.vo.ts
│       ├── functions/
│       │   ├── generate-text.function.ts
│       │   ├── register-provider.function.ts
│       │   └── validate-config.function.ts
│       └── types/
│           └── llm.types.ts
├── infrastructure/            # 🔧 Infraestrutura Transparente
│   ├── database.ts           # getDatabase() function
│   ├── logger.ts             # getLogger(context) function
│   ├── events.ts             # publishEvent(event) function
│   └── validation.ts         # validate(schema, data) function
├── modules/                   # 📦 ESTRUTURA LEGADA (EM MIGRAÇÃO)
│   └── [módulos existentes sendo migrados]
└── persistence/              # 🗄️ Configuração de Persistência
    ├── db.ts
    ├── schemas/
    └── migrations/
```

## Domínios Definidos

### 1. **Projects** - Container de Colaboração

**Propósito**: Espaços de trabalho onde usuários e agentes colaboram  
**Responsabilidades**:

- Gerenciamento de projetos
- Canais de comunicação dentro de projetos
- Mensagens de equipe e colaboração
- Arquivos e recursos compartilhados

**Entidades Principais**:

- `Project`: Projeto principal com metadados e configurações
- `Channel`: Canal de comunicação dentro do projeto
- `ProjectMessage`: Mensagens trocadas nos canais

### 2. **Agents** - Workers Autônomos

**Propósito**: Agentes de IA que executam tarefas de forma autônoma  
**Responsabilidades**:

- Execução de tarefas automatizadas
- Gerenciamento de filas de trabalho
- Processamento assíncrono
- Integração com LLMs para execução

**Entidades Principais**:

- `Agent`: Agente principal com configurações e estado
- `AgentWorker`: Worker responsável pela execução
- `AgentQueue`: Fila de tarefas do agente

### 3. **Users** - Espaço Pessoal

**Propósito**: Área pessoal dos usuários e comunicação direta  
**Responsabilidades**:

- Perfis e preferências dos usuários
- Mensagens diretas entre usuários
- Configurações pessoais
- Histórico de conversas privadas

**Entidades Principais**:

- `User`: Usuário com perfil e configurações
- `DirectMessage`: Mensagens diretas entre usuários
- `UserPreferences`: Preferências e configurações pessoais

### 4. **LLM** - Infraestrutura Compartilhada

**Propósito**: Integração com provedores de Large Language Models  
**Responsabilidades**:

- Configuração de provedores de LLM
- Geração de texto e respostas
- Gerenciamento de APIs e tokens
- Configuração de modelos

**Entidades Principais**:

- `LLMProvider`: Provedor de LLM (OpenAI, DeepSeek, etc.)
- `ModelConfig`: Configuração de modelo específico

---

# Object Calisthenics - Regras Obrigatórias

## Regras Aplicadas

### 1. **Apenas Um Nível de Indentação por Método**

```typescript
// ❌ INCORRETO
public processItems(items: Item[]): void {
  for (const item of items) {
    if (item.isValid()) {
      if (item.needsProcessing()) {
        this.process(item);
      }
    }
  }
}

// ✅ CORRETO
public processItems(items: Item[]): void {
  items.forEach(item => this.processItem(item));
}

private processItem(item: Item): void {
  if (!item.isValid()) return;
  if (!item.needsProcessing()) return;

  this.process(item);
}
```

### 2. **Não Use a Palavra-Chave ELSE**

```typescript
// ❌ INCORRETO
public getStatus(): string {
  if (this.isActive()) {
    return 'active';
  } else {
    return 'inactive';
  }
}

// ✅ CORRETO
public getStatus(): string {
  if (this.isActive()) {
    return 'active';
  }

  return 'inactive';
}
```

### 3. **Encapsule Todos os Primitivos**

```typescript
// ❌ INCORRETO
export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}
}

// ✅ CORRETO
export class Project {
  constructor(
    private readonly identity: ProjectIdentity,
    private readonly projectName: ProjectName,
    private readonly creationDate: CreationDate,
  ) {}

  public getId(): string {
    return this.identity.getValue();
  }

  public getName(): string {
    return this.projectName.getValue();
  }
}
```

### 4. **Máximo 10 Linhas por Método**

```typescript
// ❌ INCORRETO - Método muito longo
public createProject(data: CreateProjectData): Project {
  // Validações
  if (!data.name) throw new Error('Name required');
  if (data.name.length < 3) throw new Error('Name too short');
  if (data.name.length > 100) throw new Error('Name too long');

  // Criação
  const id = generateId();
  const project = new Project(id, data.name, new Date());

  // Persistência
  this.repository.save(project);

  // Eventos
  this.eventBus.publish(new ProjectCreated(project));

  // Log
  this.logger.info('Project created', { id });

  return project;
}

// ✅ CORRETO - Métodos pequenos e focados
public createProject(data: CreateProjectData): Project {
  this.validateProjectData(data);
  const project = this.buildProject(data);
  this.persistProject(project);
  this.notifyProjectCreation(project);

  return project;
}

private validateProjectData(data: CreateProjectData): void {
  if (!data.name) throw new Error('Name required');
  if (data.name.length < 3) throw new Error('Name too short');
  if (data.name.length > 100) throw new Error('Name too long');
}
```

### 5. **Máximo 2 Variáveis de Instância por Classe**

```typescript
// ❌ INCORRETO
export class Project {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly description: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly ownerId: string,
  ) {}
}

// ✅ CORRETO
export class Project {
  constructor(
    private readonly identity: ProjectIdentity,
    private readonly attributes: ProjectAttributes,
  ) {}
}

export class ProjectAttributes {
  constructor(
    private readonly name: ProjectName,
    private readonly description: ProjectDescription,
    private readonly timestamps: ProjectTimestamps,
    private readonly owner: ProjectOwner,
  ) {}
}
```

### 6. **Máximo 50 Linhas por Classe**

```typescript
// ✅ EXEMPLO DE CLASSE COMPLIANT
export class ProjectName {
  private readonly value: string;

  constructor(name: string) {
    const validated = ProjectNameSchema.parse(name);
    this.value = validated;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ProjectName): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public isValid(): boolean {
    return this.value.length >= 3 && this.value.length <= 100;
  }

  public toUpperCase(): ProjectName {
    return new ProjectName(this.value.toUpperCase());
  }

  public toLowerCase(): ProjectName {
    return new ProjectName(this.value.toLowerCase());
  }

  public startsWith(prefix: string): boolean {
    return this.value.startsWith(prefix);
  }

  public endsWith(suffix: string): boolean {
    return this.value.endsWith(suffix);
  }

  public contains(substring: string): boolean {
    return this.value.includes(substring);
  }
}

// Validação Zod separada
export const ProjectNameSchema = z
  .string()
  .min(3, "Project name must be at least 3 characters")
  .max(100, "Project name cannot exceed 100 characters")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters in project name");
```

---

# Infraestrutura Transparente

## Conceito

A infraestrutura transparente elimina a necessidade de dependency injection para utilitários básicos, fornecendo acesso global a recursos fundamentais através de funções simples.

## Implementação

### Database Access

```typescript
// src/main/infrastructure/database.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!db) {
    const sqlite = new Database("project-wiz.db");
    db = drizzle(sqlite);
  }
  return db;
}

// Uso nas funções de domínio
export async function createProject(data: CreateProjectDTO): Promise<Project> {
  const db = getDatabase();
  const result = await db.insert(projectsSchema).values(data).returning();
  return Project.fromSchema(result[0]);
}
```

### Logging Contextual

```typescript
// src/main/infrastructure/logger.ts
import { createLogger, format, transports } from "winston";

const baseLogger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
    new transports.Console({ format: format.simple() }),
  ],
});

export function getLogger(context: string) {
  return baseLogger.child({ context });
}

// Uso nas funções de domínio
export async function createProject(data: CreateProjectDTO): Promise<Project> {
  const logger = getLogger("createProject");

  try {
    logger.info("Creating project", { name: data.name });
    const project = await persistProject(data);
    logger.info("Project created successfully", { id: project.getId() });
    return project;
  } catch (error) {
    logger.error("Failed to create project", { error, data });
    throw new DomainError("Project creation failed");
  }
}
```

### Event Publishing

```typescript
// src/main/infrastructure/events.ts
import { EventEmitter } from "events";

const eventBus = new EventEmitter();

export function publishEvent(eventName: string, data: any): void {
  eventBus.emit(eventName, data);
}

export function subscribeToEvent(eventName: string, handler: Function): void {
  eventBus.on(eventName, handler);
}

// Uso nas funções de domínio
export async function createProject(data: CreateProjectDTO): Promise<Project> {
  const project = await persistProject(data);

  publishEvent("project.created", {
    projectId: project.getId(),
    ownerId: project.getOwnerId(),
    timestamp: new Date(),
  });

  return project;
}
```

### Validation

```typescript
// src/main/infrastructure/validation.ts
import { z } from "zod";

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Validation failed", error.errors);
    }
    throw error;
  }
}

// Uso nas funções de domínio
export async function createProject(data: unknown): Promise<Project> {
  const validatedData = validate(CreateProjectSchema, data);
  // ... resto da implementação
}
```

---

# Padrões de Implementação

## Value Objects

### Template Padrão

```typescript
export class [Name]ValueObject {
  private readonly value: [Type];

  constructor(value: [Type]) {
    const validated = [Name]Schema.parse(value);
    this.value = validated;
  }

  public getValue(): [Type] {
    return this.value;
  }

  public equals(other: [Name]ValueObject): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return String(this.value);
  }

  // Métodos específicos do domínio (≤10 linhas cada)
}

// Schema Zod separado
export const [Name]Schema = z.[type]()
  .min/max/regex(...validation rules);
```

### Exemplo Completo: ProjectName

```typescript
export class ProjectName {
  private readonly value: string;

  constructor(name: string) {
    const validated = ProjectNameSchema.parse(name);
    this.value = validated;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ProjectName): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public isValidForFilesystem(): boolean {
    return !/[<>:"/\\|?*]/.test(this.value);
  }

  public toSlug(): string {
    return this.value.toLowerCase().replace(/\s+/g, "-");
  }
}

export const ProjectNameSchema = z
  .string()
  .min(3, "Project name must be at least 3 characters")
  .max(100, "Project name cannot exceed 100 characters")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters in project name");
```

## Entidades Ricas

### Template Padrão

```typescript
export class [Name]Entity {
  constructor(
    private readonly identity: [Name]Identity,
    private readonly attributes: [Name]Attributes
  ) {
    this.validateCreation();
  }

  // Métodos comportamentais (≤10 linhas cada)
  public performAction(): ActionResult {
    if (!this.canPerformAction()) {
      return ActionResult.failure('Cannot perform action');
    }

    return this.executeAction();
  }

  // Queries (≤10 linhas cada)
  public isValid(): boolean {
    return this.identity.isValid() && this.attributes.areValid();
  }

  // Conversão para persistência
  public toSchema(): [Name]Schema {
    return {
      id: this.identity.getValue(),
      ...this.attributes.toSchema()
    };
  }

  // Factory method
  public static fromSchema(schema: [Name]Schema): [Name]Entity {
    return new [Name]Entity(
      new [Name]Identity(schema.id),
      [Name]Attributes.fromSchema(schema)
    );
  }

  private validateCreation(): void {
    if (!this.isValid()) {
      throw new DomainError('Invalid entity state');
    }
  }

  private canPerformAction(): boolean {
    return this.isValid();
  }

  private executeAction(): ActionResult {
    // Implementação específica
    return ActionResult.success();
  }
}
```

### Exemplo Completo: Project

```typescript
export class Project {
  constructor(
    private readonly identity: ProjectIdentity,
    private readonly attributes: ProjectAttributes,
  ) {
    this.validateCreation();
  }

  public addChannel(channelName: ChannelName): void {
    if (!this.canAddChannel()) {
      throw new DomainError("Cannot add channel to this project");
    }

    this.attributes.addChannel(channelName);
    publishEvent("project.channel.added", {
      projectId: this.getId(),
      channelName: channelName.getValue(),
    });
  }

  public removeChannel(channelName: ChannelName): void {
    if (!this.hasChannel(channelName)) {
      throw new DomainError("Channel not found");
    }

    this.attributes.removeChannel(channelName);
    publishEvent("project.channel.removed", {
      projectId: this.getId(),
      channelName: channelName.getValue(),
    });
  }

  public getId(): string {
    return this.identity.getValue();
  }

  public getName(): string {
    return this.attributes.getName().getValue();
  }

  public isActive(): boolean {
    return this.attributes.getStatus().isActive();
  }

  public toSchema(): ProjectSchema {
    return {
      id: this.identity.getValue(),
      ...this.attributes.toSchema(),
    };
  }

  public static fromSchema(schema: ProjectSchema): Project {
    return new Project(
      new ProjectIdentity(schema.id),
      ProjectAttributes.fromSchema(schema),
    );
  }

  private validateCreation(): void {
    if (!this.identity.isValid()) {
      throw new DomainError("Invalid project identity");
    }
    if (!this.attributes.areValid()) {
      throw new DomainError("Invalid project attributes");
    }
  }

  private canAddChannel(): boolean {
    return this.isActive() && !this.hasMaxChannels();
  }

  private hasChannel(channelName: ChannelName): boolean {
    return this.attributes.hasChannel(channelName);
  }

  private hasMaxChannels(): boolean {
    return this.attributes.getChannelCount() >= 50;
  }
}
```

## Funções de Domínio

### Template Padrão

```typescript
export async function [action][Entity](
  data: [Action][Entity]DTO
): Promise<[Entity]> {
  const logger = getLogger('[action][Entity]');

  try {
    // Validação
    const validatedData = validate([Action][Entity]Schema, data);

    // Criação da entidade
    const entity = new [Entity](
      new [Entity]Identity(generateId()),
      [Entity]Attributes.fromDTO(validatedData)
    );

    // Persistência
    const db = getDatabase();
    await db.insert([entity]Schema).values(entity.toSchema());

    // Eventos
    publishEvent('[entity].[action]', {
      entityId: entity.getId(),
      timestamp: new Date()
    });

    logger.info('[Entity] [action] successfully', { id: entity.getId() });

    return entity;
  } catch (error) {
    logger.error('Failed to [action] [entity]', { error, data });
    throw new DomainError('[Entity] [action] failed');
  }
}
```

### Exemplo Completo: createProject

```typescript
export async function createProject(data: CreateProjectDTO): Promise<Project> {
  const logger = getLogger("createProject");

  try {
    // Validação
    const validatedData = validate(CreateProjectSchema, data);

    // Verificar se projeto já existe
    const existingProject = await findProjectByName(
      new ProjectName(validatedData.name),
    );
    if (existingProject) {
      throw new DomainError("Project with this name already exists");
    }

    // Criação da entidade
    const project = new Project(
      new ProjectIdentity(generateId()),
      ProjectAttributes.fromCreateDTO(validatedData),
    );

    // Persistência
    const db = getDatabase();
    await db.insert(projectsSchema).values(project.toSchema());

    // Criar canal padrão
    const defaultChannel = new Channel(
      new ChannelIdentity(generateId()),
      new ChannelName("general"),
      project.getIdentity(),
    );
    await db.insert(channelsSchema).values(defaultChannel.toSchema());

    // Eventos
    publishEvent("project.created", {
      projectId: project.getId(),
      projectName: project.getName(),
      ownerId: project.getOwnerId(),
      timestamp: new Date(),
    });

    logger.info("Project created successfully", {
      id: project.getId(),
      name: project.getName(),
    });

    return project;
  } catch (error) {
    logger.error("Failed to create project", { error, data });
    throw new DomainError("Project creation failed");
  }
}

export const CreateProjectSchema = z.object({
  name: ProjectNameSchema,
  description: z.string().optional(),
  ownerId: z.string().uuid(),
  workspacePath: z.string().optional(),
});

export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;
```

---

# Padrões de Persistência

## Schemas Drizzle

```typescript
// src/main/persistence/schemas/projects.schema.ts
export const projectsSchema = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").notNull(),
  workspacePath: text("workspace_path"),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type ProjectSchema = typeof projectsSchema.$inferSelect;
export type NewProjectSchema = typeof projectsSchema.$inferInsert;
```

## Conversão Entity ↔ Schema

```typescript
// Na entidade
export class Project {
  public toSchema(): ProjectSchema {
    return {
      id: this.identity.getValue(),
      name: this.attributes.getName().getValue(),
      description: this.attributes.getDescription()?.getValue(),
      ownerId: this.attributes.getOwnerId().getValue(),
      workspacePath: this.attributes.getWorkspacePath()?.getValue(),
      status: this.attributes.getStatus().getValue(),
      createdAt: this.attributes.getCreatedAt(),
      updatedAt: new Date(),
    };
  }

  public static fromSchema(schema: ProjectSchema): Project {
    return new Project(
      new ProjectIdentity(schema.id),
      ProjectAttributes.fromSchema(schema),
    );
  }
}
```

---

# Padrões de Comunicação IPC

## Handlers Simplificados

```typescript
// src/main/ipc/projects.handlers.ts
import { ipcMain } from "electron";
import {
  createProject,
  findProjectById,
  updateProject,
  deleteProject,
} from "@/main/domains/projects/functions";

export function setupProjectsHandlers(): void {
  ipcMain.handle("projects:create", handleCreateProject);
  ipcMain.handle("projects:findById", handleFindProjectById);
  ipcMain.handle("projects:update", handleUpdateProject);
  ipcMain.handle("projects:delete", handleDeleteProject);
}

async function handleCreateProject(
  event: Electron.IpcMainInvokeEvent,
  data: CreateProjectDTO,
): Promise<ProjectResponse> {
  try {
    const project = await createProject(data);
    return projectToResponse(project);
  } catch (error) {
    throw new IPCError("Failed to create project", error);
  }
}

async function handleFindProjectById(
  event: Electron.IpcMainInvokeEvent,
  id: string,
): Promise<ProjectResponse | null> {
  try {
    const project = await findProjectById(new ProjectIdentity(id));
    return project ? projectToResponse(project) : null;
  } catch (error) {
    throw new IPCError("Failed to find project", error);
  }
}

function projectToResponse(project: Project): ProjectResponse {
  return {
    id: project.getId(),
    name: project.getName(),
    description: project.getDescription(),
    ownerId: project.getOwnerId(),
    status: project.getStatus(),
    createdAt: project.getCreatedAt(),
    updatedAt: project.getUpdatedAt(),
  };
}
```

---

# Tratamento de Erros

## Hierarquia de Erros

```typescript
// src/main/errors/base.error.ts
export abstract class BaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// src/main/errors/domain.error.ts
export class DomainError extends BaseError {
  constructor(message: string, context?: any) {
    super(message, "DOMAIN_ERROR", context);
  }
}

// src/main/errors/validation.error.ts
export class ValidationError extends BaseError {
  constructor(
    message: string,
    public readonly details: any[],
  ) {
    super(message, "VALIDATION_ERROR", { details });
  }
}

// src/main/errors/not-found.error.ts
export class NotFoundError extends BaseError {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`, "NOT_FOUND", {
      resource,
      identifier,
    });
  }
}
```

## Padrão de Tratamento

```typescript
export async function createProject(data: CreateProjectDTO): Promise<Project> {
  const logger = getLogger("createProject");

  try {
    // Implementação...
    return project;
  } catch (error) {
    // Log do erro
    logger.error("Failed to create project", {
      error: error.message,
      stack: error.stack,
      data: sanitizeLogData(data),
    });

    // Re-throw com contexto apropriado
    if (error instanceof ValidationError) {
      throw error; // Já é um erro de domínio
    }

    if (error.code === "SQLITE_CONSTRAINT") {
      throw new DomainError("Project name already exists");
    }

    // Erro genérico
    throw new DomainError("Failed to create project", {
      originalError: error.message,
    });
  }
}

function sanitizeLogData(data: any): any {
  // Remove dados sensíveis dos logs
  const { password, apiKey, ...safe } = data;
  return safe;
}
```

---

# Validação e Qualidade

## ESLint Rules para Object Calisthenics

```javascript
// .eslintrc.calisthenics.js
module.exports = {
  rules: {
    "max-depth": ["error", 1],
    "max-lines-per-function": ["error", 10],
    "max-params": ["error", 2],
    "max-statements-per-line": ["error", { max: 1 }],
    complexity: ["error", 3],
    "max-nested-callbacks": ["error", 1],
    "no-else-return": "error",
    "prefer-early-return": "error",

    // Custom rules
    "max-instance-variables": ["error", 2],
    "no-primitive-parameters": "error",
    "no-static-methods-in-entities": "error",
  },
};
```

## Scripts de Validação

```json
{
  "scripts": {
    "quality:check": "npm run lint && npm run type-check && npm run calisthenics:check",
    "calisthenics:check": "eslint --config .eslintrc.calisthenics.js src/main/domains/",
    "architecture:validate": "node scripts/validate-architecture.js"
  }
}
```

## Validação de Arquitetura

```typescript
// scripts/validate-architecture.ts
import { glob } from "glob";
import { readFileSync } from "fs";
import { join } from "path";

interface ArchitectureViolation {
  file: string;
  rule: string;
  line?: number;
  description: string;
}

export async function validateArchitecture(): Promise<ArchitectureViolation[]> {
  const violations: ArchitectureViolation[] = [];

  // Validar estrutura de domínios
  violations.push(...(await validateDomainStructure()));

  // Validar Object Calisthenics
  violations.push(...(await validateObjectCalisthenics()));

  // Validar uso de infraestrutura transparente
  violations.push(...(await validateTransparentInfrastructure()));

  return violations;
}

async function validateDomainStructure(): Promise<ArchitectureViolation[]> {
  const violations: ArchitectureViolation[] = [];
  const domainDirs = ["projects", "agents", "users", "llm"];

  for (const domain of domainDirs) {
    const domainPath = join("src/main/domains", domain);
    const requiredDirs = ["entities", "value-objects", "functions", "types"];

    for (const dir of requiredDirs) {
      const dirPath = join(domainPath, dir);
      if (!existsSync(dirPath)) {
        violations.push({
          file: domainPath,
          rule: "domain-structure",
          description: `Missing required directory: ${dir}`,
        });
      }
    }
  }

  return violations;
}

async function validateObjectCalisthenics(): Promise<ArchitectureViolation[]> {
  const violations: ArchitectureViolation[] = [];
  const entityFiles = await glob("src/main/domains/**/entities/*.ts");

  for (const file of entityFiles) {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");

    // Validar métodos ≤10 linhas
    violations.push(...validateMethodLength(file, lines));

    // Validar ≤2 variáveis de instância
    violations.push(...validateInstanceVariables(file, lines));

    // Validar nível de indentação
    violations.push(...validateIndentation(file, lines));
  }

  return violations;
}

function validateMethodLength(
  file: string,
  lines: string[],
): ArchitectureViolation[] {
  const violations: ArchitectureViolation[] = [];
  let methodStart = -1;
  let methodName = "";
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detectar início de método
    if (
      line.includes("public ") ||
      line.includes("private ") ||
      line.includes("protected ")
    ) {
      if (line.includes("(") && line.includes(")")) {
        methodStart = i;
        methodName = extractMethodName(line);
        braceCount = 0;
      }
    }

    // Contar chaves
    if (methodStart >= 0) {
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      // Fim do método
      if (braceCount === 0 && line.includes("}")) {
        const methodLength = i - methodStart + 1;
        if (methodLength > 10) {
          violations.push({
            file,
            rule: "max-method-length",
            line: methodStart + 1,
            description: `Method '${methodName}' has ${methodLength} lines (max 10)`,
          });
        }
        methodStart = -1;
      }
    }
  }

  return violations;
}
```

---

# Migração da Estrutura Legada

## Estratégia de Migração

### Fase 1: Infraestrutura

1. Implementar infraestrutura transparente
2. Configurar validação de Object Calisthenics
3. Estabelecer padrões de domínio

### Fase 2: Domínio por Domínio

1. **Projects**: Migrar project-management module
2. **Agents**: Migrar agent-management module
3. **Users**: Migrar direct-messages module
4. **LLM**: Consolidar llm-provider module

### Fase 3: Cleanup

1. Remover módulos legados
2. Atualizar imports
3. Validação final

## Mapeamento Módulo → Domínio

```
Estrutura Legada → Nova Estrutura

src/main/modules/
├── project-management/     → src/main/domains/projects/
├── agent-management/       → src/main/domains/agents/
├── direct-messages/        → src/main/domains/users/
├── communication/          → src/main/domains/projects/ (channels)
├── channel-messaging/      → src/main/domains/projects/ (messages)
└── llm-provider/          → src/main/domains/llm/
```

---

# Checklist de Conformidade

## Para Desenvolvedores

### ✅ Object Calisthenics

- [ ] Métodos com máximo 10 linhas
- [ ] Máximo 1 nível de indentação por método
- [ ] Sem uso de ELSE
- [ ] Máximo 2 variáveis de instância por classe
- [ ] Todos os primitivos encapsulados em Value Objects
- [ ] Classes com máximo 50 linhas

### ✅ Arquitetura de Domínios

- [ ] Código organizado em domínios (projects/agents/users/llm)
- [ ] Entidades ricas com comportamento
- [ ] Funções simples para CRUD
- [ ] Infraestrutura transparente utilizada

### ✅ Qualidade

- [ ] `npm run quality:check` passa sem erros
- [ ] Tipos TypeScript completos
- [ ] Tratamento de erros apropriado
- [ ] Logging contextual implementado

### ✅ Testes

- [ ] Testes unitários para Value Objects
- [ ] Testes de comportamento para Entidades
- [ ] Testes de integração para Funções

## Para Code Review

### ✅ Verificações Obrigatórias

- [ ] Segue Object Calisthenics
- [ ] Usa infraestrutura transparente
- [ ] Primitivos encapsulados
- [ ] Nomes autodocumentados
- [ ] Sem TODOs ou placeholders
- [ ] Tratamento de erro apropriado

---

# Exemplos Completos

## Estrutura Completa de um Domínio

```
src/main/domains/projects/
├── entities/
│   ├── project.entity.ts                # Entidade rica principal
│   ├── channel.entity.ts                # Entidade canal
│   ├── project-message.entity.ts        # Entidade mensagem
│   └── project-attributes.entity.ts     # Atributos agrupados
├── value-objects/
│   ├── project-identity.vo.ts           # ID do projeto
│   ├── project-name.vo.ts               # Nome do projeto
│   ├── project-description.vo.ts        # Descrição
│   ├── workspace-path.vo.ts             # Caminho do workspace
│   ├── project-status.vo.ts             # Status ativo/inativo
│   └── channel-name.vo.ts               # Nome do canal
├── functions/
│   ├── create-project.function.ts       # Criar projeto
│   ├── find-projects.function.ts        # Buscar projetos
│   ├── update-project.function.ts       # Atualizar projeto
│   ├── delete-project.function.ts       # Deletar projeto
│   ├── add-channel.function.ts          # Adicionar canal
│   └── remove-channel.function.ts       # Remover canal
└── types/
    ├── project.types.ts                 # DTOs e responses
    ├── channel.types.ts                 # DTOs de canal
    └── project-events.types.ts          # Tipos de eventos
```

---

## Conclusão

Este guia define a **arquitetura oficial** do Project Wiz. Todos os desenvolvedores devem seguir rigorosamente estas práticas para garantir:

1. **Consistência** arquitetural
2. **Qualidade** de código através de Object Calisthenics
3. **Simplicidade** através de infraestrutura transparente
4. **Manutenibilidade** através de domínios bem definidos

**Status:** Este documento é **obrigatório** e deve ser atualizado conforme a arquitetura evolui.

**Próximos Passos:**

1. Implementar infraestrutura transparente
2. Configurar validação automatizada
3. Iniciar migração do domínio Projects
4. Treinar equipe nos novos padrões

---

**Última Atualização:** 2025-07-14  
**Próxima Revisão:** Quinzenalmente ou conforme necessário  
**Responsável:** Equipe de Arquitetura
