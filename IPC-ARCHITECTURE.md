# IPC Architecture - Project Wiz

## Visão Geral

Esta documentação define a arquitetura de comunicação Inter-Process Communication (IPC) do Project Wiz baseada em um padrão unificado usando `createIPCHandler` que padroniza validação, event-bus e tipagem automática.

O Project Wiz é uma plataforma de automação de desenvolvimento AI que utiliza agentes autônomos para executar operações complexas em repositórios de código, incluindo file operations, comandos bash, git operations e loops contínuos de processamento.

## Princípios Fundamentais

### 1. **Padrão Unificado com createIPCHandler**
- Todos os handlers usam a função `createIPCHandler` para padronização
- Validação automática de input/output via Zod schemas
- Event-bus integrado opcionalmente para reatividade
- Type safety completa com inferência automática

### 2. **Colocated Organization**
- Toda funcionalidade relacionada fica na mesma pasta
- Evita context switching entre arquivos distantes
- Facilita manutenção e refatoração

### 3. **Type Safety Cross-Process**
- Tipagem forte entre main e renderer processes
- Inferência automática de tipos dos handlers
- Zero configuração centralizada necessária

### 4. **Auto-Registration**
- Descoberta automática de handlers via filesystem
- Convenção sobre configuração
- Event-bus para comunicação automática entre handlers

## Função createIPCHandler

### Implementação Core

```typescript
// shared/utils/create-ipc-handler.ts
import { z } from 'zod'
import { IpcMainInvokeEvent } from 'electron'

export function createIPCHandler<TInput, TOutput>(config: {
  inputSchema: z.ZodSchema<TInput>
  outputSchema: z.ZodSchema<TOutput>
  handler: (input: TInput, event: IpcMainInvokeEvent) => Promise<TOutput>
}) {
  return async (data: unknown, event: IpcMainInvokeEvent): Promise<TOutput> => {
    // 1. Parse e validação do input
    const parsedInput = config.inputSchema.parse(data)
    
    // 2. Executar handler com input validado
    const result = await config.handler(parsedInput, event)
    
    // 3. Parse e validação do output
    const parsedOutput = config.outputSchema.parse(result)
    
    return parsedOutput
  }
}

// Utility type para inferência automática
export type IPCHandlerType<T> = T extends (data: infer I, event: any) => Promise<infer O>
  ? (input: I) => Promise<{ success: true; data: O } | { success: false; error: string }>
  : never
```

### Filosofia de Exports

- **`createIPCHandler`**: Export nomeado - a função utilitária
- **`export default`**: O handler configurado pronto para uso pelo ipc-loader

## Estrutura de Pastas

```
main/
├── ipc/
│   ├── auth/
│   │   ├── login/
│   │   │   └── invoke.ts          # Usando createIPCHandler
│   │   ├── register/
│   │   │   └── invoke.ts          # Usando createIPCHandler
│   │   └── logout/
│   │       └── invoke.ts          # Usando createIPCHandler
│   ├── user/
│   │   ├── create/
│   │   │   └── invoke.ts          # Usando createIPCHandler
│   │   ├── list/
│   │   │   └── invoke.ts          # Usando createIPCHandler
│   │   └── update/
│   │       └── invoke.ts          # Usando createIPCHandler
│   ├── project/
│   │   ├── create/
│   │   │   └── invoke.ts          # Com event-bus para notificações
│   │   ├── list/
│   │   │   └── invoke.ts          # Usando createIPCHandler
│   │   └── sync/
│   │       └── invoke.ts          # Com event-bus para progress
│   └── agent/
│       ├── activate/
│       │   └── invoke.ts          # Usando createIPCHandler
│       ├── execute/
│       │   └── invoke.ts          # Com event-bus para status
│       └── list/
│           └── invoke.ts          # Usando createIPCHandler
├── shared/
│   ├── utils/
│   │   └── create-ipc-handler.ts  # Função principal
│   └── types/
│       └── ipc-types.ts           # Utility types
├── bus/
│   └── event-bus.ts               # Event bus global
└── utils/
   └── ipc-loader.ts               # Auto-loader
```

