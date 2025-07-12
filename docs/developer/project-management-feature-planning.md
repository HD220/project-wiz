# Planejamento da Funcionalidade: Gerenciamento de Projetos

## 📋 Resumo Executivo

Esta documentação detalha o planejamento completo para implementação da funcionalidade de **criação e listagem de projetos** no Project Wiz, seguindo os padrões arquiteturais existentes e princípios de Clean Architecture, DDD e Object Calisthenics.

## 🎯 Objetivos

1. **Persistir projetos** no banco SQLite usando Drizzle ORM
2. **Comunicação IPC** tipada entre frontend e main process
3. **Interface reativa** usando `useSyncExternalStore` para listagem
4. **Código modular** seguindo Object Calisthenics e boas práticas
5. **Manter consistência** com padrões existentes do projeto

## 🏗️ Arquitetura Proposta

### 1. Estrutura de Módulos (Domain-Driven Design)

```
src/main/modules/project-management/
├── application/
│   ├── commands/
│   │   ├── create-project.command.ts
│   │   └── delete-project.command.ts
│   ├── queries/
│   │   ├── get-project-by-id.query.ts
│   │   └── list-projects.query.ts
│   └── handlers/
│       ├── create-project.handler.ts
│       ├── delete-project.handler.ts
│       ├── get-project-by-id.handler.ts
│       └── list-projects.handler.ts
├── domain/
│   ├── entities/
│   │   └── project.entity.ts
│   ├── value-objects/
│   │   ├── project-id.vo.ts
│   │   ├── project-name.vo.ts
│   │   └── git-url.vo.ts
│   ├── repositories/
│   │   └── project.repository.interface.ts
│   └── services/
│       └── project-validation.service.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── schema.ts
│   │   ├── project.repository.ts
│   │   └── mappers/
│   │       └── project.mapper.ts
│   └── ipc/
│       └── project.ipc-handler.ts
└── index.ts
```

### 2. Tipos Compartilhados (IPC Communication)

```
src/shared/
├── types/
│   ├── project.types.ts
│   └── ipc.types.ts
└── interfaces/
    └── project.interface.ts
```

### 3. Frontend (Renderer Process)

```
src/renderer/
├── features/project-management/
│   ├── components/
│   │   ├── project-list.component.tsx
│   │   ├── project-card.component.tsx
│   │   └── create-project-form.component.tsx
│   ├── hooks/
│   │   ├── use-projects.hook.ts
│   │   ├── use-create-project.hook.ts
│   │   └── use-project-store.hook.ts
│   └── stores/
│       └── project.store.ts
└── hooks/
    ├── use-ipc-query.hook.ts (já existe)
    └── use-ipc-mutation.hook.ts (já existe)
```

## 🗃️ Esquema do Banco de Dados

