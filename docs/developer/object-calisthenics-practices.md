# Object Calisthenics - Práticas Obrigatórias

**Data de Criação:** 2025-07-14  
**Última Atualização:** 2025-07-14  
**Status:** Obrigatório  
**Aplicabilidade:** Todo código do Project Wiz

---

## Visão Geral

Object Calisthenics são **9 regras disciplinares** que aplicamos rigorosamente no Project Wiz para garantir código limpo, legível e manutenível. Estas regras são **obrigatórias** e verificadas automaticamente.

### Por Que Object Calisthenics?

1. **Força simplicidade**: Elimina complexidade desnecessária
2. **Melhora legibilidade**: Código autodocumentado
3. **Facilita manutenção**: Mudanças ficam mais simples
4. **Reduz bugs**: Menos lugares para erros se esconderem
5. **Acelera desenvolvimento**: Padrões claros aumentam velocidade

---

# As 9 Regras Aplicadas

## Regra 1: Apenas Um Nível de Indentação por Método

### ❌ INCORRETO

```typescript
public processUsers(users: User[]): void {
  for (const user of users) {
    if (user.isActive()) {
      if (user.hasPermission('write')) {
        if (user.getLastLogin() > thirtyDaysAgo) {
          this.updateUserAccess(user);
          if (user.needsNotification()) {
            this.sendNotification(user);
          }
        }
      }
    }
  }
}
```

### ✅ CORRETO

```typescript
public processUsers(users: User[]): void {
  users.forEach(user => this.processUser(user));
}

private processUser(user: User): void {
  if (!user.isActive()) return;
  if (!user.hasPermission('write')) return;
  if (!user.isRecentlyActive()) return;

  this.updateUserAccess(user);
  this.notifyUserIfNeeded(user);
}

private notifyUserIfNeeded(user: User): void {
  if (!user.needsNotification()) return;

  this.sendNotification(user);
}
```

### Benefícios

- Cada método tem uma responsabilidade clara
- Fácil de ler e entender
- Simples de testar cada comportamento

---

## Regra 2: Não Use a Palavra-Chave ELSE

### ❌ INCORRETO

```typescript
public getProjectStatus(project: Project): string {
  if (project.isActive()) {
    if (project.hasActiveMembers()) {
      return 'running';
    } else {
      return 'idle';
    }
  } else {
    if (project.isArchived()) {
      return 'archived';
    } else {
      return 'inactive';
    }
  }
}
```

### ✅ CORRETO

```typescript
public getProjectStatus(project: Project): string {
  if (!project.isActive()) {
    return this.getInactiveStatus(project);
  }

  if (project.hasActiveMembers()) {
    return 'running';
  }

  return 'idle';
}

private getInactiveStatus(project: Project): string {
  if (project.isArchived()) {
    return 'archived';
  }

  return 'inactive';
}
```

### Padrões de Substituição

#### Guard Clauses

```typescript
// ❌ Com ELSE
public validateUser(user: User): boolean {
  if (user.isValid()) {
    return true;
  } else {
    throw new ValidationError('Invalid user');
  }
}

// ✅ Com Guard Clause
public validateUser(user: User): boolean {
  if (!user.isValid()) {
    throw new ValidationError('Invalid user');
  }

  return true;
}
```

#### Early Returns

```typescript
// ❌ Com ELSE
public calculateDiscount(user: User, amount: number): number {
  if (user.isPremium()) {
    if (amount > 100) {
      return amount * 0.2;
    } else {
      return amount * 0.1;
    }
  } else {
    return 0;
  }
}

// ✅ Com Early Returns
public calculateDiscount(user: User, amount: number): number {
  if (!user.isPremium()) {
    return 0;
  }

  if (amount > 100) {
    return amount * 0.2;
  }

  return amount * 0.1;
}
```

---

## Regra 3: Encapsule Todos os Primitivos

### Problema dos Primitivos

