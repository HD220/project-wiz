# IPC Architecture - Project Wiz

## Visão Geral

Esta documentação define a arquitetura de comunicação Inter-Process Communication (IPC) do Project Wiz baseada na discussão sobre organização e simplificação do código.

O Project Wiz é uma plataforma de automação de desenvolvimento AI que utiliza agentes autônomos para executar operações complexas em repositórios de código, incluindo file operations, comandos bash, git operations e loops contínuos de processamento.

## Princípios Fundamentais

### 1. **Colocated Organization**
- Toda funcionalidade relacionada fica na mesma pasta
- Evita context switching entre arquivos distantes
- Facilita manutenção e refatoração

### 2. **Type Safety Cross-Process**
- Tipagem forte entre main e renderer processes
- Module augmentation para distribuir types
- Zero configuração centralizada necessária

### 3. **Auto-Registration**
- Descoberta automática de handlers via filesystem
- Convenção sobre configuração
- Event-bus para comunicação automática entre handlers

### 4. **Separação MVC Flexível**
- **Handler (invoke.ts)**: Entry point IPC (obrigatório)
- **Controller**: Orquestrador de use cases (opcional - use quando necessário)
- **Model**: Regras de negócio + acesso a dados (opcional - extraia quando a lógica crescer)

### 5. **Multi-Process Architecture**
- **Renderer Process**: UI React + interação do usuário
- **Main Process**: Orquestração, database, IPC coordination
- **Worker Process**: Agentes AI, file operations, bash commands, operações isoladas

## Estrutura de Pastas

```
main/
├── ipc/
│   ├── user/
│   │   ├── create/
│   │   │   ├── invoke.ts          # IPC handler (obrigatório)
│   │   │   ├── controller.ts      # Use case orchestrator (opcional)
│   │   │   └── model.ts           # Data access + business rules (opcional)
│   │   ├── update/
│   │   │   └── invoke.ts          # Exemplo: operação simples sem controller
│   │   └── delete/
│   │       ├── invoke.ts
│   │       └── controller.ts      # Exemplo: com controller mas sem model separado
│   ├── project/
│   │   ├── sync/
│   │   │   ├── invoke.ts
│   │   │   ├── controller.ts
│   │   │   └── model.ts
│   │   └── progress/
│   │       └── listen.ts          # Event listener
│   └── agent/
│       ├── execute/
│       │   ├── invoke.ts          # Comunica com Worker Process
│       │   ├── controller.ts      # Orquestra execução do agente
│       │   └── model.ts           # Persistência de estado do agente
│       └── status/
│           └── listen.ts          # Escuta atualizações do Worker
├── worker/
│   ├── agent-executor.ts          # Worker Process principal
│   ├── tools/
│   │   ├── bash-tool.ts           # Execução bash com guardrails
│   │   ├── file-tool.ts           # File operations seguras
│   │   └── git-tool.ts            # Git operations no worktree
│   └── guards/
│       ├── bash-guard.ts          # Validação de comandos bash
│       └── file-guard.ts          # Validação de paths/operações
├── bus/
│   └── eventBus.ts                # Global event bus
└── utils/
    └── ipc-loader.ts              # Auto-loader with middleware
```

## Convenções de Nomenclatura

### Channel Names
- **Invoke Handlers**: `invoke:domain:action` (ex: `invoke:user:create`)
- **Listen Handlers**: `listen:domain:event` (ex: `listen:project:progress`)
- **Event-bus Events**: 
  - Request: `invoke:user:create:request`
  - Response: `invoke:user:create:response`

### File Structure
- `invoke.ts`: Request-response handlers (obrigatório)
- `listen.ts`: Event listeners (obrigatório para events)
- `controller.ts`: Use case orchestration (opcional - extraia quando lógica ficar complexa)
- `model.ts`: Data access and business rules (opcional - use quando tiver regras de negócio específicas)

### Process Communication
- **Main ↔ Renderer**: IPC channels via Electron ipcMain/ipcRenderer
- **Main ↔ Worker**: Node.js Worker threads ou Child process com message passing
- **Event propagation**: Event-bus central para coordenação cross-process

## Type Safety Implementation

### Module Augmentation Pattern

Cada handler define seus próprios tipos usando module augmentation:

```typescript
// main/ipc/user/create/invoke.ts
export interface Params {
  name: string
  email: string
}

export interface Response {
  id: string
  success: boolean
}

export default async function(params: Params): Promise<Response> {
  const result = await createUserController(params)
  return result
}

// Type augmentation no mesmo arquivo
declare global {
  namespace WindowAPI {
    interface InvokeHandlers {
      'invoke:user:create': (params: Params) => Promise<Response>
    }
  }
}
```