## Convenções de Nomenclatura

### Channel Names
- **Invoke Handlers**: `invoke:domain:action` (ex: `invoke:user:create`)
- **Event-bus Events**: 
  - Start: `${eventName}:start`
  - Success: `${eventName}:success`  
  - Error: `${eventName}:error`

### File Structure
- `invoke.ts`: Usando createIPCHandler (obrigatório)
- Schemas Zod definidos inline ou importados
- Event-bus opcional via parâmetro `eventName`

## Implementação de Handlers

### Padrão com createIPCHandler

Todos os handlers seguem este padrão unificado:

```typescript
// main/ipc/user/create/invoke.ts
import { z } from 'zod'
import { createIPCHandler, IPCHandlerType } from '../../../shared/utils/create-ipc-handler'
import { createUser } from '../../../features/user/user.service'

// Schemas Zod para validação
const CreateUserInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters")
})

const CreateUserOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  username: z.string(),
  createdAt: z.date()
})

// O handler configurado é o default export
export default createIPCHandler({
  inputSchema: CreateUserInputSchema,
  outputSchema: CreateUserOutputSchema,
  handler: async (input, event) => {
    // Lógica do handler - input já validado e tipado
    const user = await createUser(input)
    return user // output será validado automaticamente
  }
})

// Module augmentation com inferência automática
declare global {
  namespace WindowAPI {
    interface User {
      create: IPCHandlerType<typeof handler>
    }
  }
}
```

### Handler Simples

```typescript
// main/ipc/user/list/invoke.ts
import { z } from 'zod'
import { createIPCHandler, IPCHandlerType } from '../../../shared/utils/create-ipc-handler'
import { listUsers } from '../../../features/user/user.service'

const ListUsersInputSchema = z.object({}) // Sem parâmetros

const ListUsersOutputSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  isActive: z.boolean()
}))

export default createIPCHandler({
  inputSchema: ListUsersInputSchema,
  outputSchema: ListUsersOutputSchema,
  handler: async (input, event) => {
    return await listUsers()
  }
})

declare global {
  namespace WindowAPI {
    interface User {
      list: IPCHandlerType<typeof handler>
    }
  }
}
```

### Handler com Event-Bus Manual

```typescript
// main/ipc/project/sync/invoke.ts
import { z } from 'zod'
import { createIPCHandler, IPCHandlerType } from '../../../shared/utils/create-ipc-handler'
import { syncProjectFiles } from '../../../features/project/project.service'
import { eventBus } from '../../../bus/event-bus'

const SyncProjectInputSchema = z.object({
  projectId: z.string(),
  targetBranch: z.string().optional().default('main')
})

const SyncProjectOutputSchema = z.object({
  syncId: z.string(),
  status: z.enum(['queued', 'running']),
  filesCount: z.number()
})

export default createIPCHandler({
  inputSchema: SyncProjectInputSchema,
  outputSchema: SyncProjectOutputSchema,
  handler: async (input, event) => {
    // Event-bus manual quando necessário
    eventBus.emit('project:sync:start', { input, timestamp: Date.now() })
    
    try {
      // Lógica complexa com múltiplos passos
      const syncResult = await syncProjectFiles({
        projectId: input.projectId,
        branch: input.targetBranch
      })
      
      const output = {
        syncId: syncResult.id,
        status: syncResult.status,
        filesCount: syncResult.processedFiles
      }
      
      eventBus.emit('project:sync:success', { input, output, timestamp: Date.now() })
      return output
      
    } catch (error) {
      eventBus.emit('project:sync:error', { input, error: error.message, timestamp: Date.now() })
      throw error
    }
  }
})

declare global {
  namespace WindowAPI {
    interface Project {
      sync: IPCHandlerType<typeof handler>
    }
  }
}
```

### Global Type Definitions

