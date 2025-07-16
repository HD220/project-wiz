# Implementation Guide - Simplificação e Reorganização do Core da Aplicação

**Data:** 2025-07-14  
**Status:** 📋 Planejamento  
**Domínio:** Core Architecture  
**Base:** requirements.md + use-cases.md

---

## Visão Geral da Implementação

Este guia fornece exemplos práticos de código baseados na codebase atual do Project Wiz, demonstrando como implementar a simplificação e reorganização seguindo Object Calisthenics e DDD pragmático.

---

## 1. Estrutura de Domínios

### Nova Organização vs. Atual

**Estrutura Atual (Concerns Técnicos):**

```
src/main/modules/
├── agent-management/
├── channel-messaging/
├── communication/
├── direct-messages/
├── llm-provider/
└── project-management/
```

**Nova Estrutura (Domínios de Negócio):**

```
src/main/domains/
├── projects/                    # Container de colaboração
│   ├── project.entity.ts       # Entidade rica principal
│   ├── channel.entity.ts       # Canais dentro de projetos
│   ├── project-message.entity.ts # Mensagens de projeto
│   ├── project.functions.ts    # Funções simples CRUD
│   └── value-objects/
│       ├── project-name.vo.ts
│       ├── project-identity.vo.ts
│       └── project-workspace.vo.ts
├── agents/                     # Workers autônomos
│   ├── agent.entity.ts        # Entidade rica principal
│   ├── agent.worker.ts        # Execução de tarefas
│   ├── agent.queue.ts         # Gerenciamento de fila
│   ├── agent.functions.ts     # Funções simples CRUD
│   └── value-objects/
│       └── agent-properties.vo.ts
├── users/                     # Espaço pessoal
│   ├── user.entity.ts        # Entidade rica principal
│   ├── direct-message.entity.ts
│   ├── user-preferences.entity.ts
│   ├── user.functions.ts     # Funções simples CRUD
│   └── value-objects/
│       ├── user-identity.vo.ts
│       └── user-settings.vo.ts
└── llm/                      # Infraestrutura compartilhada
    ├── llm-provider.entity.ts
    ├── text-generation.service.ts
    ├── provider.registry.ts
    └── value-objects/
        ├── temperature.vo.ts
        ├── max-tokens.vo.ts
        └── model-config.vo.ts
```

---

## 2. Value Objects - Implementação Prática

### Exemplo 1: ProjectName (baseado em validation.utils.ts atual)

**Código Atual (Primitivo):**

```typescript
// src/main/modules/project-management/application/project.service.ts:15
async createProject(data: CreateProjectDto): Promise<ProjectDto> {
  if (!data.name || data.name.trim().length === 0) {
    throw new ValidationError("Nome é obrigatório");
  }
  // ... mais validações espalhadas
}
```

**Nova Implementação (Value Object):**

```typescript
// src/main/domains/projects/value-objects/project-name.vo.ts
import { z } from "zod";

const ProjectNameSchema = z
  .string()
  .min(1, "Nome não pode estar vazio")
  .max(100, "Nome muito longo (máximo 100 caracteres)")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Nome contém caracteres inválidos")
  .transform((str) => str.trim());

export class ProjectName {
  constructor(name: string) {
    const validated = ProjectNameSchema.parse(name);
    this.value = validated;
  }

  private readonly value: string;

  toString(): string {
    return this.value;
  }

  equals(other: ProjectName): boolean {
    return this.value === other.value;
  }

  startsWith(prefix: string): boolean {
    return this.value.toLowerCase().startsWith(prefix.toLowerCase());
  }
}
```

### Exemplo 2: Temperature (baseado em validation.utils.ts existente)

**Código Atual:**

```typescript
// src/shared/utils/validation.utils.ts:47
static isValidTemperature(temperature: number): boolean {
  return this.isInRange(temperature, 0.0, 2.0);
}
```

**Nova Implementação (Value Object):**

```typescript
// src/main/domains/llm/value-objects/temperature.vo.ts
export class Temperature {
  private readonly MIN = 0.0;
  private readonly MAX = 2.0;

  constructor(temp: number) {
    if (temp < this.MIN || temp > this.MAX) {
      throw new DomainError(
        `Temperature deve estar entre ${this.MIN} e ${this.MAX}`,
      );
    }
    this.value = temp;
  }

  private readonly value: number;

  getValue(): number {
    return this.value;
  }

  equals(other: Temperature): boolean {
    return this.value === other.value;
  }
}
```

---

## 3. Entidades Ricas - Transformação Prática