```typescript
// ❌ INCORRETO - Obsessão por primitivos
export class Project {
  constructor(
    public readonly id: string, // Que tipo de ID?
    public readonly name: string, // Quais regras de validação?
    public readonly ownerId: string, // É o mesmo tipo que id?
    public readonly createdAt: number, // Timestamp? Date? Format?
  ) {}

  public updateName(newName: string): void {
    // Como validar? Como garantir consistência?
    this.name = newName;
  }
}
```

### ✅ CORRETO - Value Objects

```typescript
export class Project {
  constructor(
    private readonly identity: ProjectIdentity,
    private readonly projectName: ProjectName,
    private readonly owner: ProjectOwner,
    private readonly timestamps: ProjectTimestamps,
  ) {}

  public updateName(newName: ProjectName): void {
    // Validação é responsabilidade do Value Object
    this.projectName = newName;
  }

  public getId(): string {
    return this.identity.getValue();
  }

  public getName(): string {
    return this.projectName.getValue();
  }
}

// Value Objects com validação e comportamento
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

  public toSlug(): string {
    return this.value.toLowerCase().replace(/\s+/g, "-");
  }

  public isValidForFilesystem(): boolean {
    return !/[<>:"/\\|?*]/.test(this.value);
  }
}

export const ProjectNameSchema = z
  .string()
  .min(3, "Project name must be at least 3 characters")
  .max(100, "Project name cannot exceed 100 characters")
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters in project name");
```

### Benefícios dos Value Objects

1. **Validação automática** no momento da criação
2. **Comportamentos específicos** do domínio
3. **Imutabilidade** garantida
4. **Tipo seguro** evita confusão entre diferentes strings/numbers
5. **Reutilização** em todo o sistema

---

## Regra 4: Máximo 10 Linhas por Método

### ❌ INCORRETO - Método muito longo

```typescript
public createProject(data: CreateProjectData): Project {
  // Validação (5 linhas)
  if (!data.name) throw new Error('Name required');
  if (data.name.length < 3) throw new Error('Name too short');
  if (data.name.length > 100) throw new Error('Name too long');
  if (!data.ownerId) throw new Error('Owner required');
  if (!this.userExists(data.ownerId)) throw new Error('Owner not found');

  // Verificação de duplicata (3 linhas)
  const existing = this.findByName(data.name);
  if (existing) throw new Error('Project already exists');

  // Criação (4 linhas)
  const id = generateId();
  const project = new Project(id, data.name, data.ownerId, Date.now());

  // Persistência (2 linhas)
  this.repository.save(project);

  // Eventos (3 linhas)
  this.eventBus.publish(new ProjectCreated(project));
  this.notificationService.notifyOwner(project);

  // Log (2 linhas)
  this.logger.info('Project created', { id, name: data.name });

  return project; // Total: 19 linhas!
}
```

### ✅ CORRETO - Métodos pequenos e focados

```typescript
public createProject(data: CreateProjectData): Project {
  this.validateProjectData(data);
  this.ensureProjectDoesNotExist(data.name);
  const project = this.buildProject(data);
  this.persistProject(project);
  this.notifyProjectCreation(project);

  return project;
}

private validateProjectData(data: CreateProjectData): void {
  if (!data.name) throw new Error('Name required');
  if (data.name.length < 3) throw new Error('Name too short');
  if (data.name.length > 100) throw new Error('Name too long');
  if (!data.ownerId) throw new Error('Owner required');
  if (!this.userExists(data.ownerId)) throw new Error('Owner not found');
}

private ensureProjectDoesNotExist(name: string): void {
  const existing = this.findByName(name);
  if (existing) {
    throw new Error('Project already exists');
  }
}

private buildProject(data: CreateProjectData): Project {
  const id = generateId();
  return new Project(id, data.name, data.ownerId, Date.now());
}

private persistProject(project: Project): void {
  this.repository.save(project);
}

private notifyProjectCreation(project: Project): void {
  this.eventBus.publish(new ProjectCreated(project));
  this.notificationService.notifyOwner(project);
  this.logger.info('Project created', {
    id: project.getId(),
    name: project.getName()
  });
}
```