### Global Type Definitions

```typescript
// renderer/window.d.ts
declare global {
  namespace WindowAPI {
    interface InvokeHandlers {}
    interface ListenHandlers {}
  }
  
  interface Window {
    api: {
      invoke<K extends keyof WindowAPI.InvokeHandlers>(
        channel: K,
        ...args: Parameters<WindowAPI.InvokeHandlers[K]>
      ): ReturnType<WindowAPI.InvokeHandlers[K]>
      
      on<K extends keyof WindowAPI.ListenHandlers>(
        channel: K,
        callback: WindowAPI.ListenHandlers[K]
      ): void
    }
  }
}
```

### Usage no Renderer

```typescript
// Completamente type-safe
const result = await window.api.invoke('invoke:user:create', { 
  name: 'João', 
  email: 'joao@example.com' 
})
// result é tipado como: { id: string; success: boolean }
```

## Auto-Loader com Middleware

### IPC Loader Implementation

```typescript
// main/utils/ipc-loader.ts
import { ipcMain } from 'electron'
import { glob } from 'glob'
import { eventBus } from '../bus/eventBus'

export async function loadIpcHandlers() {
  try {
    const invokeFiles = await glob('main/ipc/**/invoke.ts')
    const listenFiles = await glob('main/ipc/**/listen.ts')

    // Register invoke handlers
    for (const file of invokeFiles) {
      const channel = filePathToChannel(file, 'invoke')
      await registerInvokeHandler(file, channel)
    }

    // Register listen handlers  
    for (const file of listenFiles) {
      const channel = filePathToChannel(file, 'listen')
      await registerListenHandler(file, channel)
    }

    console.log(`✓ Loaded ${invokeFiles.length} invoke handlers`)
    console.log(`✓ Loaded ${listenFiles.length} listen handlers`)

  } catch (error) {
    console.error('Failed to load IPC handlers:', error)
  }
}

function filePathToChannel(filePath: string, type: 'invoke' | 'listen'): string {
  // main/ipc/user/create/invoke.ts -> invoke:user:create
  const relativePath = filePath.replace('main/ipc/', '').replace(`/${type}.ts`, '')
  const parts = relativePath.split('/')
  return `${type}:${parts.join(':')}`
}

async function registerInvokeHandler(file: string, channel: string) {
  try {
    const mod = await import(file)
    if (!mod.default || typeof mod.default !== 'function') {
      console.error(`${file} must export default function`)
      return
    }

    ipcMain.handle(channel, async (event, data) => {
      try {
        const result = await mod.default(data)
        
        // Event-bus opcional para agentes/reatividade
        if (channel.startsWith('invoke:agent:') || channel.startsWith('invoke:project:')) {
          eventBus.emit(`${channel}:completed`, { data, result, success: true, timestamp: Date.now() })
        }
        
        return { success: true, data: result }
      } catch (error) {
        // Event para erro sempre emitido para debugging
        eventBus.emit(`${channel}:error`, { data, error: error.message, timestamp: Date.now() })
        
        return { success: false, error: error.message }
      }
    })

    console.log(`✓ Registered invoke: ${channel}`)
  } catch (error) {
    console.error(`Failed to register invoke handler ${file}:`, error)
  }
}

async function registerListenHandler(file: string, channel: string) {
  try {
    const mod = await import(file)
    if (!mod.default || typeof mod.default !== 'function') {
      console.error(`${file} must export default function`)
      return
    }

    // Register event listener
    eventBus.on(channel, mod.default)
    console.log(`✓ Registered listener: ${channel}`)
  } catch (error) {
    console.error(`Failed to register listen handler ${file}:`, error)
  }
}
```

### Bootstrap Integration

```typescript
// main/index.ts
import { loadIpcHandlers } from './utils/ipc-loader'

async function createWindow() {
  // ... window setup

  // Load IPC handlers automatically
  await loadIpcHandlers()
  
  // ... rest of setup
}
```

## Event Bus Global

### Event Bus Implementation

```typescript
// main/bus/eventBus.ts
import { EventEmitter } from 'events'

export const eventBus = new EventEmitter()
```

## Padrão MVC Implementado

### 1. Handler (invoke.ts) - Entry Point

```typescript
// main/ipc/user/create/invoke.ts
import { createUserController } from './controller'

export interface Params {
  name: string
  email: string
}

export interface Response {
  id: string
  success: boolean
}

export default async function(params: Params): Promise<Response> {
  // Para casos simples, pode ter toda lógica aqui
  // Para casos complexos, delegue para controller
  return await createUserController(params)
}

declare global {
  namespace WindowAPI {
    interface InvokeHandlers {
      'invoke:user:create': (params: Params) => Promise<Response>
    }
  }
}
```

