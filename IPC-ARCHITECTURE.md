# IPC Architecture - Project Wiz

## Visão Geral

Arquitetura IPC unificada usando `createIPCHandler` que padroniza validação Zod, error handling e tipagem automática para comunicação entre main e renderer processes.

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
  return async (data: unknown, event: IpcMainInvokeEvent): Promise<TOutput | string> => {
    try {
      // 1. Parse e validação do input
      const parsedInput = config.inputSchema.parse(data)
      
      // 2. Executar handler com input validado
      const result = await config.handler(parsedInput, event)
      
      // 3. Parse e validação do output
      return config.outputSchema.parse(result)
    } catch (error) {
      // Error mapping consistente - sempre retorna string
      if (error instanceof z.ZodError) {
        return `Validation: ${error.errors[0].message}`
      }
      return error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Type helper simplificado
export type InferHandler<T> = T extends ReturnType<typeof createIPCHandler<infer I, infer O>>
  ? (input: I) => Promise<{ success: true; data: O } | { success: false; error: string }>
  : never
```

## Estrutura de Pastas

```
main/ipc/
├── auth/
│   ├── login/invoke.ts
│   └── register/invoke.ts
├── user/
│   ├── create/invoke.ts
│   └── list/invoke.ts
├── project/
│   ├── create/invoke.ts
│   └── sync/invoke.ts
└── agent/
    ├── activate/invoke.ts
    └── execute/invoke.ts
```

## Padrão de Handler

### Exemplo Básico

```typescript
// main/ipc/user/create/invoke.ts
import { z } from 'zod'
import { createIPCHandler, InferHandler } from '../../../shared/utils/create-ipc-handler'
import { createUser } from '../queries'
import { requireAuth } from '../../../shared/services/session-registry'
import { eventBus } from '../../../shared/services/events/event-bus'

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
  handler: async (input) => {
    const currentUser = requireAuth()
    const user = await createUser(input)
    
    // Evento "pós" ação
    eventBus.emit('user:created', { userId: user.id })
    
    return user
  }
})

export default handler

// Module augmentation com type helper
declare global {
  namespace WindowAPI {
    interface User {
      create: InferHandler<typeof handler>
    }
  }
}
```

### Handler com Event-Bus

```typescript
// main/ipc/project/sync/invoke.ts
import { syncProject } from '../queries'
import { requireAuth } from '../../../shared/services/session-registry'
import { eventBus } from '../../../shared/services/events/event-bus'

const handler = createIPCHandler({
  inputSchema: SyncProjectInputSchema,
  outputSchema: SyncProjectOutputSchema,
  handler: async (input) => {
    const currentUser = requireAuth()
    
    try {
      const result = await syncProject(input)
      // Evento "pós" - sync foi completado
      eventBus.emit('project:synced', { projectId: result.id })
      return result
    } catch (error) {
      // Evento "pós" - sync falhou
      eventBus.emit('project:sync-failed', { projectId: input.projectId, error: error.message })
      throw error
    }
  }
})
```

## Preload Implementation

```typescript
// renderer/preload.ts
import type { WindowAPI } from './window'

const api: WindowAPI = {
  auth: {
    login: (params) => ipcRenderer.invoke("invoke:auth:login", params),
    register: (params) => ipcRenderer.invoke("invoke:auth:register", params),
  },
  user: {
    create: (params) => ipcRenderer.invoke("invoke:user:create", params),
    list: () => ipcRenderer.invoke("invoke:user:list"),
  },
  project: {
    sync: (params) => ipcRenderer.invoke("invoke:project:sync", params),
  },
  agent: {
    execute: (params) => ipcRenderer.invoke("invoke:agent:execute", params),
  }
}

contextBridge.exposeInMainWorld("api", api)
```

## Window Types

```typescript
// renderer/window.d.ts
export interface WindowAPI {
  auth: WindowAPI.Auth
  user: WindowAPI.User  
  project: WindowAPI.Project
  agent: WindowAPI.Agent
}

declare global {
  interface Window {
    api: WindowAPI
  }
}
```

## Usage no Renderer

```typescript
// Criação de usuário com validação automática
const response = await window.api.user.create({
  name: 'Maria Silva',
  email: 'maria@test.com',
  username: 'maria'
})

if (response.success) {
  console.log('User created:', response.data.id)
} else {
  console.error('Error:', response.error) // "Validation: Invalid email format"
}

// Execução de agente
const execution = await window.api.agent.execute({
  agentId: 'agent-123',
  taskType: 'bash',
  command: 'npm run build',
  workdir: '/project/path'
})

// Events emitidos após ações:
// - user:created, user:updated, user:inactivated
// - agent:executed, agent:activated, agent:deactivated  
// - project:synced, project:sync-failed
```

## Migration Guide

### Antes vs Depois

```typescript
// ❌ Antes
export default async function(data: any, event: IpcMainInvokeEvent) {
  if (!data.name) throw new Error('Missing name')
  const user = await createUser(data)
  return user
}

// ✅ Depois
export default createIPCHandler({
  inputSchema: z.object({ name: z.string().min(2) }),
  outputSchema: z.object({ id: z.string(), name: z.string() }),
  handler: async (input) => await createUser(input)
})
```

### Checklist

- [ ] Criar schemas Zod para input/output
- [ ] Usar `export default createIPCHandler({...})`
- [ ] Atualizar module augmentation com `InferHandler<typeof handler>`
- [ ] Testar validação e tipos no renderer

## Benefícios

✅ **Padronização**: Todos os handlers seguem o mesmo padrão  
✅ **Type Safety**: Inferência automática e validação Zod  
✅ **Error Handling**: Mensagens consistentes para erros de validação  
✅ **Compatibilidade**: Zero breaking changes com sistema existente  
✅ **DX**: Type helpers simplificados para melhor developer experience  

---

**Arquitetura unificada, type-safe e compatível para toda comunicação IPC do Project Wiz.**