### Benefícios

- Cada método tem **uma responsabilidade**
- **Fácil de testar** individualmente
- **Nomes autodocumentam** o código
- **Reutilização** de métodos menores

---

## Regra 5: Máximo 2 Variáveis de Instância por Classe

### ❌ INCORRETO - Muitas variáveis de instância

```typescript
export class Project {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly description: string,
    private readonly ownerId: string,
    private readonly workspacePath: string,
    private readonly status: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly tags: string[],
    private readonly settings: any,
  ) {} // 10 variáveis!
}
```

### ✅ CORRETO - Agrupamento conceitual

```typescript
export class Project {
  constructor(
    private readonly identity: ProjectIdentity,
    private readonly attributes: ProjectAttributes,
  ) {} // Apenas 2 variáveis!

  public getId(): string {
    return this.identity.getValue();
  }

  public getName(): string {
    return this.attributes.getName();
  }

  public getOwner(): string {
    return this.attributes.getOwner();
  }
}

export class ProjectIdentity {
  constructor(private readonly value: string) {
    if (!value || value.length === 0) {
      throw new Error("Project ID cannot be empty");
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ProjectIdentity): boolean {
    return this.value === other.value;
  }
}

export class ProjectAttributes {
  constructor(
    private readonly name: ProjectName,
    private readonly metadata: ProjectMetadata,
  ) {}

  public getName(): string {
    return this.name.getValue();
  }

  public getOwner(): string {
    return this.metadata.getOwner();
  }

  public getDescription(): string {
    return this.metadata.getDescription();
  }
}

export class ProjectMetadata {
  constructor(
    private readonly ownership: ProjectOwnership,
    private readonly descriptiveInfo: ProjectInfo,
  ) {}

  public getOwner(): string {
    return this.ownership.getOwnerId();
  }

  public getDescription(): string {
    return this.descriptiveInfo.getDescription();
  }
}
```

### Estratégias de Agrupamento

#### Por Conceito de Domínio

```typescript
export class User {
  constructor(
    private readonly identity: UserIdentity, // ID, email
    private readonly profile: UserProfile, // name, preferences, settings
  ) {}
}
```

#### Por Responsabilidade

```typescript
export class Agent {
  constructor(
    private readonly configuration: AgentConfiguration, // settings, model, etc.
    private readonly runtime: AgentRuntime, // queue, worker, status
  ) {}
}
```

#### Por Ciclo de Vida

```typescript
export class Message {
  constructor(
    private readonly immutableData: MessageContent, // content, author, timestamp
    private readonly mutableState: MessageState, // status, reactions, flags
  ) {}
}
```

---

## Regra 6: Máximo 50 Linhas por Classe

### ❌ INCORRETO - Classe muito longa

```typescript
export class ProjectService {
  // 200+ linhas de código
  // Múltiplas responsabilidades
  // Difícil de manter e testar
}
```

