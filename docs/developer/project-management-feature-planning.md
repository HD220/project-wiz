# Planejamento da Funcionalidade: Gerenciamento de Projetos

## 📋 Resumo Executivo

Esta documentação detalha o planejamento completo para implementação da funcionalidade de **criação e listagem de projetos** no Project Wiz, seguindo uma arquitetura simples e pragmática com Object Calisthenics e validações Zod.

## 🎯 Objetivos

1. **Persistir projetos** no banco SQLite usando Drizzle ORM
2. **Comunicação IPC** tipada entre frontend e main process
3. **Interface reativa** usando `useSyncExternalStore` para listagem
4. **Código modular** seguindo Object Calisthenics e boas práticas
5. **Validações** usando Zod sempre que possível
6. **Arquitetura simples** sem over-engineering

## 🏗️ Arquitetura Proposta (Simplificada)

### 1. Estrutura de Módulos

```
src/main/modules/project-management/
├── entities/
│   ├── project.entity.ts
│   └── project.schema.ts
├── services/
│   └── project.service.ts
├── mappers/
│   └── project.mapper.ts
├── persistence/
│   ├── schema.ts
│   └── repository.ts
└── ipc/
    └── handlers.ts
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
│   │   └── use-projects.hook.ts
│   └── stores/
│       └── project.store.ts
└── hooks/
    ├── use-ipc-query.hook.ts (já existe)
    └── use-ipc-mutation.hook.ts (já existe)
```

## 🗃️ Esquema do Banco de Dados