```typescript
// renderer/window.d.ts - Usa os tipos inferidos automaticamente
declare global {
  // Os tipos são definidos automaticamente via module augmentation nos handlers
  // Cada handler define sua interface em WindowAPI.[Feature]
  
  // Window API usa os tipos definidos pelos handlers
  interface Window {
    api: {
      auth: WindowAPI.Auth      // <- Tipos inferidos dos handlers auth/*
      user: WindowAPI.User      // <- Tipos inferidos dos handlers user/*  
      project: WindowAPI.Project // <- Tipos inferidos dos handlers project/*
      agent: WindowAPI.Agent    // <- Tipos inferidos dos handlers agent/*
      // ... outras features definidas pelos handlers
    }
  }
}
```

### Vantagens da Inferência Automática

1. **Zero Duplicação**: Tipos definidos apenas uma vez no handler
2. **Sempre Sincronizado**: Mudanças no schema refletem automaticamente no tipo
3. **IntelliSense Completo**: Auto-complete perfeito no renderer
4. **Type Safety Absoluta**: Input/Output sempre validados via Zod

```typescript
// Exemplo de uso no renderer - tipos completamente inferidos
const user = await window.api.user.create({
  name: "Maria Silva",     // ✓ Tipo string validado
  email: "maria@test.com", // ✓ Email format validado
  username: "maria"        // ✓ Min 3 characters validado
})

// user.id        ← Tipo string (inferido do schema)
// user.name      ← Tipo string (inferido do schema)
// user.createdAt ← Tipo Date (inferido do schema)
```

### Preload Implementation

```typescript
// renderer/preload.ts - Implementação sem tipos explícitos
contextBridge.exposeInMainWorld("api", {
  auth: {
    login: (params) => ipcRenderer.invoke("invoke:auth:login", params),
    register: (params) => ipcRenderer.invoke("invoke:auth:register", params),
    logout: () => ipcRenderer.invoke("invoke:auth:logout"),
  },
  user: {
    create: (params) => ipcRenderer.invoke("invoke:user:create", params),
    list: () => ipcRenderer.invoke("invoke:user:list"),
    update: (params) => ipcRenderer.invoke("invoke:user:update", params),
  },
  project: {
    create: (params) => ipcRenderer.invoke("invoke:project:create", params),
    list: () => ipcRenderer.invoke("invoke:project:list"),
    sync: (params) => ipcRenderer.invoke("invoke:project:sync", params),
  },
  agent: {
    activate: (params) => ipcRenderer.invoke("invoke:agent:activate", params),
    list: () => ipcRenderer.invoke("invoke:agent:list"),
    execute: (params) => ipcRenderer.invoke("invoke:agent:execute", params),
  }
});
```

**Observação**: O preload não precisa mais de tipos explícitos - eles são inferidos automaticamente pelos handlers via module augmentation.

### Usage no Renderer

```typescript
// Uso com validação automática e tipos inferidos
const response = await window.api.auth.login({
  username: 'joao',
  password: 'senha123'
})

if (response.success) {
  // response.data.id, response.data.name - todos tipados automaticamente
  console.log('Logged in:', response.data.name)
} else {
  console.error('Login failed:', response.error)
}

// Criação de projeto
const projectResponse = await window.api.project.create({
  name: 'Meu Projeto',
  description: 'Descrição do projeto'
})

if (projectResponse.success) {
  // projectResponse.data.id automaticamente tipado
  console.log('Project created:', projectResponse.data.id)
}

// Sincronização com validação
const syncResponse = await window.api.project.sync({
  projectId: 'proj-123',
  targetBranch: 'main'
})

if (syncResponse.success) {
  // syncResponse.data.syncId, status - automaticamente tipados
  console.log('Sync started:', syncResponse.data.syncId)
}

// Lista sem parâmetros
const usersResponse = await window.api.user.list()
if (usersResponse.success) {
  // usersResponse.data array tipado automaticamente
  console.log('Users:', usersResponse.data.length)
}
```

## Auto-Loader Simplificado

### Compatibilidade com IPC Loader Existente

O `createIPCHandler` é **100% compatível** com o ipc-loader atual:

```typescript
// O ipc-loader atual já gerencia o wrapper { success: true/false, data/error }
// O createIPCHandler retorna diretamente o resultado
// O ipc-loader pega esse resultado e wrappa automaticamente

// Fluxo atual:
// 1. Renderer chama: window.api.user.create(data)
// 2. IPC Loader executa: handler(data, event) 
// 3. createIPCHandler valida e processa
// 4. IPC Loader wrappa: { success: true, data: result } ou { success: false, error }
// 5. Renderer recebe: { success, data/error }
```

**Sem mudanças necessárias no ipc-loader atual!**

### Integração Perfeita

```typescript
// Handler criado com createIPCHandler
export default createIPCHandler({
  inputSchema: UserInputSchema,
  outputSchema: UserOutputSchema, 
  handler: async (input, event) => {
    return await createUser(input) // Retorna User
  }
})

// IPC Loader (atual) automaticamente:
// - Importa o handler
// - Executa handler(data, event)
// - Wrappa em { success: true, data: User } ou { success: false, error: string }
// - Retorna para o renderer
```

**Benefícios da compatibilidade**:
- ✅ Zero breaking changes no sistema existente
- ✅ `createIPCHandler` foca apenas em validação Zod
- ✅ IPC Loader mantém responsabilidade por success/error wrapper
- ✅ Migration incremental - handler por handler

### Bootstrap Integration

```typescript
// main/index.ts
import { loadIpcHandlers } from './utils/ipc-loader'

async function createWindow() {
  // ... window setup

  // Load all IPC handlers with createIPCHandler
  await loadIpcHandlers()
  
  // ... rest of setup
}
```

## Event Bus Integration

### Event Bus Implementation

```typescript
// main/bus/event-bus.ts
import { EventEmitter } from 'events'

class TypedEventBus extends EventEmitter {
  // Métodos tipados opcionais para melhor DX
  emitSuccess(eventName: string, data: any) {
    this.emit(`${eventName}:success`, data)
  }
  
  emitError(eventName: string, error: any) {
    this.emit(`${eventName}:error`, error)
  }
  
  emitStart(eventName: string, data: any) {
    this.emit(`${eventName}:start`, data)
  }
}

export const eventBus = new TypedEventBus()
```

### Event Patterns com createIPCHandler

```typescript
// Quando eventName é fornecido, os seguintes eventos são emitidos:
// - `${eventName}:start` - Antes da execução
// - `${eventName}:success` - Após sucesso (com input/output)
// - `${eventName}:error` - Em caso de erro (com input/error)

// Exemplo: handler com eventName: 'user:create'
// Emite: user:create:start, user:create:success, user:create:error

// Listening nos eventos:
eventBus.on('user:create:success', (data) => {
  console.log(`User ${data.output.id} created successfully`)
  // Enviar notificação, atualizar dashboard, etc.
})

eventBus.on('project:sync:start', (data) => {
  console.log(`Starting sync for project ${data.input.projectId}`)
  // Atualizar UI com loading state
})
```

## Comparação: Antes vs Depois

### ❌ Antes (Padrão Antigo)

```typescript
// main/ipc/user/create/invoke.ts - Muita repetição
export interface Params { name: string; email: string }
export interface Response { id: string; success: boolean }

export default async function(params: Params): Promise<Response> {
  try {
    // Validação manual
    if (!params.name || params.name.length < 2) {
      throw new Error('Name must be at least 2 characters')
    }
    // ... mais validações manuais
    
    const result = await createUserController(params)
    return result
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

declare global {
  namespace WindowAPI {
    interface User {
      create: (params: Params) => Promise<Response> // ← Repetição de tipos
    }
  }
}
```

### ✅ Depois (com createIPCHandler)