### Exemplo 1: Agent Entity (baseado em agent.entity.ts atual)

**Código Atual (Parcialmente Rico, mas com violações):**

```typescript
// src/main/modules/agent-management/domain/agent.entity.ts
export class Agent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly role: string,
    public readonly goal: string,
    public readonly backstory: string,
    public readonly systemPrompt: string,
    public readonly isActive: boolean,
    public readonly isDefault: boolean,
    public readonly llmProviderId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {} // 11 propriedades - VIOLAÇÃO: >2 variáveis de instância

  // Método muito longo - VIOLAÇÃO: >10 linhas
  // REMOVIDO: método estático create() - viola Object Calisthenics
}
```

**Nova Implementação (Object Calisthenics):**

```typescript
// src/main/domains/agents/agent.entity.ts
export class Agent {
  constructor(
    private id: string,
    private properties: AgentProperties,
  ) {}

  activate(): Agent {
    return new Agent(this.id, this.properties.activate());
  }

  generateSystemPrompt(): string {
    return this.properties.buildSystemPrompt();
  }

  async processUserMessage(
    message: string,
    llmProvider: LLMProvider,
  ): Promise<string> {
    const prompt = this.generateSystemPrompt();
    return await llmProvider.generateResponse(prompt, message);
  }
}

// Value Object para propriedades do agent (personalidade)
export class AgentProperties {
  constructor(
    private name: string,
    private role: string,
  ) {}

  activate(): AgentProperties {
    return new AgentProperties(this.name, this.role);
  }

  buildSystemPrompt(): string {
    return `You are ${this.name}, a ${this.role}.`;
  }
}

// Interface para LLM Provider (infraestrutura)
export interface LLMProvider {
  generateResponse(prompt: string, message: string): Promise<string>;
}
```

### Exemplo 2: Project Entity (evolução do atual)

**Código Atual (Anêmico):**

```typescript
// src/main/modules/project-management/domain/project.entity.ts - anêmico
export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly ownerId: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {} // Apenas propriedades, sem comportamento
}
```

**Nova Implementação (Rico + Object Calisthenics):**

```typescript
// src/main/domains/projects/project.entity.ts
export class Project {
  constructor(
    private id: string,
    private name: string,
  ) {}

  createChannel(channelName: string): string {
    return `Channel ${channelName} created in project ${this.name}`;
  }

  inviteParticipant(userId: string): Project {
    return new Project(this.id, this.name);
  }

  sendMessage(content: string, senderId: string): string {
    return `Message in project ${this.name}: ${content}`;
  }

  isOwner(userId: string): boolean {
    return userId === "owner";
  }
}
```

---

## 4. Funções Simples para Persistência

### Exemplo 1: Criação de Projeto (baseado em project.service.ts atual)

**Código Atual (Service Complexo):**

```typescript
// src/main/modules/project-management/application/project.service.ts:15-43
async createProject(data: CreateProjectDto): Promise<ProjectDto> {
  // Validação
  if (!data.name || data.name.trim().length === 0) {
    throw new ValidationError("Nome é obrigatório");
  }

  // Verificação de existência
  const existingProject = await this.projectRepository.findByName(data.name);
  if (existingProject) {
    throw new ValidationError("Projeto com este nome já existe");
  }

  // Criação
  const projectData: CreateProjectSchema = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    description: data.description?.trim() || null,
    ownerId: data.ownerId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const savedProject = await this.projectRepository.save(projectData);

  // Eventos
  this.eventBus.publish("project:created", savedProject);

  return this.projectMapper.toDto(savedProject);
}
```

**Nova Implementação (Função Simples):**

```typescript
// src/main/domains/projects/project.functions.ts
import { getDatabase } from "../../infrastructure/database";
import { getLogger } from "../../infrastructure/logger";
import { publishEvent } from "../../infrastructure/events";

export async function createProject(
  name: string,
  ownerId: string,
  description?: string,
): Promise<Project> {
  const logger = getLogger("CreateProject");
  const projectName = new ProjectName(name);
  await ensureProjectNameIsUnique(projectName);

  const projectId = crypto.randomUUID();
  const project = new Project(projectId, projectName.toString());

  const db = getDatabase();
  await db.insert(projectsTable).values({
    id: projectId,
    name: projectName.toString(),
    description: description?.trim() || null,
    ownerId: ownerId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await publishEvent("project:created", { projectId });

  logger.info(`Projeto criado: ${projectName.toString()}`);
  return project;
}

async function ensureProjectNameIsUnique(name: ProjectName): Promise<void> {
  const db = getDatabase();
  const existing = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.name, name.toString()));

  if (existing.length > 0) {
    throw new DomainError(`Projeto com nome '${name.toString()}' já existe`);
  }
}
```