### ✅ CORRETO - Classes pequenas e focadas

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

  public toSlug(): string {
    return this.value.toLowerCase().replace(/\s+/g, "-");
  }

  public isValidForFilesystem(): boolean {
    return !/[<>:"/\\|?*]/.test(this.value);
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

  public length(): number {
    return this.value.length;
  }

  public isEmpty(): boolean {
    return this.value.trim().length === 0;
  }
} // Exatamente 45 linhas
```

### Quando uma Classe Fica Grande, Refatore:

#### Extrair Value Objects

```typescript
// ❌ Uma classe fazendo tudo
export class Project {
  private name: string;
  private validateName() {
    /* validação */
  }
  private formatName() {
    /* formatação */
  }
}

// ✅ Responsabilidades separadas
export class Project {
  private readonly name: ProjectName; // Value Object cuida do nome
}
```

#### Extrair Comportamentos

```typescript
// ❌ Muitos comportamentos
export class Agent {
  public start() {
    /* 15 linhas */
  }
  public stop() {
    /* 12 linhas */
  }
  public process() {
    /* 20 linhas */
  }
  public validate() {
    /* 10 linhas */
  }
}

// ✅ Comportamentos delegados
export class Agent {
  constructor(
    private readonly identity: AgentIdentity,
    private readonly worker: AgentWorker,
  ) {}

  public start(): void {
    this.worker.start();
  }

  public stop(): void {
    this.worker.stop();
  }
}

export class AgentWorker {
  // Comportamentos específicos do worker
}
```

---

## Regra 7: Primeira Classe de Collections

### ❌ INCORRETO - Arrays/Listas primitivas

```typescript
export class Project {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly channels: Channel[], // Array primitivo
  ) {}

  public addChannel(channel: Channel): void {
    // Validação espalhada
    if (this.channels.length >= 50) {
      throw new Error("Too many channels");
    }
    if (this.channels.some((c) => c.name === channel.name)) {
      throw new Error("Channel already exists");
    }
    this.channels.push(channel);
  }

  public removeChannel(channelName: string): void {
    // Lógica de busca espalhada
    const index = this.channels.findIndex((c) => c.name === channelName);
    if (index === -1) {
      throw new Error("Channel not found");
    }
    this.channels.splice(index, 1);
  }

  public getActiveChannels(): Channel[] {
    // Filtros espalhados
    return this.channels.filter((c) => c.isActive());
  }
}
```

### ✅ CORRETO - Collection como First Class Citizen

```typescript
export class Project {
  constructor(
    private readonly identity: ProjectIdentity,
    private readonly attributes: ProjectAttributes,
    private readonly channels: ProjectChannels, // Collection própria
  ) {}

  public addChannel(channel: Channel): void {
    this.channels.add(channel);
  }

  public removeChannel(channelName: ChannelName): void {
    this.channels.remove(channelName);
  }

  public getActiveChannels(): Channel[] {
    return this.channels.getActive();
  }
}

export class ProjectChannels {
  private readonly channels: Channel[];

  constructor(channels: Channel[] = []) {
    this.channels = [...channels];
    this.validateInitialState();
  }

  public add(channel: Channel): void {
    this.validateCanAdd(channel);
    this.channels.push(channel);
  }

  public remove(channelName: ChannelName): void {
    const index = this.findChannelIndex(channelName);
    if (index === -1) {
      throw new ChannelNotFoundError(channelName);
    }
    this.channels.splice(index, 1);
  }

  public getActive(): Channel[] {
    return this.channels.filter((channel) => channel.isActive());
  }

  public getCount(): number {
    return this.channels.length;
  }

  public hasChannel(channelName: ChannelName): boolean {
    return this.findChannelIndex(channelName) !== -1;
  }

  private validateCanAdd(channel: Channel): void {
    if (this.channels.length >= 50) {
      throw new TooManyChannelsError();
    }
    if (this.hasChannel(channel.getName())) {
      throw new DuplicateChannelError(channel.getName());
    }
  }

  private findChannelIndex(channelName: ChannelName): number {
    return this.channels.findIndex((c) => c.getName().equals(channelName));
  }

  private validateInitialState(): void {
    if (this.channels.length > 50) {
      throw new TooManyChannelsError();
    }
  }
}
```

### Benefícios das Collections First Class

1. **Encapsulamento** de regras de negócio específicas da coleção
2. **Validações** centralizadas em um local
3. **Comportamentos** específicos da coleção bem definidos
4. **Reutilização** da lógica de coleção
5. **Testabilidade** isolada da coleção

### Outros Exemplos

#### AgentQueue (Fila de Tarefas)

```typescript
export class AgentQueue {
  private readonly tasks: Task[];

  public enqueue(task: Task): void {
    this.validateTaskCanBeQueued(task);
    this.tasks.push(task);
    this.sortByPriority();
  }

  public dequeue(): Task | null {
    return this.tasks.shift() || null;
  }

  public getPendingCount(): number {
    return this.tasks.filter((task) => task.isPending()).length;
  }