### Schema Drizzle (src/main/modules/project-management/infrastructure/persistence/schema.ts)

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  gitUrl: text('git_url'),
  status: text('status', { 
    enum: ['active', 'inactive', 'archived'] 
  }).notNull().default('active'),
  avatar: text('avatar'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type ProjectSchema = typeof projects.$inferSelect;
export type CreateProjectSchema = typeof projects.$inferInsert;
```

## 🎨 Entidades de Domínio

### 1. Entidade Project (src/main/modules/project-management/domain/entities/project.entity.ts)

```typescript
export class ProjectEntity {
  private constructor(
    private readonly props: ProjectProps
  ) {}

  static create(props: CreateProjectProps): Result<ProjectEntity> {
    // Validações e criação da entidade
  }

  static restore(props: ProjectProps): ProjectEntity {
    // Restaurar entidade do banco
  }

  // Getters
  get id(): ProjectId { return this.props.id; }
  get name(): ProjectName { return this.props.name; }
  get description(): string | undefined { return this.props.description; }
  get gitUrl(): GitUrl | undefined { return this.props.gitUrl; }
  get status(): ProjectStatus { return this.props.status; }
  get avatar(): string | undefined { return this.props.avatar; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Methods
  updateName(name: ProjectName): void;
  updateDescription(description: string): void;
  updateGitUrl(gitUrl: GitUrl): void;
  archive(): void;
  activate(): void;
  toPlainObject(): ProjectPlainObject;
}
```

### 2. Value Objects

```typescript
// project-id.vo.ts
export class ProjectId {
  private constructor(private readonly value: string) {}
  
  static create(value?: string): ProjectId {
    return new ProjectId(value || createId());
  }
  
  toString(): string {
    return this.value;
  }
}

// project-name.vo.ts
export class ProjectName {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<ProjectName> {
    if (!value.trim()) {
      return Result.fail('Project name cannot be empty');
    }
    if (value.length > 100) {
      return Result.fail('Project name too long');
    }
    return Result.ok(new ProjectName(value.trim()));
  }
  
  toString(): string {
    return this.value;
  }
}

// git-url.vo.ts
export class GitUrl {
  private constructor(private readonly value: string) {}
  
  static create(value: string): Result<GitUrl> {
    if (!this.isValidGitUrl(value)) {
      return Result.fail('Invalid Git URL format');
    }
    return Result.ok(new GitUrl(value));
  }
  
  private static isValidGitUrl(url: string): boolean {
    // Validação de URL Git
  }
  
  toString(): string {
    return this.value;
  }
}
```

## 🔄 Camada de Aplicação (CQRS)

### 1. Commands

```typescript
// create-project.command.ts
export class CreateProjectCommand {
  constructor(
    public readonly name: string,
    public readonly description?: string,
    public readonly gitUrl?: string,
    public readonly avatar?: string
  ) {}
}

// create-project.handler.ts
export class CreateProjectHandler {
  constructor(
    private readonly projectRepository: ProjectRepositoryInterface,
    private readonly eventBus: EventBusInterface
  ) {}

  async handle(command: CreateProjectCommand): Promise<Result<ProjectEntity>> {
    // 1. Criar value objects
    // 2. Criar entidade
    // 3. Persistir no repositório
    // 4. Emitir evento de domínio
    // 5. Retornar resultado
  }
}
```

### 2. Queries

```typescript
// list-projects.query.ts
export class ListProjectsQuery {
  constructor(
    public readonly status?: ProjectStatus,
    public readonly limit?: number,
    public readonly offset?: number
  ) {}
}

// list-projects.handler.ts
export class ListProjectsHandler {
  constructor(
    private readonly projectRepository: ProjectRepositoryInterface
  ) {}

  async handle(query: ListProjectsQuery): Promise<ProjectEntity[]> {
    return this.projectRepository.findMany(query);
  }
}
```

## 🔌 Comunicação IPC

### 1. Tipos Compartilhados (src/shared/types/project.types.ts)

```typescript
export interface ProjectDto {
  id: string;
  name: string;
  description?: string;
  gitUrl?: string;
  status: 'active' | 'inactive' | 'archived';
  avatar?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  unreadCount: number; // Para compatibilidade com UI existente
  lastActivity: string; // ISO string
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  gitUrl?: string;
  avatar?: string;
}

export interface UpdateProjectDto {
  id: string;
  name?: string;
  description?: string;
  gitUrl?: string;
  avatar?: string;
}

export interface ProjectFilterDto {
  status?: 'active' | 'inactive' | 'archived';
  limit?: number;
  offset?: number;
}
```

### 2. IPC Handlers (src/main/modules/project-management/infrastructure/ipc/project.ipc-handler.ts)

```typescript
export class ProjectIpcHandler {
  constructor(
    private readonly createProjectHandler: CreateProjectHandler,
    private readonly listProjectsHandler: ListProjectsHandler,
    private readonly getProjectByIdHandler: GetProjectByIdHandler,
    private readonly deleteProjectHandler: DeleteProjectHandler
  ) {}

  registerHandlers(): void {
    ipcMain.handle('project:create', this.handleCreateProject.bind(this));
    ipcMain.handle('project:list', this.handleListProjects.bind(this));
    ipcMain.handle('project:getById', this.handleGetProjectById.bind(this));
    ipcMain.handle('project:delete', this.handleDeleteProject.bind(this));
  }

  private async handleCreateProject(
    event: IpcMainInvokeEvent,
    dto: CreateProjectDto
  ): Promise<Result<ProjectDto>> {
    // Implementação
  }

  private async handleListProjects(
    event: IpcMainInvokeEvent,
    filter?: ProjectFilterDto
  ): Promise<ProjectDto[]> {
    // Implementação
  }
}
```

## 🎯 Frontend Implementation

### 1. Store usando useSyncExternalStore

```typescript
// src/renderer/features/project-management/stores/project.store.ts
interface ProjectStoreState {
  projects: ProjectDto[];
  isLoading: boolean;
  error: string | null;
  selectedProject: ProjectDto | null;
}

class ProjectStore {
  private state: ProjectStoreState = {
    projects: [],
    isLoading: false,
    error: null,
    selectedProject: null,
  };

  private listeners = new Set<() => void>();

  // useSyncExternalStore interface
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;

  getServerSnapshot = () => this.state;

  // Actions
  async loadProjects(filter?: ProjectFilterDto): Promise<void> {
    this.setState({ isLoading: true, error: null });
    
    try {
      const projects = await window.electronIPC.invoke('project:list', filter);
      this.setState({ projects, isLoading: false });
    } catch (error) {
      this.setState({ 
        error: error.message, 
        isLoading: false 
      });
    }
  }

  async createProject(dto: CreateProjectDto): Promise<void> {
    try {
      const result = await window.electronIPC.invoke('project:create', dto);
      if (result.isSuccess) {
        await this.loadProjects(); // Recarregar lista
      } else {
        this.setState({ error: result.error });
      }
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  private setState(partialState: Partial<ProjectStoreState>): void {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach(listener => listener());
  }
}

export const projectStore = new ProjectStore();
```

### 2. Hook personalizado

```typescript
// src/renderer/features/project-management/hooks/use-projects.hook.ts
export function useProjects(filter?: ProjectFilterDto) {
  const state = useSyncExternalStore(
    projectStore.subscribe,
    projectStore.getSnapshot,
    projectStore.getServerSnapshot
  );

  const loadProjects = useCallback(
    (newFilter?: ProjectFilterDto) => {
      return projectStore.loadProjects(newFilter || filter);
    },
    [filter]
  );

  const createProject = useCallback(
    (dto: CreateProjectDto) => {
      return projectStore.createProject(dto);
    },
    []
  );

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects: state.projects,
    isLoading: state.isLoading,
    error: state.error,
    selectedProject: state.selectedProject,
    loadProjects,
    createProject,
  };
}
```

### 3. Componentes React

```typescript
// src/renderer/features/project-management/components/project-list.component.tsx
export function ProjectList() {
  const { projects, isLoading, error, loadProjects } = useProjects({
    status: 'active'
  });

  if (isLoading) return <ProjectListSkeleton />;
  if (error) return <ErrorMessage error={error} onRetry={loadProjects} />;

  return (
    <div className="space-y-2">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

// src/renderer/features/project-management/components/project-card.component.tsx
interface ProjectCardProps {
  project: ProjectDto;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="p-4 hover:bg-muted/50 cursor-pointer">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={project.avatar} />
          <AvatarFallback>{project.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{project.name}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {project.description}
          </p>
        </div>
        {project.unreadCount > 0 && (
          <Badge variant="secondary">{project.unreadCount}</Badge>
        )}
      </div>
    </Card>
  );
}
```

## 🧪 Object Calisthenics Aplicado

### Regras Seguidas:

1. **Um nível de indentação por método**: Cada método mantém complexidade baixa
2. **Não use a palavra-chave ELSE**: Usar early returns e guard clauses
3. **Wrap primitivos e strings**: Value Objects (ProjectId, ProjectName, GitUrl)
4. **Coleções de primeira classe**: Arrays/listas encapsuladas quando necessário
5. **Um ponto por linha**: Evitar method chaining excessivo
6. **Não abrevie**: Nomes descritivos e explícitos
7. **Mantenha entidades pequenas**: Máximo 50 linhas por classe
8. **Máximo duas propriedades de instância por classe**: Usar composição
9. **Sem getters/setters**: Métodos com intenção explícita

### Exemplo de Aplicação:

```typescript
// ❌ Violação das regras
export class ProjectService {
  createProject(name, desc, git, avt) {
    if (name && name.length > 0) {
      if (name.length <= 100) {
        if (git) {
          if (this.isValidGit(git)) {
            return this.repo.save({ name, desc, git, avt });
          } else {
            throw new Error('Invalid git');
          }
        } else {
          return this.repo.save({ name, desc, avt });
        }
      } else {
        throw new Error('Name too long');
      }
    } else {
      throw new Error('Name required');
    }
  }
}

// ✅ Seguindo Object Calisthenics
export class CreateProjectHandler {
  constructor(private readonly repository: ProjectRepositoryInterface) {}

  async handle(command: CreateProjectCommand): Promise<Result<ProjectEntity>> {
    const nameResult = ProjectName.create(command.name);
    if (nameResult.isFailure) {
      return Result.fail(nameResult.error);
    }

    const gitUrlResult = this.createGitUrlIfProvided(command.gitUrl);
    if (gitUrlResult.isFailure) {
      return Result.fail(gitUrlResult.error);
    }

    const project = ProjectEntity.create({
      name: nameResult.value,
      description: command.description,
      gitUrl: gitUrlResult.value,
      avatar: command.avatar,
    });

    return this.repository.save(project);
  }

  private createGitUrlIfProvided(url?: string): Result<GitUrl | undefined> {
    if (!url) {
      return Result.ok(undefined);
    }
    return GitUrl.create(url);
  }
}
```

## 📝 Testes Planejados

### 1. Testes de Unidade
- Value Objects (ProjectName, GitUrl, ProjectId)
- Entidade Project
- Handlers (Commands/Queries)
- Repository implementation

### 2. Testes de Integração
- IPC communication
- Database operations
- End-to-end project creation flow

### 3. Testes de UI
- Components rendering
- User interactions
- State management

## 🚀 Plano de Implementação

### Fase 1: Infraestrutura Base
1. ✅ Criar schema Drizzle
2. ✅ Implementar entidade de domínio
3. ✅ Implementar value objects
4. ✅ Criar interfaces de repositório

### Fase 2: Camada de Aplicação
1. ✅ Implementar commands e queries
2. ✅ Implementar handlers
3. ✅ Configurar repository concrete

### Fase 3: Comunicação IPC
1. ✅ Definir tipos compartilhados
2. ✅ Implementar IPC handlers
3. ✅ Atualizar preload script

### Fase 4: Frontend
1. ✅ Implementar store com useSyncExternalStore
2. ✅ Criar hooks personalizados
3. ✅ Atualizar componentes existentes
4. ✅ Conectar modal de criação

### Fase 5: Testes e Refinamento
1. ✅ Escrever testes unitários
2. ✅ Escrever testes de integração
3. ✅ Testes de UI
4. ✅ Refinamentos e otimizações

## 📊 Critérios de Sucesso

- ✅ Projetos persistidos corretamente no SQLite
- ✅ Interface reativa atualizando automaticamente
- ✅ Comunicação IPC tipada e funcional
- ✅ Código seguindo Object Calisthenics
- ✅ Padrões arquiteturais consistentes
- ✅ Cobertura de testes >= 80%
- ✅ Performance adequada (< 100ms para operações CRUD)

## 🔧 Configurações Necessárias

### 1. Atualizar drizzle.config.ts
```typescript
schema: [
  "./src/main/persistence/schema.ts",
  "./src/main/modules/project-management/infrastructure/persistence/schema.ts",
  // ... outros schemas
]
```

### 2. Adicionar ao package.json (se necessário)
```json
{
  "dependencies": {
    "@paralleldrive/cuid2": "^2.2.2"
  }
}
```

### 3. Atualizar tipos do preload
```typescript
// src/renderer/preload.ts - adicionar novos métodos IPC
```

Este planejamento garante uma implementação robusta, seguindo todos os princípios arquiteturais estabelecidos no projeto e mantendo alta qualidade de código.