### Exemplo 2: Busca de Agent (baseado em agent.repository.ts atual)

**Código Atual (Repository com DI):**

```typescript
// src/main/modules/agent-management/persistence/agent.repository.ts:25-35
async findById(id: string): Promise<AgentSchema | null> {
  const result = await this.db
    .select()
    .from(agentsTable)
    .where(eq(agentsTable.id, id));

  return result.length > 0 ? result[0] : null;
}
```

**Nova Implementação (Função Simples):**

```typescript
// src/main/domains/agents/agent.functions.ts
export async function findAgentById(id: AgentId): Promise<Agent | null> {
  const db = getDatabase();

  const result = await db
    .select()
    .from(agentsTable)
    .where(eq(agentsTable.id, id.getValue()));

  if (result.length === 0) {
    return null;
  }

  return mapToAgent(result[0]);
}

export async function findAgentsByCapability(
  capability: AgentCapability,
): Promise<Agent[]> {
  const db = getDatabase();

  const results = await db
    .select()
    .from(agentsTable)
    .where(like(agentsTable.capabilities, `%${capability.toString()}%`));

  return results.map(mapToAgent);
}

function mapToAgent(schema: AgentSchema): Agent {
  const properties = new AgentProperties(schema.name, schema.role);
  return new Agent(schema.id, properties);
}
```

---

## 5. Infraestrutura Transparente

### Exemplo 1: Database Access (baseado em db.ts atual)

**Código Atual:**

```typescript
// src/main/persistence/db.ts
const db = drizzle(new Database(DB_PATH));
export { db };
```

**Nova Implementação (Transparente):**

```typescript
// src/main/infrastructure/database.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { DB_PATH } from "../config";

let _database: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  if (!_database) {
    _database = drizzle(new Database(DB_PATH));
  }
  return _database;
}

// Uso nas funções
export async function createProject(name: string): Promise<Project> {
  const db = getDatabase(); // Acesso transparente
  // ... resto da implementação
}
```

### Exemplo 2: Logging (baseado em logger.ts atual)

**Código Atual:**

```typescript
// src/main/logger.ts - logger global
export const logger = pino({
  level: isDev ? "debug" : "info",
  transport: isDev ? { target: "pino-pretty" } : undefined,
});
```

**Nova Implementação (Transparente):**

```typescript
// src/main/infrastructure/logger.ts
import pino from "pino";

const baseLogger = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty" }
      : undefined,
});

export function getLogger(context: string) {
  return baseLogger.child({ context });
}

// Uso nas entidades e funções
export class Agent {
  private logger = getLogger("Agent"); // Acesso transparente

  generateResponse(): string {
    this.logger.info("Gerando resposta para usuário");
    return "Agent response";
  }
}
```

### Exemplo 3: Event Publishing (baseado em event-bus.ts atual)

**Código Atual (DI):**

```typescript
// src/main/modules/agent-management/application/agent.service.ts:85
this.eventBus.publish("agent:created", agent);
```

**Nova Implementação (Transparente):**

```typescript
// src/main/infrastructure/events.ts
import { EventBus } from "../kernel/event-bus";

let _eventBus: EventBus | null = null;

export async function publishEvent(event: string, data: any): Promise<void> {
  if (!_eventBus) {
    _eventBus = EventBus.getInstance();
  }
  await _eventBus.publish(event, data);
}

// Uso nas funções
export async function createAgent(name: string, role: string): Promise<Agent> {
  const db = getDatabase();

  const agentId = crypto.randomUUID();
  const properties = new AgentProperties(name, role);
  const agent = new Agent(agentId, properties);

  await db.insert(agentsTable).values({
    id: agentId,
    name: name,
    role: role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await publishEvent("agent:created", { agentId });

  return agent;
}
```

---

## 6. Padrões de Migração

### Migração Incremental - Exemplo Prático

**Fase 1: Criar Nova Estrutura (Paralela)**

```typescript
// Manter estrutura atual funcionando
src/main/modules/agent-management/ // ← Mantém funcionando

// Criar nova estrutura
src/main/domains/agents/ // ← Nova implementação
```

**Fase 2: Redirecionar Gradualmente**

```typescript
// src/main/modules/agent-management/application/agent.service.ts
export class AgentService {
  async createAgent(data: CreateAgentDto): Promise<AgentDto> {
    // TEMPORÁRIO: redirecionar para nova implementação
    const agent = await createAgent(data.name, data.role, data.capabilities);
    return this.legacyMapper.toDto(agent);
  }

  // Métodos antigos mantidos para compatibilidade
}
```