  public getHighPriorityTasks(): Task[] {
    return this.tasks.filter((task) => task.isHighPriority());
  }
}
```

#### UserPreferences (Configurações)

```typescript
export class UserPreferences {
  private readonly preferences: Map<string, PreferenceValue>;

  public set(key: PreferenceKey, value: PreferenceValue): void {
    this.validatePreference(key, value);
    this.preferences.set(key.getValue(), value);
  }

  public get(key: PreferenceKey): PreferenceValue | null {
    return this.preferences.get(key.getValue()) || null;
  }

  public getTheme(): Theme {
    const theme = this.get(new PreferenceKey("theme"));
    return theme ? new Theme(theme.getValue()) : Theme.default();
  }
}
```

---

## Regra 8: Sem Getters/Setters Anêmicos

### ❌ INCORRETO - Getters/Setters que apenas expõem estado

```typescript
export class Project {
  private name: string;
  private status: string;
  private channels: Channel[];

  // Getters anêmicos - apenas expõem dados
  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getStatus(): string {
    return this.status;
  }

  public setStatus(status: string): void {
    this.status = status;
  }

  public getChannels(): Channel[] {
    return this.channels;
  }

  public setChannels(channels: Channel[]): void {
    this.channels = channels;
  }
}
```

### ✅ CORRETO - Comportamentos Expressivos

```typescript
export class Project {
  constructor(
    private readonly identity: ProjectIdentity,
    private readonly attributes: ProjectAttributes,
    private readonly channels: ProjectChannels,
  ) {}

  // Comportamentos expressivos ao invés de getters/setters
  public activate(): void {
    if (!this.canBeActivated()) {
      throw new ProjectCannotBeActivatedError(this.identity);
    }

    this.attributes.markAsActive();
    publishEvent("project.activated", {
      projectId: this.identity.getValue(),
      timestamp: new Date(),
    });
  }

  public deactivate(): void {
    if (this.hasActiveMembers()) {
      throw new ProjectHasActiveMembersError(this.identity);
    }

    this.attributes.markAsInactive();
    publishEvent("project.deactivated", {
      projectId: this.identity.getValue(),
      timestamp: new Date(),
    });
  }

  public addChannel(channelName: ChannelName): void {
    if (!this.isActive()) {
      throw new InactiveProjectError(this.identity);
    }

    const channel = new Channel(
      new ChannelIdentity(generateId()),
      channelName,
      this.identity,
    );

    this.channels.add(channel);
    publishEvent("channel.added", {
      projectId: this.identity.getValue(),
      channelId: channel.getId(),
      channelName: channelName.getValue(),
    });
  }

  public removeChannel(channelName: ChannelName): void {
    if (this.isLastChannel(channelName)) {
      throw new CannotRemoveLastChannelError();
    }

    this.channels.remove(channelName);
    publishEvent("channel.removed", {
      projectId: this.identity.getValue(),
      channelName: channelName.getValue(),
    });
  }

  // Queries específicas ao invés de getters genéricos
  public isActive(): boolean {
    return this.attributes.isActive();
  }

  public hasActiveMembers(): boolean {
    return this.attributes.getActiveMemberCount() > 0;
  }

  public getDisplayName(): string {
    return this.attributes.getName().getValue();
  }

  public getChannelCount(): number {
    return this.channels.getCount();
  }

  // Métodos privados para encapsular lógica
  private canBeActivated(): boolean {
    return !this.isActive() && this.hasValidConfiguration();
  }

  private hasValidConfiguration(): boolean {
    return this.attributes.isConfigured();
  }

  private isLastChannel(channelName: ChannelName): boolean {
    return (
      this.channels.getCount() === 1 && this.channels.hasChannel(channelName)
    );
  }
}
```

### Padrões Comportamentais

#### Tell, Don't Ask

```typescript
// ❌ Ask - Cliente faz a lógica
const project = projectRepository.findById(id);
if (project.getStatus() === "active" && project.getChannels().length > 0) {
  project.setStatus("processing");
  eventBus.publish("project.processing", project.getId());
}

