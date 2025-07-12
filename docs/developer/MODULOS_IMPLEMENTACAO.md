# Guia de Implementação de Novos Módulos

## 📖 Introdução

Este guia ensina como implementar novos módulos no Project Wiz seguindo os padrões arquiteturais já estabelecidos. Se você é um desenvolvedor júnior, este documento irá te guiar passo a passo para criar funcionalidades robustas e consistentes.

## 🏗️ Arquitetura do Sistema

O Project Wiz segue uma **arquitetura Electron** com dois processos principais:

- **Main Process (Node.js)**: Backend da aplicação - lógica de negócio, banco de dados, APIs externas
- **Renderer Process (React)**: Frontend da aplicação - interface do usuário, estado da UI

### Comunicação Entre Processos

A comunicação acontece via **IPC (Inter-Process Communication)**:
```
Renderer ←→ IPC ←→ Main Process ←→ Database/APIs
```

## 📋 Padrões Arquiteturais

### 1. **Clean Architecture + DDD (Domain-Driven Design)**

Cada módulo é organizado em camadas bem definidas:

```
src/main/modules/[nome-do-modulo]/
├── persistence/
│   ├── schema.ts          # Definição das tabelas (Drizzle)
│   └── repository.ts      # Acesso aos dados (CRUD)
├── domain/
│   └── [entidade].entity.ts  # Lógica de negócio
├── application/
│   └── [entidade].service.ts # Regras de aplicação
├── ipc/
│   └── handlers.ts        # Handlers para comunicação IPC
└── [entidade].mapper.ts   # Conversão Entity ↔ DTO
```

### 2. **Padrão de Nomenclatura**

- **Arquivos**: `kebab-case` (ex: `user-management.service.ts`)
- **Classes**: `PascalCase` (ex: `UserService`)
- **Variáveis/Funções**: `camelCase` (ex: `createUser`)
- **Constantes**: `SCREAMING_SNAKE_CASE` (ex: `DATABASE_URL`)
- **Canais IPC**: `modulo:operacao` (ex: `user:create`, `channel:list`)

### 3. **Tipos e Interfaces**

- **DTOs**: Em `/src/shared/types/` para comunicação IPC
- **Entities**: No domain do módulo
- **Schemas**: Para validação (Zod + Drizzle)

## 🎯 Passo a Passo para Implementar um Novo Módulo

### **ETAPA 1: Definir Tipos Compartilhados**

**Arquivo**: `/src/shared/types/[modulo].types.ts`

```typescript
// Exemplo: /src/shared/types/channel.types.ts

// DTO para criar um novo item
export interface CreateChannelDto {
  name: string;
  description?: string;
  type: 'general' | 'task' | 'agent' | 'custom';
  projectId: string;
  isPrivate?: boolean;
}

// DTO para atualizar item existente
export interface UpdateChannelDto {
  id: string;
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

// DTO para resposta (output)
export interface ChannelDto {
  id: string;
  name: string;
  description?: string;
  type: string;
  projectId: string;
  isPrivate: boolean;
  isArchived: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para filtros
export interface ChannelFilterDto {
  projectId?: string;
  type?: string;
  isArchived?: boolean;
}
```

**💡 Dica**: DTOs são "contratos" entre frontend e backend. Sempre termine com `Dto`.

### **ETAPA 2: Schema do Banco de Dados**

**Arquivo**: `/src/main/modules/[modulo]/persistence/schema.ts`

```typescript
// Exemplo: /src/main/modules/communication/persistence/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const channels = sqliteTable("channels", {
  // ID sempre UUID
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  
  // Campos obrigatórios
  name: text("name").notNull(),
  projectId: text("project_id").notNull(),
  createdBy: text("created_by").notNull(),
  
  // Campos opcionais
  description: text("description"),
  
  // Enums como texto
  type: text("type", {
    enum: ["general", "task", "agent", "custom"],
  }).notNull().default("general"),
  
  // Booleanos como integer
  isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(false),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  
  // Timestamps automáticos
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Tipos inferidos automaticamente
export type ChannelSchema = typeof channels.$inferSelect;
export type CreateChannelSchema = typeof channels.$inferInsert;
```