**Fase 3: Deprecar e Remover**

```typescript
// Após validação completa, remover:
// src/main/modules/agent-management/
// Manter apenas: src/main/domains/agents/
```

---

## 7. Validação de Object Calisthenics

### Checklist de Implementação

**Para Cada Classe:**

- [ ] ✅ Máximo 1 nível de indentação por método
- [ ] ✅ Sem uso de ELSE (guard clauses, early returns)
- [ ] ✅ Máximo 2 variáveis de instância
- [ ] ✅ Métodos com máximo 10 linhas
- [ ] ✅ Primitivos encapsulados em Value Objects
- [ ] ✅ First-class collections
- [ ] ✅ Sem getters/setters - apenas comportamentos
- [ ] ✅ Classes com máximo 50 linhas
- [ ] ✅ Nomes expressivos sem abreviações

**Exemplo de Método Conforme:**

```typescript
// ✅ CORRETO - Object Calisthenics
processMessage(content: string): string {
  this.ensureCanProcess(); // Early return via exception
  return `Response: ${content}`; // Single responsibility
} // ≤10 linhas, sem ELSE, 1 nível indentação

// ❌ INCORRETO - Violações
processMessage(content: string): string | null {
  if (this.isActive) { // Nível 1
    if (content && content.length > 0) { // Nível 2 - VIOLAÇÃO
      if (this.hasCapability('chat')) { // Nível 3 - VIOLAÇÃO
        // ... 20 linhas de lógica - VIOLAÇÃO
        return response;
      } else {
        return null; // ELSE - VIOLAÇÃO
      }
    } else {
      return null; // ELSE - VIOLAÇÃO
    }
  } else {
    return null; // ELSE - VIOLAÇÃO
  }
}
```

---

## 8. Validação de Object Calisthenics

### Ferramentas de Validação Automática

**ESLint Customizado para Object Calisthenics:**

```javascript
// .eslintrc.calisthenics.js
module.exports = {
  rules: {
    "max-depth": ["error", 1], // Máximo 1 nível indentação
    "max-lines-per-function": ["error", 10], // Máximo 10 linhas por método
    "max-params": ["error", 2], // Força Value Objects
    "no-else-return": "error", // Proíbe else desnecessário
    "prefer-early-return": "error", // Força early returns
  },
};
```

### Validação de Estrutura

**Verificação de Compliance:**

```typescript
// Função utilitária para verificar Object Calisthenics
export function validateEntityStructure(entityClass: any): ValidationResult {
  const issues: string[] = [];

  // Verificar número de propriedades de instância
  const instanceProps = Object.getOwnPropertyNames(new entityClass());
  if (instanceProps.length > 2) {
    issues.push(
      `Entity tem ${instanceProps.length} propriedades, máximo permitido: 2`,
    );
  }

  // Verificar métodos estáticos (deve ser zero)
  const staticMethods = Object.getOwnPropertyNames(entityClass).filter(
    (name) => typeof entityClass[name] === "function" && name !== "constructor",
  );
  if (staticMethods.length > 0) {
    issues.push(`Entity tem métodos estáticos: ${staticMethods.join(", ")}`);
  }

  return { isValid: issues.length === 0, issues };
}
```

---

## 9. Ferramentas de Validação

### ESLint Rules para Object Calisthenics

```javascript
// .eslintrc.js - regras customizadas
module.exports = {
  rules: {
    "max-depth": ["error", 1], // Máximo 1 nível de indentação
    "max-lines-per-function": ["error", 10], // Máximo 10 linhas por método
    "max-params": ["error", 2], // Máximo 2 parâmetros (força Value Objects)
    complexity: ["error", 3], // Baixa complexidade ciclomática
    "no-else-return": "error", // Proíbe else desnecessário
    "prefer-early-return": "error", // Força early returns
  },
};
```

### Comandos de Validação

**Scripts disponíveis:**

- `npm run quality:check` - Verificação completa (código, tipos, formato)
- `npm run lint:check` - Verificação apenas de linting
- `npm run type-check` - Verificação apenas de tipos TypeScript

---

## Conclusão

Esta implementação demonstra como aplicar os princípios de simplificação de forma prática, baseada nos padrões já existentes na codebase do Project Wiz. A migração deve ser incremental, preservando funcionalidades e melhorando gradualmente a qualidade do código através de Object Calisthenics e DDD pragmático.