### 2. Controller - Use Case Orchestrator (Opcional)

```typescript
// main/ipc/user/create/controller.ts
import { validateUserData, saveUser, getUserByEmail } from './model'
import { eventBus } from '../../../bus/eventBus'

export async function createUserController(params: { name: string; email: string }) {
  // 1. Validation
  await validateUserData(params)
  
  // 2. Check business rules
  const existingUser = await getUserByEmail(params.email)
  if (existingUser) {
    throw new Error('User already exists with this email')
  }
  
  // 3. Execute core business logic
  const user = await saveUser(params)
  
  // 4. Emit business events (if needed)
  eventBus.emit('user:created', { userId: user.id, email: user.email })
  
  return { id: user.id, success: true }
}
```

**Nota:** Extraia controller apenas quando:
- Lógica de orquestração complexa (múltiplos steps)
- Integração com múltiplos models
- Side effects importantes (emails, notifications, etc.)
- Reutilização da lógica em outros contextos

### 3. Model - Data Access + Business Rules (Opcional)

```typescript
// main/ipc/user/create/model.ts
import { db } from '../../../database' // ou onde estiver o db
import { users } from '../../../database/schema'
import { eq } from 'drizzle-orm'

export async function validateUserData(params: { name: string; email: string }) {
  if (!params.name || params.name.length < 2) {
    throw new Error('Name must be at least 2 characters long')
  }
  
  if (!params.email || !isValidEmail(params.email)) {
    throw new Error('Invalid email format')
  }
}

export async function saveUser(params: { name: string; email: string }) {
  const newUser = {
    name: params.name,
    email: params.email,
    createdAt: new Date(),
    isActive: true
  }
  
  const result = await db.insert(users).values(newUser).returning()
  return result[0]
}

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  
  return result[0] || null
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

## Worker Process Integration

### Comunicação Main ↔ Worker

```typescript
// main/ipc/agent/execute/invoke.ts
import { executeAgentInWorker } from './controller'

export interface Params {
  agentId: string
  taskType: 'bash' | 'file' | 'git'
  command: string
  workdir: string
}

export interface Response {
  executionId: string
  status: 'queued' | 'running'
}

export default async function(params: Params): Promise<Response> {
  return await executeAgentInWorker(params)
}

declare global {
  namespace WindowAPI {
    interface InvokeHandlers {
      'invoke:agent:execute': (params: Params) => Promise<Response>
    }
  }
}
```

### Worker Process com Guardrails

```typescript
// main/worker/agent-executor.ts
import { Worker } from 'worker_threads'
import { validateBashCommand, validateFilePath } from './guards/bash-guard'

class AgentExecutor {
  private worker: Worker
  
  async executeBashCommand(command: string, workdir: string) {
    // Aplicar guardrails
    const validation = validateBashCommand(command, workdir)
    if (!validation.allowed) {
      return {
        success: false,
        error: `Comando bloqueado: ${validation.reason}`,
        suggestion: validation.suggestion
      }
    }
    
    // Executar no worker isolado
    return await this.worker.postMessage({
      type: 'bash',
      command: validation.sanitizedCommand,
      workdir
    })
  }
}
```

### Guardrails para Operações

```typescript
// main/worker/guards/bash-guard.ts
const BLOCKED_PATTERNS = [
  /rm\s+-rf?\s+\//,     // rm -rf /
  /sudo\s+/,           // comandos sudo  
  /\.\.\//, // path traversal
  /\/etc\//,           // system directories
  /curl.*\|.*sh/,      // download + execute
]

const ALLOWED_COMMANDS = [
  'npm run', 'npm install', 'git status', 'git add', 'git commit',
  'ls', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv'
]

export function validateBashCommand(command: string, workdir: string) {
  // Check blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      return {
        allowed: false,
        reason: `Padrão perigoso detectado: ${pattern}`,
        suggestion: 'Use ferramentas específicas para operações destrutivas'
      }
    }
  }
  
  // Validate command is in workdir scope
  if (command.includes('cd ') && !command.includes(workdir)) {
    return {
      allowed: false,
      reason: 'Comando tenta navegar fora do diretório do projeto',
      suggestion: `Use paths relativos dentro de ${workdir}`
    }
  }
  
  return {
    allowed: true,
    sanitizedCommand: command
  }
}
```

### Tools Específicas para Operações Destrutivas

```typescript
// main/worker/tools/file-tool.ts
import { join, relative, resolve } from 'path'
import { validateFilePath } from '../guards/file-guard'