**💡 Convenções obrigatórias**:
- Nomes de tabela: plural em inglês (`channels`, `users`, `projects`)
- IDs: sempre UUID com `randomUUID()`
- Timestamps: `created_at` e `updated_at` automáticos
- Booleanos: `integer` com `mode: "boolean"`

### **ETAPA 3: Gerar e Aplicar Migração**

```bash
# 1. Gerar migração
npm run db:generate

# 2. Aplicar ao banco
npm run db:migrate
```

### **ETAPA 4: Repository (Acesso aos Dados)**

**Arquivo**: `/src/main/modules/[modulo]/persistence/repository.ts`

```typescript
// Exemplo: /src/main/modules/communication/persistence/repository.ts
import { eq, and, desc } from "drizzle-orm";
import { db } from "../../../persistence/db";
import { channels, type ChannelSchema, type CreateChannelSchema } from "./schema";
import type { ChannelFilterDto } from "../../../../shared/types/channel.types";

export class ChannelRepository {
  
  // CREATE
  async save(data: CreateChannelSchema): Promise<ChannelSchema> {
    const [channel] = await db
      .insert(channels)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return channel;
  }

  // READ (lista com filtros)
  async findMany(filter?: ChannelFilterDto): Promise<ChannelSchema[]> {
    let query = db.select().from(channels);

    // Aplicar filtros se existirem
    if (filter) {
      const conditions = [];
      
      if (filter.projectId) {
        conditions.push(eq(channels.projectId, filter.projectId));
      }
      
      if (filter.type) {
        conditions.push(eq(channels.type, filter.type));
      }
      
      if (filter.isArchived !== undefined) {
        conditions.push(eq(channels.isArchived, filter.isArchived));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    return query.orderBy(desc(channels.createdAt));
  }

  // READ (por ID)
  async findById(id: string): Promise<ChannelSchema | null> {
    const [channel] = await db
      .select()
      .from(channels)
      .where(eq(channels.id, id))
      .limit(1);
    
    return channel || null;
  }

  // UPDATE
  async update(id: string, data: Partial<CreateChannelSchema>): Promise<ChannelSchema> {
    const [updated] = await db
      .update(channels)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(channels.id, id))
      .returning();
    
    return updated;
  }

  // DELETE
  async delete(id: string): Promise<void> {
    await db.delete(channels).where(eq(channels.id, id));
  }
}
```

**💡 Padrões do Repository**:
- Sempre use `.returning()` em INSERT/UPDATE
- Filtros opcionais com `and(...conditions)`
- Ordem por `created_at` descendente
- Métodos padrão: `save`, `findMany`, `findById`, `update`, `delete`

### **ETAPA 5: Entity (Lógica de Domínio)**

**Arquivo**: `/src/main/modules/[modulo]/domain/[entidade].entity.ts`

```typescript
// Exemplo: /src/main/modules/communication/domain/channel.entity.ts
export class Channel {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly projectId: string,
    public readonly type: 'general' | 'task' | 'agent' | 'custom',
    public readonly isPrivate: boolean = false,
    public readonly isArchived: boolean = false,
    public readonly description?: string,
    public readonly createdBy?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  // Métodos de lógica de negócio
  static validateName(name: string): boolean {
    return name.length >= 2 && name.length <= 50 && /^[a-zA-Z0-9-_]+$/.test(name);
  }

  canBeAccessedBy(userId: string): boolean {
    if (!this.isPrivate) return true;
    return this.createdBy === userId;
  }

  isEditable(): boolean {
    return !this.isArchived;
  }

  // Factory methods
  static createGeneral(name: string, projectId: string, createdBy: string): Channel {
    return new Channel(
      '', // ID será gerado pelo banco
      name,
      projectId,
      'general',
      false,
      false,
      undefined,
      createdBy
    );
  }
}
```

**💡 Regras da Entity**:
- Apenas lógica de domínio (validações, regras de negócio)
- Imutável (readonly properties)
- Factory methods para casos específicos
- Sem dependências externas

### **ETAPA 6: Mapper (Conversão Entity ↔ DTO)**