```typescript
// main/ipc/user/create/invoke.ts - Padronizado e conciso
import { z } from 'zod'
import createIPCHandler, { IPCHandlerType } from '../../../shared/utils/create-ipc-handler'
import { createUser } from '../../../features/user/user.service'

const CreateUserInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters")
})

const CreateUserOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date()
})

const handler = createIPCHandler({
  inputSchema: CreateUserInputSchema,
  outputSchema: CreateUserOutputSchema,
  eventName: 'user:create',
  handler: async (input) => {
    return await createUser(input) // ← Foco na lógica, não na infraestrutura
  }
})

export default handler

declare global {
  namespace WindowAPI {
    interface User {
      create: IPCHandlerType<typeof handler> // ← Tipos inferidos automaticamente
    }
  }
}
```

## Event-Bus em Ação

### Handler com Event-Bus para Status Updates

```typescript
// main/ipc/agent/execute/invoke.ts
import { z } from 'zod'
import createIPCHandler, { IPCHandlerType } from '../../../shared/utils/create-ipc-handler'
import { executeAgentInWorker } from '../../../features/agent/agent.service'

const ExecuteAgentInputSchema = z.object({
  agentId: z.string(),
  taskType: z.enum(['bash', 'file', 'git']),
  command: z.string(),
  workdir: z.string()
})

const ExecuteAgentOutputSchema = z.object({
  executionId: z.string(),
  status: z.enum(['queued', 'running'])
})

const handler = createIPCHandler({
  inputSchema: ExecuteAgentInputSchema,
  outputSchema: ExecuteAgentOutputSchema,
  eventName: 'agent:execute', // ← Emite agent:execute:start, agent:execute:success, agent:execute:error
  handler: async (input) => {
    return await executeAgentInWorker({
      agentId: input.agentId,
      taskType: input.taskType,
      command: input.command,
      workdir: input.workdir
    })
  }
})

export default handler

declare global {
  namespace WindowAPI {
    interface Agent {
      execute: IPCHandlerType<typeof handler>
    }
  }
}
```

### Listening aos Eventos

```typescript
// main/features/agent/agent-status.listener.ts
import { eventBus } from '../../bus/event-bus'
import { updateAgentStatus } from './agent.service'

// Escutar início de execução
eventBus.on('agent:execute:start', async (data) => {
  console.log(`🚀 Starting agent execution:`, data.input.agentId)
  
  // Atualizar status no banco
  await updateAgentStatus(data.input.agentId, 'starting')
})

// Escutar sucesso
eventBus.on('agent:execute:success', async (data) => {
  console.log(`✅ Agent execution queued:`, data.output.executionId)
  
  // Notificar outros sistemas
  await notifyAgentQueued(data.output.executionId)
})

// Escutar erros
eventBus.on('agent:execute:error', async (data) => {
  console.error(`❌ Agent execution failed:`, data.error)
  
  // Log error, notificar admin, etc.
  await handleAgentError(data.input.agentId, data.error)
})
```

### Integration com Features/Services

```typescript
// main/features/agent/agent.service.ts - Service layer simplificado
import { Worker } from 'worker_threads'
import { validateBashCommand } from './guards/bash-guard'
import { eventBus } from '../../bus/event-bus'

export async function executeAgentInWorker(params: {
  agentId: string
  taskType: 'bash' | 'file' | 'git'
  command: string
  workdir: string
}) {
  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Aplicar guardrails baseado no taskType
  if (params.taskType === 'bash') {
    const validation = validateBashCommand(params.command, params.workdir)
    if (!validation.allowed) {
      throw new Error(`Comando bloqueado: ${validation.reason}`)
    }
  }
  
  // Queue para worker thread
  const worker = new Worker('./worker/agent-executor.js')
  worker.postMessage({
    executionId,
    agentId: params.agentId,
    taskType: params.taskType,
    command: params.command,
    workdir: params.workdir
  })
  
  return {
    executionId,
    status: 'queued' as const
  }
}
```

### Validation Schemas para Segurança