export class FileTool {
  constructor(private workdir: string) {}
  
  async deleteFile(relativePath: string) {
    const validation = validateFilePath(relativePath, this.workdir)
    if (!validation.allowed) {
      throw new Error(`Operação bloqueada: ${validation.reason}`)
    }
    
    const fullPath = join(this.workdir, relativePath)
    // Executar deleteção com logging completo
    return await this.performFileOperation('delete', fullPath)
  }
  
  async createFile(relativePath: string, content: string) {
    const validation = validateFilePath(relativePath, this.workdir)
    if (!validation.allowed) {
      throw new Error(`Operação bloqueada: ${validation.reason}`)
    }
    
    const fullPath = join(this.workdir, relativePath)
    return await this.performFileOperation('create', fullPath, content)
  }
  
  private async performFileOperation(operation: string, path: string, content?: string) {
    // Log all operations for audit trail
    console.log(`[FileTool] ${operation}: ${path}`)
    
    // Actual file operation implementation
    // ... 
  }
}
```

## Listen Handlers para Events

### Event Listener Implementation

```typescript
// main/ipc/agent/status/listen.ts
export interface EventData {
  agentId: string
  executionId: string
  status: 'running' | 'completed' | 'failed'
  result?: any
  error?: string
}

export default async function(data: EventData) {
  // Processar update de status do agente
  console.log(`Agent ${data.agentId} execution ${data.executionId}: ${data.status}`)
  
  // Atualizar banco de dados com status
  await updateAgentExecutionStatus(data.agentId, data.executionId, data.status)
  
  // Notificar renderer se necessário
  if (data.status === 'completed' || data.status === 'failed') {
    // Emit para UI via IPC se necessário
    eventBus.emit('agent:execution:finished', data)
  }
}

declare global {
  namespace WindowAPI {
    interface ListenHandlers {
      'listen:agent:status': (data: EventData) => void
    }
  }
}
```

## Exemplos de Uso Completos

### 1. Criação de Usuário (Request-Response)

```typescript
// Renderer
const result = await window.api.invoke('invoke:user:create', {
  name: 'Maria Silva',
  email: 'maria@example.com'
})

if (result.success) {
  console.log('User created with ID:', result.data.id)
} else {
  console.error('Error:', result.error)
}
```

### 2. Execução de Agente com Worker Process

```typescript
// Renderer - Executar agente
const execution = await window.api.invoke('invoke:agent:execute', {
  agentId: 'agent-123',
  taskType: 'bash',
  command: 'npm run build',
  workdir: '/path/to/project'
})

console.log('Execution started:', execution.executionId)

// Escutar status updates
window.api.on('listen:agent:status', (data) => {
  if (data.executionId === execution.executionId) {
    console.log(`Status: ${data.status}`)
    
    if (data.status === 'completed') {
      console.log('Result:', data.result)
    } else if (data.status === 'failed') {
      console.error('Error:', data.error)
    }
  }
})
```

### 3. Operações de Arquivo Seguras

```typescript
// Renderer - Deletar arquivo via tool específica
const result = await window.api.invoke('invoke:agent:file-delete', {
  agentId: 'agent-123',
  relativePath: 'temp/old-file.txt'  // Path relativo ao workdir
})

if (result.success) {
  console.log('File deleted successfully')
} else {
  console.log('Operation blocked:', result.error)
  console.log('Suggestion:', result.suggestion)
}
```

## Benefícios da Arquitetura

### 1. **Escalabilidade**
- Adicionar nova funcionalidade = criar nova pasta com 3 arquivos
- Auto-discovery elimina configuração manual
- Event-bus permite integração loose-coupled

### 2. **Manutenibilidade**
- Colocated structure mantém contexto
- Separação MVC clara
- Type safety previne errors em runtime

### 3. **Segurança e Isolamento**
- Worker Process isola operações perigosas dos agentes
- Guardrails previnem execução de comandos destrutivos
- Tools específicas para operações de arquivo com validação
- Logging completo para auditoria e debugging

### 4. **Developer Experience**
- Auto-complete completo no renderer
- Types colocated com implementação
- Convenções simples e consistentes

### 5. **Testabilidade**
- Controllers podem ser testados isoladamente
- Models têm lógica de negócio pura
- Worker Process pode ser mockado para testes
- Guardrails podem ser testados independentemente
- Event-bus permite integração loose-coupled

---

Esta arquitetura fornece uma base sólida para a comunicação IPC do Project Wiz, baseada em colocated organization, type safety e auto-registration.