**Arquivo**: `/src/main/modules/[modulo]/[entidade].mapper.ts`

```typescript
// Exemplo: /src/main/modules/communication/channel.mapper.ts
import { Channel } from "./domain/channel.entity";
import type { ChannelDto } from "../../shared/types/channel.types";
import type { ChannelSchema } from "./persistence/schema";

export class ChannelMapper {
  
  // Schema → Entity
  toDomain(schema: ChannelSchema): Channel {
    return new Channel(
      schema.id,
      schema.name,
      schema.projectId,
      schema.type as 'general' | 'task' | 'agent' | 'custom',
      schema.isPrivate,
      schema.isArchived,
      schema.description || undefined,
      schema.createdBy,
      schema.createdAt,
      schema.updatedAt,
    );
  }

  // Entity → DTO (para o frontend)
  toDto(entity: Channel): ChannelDto {
    return {
      id: entity.id,
      name: entity.name,
      projectId: entity.projectId,
      type: entity.type,
      isPrivate: entity.isPrivate,
      isArchived: entity.isArchived,
      description: entity.description,
      createdBy: entity.createdBy || '',
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  // Schema → DTO (direto, sem entity)
  schemaToDtoFast(schema: ChannelSchema): ChannelDto {
    return {
      id: schema.id,
      name: schema.name,
      projectId: schema.projectId,
      type: schema.type,
      isPrivate: schema.isPrivate,
      isArchived: schema.isArchived,
      description: schema.description || undefined,
      createdBy: schema.createdBy,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };
  }
}
```

### **ETAPA 7: Service (Regras de Aplicação)**

**Arquivo**: `/src/main/modules/[modulo]/application/[entidade].service.ts`

```typescript
// Exemplo: /src/main/modules/communication/application/channel.service.ts
import { ChannelRepository } from "../persistence/repository";
import { Channel } from "../domain/channel.entity";
import { ChannelMapper } from "../channel.mapper";
import type { 
  CreateChannelDto, 
  UpdateChannelDto, 
  ChannelFilterDto 
} from "../../../shared/types/channel.types";

export class ChannelService {
  constructor(
    private repository: ChannelRepository,
    private mapper: ChannelMapper,
  ) {}

  async createChannel(data: CreateChannelDto): Promise<Channel> {
    // Validação de negócio
    if (!Channel.validateName(data.name)) {
      throw new Error("Nome do canal inválido");
    }

    // Verificar se já existe canal com esse nome no projeto
    const existing = await this.repository.findMany({
      projectId: data.projectId,
    });
    
    if (existing.some(ch => ch.name.toLowerCase() === data.name.toLowerCase())) {
      throw new Error("Já existe um canal com este nome neste projeto");
    }

    // Salvar no banco
    const saved = await this.repository.save({
      name: data.name,
      description: data.description,
      type: data.type,
      projectId: data.projectId,
      isPrivate: data.isPrivate || false,
      createdBy: data.createdBy || 'system',
    });

    return this.mapper.toDomain(saved);
  }

  async listChannels(filter?: ChannelFilterDto): Promise<Channel[]> {
    const schemas = await this.repository.findMany(filter);
    return schemas.map(schema => this.mapper.toDomain(schema));
  }

  async getChannelById(id: string): Promise<Channel | null> {
    const schema = await this.repository.findById(id);
    return schema ? this.mapper.toDomain(schema) : null;
  }

  async updateChannel(data: UpdateChannelDto): Promise<Channel> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Canal não encontrado");
    }

    if (existing.isArchived) {
      throw new Error("Não é possível editar canal arquivado");
    }

    const updated = await this.repository.update(data.id, data);
    return this.mapper.toDomain(updated);
  }

  async deleteChannel(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Canal não encontrado");
    }

    await this.repository.delete(id);
  }
}
```

**💡 Responsabilidades do Service**:
- Orquestrar operações complexas
- Aplicar regras de negócio
- Validar dados antes de persistir
- Coordenar múltiplos repositórios se necessário

### **ETAPA 8: IPC Handlers**

**Arquivo**: `/src/main/modules/[modulo]/ipc/handlers.ts`