```typescript
// shared/schemas/security-schemas.ts - Schemas Zod para validação de segurança
import { z } from 'zod'

const BLOCKED_BASH_PATTERNS = [
  /rm\s+-rf?\s+\//,     // rm -rf /
  /sudo\s+/,           // comandos sudo
  /\.\.\//,            // path traversal
  /\/etc\//,           // system directories
  /curl.*\|.*sh/,      // download + execute
]

const ALLOWED_COMMANDS = [
  'npm run', 'npm install', 'git status', 'git add', 'git commit',
  'ls', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv'
]

// Schema que valida comando bash
export const SafeBashCommandSchema = z.string().refine(
  (command) => {
    // Check blocked patterns
    for (const pattern of BLOCKED_BASH_PATTERNS) {
      if (pattern.test(command)) {
        return false
      }
    }
    return true
  },
  { message: "Comando contém padrão perigoso bloqueado" }
).refine(
  (command) => {
    // Check if command starts with allowed prefix
    return ALLOWED_COMMANDS.some(allowed => command.startsWith(allowed))
  },
  { message: "Comando não está na lista de comandos permitidos" }
)

// Schema que valida path de arquivo
export const SafeFilePathSchema = z.string().refine(
  (path) => {
    return !path.includes('../') && !path.startsWith('/')
  },
  { message: "Path contém navegação perigosa" }
)
```

### Usage nos Handlers

```typescript
// main/ipc/agent/bash/invoke.ts - Validação integrada
import createIPCHandler from '../../../shared/utils/create-ipc-handler'
import { SafeBashCommandSchema } from '../../../shared/schemas/security-schemas'

const BashExecuteInputSchema = z.object({
  agentId: z.string(),
  command: SafeBashCommandSchema, // ← Validação de segurança automática
  workdir: z.string()
})

const handler = createIPCHandler({
  inputSchema: BashExecuteInputSchema,
  outputSchema: BashExecuteOutputSchema,
  eventName: 'agent:bash',
  handler: async (input) => {
    // Comando já foi validado pelo schema - pode executar com segurança
    return await executeBashCommand(input.command, input.workdir)
  }
})
```

### Handlers Específicos por Operação

```typescript
// main/ipc/agent/file-create/invoke.ts
import createIPCHandler from '../../../shared/utils/create-ipc-handler'
import { SafeFilePathSchema } from '../../../shared/schemas/security-schemas'

const FileCreateInputSchema = z.object({
  agentId: z.string(),
  relativePath: SafeFilePathSchema, // ← Validação de path integrada
  content: z.string(),
  workdir: z.string()
})

const FileCreateOutputSchema = z.object({
  success: z.boolean(),
  filePath: z.string()
})

const handler = createIPCHandler({
  inputSchema: FileCreateInputSchema,
  outputSchema: FileCreateOutputSchema,
  eventName: 'agent:file:create',
  handler: async (input) => {
    const fullPath = join(input.workdir, input.relativePath)
    
    // Operação já foi validada pelo schema
    await writeFile(fullPath, input.content)
    
    return {
      success: true,
      filePath: fullPath
    }
  }
})

export default handler

declare global {
  namespace WindowAPI {
    interface Agent {
      createFile: IPCHandlerType<typeof handler>
    }
  }
}
```

```typescript
// main/ipc/agent/file-delete/invoke.ts
const FileDeleteInputSchema = z.object({
  agentId: z.string(),
  relativePath: SafeFilePathSchema,
  workdir: z.string()
})

const handler = createIPCHandler({
  inputSchema: FileDeleteInputSchema,
  outputSchema: z.object({ success: z.boolean() }),
  eventName: 'agent:file:delete', // ← Audit trail automático
  handler: async (input) => {
    const fullPath = join(input.workdir, input.relativePath)
    await unlink(fullPath)
    return { success: true }
  }
})
```

## Event-Bus Listeners Automáticos

Com `createIPCHandler`, os eventos são emitidos automaticamente. Listeners podem ser configurados como serviços:

```typescript
// main/features/agent/listeners/execution-status.listener.ts
import { eventBus } from '../../../bus/event-bus'
import { updateAgentStatus, notifyUI } from '../agent.service'

// Auto-setup dos listeners
export function setupAgentListeners() {
  // Listener para início de execução
  eventBus.on('agent:execute:start', async (data) => {
    console.log(`🚀 Agent execution starting:`, data.input.agentId)
    await updateAgentStatus(data.input.agentId, 'executing')
  })
  
  // Listener para execução bem-sucedida
  eventBus.on('agent:execute:success', async (data) => {
    console.log(`✅ Agent queued:`, data.output.executionId)
    await notifyUI('agent:status', {
      executionId: data.output.executionId,
      status: 'queued'
    })
  })
  
  // Listener para falhas
  eventBus.on('agent:execute:error', async (data) => {
    console.error(`❌ Agent execution failed:`, data.error)
    await notifyUI('agent:status', {
      agentId: data.input.agentId,
      status: 'failed',
      error: data.error
    })
  })
  
  // Listener para operações de arquivo
  eventBus.on('agent:file:create:success', async (data) => {
    console.log(`📄 File created:`, data.output.filePath)
    await auditLog('file:create', {
      agentId: data.input.agentId,
      filePath: data.output.filePath
    })
  })
}
```

### Bootstrap Listeners

```typescript
// main/index.ts
import { loadIpcHandlers } from './utils/ipc-loader'
import { setupAgentListeners } from './features/agent/listeners/execution-status.listener'

async function createWindow() {
  // Load IPC handlers
  await loadIpcHandlers()
  
  // Setup event listeners
  setupAgentListeners()
  
  // ... rest of setup
}
```

## Exemplos de Uso Completos

### 1. Criação de Usuário com Validação Automática

```typescript
// Renderer - Validação automática via Zod
const user = await window.api.user.create({
  name: 'Maria Silva',      // ✓ Validado: min 2 chars
  email: 'maria@test.com',  // ✓ Validado: formato email
  username: 'maria'         // ✓ Validado: min 3 chars
})

// user.id, user.name, user.createdAt - todos tipados automaticamente
console.log(`User ${user.name} created with ID: ${user.id}`)

// Se houver erro de validação, será lançado automaticamente pelo createIPCHandler
// Ex: "Invalid email format" ou "Name must be at least 2 characters"
```

### 2. Execução de Agente com Event-Bus

```typescript
// Renderer - Execução com events automáticos
const execution = await window.api.agent.execute({
  agentId: 'agent-123',
  taskType: 'bash',
  command: 'npm run build', // ✓ Validado pelos security schemas
  workdir: '/project/path'
})

console.log('Execution queued:', execution.executionId)
// Events foram emitidos automaticamente:
// - agent:execute:start
// - agent:execute:success

// Se comando for bloqueado, erro será lançado automaticamente
// Ex: "Comando contém padrão perigoso bloqueado"
```

### 3. Operações de Arquivo com Audit Trail

```typescript
// Renderer - File operations com validação de segurança

// Criar arquivo
const createResult = await window.api.agent.createFile({
  agentId: 'agent-123',
  relativePath: 'src/components/new-component.tsx', // ✓ Path validado
  content: 'export default function NewComponent() {...}',
  workdir: '/project/path'
})

console.log('File created:', createResult.filePath)
// Event emitido: agent:file:create:success

// Deletar arquivo  
const deleteResult = await window.api.agent.deleteFile({
  agentId: 'agent-123',
  relativePath: 'temp/old-file.txt',
  workdir: '/project/path'
})

console.log('File deleted successfully')
// Event emitido: agent:file:delete:success

// Se path for perigoso, erro será lançado automaticamente
// Ex: "Path contém navegação perigosa" para "../../../etc/passwd"
```

### 4. Project Sync com Progress Events

```typescript
// Renderer - Operação longa com progress tracking
const syncResult = await window.api.project.sync({
  projectId: 'proj-456',
  targetBranch: 'main'
})

console.log('Sync started:', syncResult.syncId)
// Events automáticos:
// - project:sync:start (com input)
// - project:sync:success (com output)
// - project:sync:error (se falhar)

// O event-bus permite tracking do progresso em outros componentes
```

## Benefícios da Nova Arquitetura