// ✅ Tell - Objeto faz a lógica
const project = projectRepository.findById(id);
project.startProcessing(); // O próprio objeto decide se pode e como fazer
```

#### Comportamentos Específicos do Domínio

```typescript
export class Agent {
  // ❌ Getter genérico
  public getStatus(): string {
    return this.status;
  }

  // ✅ Queries específicas
  public isReadyToWork(): boolean {
    return this.status.isIdle() && this.hasValidConfiguration();
  }

  public canAcceptNewTask(): boolean {
    return this.isReadyToWork() && !this.isAtMaxCapacity();
  }

  public isOverloaded(): boolean {
    return this.queue.getSize() > this.getMaxQueueSize();
  }
}
```

---

## Regra 9: Sem Métodos Estáticos em Entidades

### ❌ INCORRETO - Métodos estáticos em entidades

```typescript
export class Project {
  private constructor(
    private readonly identity: ProjectIdentity,
    private readonly attributes: ProjectAttributes,
  ) {}

  // ❌ Método estático na entidade
  public static create(name: string, ownerId: string): Project {
    const identity = new ProjectIdentity(generateId());
    const attributes = ProjectAttributes.create(name, ownerId);
    return new Project(identity, attributes);
  }

  // ❌ Método estático para validação
  public static validateName(name: string): boolean {
    return name.length >= 3 && name.length <= 100;
  }

  // ❌ Método estático para formatação
  public static formatDisplayName(name: string): string {
    return name.trim().toLowerCase();
  }
}
```

### ✅ CORRETO - Factory Functions e Value Objects

```typescript
// Factory function para criação
export function createProject(name: string, ownerId: string): Project {
  const logger = getLogger("createProject");

  try {
    const projectName = new ProjectName(name);
    const projectOwner = new ProjectOwner(ownerId);
    const identity = new ProjectIdentity(generateId());
    const attributes = new ProjectAttributes(projectName, projectOwner);

    const project = new Project(identity, attributes);

    publishEvent("project.created", {
      projectId: identity.getValue(),
      projectName: projectName.getValue(),
    });

    logger.info("Project created", { id: identity.getValue() });

    return project;
  } catch (error) {
    logger.error("Failed to create project", { error, name, ownerId });
    throw new ProjectCreationError("Failed to create project");
  }
}

// Entidade focada em comportamento
export class Project {
  constructor(
    private readonly identity: ProjectIdentity,
    private readonly attributes: ProjectAttributes,
  ) {
    this.validateCreation();
  }

  // Apenas comportamentos de instância
  public activate(): void {
    if (!this.canBeActivated()) {
      throw new ProjectCannotBeActivatedError();
    }

    this.attributes.markAsActive();
  }

  public addMember(member: ProjectMember): void {
    if (!this.canAddMember(member)) {
      throw new CannotAddMemberError();
    }

    this.attributes.addMember(member);
  }

  // Conversion para persistência
  public toSchema(): ProjectSchema {
    return {
      id: this.identity.getValue(),
      ...this.attributes.toSchema(),
    };
  }

  // Factory method para reconstrução (OK porque é criação)
  public static fromSchema(schema: ProjectSchema): Project {
    return new Project(
      new ProjectIdentity(schema.id),
      ProjectAttributes.fromSchema(schema),
    );
  }

  private validateCreation(): void {
    if (!this.identity.isValid() || !this.attributes.areValid()) {
      throw new InvalidProjectError();
    }
  }

  private canBeActivated(): boolean {
    return !this.attributes.isActive() && this.attributes.isConfigured();
  }

  private canAddMember(member: ProjectMember): boolean {
    return this.attributes.isActive() && !this.attributes.hasMember(member);
  }
}

// Value Objects cuidam de validação e formatação
export class ProjectName {
  private readonly value: string;

  constructor(name: string) {
    const validated = ProjectNameSchema.parse(name);
    this.value = this.formatName(validated);
  }