```typescript
// Exemplo: /src/main/modules/communication/ipc/handlers.ts
import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { ChannelService } from "../application/channel.service";
import { ChannelMapper } from "../channel.mapper";
import type { 
  CreateChannelDto, 
  UpdateChannelDto, 
  ChannelDto, 
  ChannelFilterDto 
} from "../../../shared/types/channel.types";

export class ChannelIpcHandlers {
  constructor(
    private channelService: ChannelService,
    private channelMapper: ChannelMapper,
  ) {}

  registerHandlers(): void {
    ipcMain.handle("channel:create", this.handleCreateChannel.bind(this));
    ipcMain.handle("channel:list", this.handleListChannels.bind(this));
    ipcMain.handle("channel:getById", this.handleGetChannelById.bind(this));
    ipcMain.handle("channel:update", this.handleUpdateChannel.bind(this));
    ipcMain.handle("channel:delete", this.handleDeleteChannel.bind(this));
  }

  private async handleCreateChannel(
    event: IpcMainInvokeEvent,
    data: CreateChannelDto,
  ): Promise<ChannelDto> {
    try {
      const channel = await this.channelService.createChannel(data);
      return this.channelMapper.toDto(channel);
    } catch (error) {
      throw new Error(`Failed to create channel: ${(error as Error).message}`);
    }
  }

  private async handleListChannels(
    event: IpcMainInvokeEvent,
    filter?: ChannelFilterDto,
  ): Promise<ChannelDto[]> {
    try {
      const channels = await this.channelService.listChannels(filter);
      return channels.map(channel => this.channelMapper.toDto(channel));
    } catch (error) {
      throw new Error(`Failed to list channels: ${(error as Error).message}`);
    }
  }

  private async handleGetChannelById(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<ChannelDto | null> {
    try {
      const channel = await this.channelService.getChannelById(id);
      return channel ? this.channelMapper.toDto(channel) : null;
    } catch (error) {
      throw new Error(`Failed to get channel: ${(error as Error).message}`);
    }
  }

  private async handleUpdateChannel(
    event: IpcMainInvokeEvent,
    data: UpdateChannelDto,
  ): Promise<ChannelDto> {
    try {
      const channel = await this.channelService.updateChannel(data);
      return this.channelMapper.toDto(channel);
    } catch (error) {
      throw new Error(`Failed to update channel: ${(error as Error).message}`);
    }
  }

  private async handleDeleteChannel(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<void> {
    try {
      await this.channelService.deleteChannel(id);
    } catch (error) {
      throw new Error(`Failed to delete channel: ${(error as Error).message}`);
    }
  }
}
```

**💡 Convenções dos Handlers**:
- Canais IPC: `modulo:operacao` (ex: `channel:create`)
- Sempre try/catch com mensagens descritivas
- Bind dos métodos no constructor
- Converter Entity → DTO antes de retornar

### **ETAPA 9: Registro no Main Process**

**Arquivo**: `/src/main/main.ts` (adicionar nas inicializações)

```typescript
// Adicionar imports
import { ChannelRepository } from "./modules/communication/persistence/repository";
import { ChannelService } from "./modules/communication/application/channel.service";
import { ChannelMapper } from "./modules/communication/channel.mapper";
import { ChannelIpcHandlers } from "./modules/communication/ipc/handlers";

// Dentro do app.on("ready", ...)
app.on("ready", async () => {
  createWindow();

  // ... outras inicializações ...

  // Inicializar módulo de canais
  const channelRepository = new ChannelRepository();
  const channelMapper = new ChannelMapper();
  const channelService = new ChannelService(channelRepository, channelMapper);
  const channelIpcHandlers = new ChannelIpcHandlers(channelService, channelMapper);
  
  // Registrar handlers
  channelIpcHandlers.registerHandlers();
});
```

## 🖥️ Frontend (Renderer Process)

### **ETAPA 10: Store (Gerenciamento de Estado)**

**Arquivo**: `/src/renderer/features/[modulo]/stores/[entidade].store.ts`