### Schema Drizzle (src/main/modules/project-management/infrastructure/persistence/schema.ts)

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const projects = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  description: text("description"),
  gitUrl: text("git_url"),
  status: text("status", {
    enum: ["active", "inactive", "archived"],
  })
    .notNull()
    .default("active"),
  avatar: text("avatar"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type ProjectSchema = typeof projects.$inferSelect;
export type CreateProjectSchema = typeof projects.$inferInsert;
```

## 🎨 Entidades com Validação Zod

### 1. Schema Zod para Validação

```typescript
// src/main/modules/project-management/entities/project.schema.ts
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

export const ProjectSchema = z.object({
  id: z
    .string()
    .cuid2()
    .default(() => createId()),
  name: z
    .string()
    .min(1, "Project name cannot be empty")
    .max(100, "Project name too long")
    .transform((val) => val.trim()),
  description: z.string().optional(),
  gitUrl: z.string().url("Invalid Git URL format").optional(),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  avatar: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProjectSchema = ProjectSchema.partial().extend({
  id: z.string().cuid2(),
  updatedAt: z.date().default(() => new Date()),
});

export type ProjectData = z.infer<typeof ProjectSchema>;
export type CreateProjectData = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectData = z.infer<typeof UpdateProjectSchema>;
```

### 2. Entidade Project (src/main/modules/project-management/entities/project.entity.ts)

```typescript
import {
  ProjectSchema,
  ProjectData,
  UpdateProjectSchema,
} from "./project.schema";

export class ProjectEntity {
  private props: ProjectData;

  constructor(data: Partial<ProjectData> | ProjectData) {
    // Valida automaticamente no construtor
    this.props = ProjectSchema.parse(data);
  }

  // Getters seguindo Object Calisthenics (sem abreviações)
  getId(): string {
    return this.props.id;
  }
  getName(): string {
    return this.props.name;
  }
  getDescription(): string | undefined {
    return this.props.description;
  }
  getGitUrl(): string | undefined {
    return this.props.gitUrl;
  }
  getStatus(): "active" | "inactive" | "archived" {
    return this.props.status;
  }
  getAvatar(): string | undefined {
    return this.props.avatar;
  }
  getCreatedAt(): Date {
    return this.props.createdAt;
  }
  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Update methods with Zod validation
  updateName(data: { name: string }): void {
    const validated = z.object({ name: ProjectSchema.shape.name }).parse(data);
    this.props.name = validated.name;
    this.props.updatedAt = new Date();
  }

  updateDescription(data: { description?: string }): void {
    const validated = z
      .object({
        description: ProjectSchema.shape.description,
      })
      .parse(data);
    this.props.description = validated.description;
    this.props.updatedAt = new Date();
  }

  updateGitUrl(data: { gitUrl?: string }): void {
    const validated = z
      .object({
        gitUrl: ProjectSchema.shape.gitUrl,
      })
      .parse(data);
    this.props.gitUrl = validated.gitUrl;
    this.props.updatedAt = new Date();
  }

  archive(): void {
    this.props.status = "archived";
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.status = "active";
    this.props.updatedAt = new Date();
  }

  toPlainObject(): ProjectData {
    return { ...this.props };
  }
}
```

## 🔄 Service Layer (Simplificado)

```typescript
// src/main/modules/project-management/services/project.service.ts
import { ProjectEntity } from "../entities/project.entity";
import { ProjectRepository } from "../persistence/repository";
import {
  CreateProjectData,
  UpdateProjectData,
  ProjectData,
} from "../entities/project.schema";

export class ProjectService {
  private projectEntity: ProjectEntity;

  constructor(private repository: ProjectRepository) {
    this.projectEntity = new ProjectEntity();
  }

  async createProject(data: CreateProjectData): Promise<ProjectData> {
    const project = this.projectEntity.create(data);
    const saved = await this.repository.save(project.toPlainObject());
    return saved;
  }

  async listProjects(filter?: {
    status?: "active" | "inactive" | "archived";
    limit?: number;
    offset?: number;
  }): Promise<ProjectData[]> {
    return this.repository.findMany(filter);
  }

  async getProjectById(data: { id: string }): Promise<ProjectData | null> {
    return this.repository.findById(data.id);
  }

  async updateProject(data: UpdateProjectData): Promise<ProjectData> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const project = this.projectEntity.restore(existing);

    if (data.name !== undefined) {
      project.updateName({ name: data.name });
    }
    if (data.description !== undefined) {
      project.updateDescription({ description: data.description });
    }
    if (data.gitUrl !== undefined) {
      project.updateGitUrl({ gitUrl: data.gitUrl });
    }

    return this.repository.update(project.toPlainObject());
  }

  async deleteProject(data: { id: string }): Promise<void> {
    await this.repository.delete(data.id);
  }

  async archiveProject(data: { id: string }): Promise<ProjectData> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Project not found");
    }

    const project = this.projectEntity.restore(existing);
    project.archive();

    return this.repository.update(project.toPlainObject());
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
  status: "active" | "inactive" | "archived";
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
  status?: "active" | "inactive" | "archived";
  limit?: number;
  offset?: number;
}
```

### 2. IPC Handlers (src/main/modules/project-management/ipc/handlers.ts)

```typescript
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { ProjectService } from '../services/project.service';
import { ProjectMapper } from '../mappers/project.mapper';
import { CreateProjectDto, UpdateProjectDto, ProjectFilterDto } from '../../../shared/types/project.types';

export class ProjectIpcHandlers {
  constructor(
    private projectService: ProjectService,
    private projectMapper: ProjectMapper
  ) {}

  registerHandlers(): void {
    ipcMain.handle('project:create', this.handleCreateProject.bind(this));
    ipcMain.handle('project:list', this.handleListProjects.bind(this));
    ipcMain.handle('project:getById', this.handleGetProjectById.bind(this));
    ipcMain.handle('project:update', this.handleUpdateProject.bind(this));
    ipcMain.handle('project:delete', this.handleDeleteProject.bind(this));
    ipcMain.handle('project:archive', this.handleArchiveProject.bind(this));
  }

  private async handleCreateProject(
    event: IpcMainInvokeEvent,
    data: CreateProjectDto
  ): Promise<ProjectDto> {
    try {
      const project = await this.projectService.createProject(data);
      return this.projectMapper.toDto(project);
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  private async handleListProjects(
    event: IpcMainInvokeEvent,
    filter?: ProjectFilterDto
  ): Promise<ProjectDto[]> {
    const projects = await this.projectService.listProjects(filter);
    return projects.map(project => this.projectMapper.toDto(project));
  }

  private async handleGetProjectById(
    event: IpcMainInvokeEvent,
    data: { id: string }
  ): Promise<ProjectDto | null> {
    const project = await this.projectService.getProjectById(data);
    return project ? this.projectMapper.toDto(project) : null;
  }

  private async handleUpdateProject(
    event: IpcMainInvokeEvent,
    data: UpdateProjectDto
  ): Promise<ProjectDto> {
    const project = await this.projectService.updateProject(data);
    return this.projectMapper.toDto(project);
  }

  private async handleDeleteProject(
    event: IpcMainInvokeEvent,
    data: { id: string }
  ): Promise<void> {
    await this.projectService.deleteProject(data);
  }

  private async handleArchiveProject(
    event: IpcMainInvokeEvent,
    data: { id: string }
  ): Promise<ProjectDto> {
    const project = await this.projectService.archiveProject(data);
    return this.projectMapper.toDto(project);
  }
}
```

### 3. Mapper Separado (src/main/modules/project-management/mappers/project.mapper.ts)

```typescript
import { ProjectData } from '../entities/project.schema';
import { ProjectDto } from '../../../shared/types/project.types';

export class ProjectMapper {
  toDto(project: ProjectData): ProjectDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      gitUrl: project.gitUrl,
      status: project.status,
      avatar: project.avatar,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      unreadCount: 0, // Default para compatibilidade com UI
      lastActivity: project.updatedAt.toISOString(),
    };
  }

  fromDto(dto: CreateProjectDto): Partial<ProjectData> {
    return {
      name: dto.name,
      description: dto.description,
      gitUrl: dto.gitUrl,
      avatar: dto.avatar,
    };
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
      const projects = await window.electronIPC.invoke("project:list", filter);
      this.setState({ projects, isLoading: false });
    } catch (error) {
      this.setState({
        error: error.message,
        isLoading: false,
      });
    }
  }

  async createProject(dto: CreateProjectDto): Promise<void> {
    try {
      const result = await window.electronIPC.invoke("project:create", dto);
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
    this.listeners.forEach((listener) => listener());
  }
}

export const projectStore = new ProjectStore();
```

### 2. Hook Único para Projetos

```typescript
// src/renderer/features/project-management/hooks/use-projects.hook.ts
export function useProjects(filter?: ProjectFilterDto) {
  const state = useSyncExternalStore(
    projectStore.subscribe,
    projectStore.getSnapshot,
    projectStore.getServerSnapshot,
  );

  // Mutations (operações que modificam dados)
  const mutations = useMemo(() => ({
    createProject: (data: CreateProjectDto) => projectStore.createProject(data),
    updateProject: (data: UpdateProjectDto) => projectStore.updateProject(data),
    deleteProject: (data: { id: string }) => projectStore.deleteProject(data),
    archiveProject: (data: { id: string }) => projectStore.archiveProject(data),
  }), []);

  // Queries (operações de busca/listagem)
  const queries = useMemo(() => ({
    loadProjects: (newFilter?: ProjectFilterDto) => 
      projectStore.loadProjects(newFilter || filter),
    getProjectById: (data: { id: string }) => 
      projectStore.getProjectById(data),
    refreshProjects: () => projectStore.loadProjects(filter),
  }), [filter]);

  // Auto-load na inicialização
  useEffect(() => {
    queries.loadProjects();
  }, [queries.loadProjects]);

  return {
    // Estado
    projects: state.projects,
    isLoading: state.isLoading,
    error: state.error,
    selectedProject: state.selectedProject,
    
    // Operações
    ...mutations,
    ...queries,
  };
}
```

### 3. Componentes React

```typescript
// src/renderer/features/project-management/components/project-list.component.tsx
export function ProjectList() {
  const { projects, isLoading, error, refreshProjects } = useProjects({
    status: 'active'
  });

  if (isLoading) return <ProjectListSkeleton />;
  if (error) return <ErrorMessage error={error} onRetry={refreshProjects} />;

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

## 📋 Observações sobre Testes

**Decisão**: Não implementar testes neste momento - muito cedo no desenvolvimento.

**Futuramente considerar**:

- Testes de unidade para service layer
- Testes de integração para IPC
- Testes de validação Zod
- Testes de UI quando interface estabilizar

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
            throw new Error("Invalid git");
          }
        } else {
          return this.repo.save({ name, desc, avt });
        }
      } else {
        throw new Error("Name too long");
      }
    } else {
      throw new Error("Name required");
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

## 🚀 Plano de Implementação (Simplificado)

### Fase 1: Infraestrutura Base

1. ✅ Criar schema Drizzle
2. ✅ Implementar schemas Zod para validação
3. ✅ Implementar entidade Project
4. ✅ Criar repository

### Fase 2: Service Layer

1. ✅ Implementar ProjectService
2. ✅ Configurar dependências

### Fase 3: Comunicação IPC

1. ✅ Definir tipos compartilhados
2. ✅ Implementar IPC handlers
3. ✅ Atualizar preload script

### Fase 4: Frontend

1. ✅ Implementar store com useSyncExternalStore
2. ✅ Criar hooks personalizados
3. ✅ Atualizar componentes existentes
4. ✅ Conectar modal de criação

### Fase 5: Refinamento

1. ✅ Testes manuais
2. ✅ Otimizações de performance
3. ✅ Melhorias de UX

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
];
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