  public getValue(): string {
    return this.value;
  }

  public toDisplayFormat(): string {
    return this.value.charAt(0).toUpperCase() + this.value.slice(1);
  }

  private formatName(name: string): string {
    return name.trim().toLowerCase();
  }
}
```

### Exceções Permitidas para Métodos Estáticos

#### 1. Factory Methods para Reconstrução

```typescript
export class Project {
  // ✅ OK - Reconstrução a partir de dados persistidos
  public static fromSchema(schema: ProjectSchema): Project {
    return new Project(
      new ProjectIdentity(schema.id),
      ProjectAttributes.fromSchema(schema),
    );
  }

  // ✅ OK - Reconstrução a partir de DTO
  public static fromDTO(dto: ProjectDTO): Project {
    return new Project(
      new ProjectIdentity(dto.id),
      ProjectAttributes.fromDTO(dto),
    );
  }
}
```

#### 2. Singletons (Apenas para Infraestrutura)

```typescript
// ✅ OK - Apenas para infraestrutura, nunca entidades de domínio
export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;

  public static getInstance(): DatabaseConnection {
    if (!this.instance) {
      this.instance = new DatabaseConnection();
    }
    return this.instance;
  }
}
```

### Por Que Evitar Métodos Estáticos?

1. **Dificulta testes**: Métodos estáticos são difíceis de mockar
2. **Acoplamento forte**: Cria dependências implícitas
3. **Viola OOP**: Métodos estáticos não são orientados a objetos
4. **Dificulta extensibilidade**: Não podem ser sobrescritos
5. **Estado global**: Podem criar estado compartilhado indesejado

---

# Ferramentas de Validação

## ESLint Configuration

```javascript
// .eslintrc.calisthenics.js
module.exports = {
  extends: ["@typescript-eslint/recommended"],
  rules: {
    // Regra 1: Apenas um nível de indentação
    "max-depth": ["error", 1],

    // Regra 2: Sem ELSE
    "no-else-return": "error",
    "no-unnecessary-else": "error",

    // Regra 4: Máximo 10 linhas por método
    "max-lines-per-function": [
      "error",
      {
        max: 10,
        skipBlankLines: true,
        skipComments: true,
        IIFEs: true,
      },
    ],

    // Regra 5: Máximo 2 parâmetros (força Value Objects)
    "max-params": ["error", 2],

    // Regra 6: Máximo 50 linhas por classe
    "max-lines": [
      "error",
      {
        max: 50,
        skipBlankLines: true,
        skipComments: true,
      },
    ],

    // Regra 8: Sem getters/setters anêmicos
    "accessor-pairs": "off",
    "no-setter-return": "error",

    // Regra 9: Sem métodos estáticos em entidades
    "prefer-static-methods": "off",
    "class-methods-use-this": "error",

    // Outras regras de qualidade
    complexity: ["error", 3],
    "max-nested-callbacks": ["error", 1],
    "prefer-early-return": "error",
  },
  // Rules customizados para Object Calisthenics
  plugins: ["@project-wiz/object-calisthenics"],
  rules: {
    "@project-wiz/max-instance-variables": ["error", 2],
    "@project-wiz/no-primitive-parameters": "error",
    "@project-wiz/collections-first-class": "error",
    "@project-wiz/no-static-in-entities": "error",
  },
};
```

## Scripts de Validação

```json
{
  "scripts": {
    "calisthenics:check": "eslint --config .eslintrc.calisthenics.js src/main/domains/",
    "calisthenics:fix": "eslint --config .eslintrc.calisthenics.js --fix src/main/domains/",
    "quality:full": "npm run lint && npm run type-check && npm run calisthenics:check"
  }
}
```

## Git Hooks

```bash
#!/bin/sh
# .husky/pre-commit

echo "🧘 Checking Object Calisthenics..."
npm run calisthenics:check