```typescript
// Exemplo: /src/renderer/features/communication/stores/channel.store.ts
import type { 
  ChannelDto, 
  CreateChannelDto, 
  UpdateChannelDto, 
  ChannelFilterDto 
} from "../../../../shared/types/channel.types";

interface ChannelStoreState {
  channels: ChannelDto[];
  isLoading: boolean;
  error: string | null;
  selectedChannel: ChannelDto | null;
}

class ChannelStore {
  private state: ChannelStoreState = {
    channels: [],
    isLoading: false,
    error: null,
    selectedChannel: null,
  };

  private listeners = new Set<() => void>();

  // Para useSyncExternalStore
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;
  getServerSnapshot = () => this.state;

  // Atualizar estado e notificar listeners
  private setState(newState: Partial<ChannelStoreState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener());
  }

  // QUERIES (buscar dados)
  async loadChannels(filter?: ChannelFilterDto, forceReload = false): Promise<void> {
    if (!window.electronIPC) {
      console.warn("ElectronIPC not available yet");
      return;
    }

    // Evitar recarregamentos desnecessários
    if (!forceReload && this.state.channels.length > 0 && !this.state.isLoading) {
      return;
    }

    this.setState({ isLoading: true, error: null });

    try {
      const channels = (await window.electronIPC.invoke(
        "channel:list",
        filter,
      )) as ChannelDto[];
      
      this.setState({ 
        channels, 
        isLoading: false 
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
    }
  }

  async getChannelById(id: string): Promise<ChannelDto | null> {
    if (!window.electronIPC) return null;

    try {
      return (await window.electronIPC.invoke(
        "channel:getById",
        id,
      )) as ChannelDto | null;
    } catch (error) {
      this.setState({ error: (error as Error).message });
      return null;
    }
  }

  // MUTATIONS (modificar dados)
  async createChannel(data: CreateChannelDto): Promise<void> {
    if (!window.electronIPC) return;

    this.setState({ isLoading: true, error: null });

    try {
      const newChannel = (await window.electronIPC.invoke(
        "channel:create",
        data,
      )) as ChannelDto;

      // Adicionar ao estado atual
      this.setState({
        channels: [...this.state.channels, newChannel],
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
      throw error; // Re-throw para o componente lidar
    }
  }

  async updateChannel(data: UpdateChannelDto): Promise<void> {
    if (!window.electronIPC) return;

    this.setState({ isLoading: true, error: null });

    try {
      const updatedChannel = (await window.electronIPC.invoke(
        "channel:update",
        data,
      )) as ChannelDto;

      // Atualizar no estado
      this.setState({
        channels: this.state.channels.map(ch => 
          ch.id === updatedChannel.id ? updatedChannel : ch
        ),
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  }

  async deleteChannel(id: string): Promise<void> {
    if (!window.electronIPC) return;

    this.setState({ isLoading: true, error: null });

    try {
      await window.electronIPC.invoke("channel:delete", id);

      // Remover do estado
      this.setState({
        channels: this.state.channels.filter(ch => ch.id !== id),
        isLoading: false,
      });
    } catch (error) {
      this.setState({
        error: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  }

  // Ações locais
  setSelectedChannel(channel: ChannelDto | null) {
    this.setState({ selectedChannel: channel });
  }

  clearError() {
    this.setState({ error: null });
  }
}

// Instância singleton
export const channelStore = new ChannelStore();
```

**💡 Padrões do Store**:
- Estado tipado com interface
- `useSyncExternalStore` pattern
- Separação entre queries e mutations
- Estados de loading e error
- Re-throw errors para componentes

### **ETAPA 11: Hook Personalizado**

**Arquivo**: `/src/renderer/features/[modulo]/hooks/use-[entidade].hook.ts`