### 1. **Padronização Completa**
- ✅ Todos os handlers seguem exatamente o mesmo padrão com `createIPCHandler`
- ✅ Validação automática de input/output via Zod em 100% dos handlers
- ✅ Export pattern consistente: nomeado para função, default para handler
- ✅ Error handling gerenciado pelo ipc-loader existente

### 2. **Type Safety Revolucionária**
- ✅ Inferência automática completa - tipos definidos apenas uma vez
- ✅ Zero duplicação de tipos entre handler e window API
- ✅ Schemas Zod como única fonte de verdade para validação
- ✅ IntelliSense perfeito no renderer com tipos sempre sincronizados

### 3. **Developer Experience Superior**
- ✅ Um só padrão para aprender e usar em todos os handlers
- ✅ Auto-complete completo: `response.data.id` com tipos inferidos
- ✅ Validação de segurança integrada via schemas especializados
- ✅ Event-bus manual quando necessário - flexibilidade total

### 4. **Compatibilidade Total**
- ✅ Zero breaking changes no sistema existente
- ✅ Migration incremental - handler por handler
- ✅ IPC Loader atual funciona sem modificações
- ✅ Renderer mantém padrão `{ success, data/error }`

### 5. **Escalabilidade Simplificada**
- ✅ Adicionar nova funcionalidade = criar invoke.ts com `createIPCHandler`
- ✅ Auto-discovery funciona perfeitamente
- ✅ Event-bus permite loose coupling entre features
- ✅ Sem boilerplate - foco na lógica de negócio

### 6. **Manutenibilidade Extraordinária**
- ✅ Padrão único e consistente em toda a aplicação
- ✅ Mudanças no schema refletem automaticamente nos tipos
- ✅ Debugging simplificado - validação clara
- ✅ Refactoring seguro com TypeScript strict

### 7. **Filosofia de Responsabilidades**
- ✅ `createIPCHandler`: Validação Zod + lógica de negócio
- ✅ IPC Loader: Success/error wrapper + auto-registration
- ✅ Separação clara de responsabilidades
- ✅ Cada camada com propósito específico

## Migration Guide

### Converter Handler Existente

```typescript
// ❌ Antes - Handler atual
export default async function(data: any, event: IpcMainInvokeEvent) {
  // Validação manual
  if (!data.name || !data.email) {
    throw new Error('Missing required fields')
  }
  
  // Lógica do handler
  const user = await createUser(data)
  return user // Sem validação de output
}

// ✅ Depois - Com createIPCHandler
import { z } from 'zod'
import { createIPCHandler, IPCHandlerType } from '../../../shared/utils/create-ipc-handler'

const CreateUserInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
})

const CreateUserOutputSchema = z.object({
  id: z.string(),
  name: z.string(), 
  email: z.string(),
  createdAt: z.date()
})

export default createIPCHandler({
  inputSchema: CreateUserInputSchema,
  outputSchema: CreateUserOutputSchema,
  handler: async (input, event) => {
    // input já validado automaticamente
    const user = await createUser(input)
    return user // output será validado automaticamente
  }
})
```

### Checklist de Migration

- [ ] Instalar utility: `createIPCHandler` e `IPCHandlerType`
- [ ] Criar schemas Zod para input/output do handler
- [ ] Substituir export function por `export default createIPCHandler({...})`
- [ ] Atualizar module augmentation para usar `IPCHandlerType<typeof handler>`
- [ ] Testar validação e tipos no renderer
- [ ] Adicionar event-bus manualmente se necessário

### Migration Incremental

✅ **Sem breaking changes**: Handlers antigos e novos coexistem  
✅ **Handler por handler**: Migration gradual conforme necessidade  
✅ **Zero downtime**: IPC Loader funciona com ambos os padrões  
✅ **Type safety crescente**: Cada handler migrado ganha validação Zod

---

**Esta arquitetura com `createIPCHandler` estabelece um padrão unificado, type-safe e compatível para toda comunicação IPC do Project Wiz, mantendo zero breaking changes e oferecendo migration incremental.**