if [ $? -ne 0 ]; then
  echo "❌ Object Calisthenics violations found!"
  echo "Run 'npm run calisthenics:fix' to fix automatically or fix manually"
  exit 1
fi

echo "✅ Object Calisthenics check passed!"
```

---

# Checklist de Desenvolvimento

## ✅ Antes de Commit

### Regras de Object Calisthenics

- [ ] Máximo 1 nível de indentação por método
- [ ] Nenhum uso da palavra-chave ELSE
- [ ] Todos os primitivos encapsulados em Value Objects
- [ ] Métodos com máximo 10 linhas
- [ ] Máximo 2 variáveis de instância por classe
- [ ] Classes com máximo 50 linhas
- [ ] Collections são first-class citizens
- [ ] Sem getters/setters anêmicos
- [ ] Sem métodos estáticos em entidades

### Validação Automática

- [ ] `npm run calisthenics:check` passa sem erros
- [ ] `npm run type-check` passa sem erros
- [ ] `npm run lint` passa sem erros

## ✅ Durante Code Review

### Verificações Obrigatórias

- [ ] Value Objects usados para todos os primitivos
- [ ] Entidades ricas com comportamento
- [ ] Métodos expressivos ao invés de getters/setters
- [ ] Factory functions ao invés de métodos estáticos
- [ ] Collections encapsuladas adequadamente
- [ ] Máximo 1 nível de indentação respeitado
- [ ] Nomes autodocumentados

---

# Exercícios Práticos

## Exercício 1: Refatorar Método com Múltiplos Níveis

```typescript
// Refatore este método para ter apenas 1 nível de indentação
public processMessages(messages: Message[]): void {
  for (const message of messages) {
    if (message.isValid()) {
      if (message.getType() === 'text') {
        if (message.getContent().length > 0) {
          if (message.getAuthor().isActive()) {
            this.processTextMessage(message);
            if (message.needsNotification()) {
              this.sendNotification(message);
            }
          }
        }
      } else if (message.getType() === 'image') {
        if (message.hasValidImage()) {
          this.processImageMessage(message);
        }
      }
    }
  }
}
```

## Exercício 2: Eliminar ELSE

```typescript
// Remova todos os ELSEs deste método
public calculateUserDiscount(user: User, purchase: Purchase): number {
  if (user.isPremium()) {
    if (purchase.getAmount() > 1000) {
      return purchase.getAmount() * 0.2;
    } else {
      if (purchase.getAmount() > 500) {
        return purchase.getAmount() * 0.15;
      } else {
        return purchase.getAmount() * 0.1;
      }
    }
  } else {
    if (user.isRegular()) {
      if (purchase.getAmount() > 500) {
        return purchase.getAmount() * 0.05;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
}
```

## Exercício 3: Criar Value Objects

```typescript
// Encapsule todos os primitivos em Value Objects
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly age: number,
    public readonly isActive: boolean,
  ) {}

  public updateEmail(newEmail: string): void {
    // Como validar email aqui?
    this.email = newEmail;
  }

  public canVote(): boolean {
    return this.age >= 18;
  }
}
```

---

# Conclusão

Object Calisthenics são **regras obrigatórias** no Project Wiz que garantem:

1. **Código mais limpo** e legível
2. **Manutenção simplificada**
3. **Testes mais fáceis**
4. **Bugs reduzidos**
5. **Desenvolvimento mais rápido**

Estas práticas são **verificadas automaticamente** e devem ser seguidas por todos os desenvolvedores (humanos e LLMs).

**Próximos Passos:**

1. Configurar validação automática
2. Treinar equipe nas práticas
3. Implementar em novos desenvolvimentos
4. Refatorar código legado gradualmente

---

**Lembre-se**: Object Calisthenics são disciplinas que **forçam boas práticas**. No início pode parecer restritivo, mas rapidamente se torna natural e resulta em código de muito melhor qualidade.

**Status:** Documento obrigatório  
**Próxima Revisão:** Mensal ou conforme necessário  
**Responsável:** Equipe de Desenvolvimento