```typescript
// Exemplo: /src/renderer/features/communication/hooks/use-channels.hook.ts
import { useSyncExternalStore, useEffect, useMemo, useRef } from "react";
import { channelStore } from "../stores/channel.store";
import type { 
  CreateChannelDto, 
  UpdateChannelDto, 
  ChannelFilterDto 
} from "../../../../shared/types/channel.types";

export function useChannels(filter?: ChannelFilterDto) {
  const state = useSyncExternalStore(
    channelStore.subscribe,
    channelStore.getSnapshot,
    channelStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  // Auto-loading quando electronIPC fica disponível
  useEffect(() => {
    const loadInitialChannels = async () => {
      if (window.electronIPC && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await channelStore.loadChannels(filterRef.current);
      }
    };

    loadInitialChannels();
  }, []);

  // Mutations - memoizadas para evitar re-renders
  const mutations = useMemo(() => ({
    createChannel: (data: CreateChannelDto) => 
      channelStore.createChannel(data),
    
    updateChannel: (data: UpdateChannelDto) => 
      channelStore.updateChannel(data),
    
    deleteChannel: (id: string) => 
      channelStore.deleteChannel(id),
      
    setSelectedChannel: (channel: ChannelDto | null) => 
      channelStore.setSelectedChannel(channel),
      
    clearError: () => channelStore.clearError(),
  }), []);

  // Queries - memoizadas
  const queries = useMemo(() => ({
    loadChannels: (newFilter?: ChannelFilterDto, forceReload?: boolean) => 
      channelStore.loadChannels(newFilter || filterRef.current, forceReload),
      
    getChannelById: (id: string) => 
      channelStore.getChannelById(id),
      
    refetch: () => 
      channelStore.loadChannels(filterRef.current, true),
  }), []);

  return {
    // Estado
    channels: state.channels,
    isLoading: state.isLoading,
    error: state.error,
    selectedChannel: state.selectedChannel,
    
    // Operações
    ...mutations,
    ...queries,
  };
}
```

**💡 Benefícios do Hook**:
- Auto-loading inteligente
- Memoização para performance
- Separação conceptual mutations/queries
- Interface limpa para componentes

### **ETAPA 12: Integração em Componentes**

```typescript
// Exemplo de uso em componente
import { useChannels } from "../hooks/use-channels.hook";

function ChannelList({ projectId }: { projectId: string }) {
  const { 
    channels, 
    isLoading, 
    error, 
    createChannel, 
    loadChannels 
  } = useChannels({ projectId });

  const handleCreateChannel = async (name: string) => {
    try {
      await createChannel({
        name,
        projectId,
        type: 'general',
        createdBy: 'current-user-id',
      });
      // Store automaticamente atualiza a lista
    } catch (error) {
      // Error já está no estado do store
      console.error('Erro ao criar canal:', error);
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {channels.map(channel => (
        <div key={channel.id}>{channel.name}</div>
      ))}
    </div>
  );
}
```

## ✅ Checklist de Implementação

### Backend (Main Process)
- [ ] Tipos compartilhados em `/src/shared/types/`
- [ ] Schema Drizzle com convenções corretas
- [ ] Migração gerada e aplicada
- [ ] Repository com CRUD completo
- [ ] Entity com lógica de domínio
- [ ] Mapper para conversões
- [ ] Service com regras de aplicação
- [ ] IPC Handlers com error handling
- [ ] Registro no main.ts

### Frontend (Renderer Process)
- [ ] Store com estado tipado
- [ ] Hook personalizado com auto-loading
- [ ] Integração em componentes
- [ ] Estados de loading/error tratados
- [ ] Mutations e queries funcionando

### Integração
- [ ] Comunicação IPC funcionando
- [ ] Estados sincronizados
- [ ] Error handling end-to-end
- [ ] Performance otimizada

## 🚨 Erros Comuns para Evitar

1. **Não seguir convenções de nomenclatura**
2. **Misturar lógicas entre camadas**
3. **Esquecer de fazer bind dos métodos IPC**
4. **Não tratar erros adequadamente**
5. **Não memoizar hooks adequadamente**
6. **Schemas com tipos inconsistentes**
7. **Não usar `.returning()` em mutations**

## 📚 Próximos Passos

Depois de dominar este padrão, você pode explorar:
- **Relacionamentos entre entidades** (1:N, N:N)
- **Eventos do Event Bus** para comunicação interna
- **Validação com Zod** schemas
- **Testes unitários** para cada camada
- **Otimizações de performance** avançadas

---

**💡 Lembre-se**: A consistência é mais importante que a perfeição. Siga sempre os padrões estabelecidos para manter o código limpo e manutenível!